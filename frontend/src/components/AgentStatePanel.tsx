import { ProcessLog } from '@/types/research';
import { ProcessTimeline } from './ProcessTimeline';
import { 
  PanelRightClose, 
  PanelRightOpen, 
  Activity, 
  Cpu 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface AgentStatePanelProps {
  logs: ProcessLog[];
  isOpen: boolean;
  onToggle: () => void;
  isProcessing: boolean;
}

export const AgentStatePanel = ({ 
  logs, 
  isOpen, 
  onToggle, 
  isProcessing 
}: AgentStatePanelProps) => {
  return (
    <>
      {/* Toggle button when closed */}
      {!isOpen && (
        <Button
          onClick={onToggle}
          variant="ghost"
          className="fixed right-4 top-4 z-50 bg-card/80 backdrop-blur-sm border border-border hover:border-accent/50 hover:bg-card"
        >
          <PanelRightOpen className="w-4 h-4 mr-2 text-accent" />
          <span className="font-mono text-xs">Agent State</span>
        </Button>
      )}

      {/* Panel */}
      <div
        className={cn(
          "h-full border-l border-border bg-card/50 backdrop-blur-sm transition-all duration-300 flex flex-col",
          isOpen ? "w-80 opacity-100" : "w-0 opacity-0 overflow-hidden"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                isProcessing 
                  ? "bg-accent/20 text-accent animate-pulse-glow" 
                  : "bg-muted text-muted-foreground"
              )}>
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold">
                  Live Agent State
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isProcessing ? "bg-accent animate-pulse" : "bg-muted-foreground/50"
                  )} />
                  <span className="text-xs text-muted-foreground font-mono">
                    {isProcessing ? 'Processing...' : 'Idle'}
                  </span>
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="text-muted-foreground hover:text-foreground"
            >
              <PanelRightClose className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Process logs */}
        <ScrollArea className="flex-1 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-accent" />
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Process Timeline
            </span>
            {logs.length > 0 && (
              <span className="text-xs font-mono bg-accent/20 text-accent px-1.5 py-0.5 rounded">
                {logs.length}
              </span>
            )}
          </div>
          <ProcessTimeline logs={logs} />
        </ScrollArea>

        {/* Stats footer */}
        {logs.length > 0 && (
          <div className="p-4 border-t border-border flex-shrink-0">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-success/10 rounded p-2">
                <div className="text-success font-mono text-lg font-bold">
                  {logs.filter(l => l.status === 'success').length}
                </div>
                <div className="text-xs text-muted-foreground">Success</div>
              </div>
              <div className="bg-warning/10 rounded p-2">
                <div className="text-warning font-mono text-lg font-bold">
                  {logs.filter(l => l.status === 'retry').length}
                </div>
                <div className="text-xs text-muted-foreground">Retries</div>
              </div>
              <div className="bg-destructive/10 rounded p-2">
                <div className="text-destructive font-mono text-lg font-bold">
                  {logs.filter(l => l.status === 'error').length}
                </div>
                <div className="text-xs text-muted-foreground">Errors</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
