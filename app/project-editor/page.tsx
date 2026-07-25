import ProjectEditor from "./ProjectEditor";

export const metadata = {
  title: "Project Editor - JuaraKu",
  description: "Python code editor",
};

export default function ProjectEditorPage() {
  return (
    <div className="flex flex-1 flex-col">
      <ProjectEditor />
    </div>
  );
}
