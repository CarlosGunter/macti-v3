import { HeaderBasic } from "@/shared/components/common/HeaderBasic";

export default function RegistroLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderBasic />
      <main className="flex flex-col items-center max-w-6xl mx-auto p-2">{children}</main>
    </>
  );
}
