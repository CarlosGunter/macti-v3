import { BookOpen, Users } from "lucide-react";
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
  const groupsLabel =
    courses.groups.length === 1 ? "1 grupo" : `${courses.groups.length} grupos`;

  return (
    <article
      aria-labelledby={titleId}
      className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/95 p-4 text-card-foreground shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative grid gap-4">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-card-foreground/50">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Solicitud docente
            </div>

            <h3 id={titleId} className="text-lg font-semibold leading-tight sm:text-xl">
              {user.name} {user.last_name}
            </h3>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-3 py-1.5 text-xs font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {STATUS_BADGE_LABELS[courses.status]}
          </div>
        </header>

        <section className="grid gap-3 rounded-xl border border-border/60 bg-background/65 p-3.5">
          <div className="flex items-center gap-2 text-sm font-medium text-card-foreground/80">
            <BookOpen className="h-4 w-4 text-card-foreground/55" />
            <span className="truncate">{courses.course_full_name}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-card-foreground/60">
            <Users className="h-3.5 w-3.5" />
            <span>{groupsLabel}</span>
          </div>
        </section>

        <ul className="flex flex-wrap gap-2" aria-label="Grupos del curso">
          {courses.groups.map((group) => (
            <li
              key={group}
              className="rounded-full border border-border/70 bg-secondary/35 px-2.5 py-1 text-[0.72rem] font-medium text-card-foreground/75"
            >
              {group}
            </li>
          ))}
        </ul>

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
