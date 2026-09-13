import { Spinner } from "./Spinner";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  variant?: "recommended" | "danger" | "default" | "secondary";
}

const variants = {
  recommended: "bg-green-700 text-white hover:bg-green-600",
  danger: "bg-red-700 text-white hover:bg-red-600",
  default:
    "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground",
  secondary:
    "bg-primary text-primary-foreground border border-primary-foreground hover:bg-accent hover:text-accent-foreground hover:border-border",
};

export default function Button({
  children,
  onClick,
  type = "button",
  disabled = false,
  isLoading = false,
  className = "",
  variant = "default",
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled || isLoading}
      className={`${className} inline-flex items-center justify-center gap-2 duration-200 px-4 py-2 shadow-lg rounded-xl transition-all font-semibold ${variants[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${isLoading && "cursor-progress"}`}
    >
      {isLoading && <Spinner />}
      {children}
    </button>
  );
}
