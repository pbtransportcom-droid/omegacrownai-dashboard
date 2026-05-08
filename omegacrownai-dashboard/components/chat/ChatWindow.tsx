'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { sendChat } from '@/lib/api/chat';
import { mockProjects } from '@/lib/mock-data';
import type { ChatAction, ChatResponse } from '@/lib/types';

export function ChatWindow() {
  const router = useRouter();
  const [message, setMessage] = useState('Build a landing page for OmegaCrownAI and use my latest market recap video.');
  const [projectId, setProjectId] = useState<string>('');
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSend() {
    setLoading(true);
    try {
      const data = await sendChat({ message, project_id: projectId || undefined });
      setResponse(data);
    } catch {
      setResponse({
        reply: 'Backend unavailable in scaffold mode. This UI is ready for /api/ai/chat.',
        actions: [{ type: 'open_project', label: 'Open landing page', project_id: 'web-001' }]
      });
    } finally {
      setLoading(false);
    }
  }

  function handleAction(action: ChatAction) {
    if (action.type === 'open_project' && action.project_id) {
      const project = mockProjects.find((p) => p.id === action.project_id);

      if (!project) {
        router.push('/projects');
        return;
      }

      if (project.type === 'website') {
        router.push(`/build/website/${project.id}`);
        return;
      }

      if (project.type === 'app') {
        router.push(`/build/app/${project.id}`);
        return;
      }

      if (project.type === 'video') {
        router.push('/create');
        return;
      }

      if (project.type === 'trading') {
        router.push('/trade');
        return;
      }

      if (project.type === 'workflow') {
        router.push('/automate');
        return;
      }

      router.push('/projects');
      return;
    }

    if (action.type === 'open_file') {
      router.push('/build');
      return;
    }

    if (action.type === 'run_analysis') {
      const symbol = action.symbol || 'BTCUSDT';
      router.push(`/trade?symbol=${encodeURIComponent(symbol)}`);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted">Context selector</p>
            <select
              className="mt-2 w-full rounded-xl border border-border bg-black/20 px-3 py-2.5 text-sm"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              <option value="">No project</option>
              {mockProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-border bg-black/20 p-4">
            <p className="text-sm text-muted">You</p>
            <p className="mt-2 whitespace-pre-wrap text-sm">{message}</p>
          </div>

          <div className="rounded-2xl border border-border bg-white/5 p-4">
            <p className="text-sm text-muted">Omega</p>
            <p className="mt-2 whitespace-pre-wrap text-sm">
              {response?.reply || 'Assistant responses will appear here.'}
            </p>
          </div>

          <div className="flex gap-3">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask OmegaCrown anything"
            />
            <Button onClick={onSend} disabled={loading}>
              {loading ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-base font-semibold">Proposed actions</h3>
        <div className="mt-4 space-y-3">
          {(response?.actions || []).map((action, index) => (
            <button
              key={`${action.label}-${index}`}
              type="button"
              onClick={() => handleAction(action)}
              className="w-full rounded-xl border border-border bg-black/20 p-3 text-left text-sm transition hover:bg-white/5"
            >
              <p className="font-medium">{action.label}</p>
              <p className="mt-1 text-muted">{action.type}</p>
            </button>
          ))}

          {!response?.actions?.length && (
            <p className="text-sm text-muted">
              Structured actions from /api/ai/chat will render here.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
