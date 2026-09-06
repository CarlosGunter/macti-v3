import { Header } from "@/shared/components/common/Header";
import { RuntimeRecoveryBoundary } from "@/shared/components/feedback/RuntimeRecoveryBoundary";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ institute: string }>;
}

export default async function Layout({ children, params }: LayoutProps) {
  const { institute } = await params;
  return (
    <RuntimeRecoveryBoundary>
      <div className="w-full flex flex-col items-center">
        <Header institute={institute} />
        <div className="w-11/12 max-w-6xl p-2 sm:p-0">{children}</div>
      </div>
    </RuntimeRecoveryBoundary>
  );
}
