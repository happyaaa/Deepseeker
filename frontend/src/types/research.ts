export interface ProcessLog {
  step: string;
  status: 'success' | 'error' | 'retry' | 'pending' | 'running';
  message: string;
  timestamp?: string;
}

export interface ResearchResponse {
  final_report: string;
  process_logs: ProcessLog[];
  sources?: SourceItem[];
}

export interface SourceItem {
  title: string;
  url: string;
}

export interface ResearchSession {
  id: string;
  query: string;
  timestamp: Date;
  status: 'completed' | 'in_progress' | 'failed';
  response?: ResearchResponse;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  processLogs?: ProcessLog[];
  sources?: SourceItem[];
  disableTypewriter?: boolean;
}
