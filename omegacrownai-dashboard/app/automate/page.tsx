import { AutomateWorkspace } from '@/components/automate/AutomateWorkspace';
import { AppShell } from '@/components/layout/AppShell';
import { SectionHeader } from '@/components/layout/SectionHeader';

export default function AutomatePage() {
  return (
    <AppShell section="automate">
      <SectionHeader eyebrow="Automate" title="Workflow builder" subtitle="Natural-language first automation UI that renders human-readable triggers and actions." />
      <AutomateWorkspace />
    </AppShell>
  );
}
