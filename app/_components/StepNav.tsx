import Link from "next/link";
import type { StepEntry } from "@/lib/types";

type Props = {
  projectId: string;
  steps: StepEntry[];
  currentStep?: number;
};

export default function StepNav({
  projectId,
  steps,
  currentStep,
}: Props) {
  const completedSteps = currentStep ? currentStep - 1 : 0;

  return (
    <nav className="flex flex-col gap-1">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Steps
        </p>
        <span className="text-xs font-medium text-scratch-blue">
          {completedSteps}/{steps.length}
        </span>
      </div>

      <div className="relative">
        <div className="absolute left-3 top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-700" />

        <div
          className="absolute left-3 top-0 w-px bg-scratch-blue transition-all duration-500 ease-out"
          style={{
            height: steps.length > 0
              ? `${(completedSteps / steps.length) * 100}%`
              : "0%",
          }}
        />

        {steps.map((step, i) => {
          const stepNumber = i + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = currentStep !== undefined && stepNumber < currentStep;

          return (
            <Link
              key={i}
              href={`/${projectId}/${stepNumber}`}
              className={`
                group relative flex items-center gap-3 py-2 px-2 rounded-lg
                transition-all duration-200 ease-out
                ${
                  isActive
                    ? ""
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                }
              `}
            >
              <div
                className={`
                  relative z-10 flex items-center justify-center
                  w-6 h-6 rounded-full text-[10px] font-bold
                  transition-all duration-200 ease-out
                  ${
                    isActive
                      ? "bg-scratch-blue text-white shadow-md shadow-scratch-blue/30 scale-110"
                      : isCompleted
                        ? "bg-scratch-blue text-white shadow-sm"
                        : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 group-hover:bg-zinc-300 dark:group-hover:bg-zinc-600"
                  }
                `}
              >
                {isCompleted ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>

              <span
                className={`
                  text-sm flex-1 truncate transition-colors duration-200
                  ${
                    isActive
                      ? "font-bold text-black dark:text-white"
                      : isCompleted
                        ? "font-medium text-zinc-700 dark:text-zinc-300"
                        : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200"
                  }
                `}
              >
                {step.title}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
