export type ProjectType = 'website' | 'app' | 'video' | 'trading' | 'workflow';

export interface ProjectSummary {
  id: string;
  name: string;
  type: ProjectType;
  updated_at: string;
  status?: string;
}

export interface FileNode {
  path: string;
  content: string;
}

export interface AIChatRequest {
  message: string;
  project_id?: string;
}

export interface ChatAction {
  type: 'open_project' | 'open_file' | 'run_analysis';
  label: string;
  project_id?: string;
  path?: string;
  symbol?: string;
}

export interface ChatResponse {
  reply: string;
  actions?: ChatAction[];
}

export interface TradingAnalysis {
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  risk: 'low' | 'medium' | 'high';
  analysis: string;
  symbol?: string;
}

export interface VideoJob {
  job_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  video_url?: string;
  prompt: string;
}

export interface WorkflowView {
  trigger: { type: string; description: string };
  actions: { type: string; description: string }[];
  status: 'active' | 'paused';
}
