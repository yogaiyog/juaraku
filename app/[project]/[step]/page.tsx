import fs from "node:fs";
import path from "node:path";
import { getAllProjects, getProject, getProjectDir } from "@/lib/projects";
import { getStepContent, parseQuiz, parseQuizIntro } from "@/lib/markdown";
import { renderMarkdown } from "@/lib/render-markdown";
import { notFound } from "next/navigation";
import StepRenderer from "@/app/_components/StepRenderer";
import StepQuiz from "@/app/_components/StepQuiz";
import Button from "@/app/_components/Button";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ project: string; step: string }>;
};

export async function generateStaticParams() {
  const projects = await getAllProjects();
  const paths: { project: string; step: string }[] = [];

  for (const p of projects) {
    for (let i = 1; i <= p.stepCount; i++) {
      paths.push({ project: p.id, step: String(i) });
    }
  }

  return paths;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { project, step } = await params;
  const proj = await getProject(project);
  if (!proj) return { title: "Not Found" };
  const stepIdx = Number.parseInt(step, 10);
  const stepMeta = proj.meta.steps[stepIdx - 1];
  return {
    title: `${stepMeta?.title ?? `Step ${step}`} - ${proj.meta.title}`,
  };
}

export default async function StepPage({ params }: Props) {
  const { project, step } = await params;
  const proj = await getProject(project);
  if (!proj) notFound();

  const stepIdx = Number.parseInt(step, 10);
  if (Number.isNaN(stepIdx) || stepIdx < 1 || stepIdx > proj.stepCount) {
    notFound();
  }

  const stepMeta = proj.meta.steps[stepIdx - 1];
  const segments = await getStepContent(project, stepIdx);

  let quizIntro = "";
  const quizQuestions: ReturnType<typeof parseQuiz> = [];

  if (stepMeta.knowledge_quiz) {
    const quizDir = path.join(
      process.cwd(),
      "projects",
      getProjectDir(project),
      "en",
      stepMeta.knowledge_quiz.path
    );

    for (let q = 1; q <= stepMeta.knowledge_quiz.questions; q++) {
      const filePath = path.join(quizDir, `question_${q}.md`);
      if (!fs.existsSync(filePath)) continue;

      const raw = fs.readFileSync(filePath, "utf-8");
      if (q === 1) {
        quizIntro = parseQuizIntro(raw);
      }
      const questions = parseQuiz(raw);
      if (questions.length > 0) {
        quizQuestions.push(questions[0]);
      }
    }
  }

  const renderedQuizQuestions = quizQuestions.map((q) => ({
    ...q,
    text: renderMarkdown(q.text),
    legend: q.legend,
    image: q.image
      ? `/api/assets/${project}/${q.image}`
      : undefined,
    choices: q.choices.map((c) => ({
      ...c,
      label: renderMarkdown(c.label),
      feedback: renderMarkdown(c.feedback),
    })),
  }));

  return (
    <div>
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Step {stepIdx} of {proj.stepCount}
          </p>
          <p className="text-xs font-bold text-scratch-blue">
            {Math.round((stepIdx / proj.stepCount) * 100)}%
          </p>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-scratch-blue transition-all duration-500"
            style={{ width: `${(stepIdx / proj.stepCount) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <StepRenderer segments={segments} projectId={project} />
      </div>

      {renderedQuizQuestions.length > 0 && (
        <>
          {quizIntro && (
            <div
              className="prose prose-zinc mb-8 mt-8 max-w-none dark:prose-invert prose-a:text-scratch-blue"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(quizIntro) }}
            />
          )}
          <StepQuiz questions={renderedQuizQuestions} />
        </>
      )}

      <div className="mt-8 flex items-center justify-between">
        {stepIdx > 1 ? (
          <Button href={`/${project}/${stepIdx - 1}`} variant="secondary">
            ← Previous
          </Button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          {stepIdx < proj.stepCount && (
            <Button href={`/${project}/${stepIdx + 1}`} variant="primary">
              Next →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
