import InstituteCard from "@/domains/home/components/InstituteCard";
import { HeaderBasic } from "@/shared/components/common/HeaderBasic";
import { institutes } from "@/shared/config/institutes";

export default function Home() {
  return (
    <>
      <HeaderBasic />
      <div className="max-w-7xl mx-auto p-2 my-6 w-full">
        <main className="grid gap-4 w-full">
          <h2 className="text-4xl font-bold">Explorar Dependencias</h2>
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
