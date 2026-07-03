"use client";

import Form from "next/form";
import { useActionState } from "react";
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
import { accountRequestTeacherAction } from "../actions/accountRequestTeacherAction";
import GroupInput from "./iu/GroupInput";

export default function AccountRequestTeacherForm() {
  const [state, formAction, isPending] = useActionState(
    accountRequestTeacherAction,
    null,
  );

  return (
    <Form action={formAction} disabled={isPending}>
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Registro de Profesor</FieldLegend>
          <FieldDescription>
            El administrador se encargará de revisar y aprobar tu solicitud.
          </FieldDescription>

          <FieldGroup>
            <Field>
              <FieldLabel>Escuela/Facultad/Instituto</FieldLabel>
              <Select name="institute" defaultValue={state?.data?.institute as string}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona tu facultad" />
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

            <FieldSeparator />

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
              <FieldError>{state?.errors.last_name?.errors[0]}</FieldError>
            </Field>

            <Field>
              <FieldLabel>Correo Electrónico</FieldLabel>
              <FieldContent>
                <Input
                  type="email"
                  name="email"
                  placeholder="ejemplo@dominio.com"
                  defaultValue={state?.data?.email as string}
                />
              </FieldContent>
              <FieldError>{state?.errors.email?.errors[0]}</FieldError>
            </Field>

            <FieldSeparator />

            <Field>
              <FieldLabel>Curso que impartirá</FieldLabel>
              <FieldContent>
                <Input
                  type="text"
                  name="course_full_name"
                  placeholder="Introducción a la Programación"
                  defaultValue={state?.data?.course_full_name as string}
                />
              </FieldContent>
              <FieldError>{state?.errors.course_full_name?.errors[0]}</FieldError>
            </Field>

            <GroupInput
              defaultValue={state?.data?.groups as string[]}
              error={state?.errors.groups?.errors[0]}
            />

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
