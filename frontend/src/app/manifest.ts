import type { MetadataRoute } from "next";

/**
 * Genera el manifiesto de aplicación web (PWA) de MACTI resolviendo las rutas
 * de inicio e iconos con el `basePath` configurado en tiempo de compilación.
 *
 * @returns Configuración del manifiesto web para Next.js.
 */
export default function manifest(): MetadataRoute.Manifest {
  const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const basePath = rawBasePath === "/" ? "" : rawBasePath.replace(/\/+$/, "");

  return {
    name: "MACTI",
    short_name: "MACTI",
    description:
      "MACTI es una plataforma que alberga materiales didácticos haciendo énfasis en ejemplos prácticos y aplicaciones de conceptos abstractos para los cursos semestrales de análisis Numérico y Ecuaciones Diferenciales.",
    start_url: `${basePath}/`,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    lang: "es",
    icons: [
      {
        src: `${basePath}/icon0.svg`,
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: `${basePath}/icon1.png`,
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: `${basePath}/apple-icon.png`,
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: `${basePath}/favicon.ico`,
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
