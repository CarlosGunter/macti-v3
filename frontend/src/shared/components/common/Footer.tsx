import Image from "next/image";
import CienciasNucleares from "@/assets/logos/Ciencias_Nucleares.png";
import CienciasLogo from "@/assets/logos/CienciasLogo";
import GeofisicaLogo from "@/assets/logos/GeofisicaUNAM";
import UnamLogo from "@/assets/logos/UnamLogo";

export function Footer() {
  return (
    <footer className="w-full py-6 px-8 border-t-8 bg-secondary text-secondary-foreground border-border">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6 justify-center md:justify-start">
          <UnamLogo
            role="img"
            aria-label="Escudo UNAM"
            className="h-16 w-auto object-contain brightness-0 invert"
          />
          <GeofisicaLogo
            role="img"
            aria-label="Logo Geofísica UNAM"
            className="h-9 w-auto object-contain"
          />
        </div>

        <div className="text-center">
          <p className="font-bold text-base sm:text-sm tracking-wide">
            <span className="block lg:inline">Proyecto MACTI</span>
            <span className="hidden lg:inline"> | </span>
            <span className="block lg:inline">Todos los derechos reservados</span>
            <span className="hidden lg:inline"> | </span>
            <span className="block lg:inline">© 2026</span>
          </p>
        </div>

        <div className="flex items-center gap-6 justify-center md:justify-end">
          <CienciasLogo
            role="img"
            aria-label="Escudo Ciencias UNAM"
            className="h-16 w-auto object-contain brightness-0 invert"
          />
          <Image
            src={CienciasNucleares}
            alt="Logo Ciencias Nucleares UNAM"
            className="h-16 w-auto object-contain"
          />
        </div>
      </div>
    </footer>
  );
}
