"use client";

import { useState } from "react";
import { createCourseRequestAutenticated } from "@/domains/courses/services/createCourseRequestAutenticated";
import Button from "@/shared/components/ui/Button";
import type { InstitutesType } from "@/shared/config/institutes";

interface RequestJoinCourseButtonProps {
  institute: InstitutesType;
  courseId: number;
}

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
      return;
    }

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
        {hasRequested ? "Solicitud enviada" : "Unirse"}
      </Button>
    </div>
  );
}
