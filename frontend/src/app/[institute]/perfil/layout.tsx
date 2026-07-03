import { QueryContextProvider } from "@/shared/providers/QueryProvider";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <QueryContextProvider>{children}</QueryContextProvider>;
}
