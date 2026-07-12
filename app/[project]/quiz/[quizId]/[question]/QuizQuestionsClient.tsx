"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { QuizQuestion } from "@/lib/types";
import QuizCard from "@/app/_components/QuizCard";
import Button from "@/app/_components/Button";

type Props = {
  project: string;
  quizId: string;
  questions: QuizQuestion[];
  questionNumber: number;
  totalQuestions: number;
};

export default function QuizQuestionsClient({
  project,
  quizId,
  questions,
  questionNumber,
  totalQuestions,
}: Props) {
  const router = useRouter();
  const [score] = useState(0);
  const [finished, setFinished] = useState(false);

  if (finished) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm sm:p-12 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 text-6xl">🏆</div>
        <p className="mb-2 text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">
          {score} / {totalQuestions}
        </p>
        <p className="mb-8 text-lg text-zinc-500">Quiz complete!</p>
        <div className="flex justify-center gap-3">
          <Button href={`/${project}`} variant="secondary">
            Back to Project
          </Button>
          <Button href={`/${project}`} variant="primary">
            Continue
          </Button>
        </div>
      </div>
    );
  }

  const question = questions[0];
  const imageSrc = question.image
    ? `/api/assets/${project}/${question.image}`
    : undefined;

  return (
    <QuizCard
      question={{ ...question, image: imageSrc }}
      questionNumber={questionNumber}
      totalQuestions={totalQuestions}
      onNext={() => {
        if (questionNumber < totalQuestions) {
          router.push(
            `/${project}/quiz/${quizId}/${questionNumber + 1}`
          );
        } else {
          setFinished(true);
        }
      }}
    />
  );
}
