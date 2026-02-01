import { useState } from 'react';
import { useResearchAgent } from '@/hooks/useResearchAgent';
import { SessionHistory } from './SessionHistory';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { AgentStatePanel } from './AgentStatePanel';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Menu, 
  X, 
  Zap,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const ResearchDashboard = () => {
  const {
    sessions,
    activeSessionId,
    messages,
    processLogs,
    isProcessing,
    createNewSession,
    selectSession,
    deleteSession,
    submitQuery
  } = useResearchAgent();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [agentPanelOpen, setAgentPanelOpen] = useState(true);

  return (
    <div className="h-screen w-full flex overflow-hidden cyber-gradient">
      {/* Mobile sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden bg-card/80 backdrop-blur-sm border border-border"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </Button>

      {/* Left Sidebar - Session History */}
      <div
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-40 w-72 border-r border-border transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SessionHistory
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={selectSession}
          onNewSession={createNewSession}
          onDeleteSession={deleteSession}
        />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 flex-shrink-0 bg-card/30 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center neon-glow">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold gradient-text">
                Deep Research Agent
              </h1>
              <p className="text-xs text-muted-foreground font-mono flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-accent" />
                AI-Powered Research Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isProcessing && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/20 border border-accent/30">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-xs font-mono text-accent">Processing</span>
              </div>
            )}
          </div>
        </header>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 neon-border animate-pulse-glow">
                <MessageSquare className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">
                Start Your Research
              </h2>
              <p className="text-muted-foreground max-w-md mb-6">
                Enter a query below to begin. The AI agent will research, analyze, and compile a comprehensive report for you.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  'Latest trends in AI',
                  'Compare React vs Vue',
                  'Best practices for API design'
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => submitQuery(suggestion)}
                    className="px-4 py-2 rounded-lg bg-secondary/50 border border-border text-sm font-mono hover:border-primary/50 hover:bg-secondary transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto pb-4">
              {messages.map((message, index) => (
                <ChatMessage 
                  key={message.id} 
                  message={message}
                  useTypewriter={
                    message.type === 'assistant' && 
                    !message.isLoading && 
                    index === messages.length - 1
                  }
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="p-6 border-t border-border bg-card/30 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <ChatInput 
              onSubmit={submitQuery} 
              disabled={isProcessing} 
            />
          </div>
        </div>
      </div>

      {/* Right Panel - Agent State */}
      <AgentStatePanel
        logs={processLogs}
        isOpen={agentPanelOpen}
        onToggle={() => setAgentPanelOpen(!agentPanelOpen)}
        isProcessing={isProcessing}
      />
    </div>
  );
};
