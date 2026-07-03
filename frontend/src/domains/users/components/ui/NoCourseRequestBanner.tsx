import { Inbox } from "lucide-react";

export function NoCourseRequestBanner() {
  return (
    <article className="grid gap-3 rounded-2xl border border-dashed border-border/70 bg-card/70 p-6 text-card-foreground shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-secondary/40 text-card-foreground/60">
          <Inbox className="h-5 w-5" />
        </span>
        <div className="grid gap-1">
          <h3 className="text-base font-semibold">No hay solicitudes para mostrar</h3>
          <p className="text-sm text-card-foreground/65">
            Prueba cambiando el filtro de estado o revisa más tarde.
          </p>
        </div>
      </div>
    </article>
  );
}
