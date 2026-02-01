import { useState, KeyboardEvent } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSubmit: (query: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSubmit, disabled }: ChatInputProps) => {
  const [query, setQuery] = useState('');

  const handleSubmit = () => {
    if (query.trim() && !disabled) {
      onSubmit(query.trim());
      setQuery('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative">
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-xl blur-lg opacity-50" />
      
      <div className="relative cyber-panel p-2 flex gap-2 items-end">
        <div className="flex-1 relative">
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your research query..."
            disabled={disabled}
            className={cn(
              "min-h-[60px] max-h-[200px] resize-none bg-background/50 border-border",
              "placeholder:text-muted-foreground/50 font-mono text-sm",
              "focus:border-primary/50 focus:ring-1 focus:ring-primary/30",
              "transition-all duration-300"
            )}
            rows={1}
          />
          <div className="absolute bottom-2 left-3 flex items-center gap-1.5 text-muted-foreground/40">
            <Sparkles className="w-3 h-3" />
            <span className="text-xs font-mono">Deep Research Agent</span>
          </div>
        </div>
        
        <Button
          onClick={handleSubmit}
          disabled={!query.trim() || disabled}
          className={cn(
            "h-[60px] w-[60px] rounded-lg transition-all duration-300",
            "bg-primary/90 hover:bg-primary text-primary-foreground",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            query.trim() && !disabled && "neon-glow"
          )}
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
