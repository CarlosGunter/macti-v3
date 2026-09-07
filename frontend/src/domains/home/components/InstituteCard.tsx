"use client";

import Link from "next/dist/client/link";
import type { StaticImageData } from "next/image";
import Image from "next/image";

interface Institute {
  id: string;
  name: string;
  details: string;
  image: StaticImageData;
}

export default function InstituteCard({ id, name, details, image }: Institute) {
  return (
    <article>
      <Link
        href={details}
        className="group block border border-background rounded-2xl overflow-hidden  hover:shadow-md transition-all group shadow-xl flex-col h-full transform hover:-translate-y-1 hover:border-border duration-200 text-card-foreground bg-card hover:bg-accent/50"
      >
        <div className="w-full h-62.5 overflow-hidden flex items-center justify-center">
          <Image
            src={image}
            alt="Logo Instituto"
            className="h-full w-full object-cover group-hover:saturate-150 transition-all"
          />
        </div>
        <div className="border-t border-[#0a231c]/20 p-4 text-center transition-colors">
          <p className="text-sm font-semibold tracking-wide">{name}</p>
        </div>
      </Link>
    </article>
  );
}
