"""Pruebas unitarias y de integración para el módulo register."""

import unittest
from datetime import UTC, datetime, timedelta
from types import SimpleNamespace
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

from fastapi import BackgroundTasks, HTTPException

from app.modules.register.controllers.account_requests import AccountRequestsController
from app.modules.register.controllers.authenticated_student_request import (
    AuthenticatedStudentRequestController,
)
from app.modules.register.controllers.authenticated_teacher_request import (
    AuthenticatedTeacherRequestController,
)
from app.modules.register.controllers.create_account import CreateAccountController
from app.modules.register.controllers.get_user_info import GetUserInfoController
from app.modules.register.controllers.list_account_requests import (
    ListAccountRequestsController,
)
from app.modules.register.controllers.list_account_requests_teacher import (
    AccountRequestsTeacherController,
)
from app.modules.register.controllers.update_request_status import (
    RequestStatusController,
)
from app.modules.register.schemas import (
    AuthenticatedStudentRequestSchema,
    AuthenticatedTeacherRequestSchema,
    CreateAccountSchema,
    RequestStatusUpdateSchema,
    StudentRequestSchema,
)
from app.shared.enums.institutes_enum import InstitutesEnum
from app.shared.enums.role_enum import AccountRoleEnum
from app.shared.enums.status_enum import RequestStatusEnum
from tests.conftest_helpers import (
    build_fake_user,
    clear_overrides,
    create_test_client,
)


