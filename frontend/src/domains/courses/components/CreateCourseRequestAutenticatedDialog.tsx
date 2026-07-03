"use client";

import Form from "next/form";
import { useActionState, useEffect, useState } from "react";
import type { InstitutesType } from "@/shared/config/institutes";
import { Badge } from "@/shared/shadcn/components/ui/badge";
import { Button } from "@/shared/shadcn/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/shadcn/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/shared/shadcn/components/ui/field";
import { Input } from "@/shared/shadcn/components/ui/input";
import { createCourseRequestAutenticatedAction } from "../actions/createCourseRequestAutenticatedAction";

interface CreateCourseRequestAutenticatedDialogProps {
  institute: InstitutesType;
}

function CourseGroupsInput({
  defaultValue,
  error,
}: {
  defaultValue?: string[];
  error?: string;
}) {
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState<string[]>(defaultValue ?? []);

  useEffect(() => {
    setGroups(defaultValue ?? []);
  }, [defaultValue]);

  const handleAddGroup = () => {
    const trimmed = groupName.trim();
    if (trimmed && !groups.includes(trimmed)) {
      setGroups([...groups, trimmed]);
      setGroupName("");
    }
  };

  const handleRemoveGroup = (name: string) => {
    setGroups(groups.filter((group) => group !== name));
  };

  return (
    <Field>
      <FieldLabel>Grupos</FieldLabel>
      <FieldContent>
        <div className="flex gap-2">
          <Input
            placeholder="Agregar grupo..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddGroup();
              }
            }}
          />
          <Button type="button" onClick={handleAddGroup} disabled={!groupName.trim()}>
            Agregar
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {groups.map((group) => (
            <Badge key={group} variant="secondary" className="flex items-center gap-1">
              <input type="hidden" name="groups" value={group} />
              <span className="ml-1.5">{group}</span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-5 w-5 p-0"
                onClick={() => handleRemoveGroup(group)}
                aria-label={`Eliminar ${group}`}
              >
                ×
              </Button>
            </Badge>
          ))}
        </div>

        <FieldError>{error}</FieldError>
      </FieldContent>
    </Field>
  );
}

export default function CreateCourseRequestAutenticatedDialog({
  institute,
}: CreateCourseRequestAutenticatedDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    createCourseRequestAutenticatedAction.bind(null, institute),
    null,
  );

  useEffect(() => {
    if (state?.success) {
      setOpen(false);
    }
  }, [state?.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">Solicitar nuevo curso</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-180">
        <DialogHeader>
          <DialogTitle>Solicitud de nuevo curso</DialogTitle>
          <DialogDescription>
            Crea una solicitud autenticada para abrir un curso nuevo dentro de tu
            instituto.
          </DialogDescription>
        </DialogHeader>

        <Form action={formAction} disabled={isPending} className="grid gap-4">
          <FieldGroup>
            <FieldSet>
              <FieldDescription>
                Completa el nombre del curso y registra los grupos iniciales.
              </FieldDescription>

              <FieldGroup>
                <Field>
                  <FieldLabel>Nombre completo del curso</FieldLabel>
                  <FieldContent>
                    <Input
                      type="text"
                      name="course_full_name"
                      placeholder="Introducción a la Programación"
                      defaultValue={state?.data?.course_full_name as string}
                    />
                  </FieldContent>
                  <FieldDescription>
                    Usa el nombre oficial con el que se mostrará el curso.
                  </FieldDescription>
                  <FieldError>{state?.errors.course_full_name?.errors[0]}</FieldError>
                </Field>

                <FieldSeparator />

                <CourseGroupsInput
                  defaultValue={state?.data?.groups as string[]}
                  error={state?.errors.groups?.errors[0]}
                />

                {state?.errors.general && (
                  <FieldError className="text-center text-red-500">
                    {state.errors.general.errors[0]}
                  </FieldError>
                )}

                {state?.success && (
                  <FieldContent className="text-center text-sm text-green-600">
                    Solicitud enviada exitosamente.
                  </FieldContent>
                )}
              </FieldGroup>
            </FieldSet>
          </FieldGroup>

          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Enviando..." : "Solicitar curso"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
