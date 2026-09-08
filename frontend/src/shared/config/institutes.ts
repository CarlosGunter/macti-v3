import type { StaticImageData } from "next/image";
import cuantico from "@/assets/image/institutes/cuantico.webp";
import encit from "@/assets/image/institutes/encit.webp";
import enes_jur from "@/assets/image/institutes/enes_jur.webp";
import enes_m from "@/assets/image/institutes/enes_m.webp";
import hpc from "@/assets/image/institutes/hpc.webp";
import ier from "@/assets/image/institutes/ier.webp";
import principal from "@/assets/images/CU_Rectoria.webp";
import ciencias from "@/assets/images/Facultad_de_Ciencias.png";
import ingenieria from "@/assets/images/Facultad_de_Ingenieria.jpg";
import igf from "@/assets/images/Igef_.png";

type Institute = {
  name: string;
  moodle: string;
  jupyter: string;
  details: string;
  image: StaticImageData;
};

export const institutes: Record<string, Institute> = {
  principal: {
    name: "Principal",
    moodle: "https://tlapoa.lamod.unam.mx/lmsier",
    jupyter: "https://tlapoa.lamod.unam.mx/hubier/hub",
    details: "/principal",
    image: principal,
  },
  cuantico: {
    name: "Escuela de computo cuantico",
    moodle: "https://moodle.org",
    jupyter: "https://jupyter.org",
    details: "/cuantico",
    image: cuantico,
  },
  ciencias: {
    name: "Facultad de ciencias",
    moodle: "https://moodle.org",
    jupyter: "https://jupyter.org",
    details: "/ciencias",
    image: ciencias,
  },
  ingenieria: {
    name: "Facultad de ingenieria",
    moodle: "https://moodle.org",
    jupyter: "https://jupyter.org",
    details: "/ingenieria",
    image: ingenieria,
  },
  encit: {
    name: "ENCiT",
    moodle: "https://moodle.org",
    jupyter: "https://jupyter.org",
    details: "/encit",
    image: encit,
  },
  ier: {
    name: "IER",
    moodle: "https://moodle.org",
    jupyter: "https://jupyter.org",
    details: "/ier",
    image: ier,
  },
  enes_m: {
    name: "ENES Morelia",
    moodle: "https://moodle.org",
    jupyter: "https://jupyter.org",
    details: "/enes_m",
    image: enes_m,
  },
  hpc: {
    name: "Cursos HPC",
    moodle: "https://moodle.org",
    jupyter: "https://jupyter.org",
    details: "/hpc",
    image: hpc,
  },
  igf: {
    name: "Instituto de geofisica",
    moodle: "https://moodle.org",
    jupyter: "https://jupyter.org",
    details: "/igf",
    image: igf,
  },
  enes_jur: {
    name: "ENES Juriquilla",
    moodle: "https://moodle.org",
    jupyter: "https://jupyter.org",
    details: "/enes_jur",
    image: enes_jur,
  },
};

export type InstitutesType = keyof typeof institutes;
