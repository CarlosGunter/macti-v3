import Image from "next/image";
import FallbackImage from "@/assets/images/fallback-img.webp";

interface CourseCardProps {
  children?: React.ReactNode;
  courseId: number;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
}

export default function CourseCard({
  children,
  title,
  description,
  imageUrl,
}: CourseCardProps) {
  return (
    <div className="bg-card border-slate-800/80 rounded-[2rem] overflow-hidden shadow-xl flex h-full flex-col transform hover:-translate-y-1 hover:border-black hover:shadow-md transition-all duration-200">
      <div className="bg-white flex flex-col items-center justify-center border-b border-slate-800/80 aspect-4/3">
        <Image src={imageUrl || FallbackImage} className="w-full h-full" alt="" />
      </div>

      <div className="p-6 flex flex-col grow justify-between space-y-6 group-hover:bg-[#00d9da]/20 transition-colors duration-200">
        <div className="space-y-1.5">
          <p className="text-xs sm:text-sm text-slate-600 font-medium tracking-wide">
            Nombre de la Facultad
          </p>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#0b2027] tracking-tight group-hover:text-black">
            {title}
          </h2>
        </div>

        <div className="space-y-2 pt-1 text-slate-800 text-xs tracking-tight font-medium">
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {description || "Curso sin descripción disponible."}
          </p>
        </div>

        <div className="flex items-center gap-2 text-slate-950 text-sm font-semibold pt-1">
          <p className="flex items-center gap-2 text-[#0b2027]/90 font-bold text-xs sm:text-sm">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <title>Tiempo del curso</title>
              <circle cx="12" cy="12" r="9"></circle>
              <polyline points="12 7 12 12 15 14"></polyline>
            </svg>
            Tiempo del curso [ 10hrs ]
          </p>
        </div>

        <div className="flex gap-4 pt-4 w-full *:flex-1">{children}</div>
      </div>
    </div>
  );
}
