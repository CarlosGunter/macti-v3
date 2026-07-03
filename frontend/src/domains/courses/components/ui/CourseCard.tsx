interface CourseCardProps {
  children?: React.ReactNode;
  courseId: number;
  title: string;
  description?: string | null;
}

export default function CourseCard({ children, title, description }: CourseCardProps) {
  return (
    <section className="grid gap-4 rounded-2xl border border-border p-8 bg-card text-card-foreground">
      <div className="grid gap-2">
        <h2 className="font-semibold text-lg">{title}</h2>
        <p className="text-sm text-foreground/70">{description || "Curso de MACTI"}</p>
      </div>
      <div className="flex gap-2 items-center self-end-safe md:self-auto">{children}</div>
    </section>
  );
}
