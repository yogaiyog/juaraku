import PythonEditor from "./PythonEditor";

export const metadata = {
  title: "Python Editor - JuaraKu",
  description: "Run Python code in your browser using Skulpt",
};

export default function PythonEditorPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PythonEditor />
    </div>
  );
}
