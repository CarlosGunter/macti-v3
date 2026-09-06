import InstituteCard from "@/domains/home/components/InstituteCard";
import { HeaderBasic } from "@/shared/components/common/HeaderBasic";
import { institutes } from "@/shared/config/institutes";

export default function Home() {
  return (
    <>
      <HeaderBasic />
      <div className="max-w-11/12 mx-auto px-2 md:px-0 w-full">
        <main className="grid gap-6 w-full">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Explorar Dependencias
          </h2>
          <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {Object.entries(institutes).map(([key, institute]) => (
              <InstituteCard key={key} id={key} {...institute} />
            ))}
          </section>
        </main>
      </div>
    </>
  );
}
