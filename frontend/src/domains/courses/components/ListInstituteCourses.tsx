import { headers } from "next/headers";
import { getAuthInstance } from "@/infra/auth/auth-factory";
import { Anchor } from "@/shared/components/ui/Anchor";
import { type InstitutesType, institutes } from "@/shared/config/institutes";
import { fetchCoursesServer } from "../services/fetchCoursesServer";
import CourseCard from "./ui/CourseCard";
import RequestJoinCourseButton from "./ui/RequestJoinCourseButton";

interface ListInstituteCoursesProps {
  institute: InstitutesType;
}

export default async function ListInstituteCourses({
  institute,
}: ListInstituteCoursesProps) {
  const courses = await fetchCoursesServer({ institute });
  const currentInstitute = institutes[institute];

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center p-6">
        <p className="text-gray-500">No hay cursos disponibles en este instituto.</p>
      </div>
    );
  }

  const session = await getAuthInstance(institute).api.getSession({
    headers: await headers(),
  });

  return (
    <div className="mx-auto max-w-6xl md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8  w-full">
      {courses.map((course) => (
        <CourseCard
          key={`course-${course.id}`}
          courseId={course.id}
          title={course.displayname || course.fullname}
          description={course.summary || course.shortname}
        >
          {session && (
            <RequestJoinCourseButton institute={institute} courseId={course.id} />
          )}
          <Anchor
            href={`${currentInstitute.moodle}/course/view.php?id=${course.id}`}
            variant="bordered"
            external
          >
            Moodle
          </Anchor>
          <Anchor href={`${currentInstitute.jupyter}/hub/`} variant="bordered" external>
            Jupyter
          </Anchor>
        </CourseCard>
      ))}
    </div>
  );
}
