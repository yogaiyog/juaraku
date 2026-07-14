export default function SavePanel() {
  return (
    <div className="my-6 rounded-xl border px-5 py-4 bg-zinc-800 border-zinc-700 text-white">
      <h3 className="flex items-center gap-2 text-base font-semibold">
        <svg
          className="h-5 w-5 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
          />
        </svg>
        Save your project
      </h3>
    </div>
  );
}
