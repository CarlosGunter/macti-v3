"use client";

import { useState } from "react";
import { Badge } from "@/shared/shadcn/components/ui/badge";
import { Button } from "@/shared/shadcn/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/shared/shadcn/components/ui/field";
import { Input } from "@/shared/shadcn/components/ui/input";

interface GroupInputProps {
  defaultValue?: string[];
  error?: string;
}

export default function GroupInput({ defaultValue, error }: GroupInputProps) {
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState<string[]>(defaultValue ?? []);

  const handleAddGroup = () => {
    const trimmed = groupName.trim();
    if (trimmed && !groups.includes(trimmed)) {
      setGroups([...groups, trimmed]);
      setGroupName("");
    }
  };

  const handleRemoveGroup = (name: string) => {
    setGroups(groups.filter((g) => g !== name));
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

        <div className="flex flex-wrap gap-2 mt-2">
          {groups.map((group) => (
            <Badge key={group} variant="secondary" className="flex items-center gap-1">
              <input type="hidden" name="groups" value={group} />
              <div className="ml-1.5">{group}</div>
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
