import { headers } from "next/dist/server/request/headers";
import Image from "next/image";
import Link from "next/link";
import MactiLogo from "@/assets/image/logos/macti_logo.png";
import { getAuthInstance } from "@/infra/auth/auth-factory";
import { AutenticatedHeader } from "./AutenticatedHeader";
import { UnauthenticatedHeader } from "./UnauthenticatedHeader";

interface HeaderProps {
  institute: string;
}

export async function Header({ institute }: HeaderProps) {
  const auth = getAuthInstance(institute);
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const authenticated = !!session;

  return (
    <header className="w-full p-4 flex justify-between items-center mb-4">
      <Link href="/" aria-label="Ir a la página principal">
        <Image src={MactiLogo.src} alt="Macti Logo" width={86} height={40} />
      </Link>
      {authenticated ? (
        <AutenticatedHeader institute={institute} session={session} />
      ) : (
        <UnauthenticatedHeader institute={institute} />
      )}
    </header>
  );
}
