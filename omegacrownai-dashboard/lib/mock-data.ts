import { ProjectSummary, VideoJob, WorkflowView } from '@/lib/types';

export const mockProjects: ProjectSummary[] = [
  { id: 'web-001', name: 'OmegaCrown Landing Page', type: 'website', updated_at: '2026-04-20 09:15', status: 'draft' },
  { id: 'app-002', name: 'Signal Dashboard', type: 'app', updated_at: '2026-04-20 08:40', status: 'preview' },
  { id: 'vid-003', name: 'Daily Market Recap', type: 'video', updated_at: '2026-04-19 17:05', status: 'completed' },
  { id: 'trd-004', name: 'BTC Swing Analysis', type: 'trading', updated_at: '2026-04-19 14:25', status: 'ready' },
  { id: 'wrk-005', name: 'BTC 3% Alert', type: 'workflow', updated_at: '2026-04-19 13:10', status: 'active' }
];

export const mockFiles = [
  { path: 'app/page.tsx', content: `export default function Page() {\n  return <main className=\"p-24\">OmegaCrownAI</main>;\n}` },
  { path: 'components/Hero.tsx', content: `export function Hero() {\n  return <section>Hero</section>;\n}` },
  { path: 'styles/globals.css', content: `body { background: #0a0b10; color: white; }` }
];

export const mockVideoJobs: VideoJob[] = [
  { job_id: 'vid_1001', status: 'completed', prompt: 'Futuristic market recap', video_url: 'https://example.com/video.mp4' },
  { job_id: 'vid_1002', status: 'processing', prompt: 'AI city skyline brand trailer' }
];

export const mockWorkflow: WorkflowView = {
  trigger: { type: 'price_change', description: 'When BTC drops 3% in 24 hours' },
  actions: [
    { type: 'email', description: 'Email pbtransportcom@gmail.com' },
    { type: 'video', description: 'Generate a short market recap video' }
  ],
  status: 'active'
};
