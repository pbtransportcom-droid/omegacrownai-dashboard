import { PropsWithChildren } from 'react';
import { ContextSidebar } from '@/components/layout/ContextSidebar';
import { TopNav } from '@/components/layout/TopNav';

export function AppShell({ section, children }: PropsWithChildren<{ section: 'build' | 'trade' | 'create' | 'automate' | 'projects' | 'chat' }>) {
  return (
    <div className="min-h-screen bg-bg text-text">
      <TopNav />
      <div className="flex min-h-[calc(100vh-73px)]">
        <ContextSidebar section={section} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
