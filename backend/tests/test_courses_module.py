"""Pruebas unitarias y de integración para el módulo courses."""

import unittest
from types import SimpleNamespace
from typing import Any, cast
from unittest.mock import AsyncMock, MagicMock, patch

from fastapi import HTTPException

from app.modules.courses.controllers.list_courses import ListCoursesController
from app.modules.courses.controllers.user_enrolled_courses import (
    UserEnrolledCoursesController,
)
from app.shared.enums.institutes_enum import InstitutesEnum
from tests.conftest_helpers import (
    build_fake_user,
    clear_overrides,
    create_test_client,
)


class TestCoursesControllers(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.db_mock = MagicMock()
        self.fake_user = build_fake_user()

    def tearDown(self):
        clear_overrides()

    async def test_list_courses_filters_site_and_paginates(self):
        """Valida que list_courses excluya el curso sitio (índice 0), filtre por search y pagine."""
        mock_moodle = MagicMock()
        mock_moodle.get_courses = AsyncMock(
            return_value=SimpleNamespace(
                error=None,
                courses=[
                    {
                        "id": 1,
                        "fullname": "MACTI Sitio",
                        "shortname": "SITE",
                        "displayname": "Sitio",
                        "summary": "",
                    },
                    {
                        "id": 10,
                        "fullname": "Cálculo Diferencial",
                        "shortname": "CALC1",
                        "displayname": "Cálculo I",
                        "summary": "",
                    },
                    {
                        "id": 11,
                        "fullname": "Álgebra Lineal",
                        "shortname": "ALG1",
                        "displayname": "Álgebra I",
                        "summary": "",
                    },
                ],
            )
        )

        controller = ListCoursesController(moodle_service=cast(Any, mock_moodle))
        result = await controller.list_courses(
            institute=InstitutesEnum.PRINCIPAL,
            search="cálculo",
            page=1,
            limit=10,
        )

        self.assertEqual(result.total, 1)
        self.assertEqual(len(result.items), 1)
        self.assertEqual(result.items[0]["id"], 10)

    async def test_list_courses_raises_502_on_moodle_error(self):
        """Valida propagación de error 502 cuando Moodle falla."""
        mock_moodle = MagicMock()
        mock_moodle.get_courses = AsyncMock(
            return_value=SimpleNamespace(error="Timeout en Web Service", courses=[])
        )

        controller = ListCoursesController(moodle_service=cast(Any, mock_moodle))
        with self.assertRaises(HTTPException) as ctx:
            await controller.list_courses(institute=InstitutesEnum.PRINCIPAL)

        detail: Any = ctx.exception.detail
        self.assertEqual(ctx.exception.status_code, 502)
        self.assertEqual(detail["error_code"], "MOODLE_COURSE_LIST_ERROR")

    async def test_user_enrolled_courses_concurrent_roles_and_pagination(self):
        """Valida la obtención de cursos inscritos con asignación concurrente de roles."""
        controller = UserEnrolledCoursesController(db=self.db_mock)
        controller.repository = MagicMock()
        controller.repository.get_jids_by_kc_id.return_value = [
            SimpleNamespace(auth=True, moodle_id=50)
        ]

        enrolled_mock = [
            {
                "id": 101,
                "fullname": "Física I",
                "shortname": "FIS1",
                "displayname": "Física I",
                "summary": "",
            },
            {
                "id": 102,
                "fullname": "Programación",
                "shortname": "PROG",
                "displayname": "Programación",
                "summary": "",
            },
        ]

        with (
            patch(
                "app.modules.courses.controllers.user_enrolled_courses.MoodleService.get_enrolled_courses",
                new=AsyncMock(
                    return_value=SimpleNamespace(
                        error=None, enrolled_courses=enrolled_mock
                    )
                ),
            ),
            patch(
                "app.shared.services.moodle_service.MoodleService.get_user_profile",
                new=AsyncMock(
                    side_effect=[
                        SimpleNamespace(
                            error=None,
                            user_profile={"roles": [{"shortname": "editingteacher"}]},
                        ),
                        SimpleNamespace(
                            error=None,
                            user_profile={"roles": [{"shortname": "student"}]},
                        ),
                    ]
                ),
            ),
        ):
            result = await controller.get_user_enrolled_courses(
                institute=InstitutesEnum.PRINCIPAL,
                user_info=self.fake_user,
                page=1,
                limit=10,
            )

        self.assertEqual(result.total, 2)
        self.assertEqual(result.items[0]["role"], ["editingteacher"])
        self.assertEqual(result.items[1]["role"], ["student"])

    async def test_user_enrolled_courses_raises_404_when_jid_missing(self):
        """Valida error 404 cuando el kc_id no tiene cuenta vinculada."""
        controller = UserEnrolledCoursesController(db=self.db_mock)
        controller.repository = MagicMock()
        controller.repository.get_jids_by_kc_id.return_value = []

        with self.assertRaises(HTTPException) as ctx:
            await controller.get_user_enrolled_courses(
                institute=InstitutesEnum.PRINCIPAL,
                user_info=self.fake_user,
            )

        detail: Any = ctx.exception.detail
        self.assertEqual(ctx.exception.status_code, 404)
        self.assertEqual(detail["error_code"], "MOODLE_NO_ENCONTRADO")

    def test_courses_endpoint_dependency_injection(self):
        """Valida la inyección de ListCoursesController en el router /courses."""
        mock_ctrl = MagicMock()
        mock_ctrl.list_courses = AsyncMock(
            return_value={
                "items": [],
                "total": 0,
                "page": 1,
                "limit": 10,
                "total_pages": 0,
            }
        )

        client = create_test_client(
            db_mock=self.db_mock,
            extra_overrides={ListCoursesController: lambda: mock_ctrl},
        )
        response = client.get("/courses/", params={"institute": "principal"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["total"], 0)
        mock_ctrl.list_courses.assert_awaited_once()


if __name__ == "__main__":
    unittest.main()
