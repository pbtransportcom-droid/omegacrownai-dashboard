export function FileTree({ files, active, onSelect }: { files: { path: string }[]; active: string; onSelect: (path: string) => void }) {
  return (
    <div className="space-y-2 text-sm">
      {files.map((file) => (
        <button
          key={file.path}
          onClick={() => onSelect(file.path)}
          className={`block w-full rounded-xl border px-3 py-2 text-left ${active === file.path ? 'border-accent bg-white/5 text-text' : 'border-border text-muted hover:bg-white/5 hover:text-text'}`}
        >
          {file.path}
        </button>
      ))}
    </div>
  );
}
