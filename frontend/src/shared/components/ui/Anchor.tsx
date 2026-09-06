import Link from "next/link";

interface AnchorProps {
  children: React.ReactNode;
  href: string;
  className?: string;
  variant?: "default" | "secondary" | "bordered";
  external?: boolean;
}

const variants = {
  default:
    "bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground",
  secondary:
    "bg-secondary text-secondary-foreground border border-gray-300 dark:border-gray-600 hover:bg-secondary/80",
  bordered:
    "bg-primary text-primary-foreground border-2 font-bold border-secondary hover:bg-accent hover:border-accent hover:text-accent-foreground",
};

export function Anchor({
  children,
  href,
  className = "",
  variant = "default",
  external = false,
}: AnchorProps) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : "_self"}
      className={`flex justify-center items-center gap-2 p-2 rounded-lg transition-all duration-200 ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
