import Link from "next/link";
import { MACTILogo } from "@/assets/logos/MactiLogo";

export function HeaderBasic() {
  return (
    <header className="w-full md:w-11/12 backdrop-blur-md top-0 z-50 border-b-8 border-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 p-4 md:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Ir a la página principal"
          className="w-37.5 transform hover:-translate-y-0.5 duration-200"
        >
          <MACTILogo className="w-full h-auto" />
        </Link>
        <nav className="text-lg font-medium flex items-center gap-4 md:gap-6">
          <Link href="/faq" className="hover:text-accent-foreground transition">
            FAQ
          </Link>
          <Link
            href="https://www.geofisica.unam.mx/recursos/docs/IGEF_aviso_privacidad_20190802.pdf"
            className="hover:text-accent-foreground transition leading-6 w-min md:w-auto"
          >
            Aviso de Privacidad
          </Link>
        </nav>
      </div>
    </header>
  );
}
