import Image from "next/image";
import Link from "next/link";
import MactiLogo from "@/assets/image/logos/macti_logo.png";

export function HeaderBasic() {
  return (
    <header className="w-full p-4 flex justify-between items-center mb-4">
      <Link href="/" aria-label="Ir a la página principal">
        <Image src={MactiLogo.src} alt="Macti Logo" width={86} height={40} />
      </Link>
    </header>
  );
}
