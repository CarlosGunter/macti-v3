import { Mail } from "lucide-react";
import Link from "next/link";
import { STATUS_BADGE_LABELS, USER_ROLES } from "../../constants";
import type { CourseRequestStudent } from "../../schemas/courseRequestsStudentsSchema";
import CourseRequestStatusActions from "./CourseRequestStatusActions";

interface StudentCourseRequestCardProps {
  request: CourseRequestStudent;
  institute: string;
  courseId: string;
}

export default function StudentCourseRequestCard({
  request,
  institute,
  courseId,
}: StudentCourseRequestCardProps) {
  const titleId = `student-course-request-${request.id}`;

  return (
    <article
      aria-labelledby={titleId}
      className="group overflow-hidden rounded-2xl bg-primary p-4 text-card-foreground shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="grid gap-4">
        <header className="flex items-start justify-between gap-3">
          <div className="grid gap-1.5">
            <p className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-card-foreground/50">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
              Solicitud de estudiante
            </p>

            <h3 id={titleId} className="text-lg font-semibold leading-tight sm:text-xl">
              {request.name} {request.last_name}
            </h3>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-secondary/15 bg-secondary/8 px-3 py-1.5 text-xs font-medium text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
            {STATUS_BADGE_LABELS[request.status]}
          </div>
        </header>

        <Link
          href={`mailto:${request.email}`}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-accent-invert-foreground w-fit truncate transition-colors"
        >
          <Mail className="h-4 w-4" />
          {request.email}
        </Link>

        <CourseRequestStatusActions
          institute={institute}
          requestId={request.id}
          currentStatus={request.status}
          role={USER_ROLES.STUDENT}
          queryKey={["courseRequestsStudents", courseId, institute]}
          title="Actualizar estado"
        />
      </div>
    </article>
  );
}
