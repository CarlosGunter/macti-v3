export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`w-5 h-5 transform group-hover:translate-x-1 transition-transform ${className}`}
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      viewBox="0 0 24 24"
    >
      <title>Arrow</title>
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M14 5l7 7m0 0l-7 7m7-7H3"
      ></path>
    </svg>
  );
}
