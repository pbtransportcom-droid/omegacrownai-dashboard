'use client';

import Link from 'next/link';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { mockFiles } from '@/lib/mock-data';

export function BuildWorkspace() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <h3 className="font-semibold">Build workflows</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-black/20 p-4">
            <p className="text-lg font-semibold">New Website</p>
            <p className="mt-2 text-sm text-muted">Generate a landing page, file tree, and preview.</p>
            <Link href="/build/website/web-001"><Button className="mt-4">Open website workspace</Button></Link>
          </div>
          <div className="rounded-2xl border border-border bg-black/20 p-4">
            <p className="text-lg font-semibold">New App</p>
            <p className="mt-2 text-sm text-muted">Generate a spec, codebase, and API routes.</p>
            <Link href="/build/app/app-002"><Button className="mt-4">Open app workspace</Button></Link>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold">Recent files</h3>
        <div className="mt-4 space-y-2 text-sm">
          {mockFiles.map((file) => (
            <div key={file.path} className="rounded-xl border border-border px-3 py-2.5 text-muted">
              {file.path}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
