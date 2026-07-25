"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { EditorView } from "@codemirror/view";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const DARK_KEY = "python-editor-dark";

type InitPayload = {
  instructions?: string;
  defaultCode?: string;
  title?: string;
  studentId?: string;
  token?: string;
  fallbackUrl?: string;
  taskCode?: string;
  projectId?: string;
};

type SkType = {
  configure: (opts: {
    output?: (text: string) => void;
    read?: (name: string) => string;
    inputfun?: (prompt: string) => string | Promise<string>;
    inputfunTakesPrompt?: boolean;
  }) => void;
  misceval: {
    asyncToPromise: <T>(fn: () => T) => Promise<T>;
  };
  importMainWithBody: (
    name: string,
    dummy: boolean,
    body: string,
    opts?: {
      output?: (text: string) => void;
      input?: (prompt: string) => Promise<string>;
      read?: (name: string) => string;
    },
  ) => Promise<void>;
};

const DEFAULT_CODE = `print("Hello from Skulpt!")

for i in range(5):
    print("Number:", i)
`;

const DEFAULT_INSTRUCTIONS = `## Project Editor

Tulis kode Python di editor lalu klik **Run** untuk menjalankannya langsung di browser.

### Fitur
- **Syntax highlighting** — warna otomatis untuk kode Python
- **Dark mode** — toggle \\🌙 / ☀️ di pojok kanan
- **Turtle graphics** — dukung \`import turtle\`
- **Input interaktif** — \`input()\` akan menampilkan kolom input
`;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

function usesTurtle(code: string): boolean {
  return /^import turtle\b|^from turtle\b/m.test(code.trim());
}

