"use client";

import { usePathname } from "next/navigation";
import StepNav from "./StepNav";
import type { StepEntry } from "@/lib/types";

type Props = {
  projectId: string;
  steps: StepEntry[];
};

export default function StepNavClient({ projectId, steps }: Props) {
  const pathname = usePathname();

  const stepMatch = pathname.match(
    new RegExp(`^/${projectId}/(\\d+)$`)
  );
  const currentStep = stepMatch
    ? Number.parseInt(stepMatch[1], 10)
    : undefined;

  return (
    <StepNav
      projectId={projectId}
      steps={steps}
      currentStep={currentStep}
    />
  );
}
