/**
 * Construye la URL base del portal de un instituto resolviendo correctamente
 * el dominio y el path base (`NEXT_PUBLIC_APP_URL` y `NEXT_PUBLIC_BASE_PATH`).
 *
 * Evita la duplicación del path principal (por ejemplo `/macti/macti/[institute]`)
 * si `NEXT_PUBLIC_APP_URL` ya incluye el `NEXT_PUBLIC_BASE_PATH`.
 *
 * @param institute Identificador del instituto.
 * @returns URL absoluta o relativa normalizada hacia el instituto.
 */
export function getInstituteUrl(institute: string): string {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/+$/, "");
  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/+$/, "");

  // Si appUrl ya incluye el basePath al final, no se debe concatenar nuevamente
  if (basePath && appUrl.endsWith(basePath)) {
    return `${appUrl}/${institute}`;
  }

  if (basePath) {
    return `${appUrl}${basePath}/${institute}`;
  }

  return `${appUrl}/${institute}`;
}