class TestRegisterControllers(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.db_mock = MagicMock()
        self.fake_user = build_fake_user()

    def tearDown(self):
        clear_overrides()

    async def test_request_account_success_and_duplicate_validation(self):
        """Valida registro exitoso y rechazo por solicitud duplicada en AccountRequestsController."""
        controller = AccountRequestsController(db=self.db_mock)
        controller.repository = MagicMock()

        payload = StudentRequestSchema(
            name="Pedro",
            last_name="Ramírez",
            email="nuevo.alumno@unam.mx",
            institute=InstitutesEnum.PRINCIPAL,
            course_id=12,
        )

        # Caso 1: Éxito
        controller.repository.get_by_email_and_institute.return_value = None
        with patch(
            "app.modules.register.controllers.account_requests.KeycloakService.user_exists",
            new=AsyncMock(return_value=SimpleNamespace(exists=False)),
        ):
            res = await controller.request_account(
                role=AccountRoleEnum.ALUMNO, data=payload
            )
            self.assertEqual(
                res["message"], "Solicitud de cuenta registrada correctamente."
            )
            controller.repository.commit.assert_called_once()

        # Caso 2: Duplicado
        controller.repository.get_by_email_and_institute.return_value = SimpleNamespace(
            id=1
        )
        with self.assertRaises(HTTPException) as ctx:
            await controller.request_account(role=AccountRoleEnum.ALUMNO, data=payload)

        detail: Any = ctx.exception.detail
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertEqual(detail["error_code"], "DUPLICADO")

    async def test_authenticated_student_and_teacher_requests(self):
        """Valida solicitudes autenticadas para alumnos y docentes."""
        # Alumno autenticado
        stu_ctrl = AuthenticatedStudentRequestController(db=self.db_mock)
        stu_ctrl.repository = MagicMock()
        stu_ctrl.repository.get_auth_with_relations.return_value = SimpleNamespace(
            id=1,
            institute=InstitutesEnum.PRINCIPAL,
            student_course_requests=[],
        )
        stu_ctrl.repository.exists_student_request_for_course_and_institute.return_value = False

        res_stu = await stu_ctrl.request_student_course(
            data=AuthenticatedStudentRequestSchema(course_id=30),
            user_info=self.fake_user,
        )
        self.assertEqual(
            res_stu["message"], "Solicitud de curso registrada correctamente."
        )

        # Docente autenticado
        tea_ctrl = AuthenticatedTeacherRequestController(db=self.db_mock)
        tea_ctrl.repository = MagicMock()
        tea_ctrl.repository.get_auth_with_relations.return_value = SimpleNamespace(
            id=1,
            institute=InstitutesEnum.PRINCIPAL,
            teacher_course_requests=[],
        )
        tea_ctrl.repository.exists_teacher_request_for_course_and_institute.return_value = False

        res_tea = await tea_ctrl.request_teacher_course(
            data=AuthenticatedTeacherRequestSchema(
                course_full_name="Física Computacional", groups=["G1"]
            ),
            user_info=self.fake_user,
        )
        self.assertEqual(
            res_tea["message"], "Solicitud de curso registrada correctamente."
        )

    async def test_get_user_info_by_token_valid_and_expired(self):
        """Valida recuperación de información por token y detección de expiración."""
        token_id = uuid4()
        now = datetime.now(UTC)
        controller = GetUserInfoController(db=self.db_mock)
        controller.repository = MagicMock()

        # Token válido
        controller.repository.get_token_context.return_value = SimpleNamespace(
            created_at=now,
            expires_at=now + timedelta(hours=1),
            is_used=False,
            auth=SimpleNamespace(
                id=1,
                email="alumno@unam.mx",
                institute=InstitutesEnum.PRINCIPAL,
                jids=None,
                profile=SimpleNamespace(
                    name="Pedro", last_name="Ramírez", role=AccountRoleEnum.ALUMNO
                ),
                student_course_requests=[
                    SimpleNamespace(
                        id=7, status=RequestStatusEnum.APPROVED, moodle_course_id=10
                    )
                ],
                teacher_course_requests=[],
            ),
        )
        info = await controller.get_user_info(token=token_id)
        self.assertEqual(info.email, "alumno@unam.mx")

        # Token expirado -> HTTP 410
        controller.repository.get_token_context.return_value.expires_at = (
            now - timedelta(minutes=5)
        )
        with self.assertRaises(HTTPException) as ctx:
            await controller.get_user_info(token=token_id)

        detail: Any = ctx.exception.detail
        self.assertEqual(ctx.exception.status_code, 410)
        self.assertEqual(detail["error_code"], "TOKEN_EXPIRADO")

    async def test_list_requests_students_and_teachers(self):
        """Valida listados paginados de solicitudes de alumnos y docentes."""
        stu_list = ListAccountRequestsController(db=self.db_mock)
        stu_list.repository = MagicMock()
        stu_list.repository.list_student_account_requests.return_value = (
            [
                {
                    "id": 1,
                    "user_id": 10,
                    "name": "Ana",
                    "last_name": "Gómez",
                    "email": "ana@unam.mx",
                    "status": RequestStatusEnum.PENDING,
                    "role": AccountRoleEnum.ALUMNO,
                }
            ],
            1,
        )
        res_stu = await stu_list.list_accounts_requests(
            course_id=10, institute=InstitutesEnum.PRINCIPAL
        )
        self.assertEqual(res_stu.total, 1)

        tea_list = AccountRequestsTeacherController(db=self.db_mock)
        tea_list.repository = MagicMock()
        tea_list.repository.list_teacher_account_requests.return_value = (
            [
                {
                    "user_id": 2,
                    "name": "Carlos",
                    "last_name": "Ruiz",
                    "email": "carlos@unam.mx",
                    "role": AccountRoleEnum.DOCENTE,
                    "institute": InstitutesEnum.PRINCIPAL,
                    "course_request_id": 4,
                    "status": RequestStatusEnum.PENDING,
                    "course_full_name": "Mecánica",
                    "groups": "01, 02",
                }
            ],
            1,
        )
        res_tea = await tea_list.list_teacher_accounts_requests(
            institute=InstitutesEnum.PRINCIPAL
        )
        self.assertEqual(res_tea.total, 1)
        self.assertEqual(res_tea.items[0]["courses"]["groups"], ["01", "02"])

    async def test_update_request_status_approval_and_invalid_transition(self):
        """Valida aprobación de solicitud inactiva y rechazo de transición inválida."""
        controller = RequestStatusController(db=self.db_mock)
        controller.repository = MagicMock()
        token_uuid = uuid4()

        mock_req = SimpleNamespace(
            status=RequestStatusEnum.PENDING,
            moodle_course_id=10,
            auth=SimpleNamespace(id=1, is_active=False, email="alumno@unam.mx"),
        )
        controller.repository.get_course_request.return_value = mock_req
        controller.repository.create_or_update_verification_token.return_value = (
            SimpleNamespace(token=token_uuid)
        )

        with (
            patch.object(
                controller,
                "_authorize_request_action",
                new=AsyncMock(return_value=None),
            ),
            patch(
                "app.modules.register.controllers.update_request_status.EmailService.send_validation_email",
                return_value=SimpleNamespace(success=True, error=None),
            ),
        ):
            res = await controller.update_request_status(
                data=RequestStatusUpdateSchema(
                    request_id=1, new_status=RequestStatusEnum.APPROVED
                ),
                role=AccountRoleEnum.ALUMNO,
                institute=InstitutesEnum.PRINCIPAL,
                current_user=self.fake_user,
            )
            self.assertIn("Solicitud aprobada", res["message"])

        # Transición inválida ENROLLED -> PENDING -> HTTP 409
        mock_req.status = RequestStatusEnum.ENROLLED
        with self.assertRaises(HTTPException) as ctx:
            await controller.update_request_status(
                data=RequestStatusUpdateSchema(
                    request_id=1, new_status=RequestStatusEnum.PENDING
                ),
                role=AccountRoleEnum.ALUMNO,
                institute=InstitutesEnum.PRINCIPAL,
                current_user=self.fake_user,
            )
        self.assertEqual(ctx.exception.status_code, 409)

    async def test_create_account_provisions_and_enqueues_jupyter_background(self):
        """Valida alta en Keycloak/Moodle y encolado en BackgroundTasks hacia JupyterHub."""
        token_uuid = uuid4()
        now = datetime.now(UTC)
        bg_tasks = BackgroundTasks()

        controller = CreateAccountController(db=self.db_mock, background_tasks=bg_tasks)
        controller.repository = MagicMock()
        controller.repository.get_auth_with_relations.return_value = SimpleNamespace(
            id=1,
            email="docente@unam.mx",
            institute=InstitutesEnum.PRINCIPAL,
            profile=SimpleNamespace(
                name="Pedro", last_name="Ramírez", role=AccountRoleEnum.DOCENTE
            ),
            verification_token=SimpleNamespace(
                token=token_uuid,
                is_used=False,
                expires_at=now + timedelta(hours=1),
            ),
            student_course_requests=[],
            teacher_course_requests=[
                SimpleNamespace(
                    id=3,
                    course_full_name="Física Computacional",
                    groups="G1",
                    status=RequestStatusEnum.APPROVED,
                )
            ],
        )

        with (
            patch.object(
                controller, "_recover_existing_kc", new=AsyncMock(return_value=uuid4())
            ),
            patch.object(
                controller,
                "_create_moodle_user_or_raise",
                new=AsyncMock(return_value=99),
            ),
            patch(
                "app.modules.register.controllers.create_account.EnrollUserUseCase"
            ) as mock_enroll_cls,
            patch(
                "app.modules.register.controllers.create_account.JupyterService.sync_user_role",
                new=AsyncMock(return_value=True),
            ) as mock_jupyter,
        ):
            mock_enroll_cls.return_value.execute = AsyncMock(
                return_value=SimpleNamespace(enrolled=True, error=None)
            )

            res = await controller.create_account(
                data=CreateAccountSchema(
                    user_id=1,
                    new_password="PasswordSegura123!",  # noqa: S106
                    token=token_uuid,
                )
            )

            self.assertEqual(res["message"], "Cuenta creada exitosamente")
            mock_jupyter.assert_not_awaited()
            self.assertEqual(len(bg_tasks.tasks), 1)

            # Ejecutar tarea encolada y verificar llamada a JupyterHub
            await bg_tasks.tasks[0]()
            mock_jupyter.assert_awaited_once_with(
                email="docente@unam.mx",
                role="docente",
                first_name="Pedro",
                last_name="Ramírez",
            )

    def test_register_endpoint_dependency_override(self):
        """Valida integración HTTP del router /register con dependency_overrides."""
        mock_ctrl = MagicMock()
        mock_ctrl.get_user_info = AsyncMock(
            return_value={
                "id": 1,
                "email": "alumno@unam.mx",
                "name": "Pedro",
                "last_name": "Ramírez",
                "role": "alumno",
                "institute": "principal",
                "course_request": {
                    "id": 7,
                    "status": "approved",
                    "moodle_course_id": 10,
                    "course_full_name": None,
                    "groups": None,
                },
            }
        )

        client = create_test_client(
            db_mock=self.db_mock,
            extra_overrides={GetUserInfoController: lambda: mock_ctrl},
        )
        token_str = str(uuid4())
        response = client.get(
            "/register/user-info-by-token", params={"token": token_str}
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["email"], "alumno@unam.mx")
        mock_ctrl.get_user_info.assert_awaited_once()


if __name__ == "__main__":
    unittest.main()
