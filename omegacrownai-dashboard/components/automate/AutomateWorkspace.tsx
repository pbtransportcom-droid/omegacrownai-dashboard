'use client';

import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Textarea } from '@/components/common/Textarea';
import { mockWorkflow } from '@/lib/mock-data';
import { generateWorkflow } from '@/lib/api/automate';
import { WorkflowView } from '@/lib/types';

export function AutomateWorkspace() {
  const [instruction, setInstruction] = useState('When BTC drops 3%, email me and generate a market recap video.');
  const [workflow, setWorkflow] = useState<WorkflowView | null>(mockWorkflow);

  async function onGenerate() {
  try {
    const result = await generateWorkflow(instruction);

    setWorkflow({
      trigger: {
        type: "generated",
        description: result.trigger,
      },
      actions: result.actions.map((action) => ({
        type: "action",
        description: action,
      })),
      status: result.status,
    });
  } catch {
    setWorkflow(mockWorkflow);
  }
}

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <h3 className="font-semibold">Natural language workflow</h3>
        <Textarea className="mt-4 min-h-36" value={instruction} onChange={(e) => setInstruction(e.target.value)} />
        <Button className="mt-4" onClick={onGenerate}>Generate workflow</Button>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Readable steps</h3>
          <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs text-success">{workflow?.status || 'paused'}</span>
        </div>
        <div className="mt-4 space-y-4 text-sm">
          <div className="rounded-xl border border-border bg-black/20 p-3">
            <p className="text-muted">Trigger</p>
            <p className="mt-1">{workflow?.trigger.description}</p>
          </div>
          {workflow?.actions.map((action) => (
            <div key={action.description} className="rounded-xl border border-border bg-black/20 p-3">
              <p className="text-muted">Action</p>
              <p className="mt-1">{action.description}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
