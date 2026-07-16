export type StepEntry = {
  title: string;
  completion?: string[];
  knowledge_quiz?: {
    path: string;
    version: number;
    questions: number;
    passing_score: number;
  };
};

export type ProjectMeta = {
  title: string;
  hero_image: string;
  description: string;
  listed: boolean;
  copyedit: boolean;
  last_tested: string;
  version?: number;
  steps: StepEntry[];
  meta_title?: string;
  meta_description?: string;
  pdf?: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type Path = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export type Project = {
  id: string;
  meta: ProjectMeta;
  stepCount: number;
  directoryName: string;
  categories: Category[];
  paths: Path[];
  pathIndex?: number;
  certificate?: string | null;
};

export type ContentSegment =
  | { type: "markdown"; content: string }
  | { type: "task"; content: string }
  | { type: "print-only"; content: string }
  | { type: "no-print"; content: string }
  | { type: "blocks3"; code: string }
  | { type: "collapse"; title: string; content: string }
  | { type: "save" };

export type QuizChoice = {
  correct: boolean;
  label: string;
  feedback: string;
  blocks3Code?: string;
};

export type QuizQuestion = {
  legend: string;
  text: string;
  image?: string;
  choices: QuizChoice[];
  blocks3Code?: string;
};

export type Quiz = {
  intro: string;
  path: string;
  questions: QuizQuestion[];
};
