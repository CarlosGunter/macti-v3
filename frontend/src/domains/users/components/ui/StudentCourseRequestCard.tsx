import { Mail, School, UserRound } from "lucide-react";
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
      className="group overflow-hidden rounded-2xl border border-border/70 bg-card/95 p-4 text-card-foreground shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="grid gap-4">
        <header className="flex items-start justify-between gap-3">
          <div className="grid gap-1.5">
            <p className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-card-foreground/50">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Solicitud de estudiante
            </p>

            <h3 id={titleId} className="text-lg font-semibold leading-tight sm:text-xl">
              {request.name} {request.last_name}
            </h3>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-3 py-1.5 text-xs font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {STATUS_BADGE_LABELS[request.status]}
          </div>
        </header>

        <section className="grid gap-3 rounded-xl border border-border/60 bg-background/65 p-3.5">
          <div className="flex items-center gap-2 text-sm font-medium text-card-foreground/80">
            <Mail className="h-4 w-4 text-card-foreground/55" />
            <Link
              href={`mailto:${request.email}`}
              className="truncate transition-colors hover:text-primary"
            >
              {request.email}
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs text-card-foreground/60">
            <UserRound className="h-3.5 w-3.5" />
            <span>Solicitud #{request.id}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-card-foreground/60">
            <School className="h-3.5 w-3.5" />
            <span>Curso #{courseId}</span>
          </div>
        </section>

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
