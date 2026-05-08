'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { FileTree } from '@/components/build/FileTree';
import { mockFiles } from '@/lib/mock-data';

export function EditorWorkspace({ title, mode }: { title: string; mode: 'website' | 'app' }) {
  const [activePath, setActivePath] = useState(mockFiles[0].path);
  const activeFile = useMemo(() => mockFiles.find((file) => file.path === activePath) ?? mockFiles[0], [activePath]);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.7fr_1.1fr_1fr]">
      <Card>
        <h3 className="font-semibold">File tree</h3>
        <div className="mt-4">
          <FileTree files={mockFiles} active={activePath} onSelect={setActivePath} />
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{title}</h3>
          <div className="flex gap-2">
            <Button variant="secondary">Regenerate section</Button>
            <Button>{mode === 'website' ? 'Publish' : 'Run preview'}</Button>
          </div>
        </div>
        <pre className="mt-4 min-h-[420px] overflow-auto rounded-2xl border border-border bg-black/30 p-4 text-sm text-slate-200">{activeFile.content}</pre>
      </Card>

      <Card>
        <h3 className="font-semibold">Live preview / assistant</h3>
        <div className="mt-4 flex h-[300px] items-center justify-center rounded-2xl border border-dashed border-border bg-black/20 text-sm text-muted">
          {mode === 'website' ? 'Preview pane for rendered site' : 'Preview pane for generated app'}
        </div>
        <div className="mt-4 rounded-2xl border border-border bg-black/20 p-4 text-sm text-muted">
          AI assistant panel: explain code, refactor file, add section, create API route.
        </div>
      </Card>
    </div>
  );
}
