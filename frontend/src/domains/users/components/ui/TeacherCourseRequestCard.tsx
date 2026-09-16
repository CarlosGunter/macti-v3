import { BookOpen, Mail, Users } from "lucide-react";
import Link from "next/link";
import { STATUS_BADGE_LABELS, USER_ROLES } from "../../constants";
import type { CourseRequestsTeachersProps } from "../../schemas/courseRequestsTeachersSchema";
import CourseRequestStatusActions from "./CourseRequestStatusActions";

type TeacherCourseRequest = CourseRequestsTeachersProps[number];

interface TeacherCourseRequestCardProps {
  request: TeacherCourseRequest;
}

export default function TeacherCourseRequestCard({
  request,
}: TeacherCourseRequestCardProps) {
  const { user, courses } = request;
  const titleId = `teacher-course-request-${user.id}`;

  return (
    <article
      aria-labelledby={titleId}
      className="group overflow-hidden rounded-2xl bg-primary p-4 text-card-foreground shadow-sm transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative grid gap-4">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-card-foreground/50">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
              Solicitud docente
            </div>

            <h3 id={titleId} className="text-lg font-semibold leading-tight sm:text-xl">
              {user.name} {user.last_name}
            </h3>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-secondary/15 bg-secondary/8 px-3 py-1.5 text-xs font-medium text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary border-secondary" />
            {STATUS_BADGE_LABELS[courses.status]}
          </div>
        </header>

        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-card-foreground/80">
            <BookOpen className="h-4 w-4 text-card-foreground/55" />
            <span className="truncate">{courses.course_full_name}</span>
          </div>

          <div className="text-sm font-medium flex gap-2 items-center text-card-foreground/80">
            <Users className="h-4 w-4 text-card-foreground/55" />
            <span>Grupos:</span>
            <ul className="flex flex-wrap gap-2" aria-label="Grupos del curso">
              {courses.groups.map((group) => (
                <li
                  key={group}
                  className="rounded-full border border-border px-2.5 py-1 font-medium grid place-items-center text-xs"
                >
                  {group}
                </li>
              ))}
            </ul>
          </div>

          <Link
            href={`mailto:${user.email}`}
            className="truncate transition-colors flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-accent-invert-foreground w-fit"
          >
            <Mail className="h-4 w-4" />
            {user.email}
          </Link>
        </div>

        <CourseRequestStatusActions
          institute={user.institute}
          requestId={courses.id}
          currentStatus={courses.status}
          role={USER_ROLES.TEACHER}
          queryKey={["courseRequestsTeachers", user.institute]}
        />
      </div>
    </article>
  );
}
