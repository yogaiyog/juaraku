import { getFileText } from "@/lib/minio";
import { getAllProjects, getProject, getProjectDir } from "@/lib/projects";
import { parseQuiz, parseQuizIntro } from "@/lib/markdown";
import { renderMarkdown } from "@/lib/render-markdown";
import { applyTransforms } from "@/lib/transform-images";
import { notFound } from "next/navigation";
import QuizQuestionsClient from "./QuizQuestionsClient";
import Badge from "@/app/_components/Badge";
import ScratchContent from "@/app/_components/ScratchContent";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ project: string; quizId: string; question: string }>;
};

export async function generateStaticParams() {
  const projects = await getAllProjects();
  const paths: { project: string; quizId: string; question: string }[] = [];

  for (const p of projects) {
    for (const step of p.meta.steps) {
      if (step.knowledge_quiz) {
        for (let q = 1; q <= step.knowledge_quiz.questions; q++) {
          paths.push({
            project: p.id,
            quizId: step.knowledge_quiz.path,
            question: String(q),
          });
        }
      }
    }
  }

  return paths;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { project } = await params;
  const proj = await getProject(project);
  return { title: `Quiz - ${proj?.meta.title ?? "Not Found"}` };
}

function renderQuizHtml(text: string): string {
  return renderMarkdown(text);
}

export default async function QuizPage({ params }: Props) {
  const { project, quizId, question: questionStr } = await params;
  const proj = await getProject(project);
  if (!proj) notFound();

  const stepWithQuiz = proj.meta.steps.find(
    (s) => s.knowledge_quiz?.path === quizId
  );
  if (!stepWithQuiz?.knowledge_quiz) notFound();

  const questionIdx = Number.parseInt(questionStr, 10);
  if (
    Number.isNaN(questionIdx) ||
    questionIdx < 1 ||
    questionIdx > stepWithQuiz.knowledge_quiz.questions
  ) {
    notFound();
  }

  const dirName = await getProjectDir(project);

  let quizIntro = "";
  let quizQuestions = parseQuiz("");

  for (let q = 1; q <= stepWithQuiz.knowledge_quiz.questions; q++) {
    const minioKey = `projects/${dirName}/en/${quizId}/question_${q}.md`;
    const raw = await getFileText(minioKey);
    if (!raw) continue;

    if (q === questionIdx) {
      quizIntro = parseQuizIntro(raw);
      quizQuestions = parseQuiz(raw);
    }
  }

  const currentQuestion = quizQuestions[0];
  if (!currentQuestion) notFound();

  const renderedQuestion = {
    ...currentQuestion,
    text: renderQuizHtml(currentQuestion.text),
    choices: currentQuestion.choices.map((c) => ({
      ...c,
      label: applyTransforms(renderQuizHtml(c.label), project),
      feedback: applyTransforms(renderQuizHtml(c.feedback), project),
    })),
  };

  const totalQuestions = stepWithQuiz.knowledge_quiz.questions;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-extrabold text-zinc-900 sm:text-3xl dark:text-zinc-100">
          {stepWithQuiz.title}
        </h1>
        <Badge variant="quiz">📝 Quiz</Badge>
      </div>

      {quizIntro && (
        <ScratchContent
          className="prose prose-zinc mb-8 max-w-none dark:prose-invert prose-a:text-scratch-blue"
          html={renderQuizHtml(quizIntro)}
        />
      )}

      <QuizQuestionsClient
        project={project}
        quizId={quizId}
        questions={[renderedQuestion]}
        questionNumber={questionIdx}
        totalQuestions={totalQuestions}
      />
    </div>
  );
}
