/**
 * Mapeo de entidades HTML nombradas comunes a sus caracteres correspondientes.
 */
const COMMON_HTML_ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&quot;": '"',
  "&apos;": "'",
  "&lt;": "<",
  "&gt;": ">",
  "&copy;": "©",
  "&reg;": "®",
  "&trade;": "™",
  "&mdash;": "—",
  "&ndash;": "–",
  "&bull;": "•",
  "&hellip;": "…",
  "&iexcl;": "¡",
  "&iquest;": "¿",
  "&laquo;": "«",
  "&raquo;": "»",
  "&aacute;": "á",
  "&eacute;": "é",
  "&iacute;": "í",
  "&oacute;": "ó",
  "&uacute;": "ú",
  "&ntilde;": "ñ",
  "&uuml;": "ü",
  "&Aacute;": "Á",
  "&Eacute;": "É",
  "&Iacute;": "Í",
  "&Oacute;": "Ó",
  "&Uacute;": "Ú",
  "&Ntilde;": "Ñ",
  "&Uuml;": "Ü",
};

/**
 * Expresión regular para detectar entidades HTML (nombradas, decimales o hexadecimales).
 */
const ENTITY_REGEX = /&(?:[a-zA-Z]+|#\d+|#[xX][0-9a-fA-F]+);/g;

/**
 * Convierte una cadena de texto con formato HTML a texto plano de forma segura.
 *
 * Elimina etiquetas HTML, bloques `<script>` y `<style>` (incluyendo su contenido),
 * comentarios HTML y decodifica entidades numéricas y nombradas comunes.
 * Funciona de manera determinista y segura tanto en el servidor (SSR) como en el cliente,
 * evitando discrepancias de hidratación y riesgos de inyección de código.
 *
 * @param html Cadena que contiene código HTML o valores nulos/indefinidos.
 * @returns Cadena con el texto plano limpio y espacios normalizados.
 *
 * @example
 * ```ts
 * stripHtml("<p>Hola <strong>mundo</strong> &amp; bienvenidos.</p>");
 * // Retorna: "Hola mundo & bienvenidos."
 * ```
 */
export function stripHtml(html?: string | null): string {
  if (!html) {
    return "";
  }

  return (
    html
      // Elimina bloques de script con su contenido
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      // Elimina bloques de estilo con su contenido
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      // Elimina comentarios HTML
      .replace(/<!--[\s\S]*?-->/g, "")
      // Reemplaza etiquetas de bloque o salto de línea por un espacio para no concatenar palabras
      .replace(/<\/(p|div|h[1-6]|li|tr|blockquote|section|article)>/gi, " ")
      .replace(/<(br|hr)\s*\/?>/gi, " ")
      // Elimina cualquier otra etiqueta HTML remanente
      .replace(/<[^>]+>/g, "")
      // Decodifica entidades HTML
      .replace(ENTITY_REGEX, (entity) => {
        const lowerEntity = entity.toLowerCase();
        if (COMMON_HTML_ENTITIES[lowerEntity]) {
          return COMMON_HTML_ENTITIES[lowerEntity];
        }

        if (entity.startsWith("&#x") || entity.startsWith("&#X")) {
          const hexCode = Number.parseInt(entity.slice(3, -1), 16);
          return !Number.isNaN(hexCode) ? String.fromCodePoint(hexCode) : entity;
        }

        if (entity.startsWith("&#")) {
          const decCode = Number.parseInt(entity.slice(2, -1), 10);
          return !Number.isNaN(decCode) ? String.fromCodePoint(decCode) : entity;
        }

        return entity;
      })
      // Normaliza espacios consecutivos y recorta extremos
      .replace(/\s+/g, " ")
      .trim()
  );
}
