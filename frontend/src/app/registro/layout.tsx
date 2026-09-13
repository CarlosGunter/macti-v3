import { HeaderBasic } from "@/shared/components/common/HeaderBasic";

export default function RegistroLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderBasic />
      <main className="w-11/12 p-2">{children}</main>
    </>
  );
}
