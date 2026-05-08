import { BuildWorkspace } from '@/components/build/BuildWorkspace';
import { AppShell } from '@/components/layout/AppShell';
import { SectionHeader } from '@/components/layout/SectionHeader';

export default function BuildPage() {
  return (
    <AppShell section="build">
      <SectionHeader eyebrow="Build" title="Website, app, and code workspaces" subtitle="Launch website and app builder flows, then drill into dedicated project workspaces." />
      <BuildWorkspace />
    </AppShell>
  );
}
