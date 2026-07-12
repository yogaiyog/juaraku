"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import type { QuizQuestion } from "@/lib/types";
import Badge from "./Badge";

type QuizQuestionWithImage = QuizQuestion & { image?: string };

type Props = {
  questions: QuizQuestionWithImage[];
};

export default function StepQuiz({ questions }: Props) {
  const [answers, setAnswers] = useState<Record<number, number | null>>({});

  const answered = Object.keys(answers).length;
  const correct = questions.reduce((count, q, i) => {
    const selected = answers[i];
    if (selected !== null && selected !== undefined && q.choices[selected]?.correct) {
      return count + 1;
    }
    return count;
  }, 0);

  const handleSelect = useCallback((qIndex: number, cIndex: number) => {
    setAnswers((prev) => {
      if (prev[qIndex] !== undefined) return prev;
      return { ...prev, [qIndex]: cIndex };
    });
  }, []);

  return (
    <div className="flex flex-col gap-8">
      {answered > 0 && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center dark:border-green-800 dark:bg-green-950/20">
          <p className="text-lg font-bold text-green-700 dark:text-green-400">
            {correct} / {answered} correct
            {answered === questions.length && (
              <>
                {" "}
                —{" "}
                {correct === questions.length
                  ? "Perfect score!"
                  : "Keep learning!"}
              </>
            )}
          </p>
        </div>
      )}

      {questions.map((question, qIndex) => {
        const selected = answers[qIndex];
        const showFeedback = selected !== undefined;
        const isCorrect = selected !== null && selected !== undefined
          ? question.choices[selected]?.correct
          : false;

        return (
          <div
            key={qIndex}
            className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="mb-6 flex items-center gap-3">
              <Badge variant="quiz">
                Question {qIndex + 1} of {questions.length}
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
                      onClick={() => handleSelect(qIndex, i)}
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
              <div className="mt-6 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <p
                  className={`text-lg font-bold ${
                    isCorrect ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isCorrect ? "Correct!" : "Wrong!"}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
