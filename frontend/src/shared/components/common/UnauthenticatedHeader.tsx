import { Anchor } from "../ui/Anchor";
import { LoginButton } from "../ui/LoginButton";

interface UnauthenticatedHeaderProps {
  institute: string;
}

export function UnauthenticatedHeader({ institute }: UnauthenticatedHeaderProps) {
  return (
    <div className="flex gap-2">
      <Anchor href={`./registro?institute=${institute}`} variant="secondary">
        Registro
      </Anchor>
      <LoginButton institute={institute} />
    </div>
  );
}