function getInitialDark(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(DARK_KEY);
  if (stored !== null) return stored === "true";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function isCodeLine(line: string, prevWasCode: boolean): boolean {
  if (line.includes("{") && line.includes("}")) return true;
  if (prevWasCode && /^\s+/.test(line)) return true;
  if (prevWasCode && /\S+:\s*$/.test(line) && !/^[#\->*|`\d]/.test(line)) return true;
  return false;
}

function splitIntoSegments(md: string): { type: "md" | "code"; text: string }[] {
  const lines = md.split("\n");
  const segments: { type: "md" | "code"; text: string }[] = [];
  let current: string[] = [];
  let currentType: "md" | "code" | null = null;

  function flush() {
    if (current.length > 0) {
      segments.push({ type: currentType!, text: current.join("\n") });
      current = [];
    }
  }

  for (const line of lines) {
    const isCode = isCodeLine(line, currentType === "code");
    const type = isCode ? "code" : "md";
    if (type !== currentType) flush();
    currentType = type;
    current.push(line);
  }
  flush();

  return segments;
}

function PythonCodeBlock({ code, dark }: { code: string; dark: boolean }) {
  return (
    <div
      className={`my-2 overflow-hidden rounded-md border ${
        dark ? "border-zinc-700" : "border-zinc-300"
      }`}
    >
      <CodeMirror
        value={code}
        extensions={[python(), EditorView.editable.of(false)]}
        theme={dark ? "dark" : "light"}
        height="auto"
        basicSetup={{
          lineNumbers: false,
          foldGutter: false,
          bracketMatching: true,
          closeBrackets: false,
          indentOnInput: false,
          highlightActiveLine: false,
          autocompletion: false,
        }}
      />
    </div>
  );
}

function InstructionsPanel({
  instructions,
  dark,
}: {
  instructions: string;
  dark: boolean;
}) {
  const segments = useMemo(() => splitIntoSegments(instructions), [instructions]);

  return (
    <div
      className={`prose prose-sm max-w-none overflow-auto rounded-lg border p-3 shadow-sm ${
        dark
          ? "prose-invert border-zinc-700 bg-zinc-900"
          : "border-zinc-300 bg-white"
      }`}
    >
      {segments.map((seg, i) =>
        seg.type === "code" ? (
          <PythonCodeBlock key={i} code={seg.text} dark={dark} />
        ) : (
          <ReactMarkdown key={i} remarkPlugins={[remarkGfm]}>
            {seg.text}
          </ReactMarkdown>
        ),
      )}
    </div>
  );
}

export default function ProjectEditor() {
  const [sk, setSk] = useState<SkType | null>(null);
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [showTurtle, setShowTurtle] = useState(false);
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);
  const [integrated, setIntegrated] = useState(false);
  const [taskCode, setTaskCode] = useState<string | null>(null);
  const [instructions, setInstructions] = useState(DEFAULT_INSTRUCTIONS);
  const [editorTitle, setEditorTitle] = useState("Project Editor");
  const outputRef = useRef<HTMLPreElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const turtleRef = useRef<HTMLDivElement>(null);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const inputCallbackRef = useRef<((value: string) => void) | null>(null);
  const initTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDark(getInitialDark());
    setReady(true);
  }, []);

  useEffect(() => {
    async function loadSkulpt() {
      try {
        await loadScript("/skulpt/skulpt.min.js");
        await loadScript("/skulpt/skulpt-stdlib.js");
        const Sk = (window as unknown as Record<string, unknown>).Sk as SkType;
        setSk(() => Sk);
      } catch {
        setSk(null);
      }
    }
    loadSkulpt();
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (window.opener) {
      window.opener.postMessage({ type: "python-editor:ready" }, "*");
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type !== "python-editor:init") return;
      const payload = event.data.payload as InitPayload;
      if (!payload) return;

      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }

      setIntegrated(true);
      if (payload.instructions) setInstructions(payload.instructions);
      if (payload.defaultCode) setCode(payload.defaultCode);
      if (payload.title) setEditorTitle(payload.title);
      if (payload.taskCode) setTaskCode(payload.taskCode);
    };

    window.addEventListener("message", handleMessage);

    initTimeoutRef.current = setTimeout(() => {
      if (!integrated) {
        setEditorTitle("Project Editor (Offline Mode)");
      }
    }, 5000);

    return () => {
      window.removeEventListener("message", handleMessage);
      if (initTimeoutRef.current) clearTimeout(initTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const sendProgress = useCallback(
    (status: string) => {
      if (!integrated || !window.opener) return;
      window.opener.postMessage(
        {
          type: "python-editor:progress",
          payload: { status, taskCode },
        },
        "*",
      );
    },
    [integrated, taskCode],
  );

  const handleDone = useCallback(() => {
    if (integrated && window.opener) {
      window.opener.postMessage(
        {
          type: "python-editor:done",
          payload: { status: "completed", taskCode },
        },
        "*",
      );
    }
    window.close();
  }, [integrated, taskCode]);

  const toggleDark = useCallback(() => {
    setDark((v) => {
      const next = !v;
      localStorage.setItem(DARK_KEY, String(next));
      return next;
    });
  }, []);

  const handleInput = useCallback(() => {
    if (inputCallbackRef.current && inputRef.current) {
      const value = inputRef.current.value;
      inputRef.current.value = "";
      setWaitingForInput(false);
      inputCallbackRef.current(value);
      inputCallbackRef.current = null;
    }
  }, []);

  const runCode = useCallback(() => {
    if (!sk) return;

    const withTurtle = usesTurtle(code);
    setShowTurtle(withTurtle);
    setRunning(true);
    setOutput("");
    setWaitingForInput(false);

    if (withTurtle && turtleRef.current) {
      turtleRef.current.innerHTML = "";
    }

    const inputFunc = (prompt: string) => {
      return new Promise<string>((resolve) => {
        setOutput((prev) => prev + prompt);
        setWaitingForInput(true);
        inputCallbackRef.current = resolve;
      });
    };

    sk.configure({
      output: (text: string) => setOutput((prev) => prev + text),
      inputfun: inputFunc,
      inputfunTakesPrompt: true,
    });

    const promise = sk.misceval.asyncToPromise(() =>
      sk.importMainWithBody("<stdin>", false, code, {
        output: (text: string) => setOutput((prev) => prev + text),
        input: inputFunc,
      }),
    );

    promise
      .then(() => {
        setRunning(false);
        sendProgress("in_progress");
      })
      .catch((err: Error) => {
        setOutput((prev) => prev + `\nError: ${err.toString()}\n`);
        setRunning(false);
      });
  }, [sk, code, sendProgress]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && waitingForInput) {
        handleInput();
      }
    },
    [waitingForInput, handleInput],
  );

  const loadTurtleExample = useCallback(() => {
    setCode(`import turtle

t = turtle.Turtle()
t.speed(3)

for _ in range(4):
    t.forward(100)
    t.right(90)
`);
    setOutput("");
    setShowTurtle(false);
  }, []);

  if (!sk || !ready) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-zinc-500">Loading Skulpt...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{editorTitle}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDark}
            className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
              dark
                ? "border-zinc-700 hover:bg-zinc-800"
                : "border-zinc-300 hover:bg-zinc-100"
            }`}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? "☀️" : "🌙"}
          </button>
          <button
            onClick={loadTurtleExample}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              dark
                ? "border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                : "border-zinc-300 text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            Turtle Example
          </button>
          <button
            onClick={runCode}
            disabled={running}
            className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {running ? "Running..." : "Run"}
          </button>
          <button
            onClick={handleDone}
            className={`rounded-lg px-5 py-2 text-sm font-medium text-white transition-colors ${
              integrated
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-zinc-400 cursor-not-allowed"
            }`}
            disabled={!integrated}
          >
            Selesai
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 max-sm:flex-col">
        <div className="flex flex-2 flex-col">
          <label className="mb-1 text-xs font-medium text-zinc-500 uppercase tracking-wide">
            Code
          </label>
          <div
            className={`flex-1 overflow-hidden rounded-lg border shadow-sm ${
              dark ? "border-zinc-700" : "border-zinc-300"
            }`}
          >
            <CodeMirror
              value={code}
              onChange={(val) => setCode(val)}
              extensions={[python()]}
              theme={dark ? "dark" : "light"}
              height="100%"
              basicSetup={{
                lineNumbers: true,
                foldGutter: false,
                bracketMatching: true,
                closeBrackets: true,
                indentOnInput: true,
                highlightActiveLine: true,
                autocompletion: false,
              }}
            />
          </div>

          <div className="mt-4 flex flex-col">
            <label className="mb-1 text-xs font-medium text-zinc-500 uppercase tracking-wide">
              Instruksi
            </label>
            <InstructionsPanel instructions={instructions} dark={dark} />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-col flex-1">
            <label className="mb-1 text-xs font-medium text-zinc-500 uppercase tracking-wide">
              Output
            </label>
            <pre
              ref={outputRef}
              className={`font-mono flex-1 overflow-auto rounded-lg border p-3 text-sm leading-relaxed shadow-sm ${
                dark
                  ? "border-zinc-700 bg-zinc-950 text-zinc-100"
                  : "border-zinc-300 bg-zinc-50 text-zinc-900"
              }`}
            >
              {output || "Click Run to execute the code"}
            </pre>
            {waitingForInput && (
              <div className="mt-2 flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type input and press Enter..."
                  className={`font-mono flex-1 rounded-lg border px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                    dark
                      ? "border-zinc-700 bg-zinc-900"
                      : "border-zinc-300 bg-white"
                  }`}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              </div>
            )}
          </div>

          <div
            ref={turtleRef}
            id="turtle"
            className={`rounded-lg border bg-white shadow-sm ${
              dark ? "border-zinc-700" : "border-zinc-300"
            } ${showTurtle ? "" : "hidden"}`}
            style={showTurtle ? { minHeight: 400 } : undefined}
          />
        </div>
      </div>
    </div>
  );
}
