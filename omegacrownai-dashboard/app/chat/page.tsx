import { ChatWindow } from '@/components/chat/ChatWindow';
import { AppShell } from '@/components/layout/AppShell';
import { SectionHeader } from '@/components/layout/SectionHeader';

export default function ChatPage() {
  return (
    <AppShell section="chat">
      <SectionHeader eyebrow="Chat" title="Universal AI assistant" subtitle="Send messages to /api/ai/chat with optional project context and structured action responses." />
      <ChatWindow />
    </AppShell>
  );
}
