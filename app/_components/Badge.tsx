type Props = {
  children: React.ReactNode;
  variant?: "challenge" | "quiz" | "category" | "default";
  className?: string;
};

const variants = {
  challenge: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  quiz: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  category: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  default: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

export default function Badge({ children, variant = "default", className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
