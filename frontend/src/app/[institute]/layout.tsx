import { Header } from "@/shared/components/common/Header";
import { RuntimeRecoveryBoundary } from "@/shared/components/feedback/RuntimeRecoveryBoundary";
import { QueryContextProvider } from "@/shared/providers/QueryProvider";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ institute: string }>;
}

/**
 * Layout principal por instituto que provee el encabezado institucional,
 * la recuperación ante errores en tiempo de ejecución y el contexto compartido
 * de TanStack React Query para todas las rutas hijas.
 *
 * @param props Propiedades del layout con el segmento dinámico `institute`.
 */
export default async function Layout({ children, params }: LayoutProps) {
  const { institute } = await params;
  return (
    <RuntimeRecoveryBoundary>
      <QueryContextProvider>
        <div className="w-full flex flex-col items-center gap-6">
          <Header institute={institute} />
          <div className="w-11/12 p-2 sm:p-0">{children}</div>
        </div>
      </QueryContextProvider>
    </RuntimeRecoveryBoundary>
  );
}
