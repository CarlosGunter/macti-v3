import { headers } from "next/headers";
import Link from "next/link";
import { getAuthInstance } from "@/infra/auth/auth-factory";
import { AutenticatedHeader } from "./AutenticatedHeader";
import { HeaderLogo } from "./HeaderLogo";
import { UnauthenticatedHeader } from "./UnauthenticatedHeader";

/**
 * Propiedades para el componente Header.
 */
interface HeaderProps {
  /**
   * Identificador del instituto al que pertenece la vista.
   */
  institute: string;
  /**
   * Ruta de inicio general alternativa (por defecto "/").
   */
  homePage?: string;
}

/**
 * Encabezado principal para las vistas bajo el contexto de un instituto.
 *
 * Muestra el logo con redirección dinámica (a `/[institute]` o a `/`),
 * enlaces informativos y controles de sesión según el estado de autenticación.
 *
 * @param props - Propiedades del componente Header.
 * @returns Elemento del encabezado renderizado en servidor.
 */
export async function Header({ institute, homePage = `/` }: HeaderProps) {
  const auth = getAuthInstance(institute);
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const authenticated = !!session;

  return (
    <header className="w-full md:w-11/12 backdrop-blur-md top-0 z-50 border-b-8 border-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 p-4 md:px-6 lg:px-8">
        <HeaderLogo institute={institute} homePage={homePage} />
        <nav className="text-lg font-medium flex items-center gap-4 md:gap-6">
          <Link
            href="/sobre-macti"
            className="hover:text-accent-invert-foreground transition"
          >
            FAQ
          </Link>
          <Link
            href="https://www.geofisica.unam.mx/recursos/docs/IGEF_aviso_privacidad_20190802.pdf"
            className="hover:text-accent-invert-foreground transition leading-6 w-min md:w-auto"
          >
            Aviso de Privacidad
          </Link>
          {authenticated ? (
            <AutenticatedHeader institute={institute} session={session} />
          ) : (
            <UnauthenticatedHeader institute={institute} />
          )}
        </nav>
      </div>
    </header>
  );
}
