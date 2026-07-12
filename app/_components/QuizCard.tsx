"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import type { QuizQuestion } from "@/lib/types";
import Button from "./Button";
import Badge from "./Badge";

type Props = {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  onNext: () => void;
};

export default function QuizCard({
  question,
  questionNumber,
  totalQuestions,
  onNext,
}: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleSelect = (index: number) => {
    if (showFeedback) return;
    setSelected(index);
    setShowFeedback(true);
  };

  const isCorrect = selected !== null && question.choices[selected]?.correct;

  return (
    <div
      ref={cardRef}
      className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="mb-6 flex items-center gap-3">
        <Badge variant="quiz">
          Question {questionNumber} of {totalQuestions}
        </Badge>
        <p className="text-sm text-zinc-500">{question.legend}</p>
      </div>

      <div
        className="prose prose-zinc mb-6 max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: question.text }}
      />

      {question.image && (
        <Image
          src={question.image}
          alt=""
          width={800}
          height={600}
          className="mb-6 w-full rounded-xl border border-zinc-200 dark:border-zinc-700"
          unoptimized
        />
      )}

      <div className="flex flex-col gap-3">
        {question.choices.map((choice, i) => {
          let borderClass =
            "border-zinc-200 hover:border-scratch-blue dark:border-zinc-700 dark:hover:border-scratch-blue/60";
          if (showFeedback && i === selected) {
            borderClass = choice.correct
              ? "border-green-400 bg-green-50 shadow-sm shadow-green-100 dark:border-green-700 dark:bg-green-950/20"
              : "border-red-400 bg-red-50 shadow-sm shadow-red-100 dark:border-red-700 dark:bg-red-950/20";
          } else if (showFeedback && choice.correct) {
            borderClass =
              "border-green-400 bg-green-50 dark:border-green-700 dark:bg-green-950/20";
          }

          return (
            <div key={i}>
              <button
                onClick={() => handleSelect(i)}
                disabled={showFeedback}
                className={`w-full rounded-xl border p-4 text-left text-sm font-medium transition-all duration-200 ${borderClass} ${
                  !showFeedback ? "cursor-pointer" : ""
                }`}
              >
                <span
                  className="flex items-center gap-2"
                  dangerouslySetInnerHTML={{ __html: choice.label }}
                />
              </button>
              {showFeedback && i === selected && (
                <div
                  className="mt-2 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  dangerouslySetInnerHTML={{ __html: choice.feedback }}
                />
              )}
            </div>
          );
        })}
      </div>

      {showFeedback && (
        <div className="mt-8 flex items-center justify-between border-t border-zinc-100 pt-6 dark:border-zinc-800">
          <p
            className={`text-lg font-bold ${
              isCorrect ? "text-green-600" : "text-red-600"
            }`}
          >
            {isCorrect ? "🎉 Correct!" : "❌ Wrong!"}
          </p>
          <Button onClick={onNext} variant="primary">
            {questionNumber === totalQuestions
              ? "Finish Quiz"
              : "Next Question"}
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Button>
        </div>
      )}
    </div>
  );
}
