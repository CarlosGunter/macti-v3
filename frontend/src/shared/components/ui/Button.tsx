import { Spinner } from "./Spinner";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  variant?: "recommended" | "danger" | "default";
}

const variants = {
  recommended: "bg-green-700 text-white hover:bg-green-600",
  danger: "bg-red-700 text-white hover:bg-red-600",
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
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
      className={`flex justify-center items-center gap-2 p-2 rounded-lg transition-shadow duration-200 ${variants[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${isLoading && "cursor-progress"} ${className}`}
    >
      {isLoading && <Spinner />}
      {children}
    </button>
  );
}
