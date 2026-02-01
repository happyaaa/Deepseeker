import { ResearchSession } from '@/types/research';
import { cn } from '@/lib/utils';
import { 
  History, 
  Search, 
  CheckCircle2, 
  Loader2, 
  XCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SessionHistoryProps {
  sessions: ResearchSession[];
  activeSessionId: string | null;
  onSelectSession: (session: ResearchSession) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
}

const getStatusIcon = (status: ResearchSession['status']) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-3.5 h-3.5 text-success" />;
    case 'in_progress':
      return <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" />;
    case 'failed':
      return <XCircle className="w-3.5 h-3.5 text-destructive" />;
  }
};

export const SessionHistory = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession
}: SessionHistoryProps) => {
  return (
    <div className="h-full flex flex-col bg-sidebar">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <History className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-sm font-semibold text-sidebar-foreground">
              Research History
            </h2>
            <p className="text-xs text-muted-foreground font-mono">
              {sessions.length} sessions
            </p>
          </div>
        </div>
        
        <Button
          onClick={onNewSession}
          className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 gap-2 font-mono text-xs"
          variant="ghost"
        >
          <Plus className="w-4 h-4" />
          New Research
        </Button>
      </div>

      {/* Sessions list */}
      <ScrollArea className="flex-1 px-2 py-2">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Search className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm font-mono">No sessions yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={cn(
                  "group relative p-3 rounded-lg cursor-pointer transition-all duration-200",
                  "hover:bg-sidebar-accent/50",
                  activeSessionId === session.id 
                    ? "bg-sidebar-accent border border-primary/30" 
                    : "border border-transparent"
                )}
                onClick={() => onSelectSession(session)}
              >
                <div className="flex items-start gap-2">
                  {getStatusIcon(session.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-sidebar-foreground truncate font-medium">
                      {session.query}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                      {session.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
                
                {/* Delete button - shown on hover */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
