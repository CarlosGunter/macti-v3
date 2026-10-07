"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MACTILogo } from "@/assets/logos/MactiLogo";

/**
 * Propiedades para el componente HeaderLogo.
 */
interface HeaderLogoProps {
  /**
   * Identificador o slug del instituto actual.
   */
  institute: string;
  /**
   * Ruta alternativa de inicio a la que dirigir si ya se encuentra en el instituto (por defecto "/").
   */
  homePage?: string;
}

/**
 * Componente interactivo para el logo de MACTI en el encabezado.
 *
 * Determina dinámicamente el destino del enlace según la ruta actual:
 * - Si el usuario ya está en la raíz del instituto (`/[institute]`), redirige a la página principal (`/`).
 * - Si el usuario está en una subruta del instituto (ej. `/[institute]/perfil`), redirige a `/[institute]`.
 *
 * @param props - Propiedades del componente HeaderLogo.
 * @returns Enlace accesible con el logo de MACTI.
 */
export function HeaderLogo({ institute, homePage = "/" }: HeaderLogoProps) {
  const pathname = usePathname();

  const normalizedCurrentPath = pathname ? pathname.replace(/\/+$/, "") || "/" : "";
  const normalizedInstitutePath = `/${institute}`.replace(/\/+$/, "");

  const isAtInstituteRoot = normalizedCurrentPath === normalizedInstitutePath;
  const targetHref = isAtInstituteRoot ? homePage : normalizedInstitutePath;

  return (
    <Link
      href={targetHref}
      aria-label={
        isAtInstituteRoot
          ? "Ir a la página principal"
          : `Ir a la página principal de ${institute}`
      }
      className="w-37.5 transform hover:-translate-y-0.5 duration-200"
    >
      <MACTILogo className="w-full h-auto" />
    </Link>
  );
}
