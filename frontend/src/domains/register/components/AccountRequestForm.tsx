"use client";

import { useQuery } from "@tanstack/react-query";
import Form from "next/form";
import { useActionState, useState } from "react";
import { institutes } from "@/shared/config/institutes";
import { Button } from "@/shared/shadcn/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/shared/shadcn/components/ui/field";
import { Input } from "@/shared/shadcn/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/shadcn/components/ui/select";
import { accountRequestAction } from "../actions/accountRequestAction";
import { fetchCoursesClient } from "../services/fetchCoursesClient";

export default function AccountRequestForm({ institute }: { institute: string }) {
  const [state, formAction, isPending] = useActionState(accountRequestAction, null);

  const [selectedInstitute, setSelectedInstitute] = useState(
    institute || (state?.data?.institute as string) || "",
  );

  const {
    data: courses,
    isLoading: coursesLoading,
    error: coursesError,
  } = useQuery({
    queryKey: ["courses", selectedInstitute],
    queryFn: async () => {
      const result = await fetchCoursesClient({ institute: selectedInstitute });
      if (!result) throw new Error("No se pudieron cargar los cursos");
      return result;
    },
    enabled: !!selectedInstitute,
  });

  return (
    <Form action={formAction} disabled={isPending} className="w-full">
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Solicitud de Cuenta de Estudiante</FieldLegend>
          <FieldDescription>
            Cada instituto tiene su propio proceso de solicitud.
          </FieldDescription>

          <FieldGroup>
            <Field>
              <FieldLabel>Escuela/Facultad/Instituto</FieldLabel>
              <Select
                name="institute"
                value={selectedInstitute}
                onValueChange={setSelectedInstitute}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un instituto" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(institutes).map(([key, institute]) => (
                    <SelectItem key={key} value={key}>
                      {institute.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError>{state?.errors.institute?.errors[0]}</FieldError>
            </Field>

            <Field>
              <FieldLabel>Curso</FieldLabel>
              <Select
                name="course_id"
                defaultValue={state?.data?.course_id as string}
                disabled={!selectedInstitute || coursesLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      coursesLoading
                        ? "Cargando cursos..."
                        : coursesError
                          ? "Error al cargar cursos"
                          : !selectedInstitute
                            ? "Selecciona primero un instituto"
                            : courses && courses.length > 0
                              ? "Selecciona un curso"
                              : "No hay cursos disponibles"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {courses && courses.length > 0 ? (
                    courses.map((course) => (
                      <SelectItem key={course.id} value={String(course.id)}>
                        {course.displayname}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__empty__" disabled>
                      No hay cursos disponibles
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FieldDescription>
                Selecciona el curso al que deseas inscribirte.
              </FieldDescription>
              <FieldError>{state?.errors.course_id?.errors[0]}</FieldError>
            </Field>

            <FieldSeparator />

            <Field>
              <FieldLabel>Correo Electrónico</FieldLabel>
              <FieldContent>
                <Input
                  type="email"
                  name="email"
                  placeholder="ejemplo@dominio.com"
                  defaultValue={state?.data?.email as string}
                  onChange={(e) => {
                    e.target.value = e.target.value.toLowerCase();
                  }}
                />
              </FieldContent>
              <FieldDescription>
                Proporciona un correo electrónico válido.
              </FieldDescription>
              <FieldError>{state?.errors.email?.errors[0]}</FieldError>
            </Field>

            <Field>
              <FieldLabel>Nombre(s)</FieldLabel>
              <FieldContent>
                <Input
                  type="text"
                  name="name"
                  placeholder="Juan"
                  defaultValue={state?.data?.name as string}
                />
              </FieldContent>
              <FieldDescription>Ingresa tu nombre o nombres.</FieldDescription>
              <FieldError>{state?.errors.name?.errors[0]}</FieldError>
            </Field>

            <Field>
              <FieldLabel>Apellidos</FieldLabel>
              <FieldContent>
                <Input
                  type="text"
                  name="last_name"
                  placeholder="Pérez López"
                  defaultValue={state?.data?.last_name as string}
                />
              </FieldContent>
              <FieldDescription>Ingresa tus apellidos.</FieldDescription>
              <FieldError>{state?.errors.last_name?.errors[0]}</FieldError>
            </Field>

            {state?.errors.general && (
              <FieldError className="text-red-500 text-center">
                {state.errors.general.errors[0]}
              </FieldError>
            )}

            {state?.success && (
              <FieldContent className="text-green-600 text-center text-sm">
                Solicitud enviada exitosamente.
              </FieldContent>
            )}

            <Button type="submit" disabled={isPending}>
              {isPending ? "Enviando..." : "Solicitar"}
            </Button>
          </FieldGroup>
        </FieldSet>
      </FieldGroup>
    </Form>
  );
}
