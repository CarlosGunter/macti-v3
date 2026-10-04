"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createCourseRequestAutenticated } from "@/domains/courses/services/createCourseRequestAutenticated";
import Button from "@/shared/components/ui/Button";
import type { InstitutesType } from "@/shared/config/institutes";

/**
 * Propiedades del componente RequestJoinCourseButton.
 */
interface RequestJoinCourseButtonProps {
  /** Identificador del instituto al que pertenece el curso */
  institute: InstitutesType;
  /** Identificador numérico del curso en la plataforma */
  courseId: number;
}

/**
 * Botón que permite a un estudiante autenticado solicitar unirse a un curso específico.
 * Notifica al usuario el resultado de la acción mediante un toast de éxito o error.
 */
export default function RequestJoinCourseButton({
  institute,
  courseId,
}: RequestJoinCourseButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);

  const handleRequest = async () => {
    setIsSubmitting(true);

    const result = await createCourseRequestAutenticated({
      institute: institute,
      userRole: "student",
      courseRequestData: { course_id: courseId },
    });

    if (result.success) {
      setHasRequested(true);
      setIsSubmitting(false);
      toast.success(result.message || "Solicitud enviada exitosamente.");
      return;
    }

    toast.error(
      result.error || "Error al enviar la solicitud. Inténtalo de nuevo más tarde.",
    );
    setIsSubmitting(false);
  };

  return (
    <div className="grid gap-2">
      <Button
        onClick={handleRequest}
        isLoading={isSubmitting}
        className="w-full md:w-auto"
        disabled={hasRequested}
      >
        {hasRequested ? "Enviada" : "Unirse"}
      </Button>
    </div>
  );
}
