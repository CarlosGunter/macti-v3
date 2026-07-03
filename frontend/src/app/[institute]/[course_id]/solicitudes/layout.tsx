import { QueryContextProvider } from "@/shared/providers/QueryProvider";

export default function SolicitudesLayout({ children }: { children: React.ReactNode }) {
  return <QueryContextProvider>{children}</QueryContextProvider>;
}
