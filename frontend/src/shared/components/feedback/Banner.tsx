interface BannerProps {
  message: string;
  isError?: boolean;
}

export default function Banner({ message, isError = false }: BannerProps) {
  return (
    <div
      role="alert"
      className={`w-full p-4 mb-4 ${isError ? "bg-red-100 border-l-4 border-red-500 text-red-700" : "bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700"}`}
    >
      <p>{message}</p>
    </div>
  );
}
