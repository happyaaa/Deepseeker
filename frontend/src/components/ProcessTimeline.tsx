import { ProcessLog } from '@/types/research';
import { CheckCircle2, XCircle, RefreshCw, Loader2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessTimelineProps {
  logs: ProcessLog[];
}

const getStatusIcon = (status: ProcessLog['status']) => {
  switch (status) {
    case 'success':
      return <CheckCircle2 className="w-4 h-4" />;
    case 'error':
      return <XCircle className="w-4 h-4" />;
    case 'retry':
      return <RefreshCw className="w-4 h-4" />;
    case 'running':
      return <Loader2 className="w-4 h-4 animate-spin" />;
    case 'pending':
    default:
      return <Circle className="w-4 h-4" />;
  }
};

const getStatusColor = (status: ProcessLog['status']) => {
  switch (status) {
    case 'success':
      return 'text-success bg-success/20 border-success/50';
    case 'error':
      return 'text-destructive bg-destructive/20 border-destructive/50';
    case 'retry':
      return 'text-warning bg-warning/20 border-warning/50';
    case 'running':
      return 'text-accent bg-accent/20 border-accent/50';
    case 'pending':
    default:
      return 'text-muted-foreground bg-muted/20 border-muted/50';
  }
};

export const ProcessTimeline = ({ logs }: ProcessTimelineProps) => {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
        <Circle className="w-8 h-8 mb-3 opacity-50" />
        <p className="text-sm font-mono">No active processes</p>
        <p className="text-xs opacity-70">Submit a query to begin</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {logs.map((log, index) => (
        <div 
          key={index} 
          className={cn(
            "relative pl-8 pb-4 animate-fade-in",
            index === logs.length - 1 ? "" : "border-l border-border ml-3"
          )}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Timeline dot */}
          <div 
            className={cn(
              "absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center border",
              getStatusColor(log.status),
              log.status === 'running' && "animate-pulse-glow"
            )}
            style={{
              transform: 'translateX(-50%)',
              boxShadow: log.status === 'error' 
                ? '0 0 10px hsl(var(--destructive) / 0.5)' 
                : log.status === 'retry'
                ? '0 0 10px hsl(var(--warning) / 0.5)'
                : log.status === 'success'
                ? '0 0 10px hsl(var(--success) / 0.5)'
                : log.status === 'running'
                ? '0 0 10px hsl(var(--accent) / 0.5)'
                : 'none'
            }}
          >
            {getStatusIcon(log.status)}
          </div>

          {/* Content */}
          <div className="ml-2">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                "text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded",
                log.status === 'error' && "text-destructive bg-destructive/10",
                log.status === 'retry' && "text-warning bg-warning/10",
                log.status === 'success' && "text-success bg-success/10",
                log.status === 'running' && "text-accent bg-accent/10",
                log.status === 'pending' && "text-muted-foreground bg-muted/10"
              )}>
                {log.step}
              </span>
            </div>
            <p className={cn(
              "text-sm leading-relaxed",
              log.status === 'error' && "text-destructive/90",
              log.status === 'retry' && "text-warning/90",
              (log.status !== 'error' && log.status !== 'retry') && "text-foreground/80"
            )}>
              {log.message}
            </p>
            {log.timestamp && (
              <span className="text-xs text-muted-foreground font-mono mt-1 block">
                {log.timestamp}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
