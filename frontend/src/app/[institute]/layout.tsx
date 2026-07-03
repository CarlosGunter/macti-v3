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
      <Header institute={institute} />
      <div className="max-w-6xl mx-auto p-2">{children}</div>
    </RuntimeRecoveryBoundary>
  );
}
