import { ChatMessage as ChatMessageType } from '@/types/research';
import { TypewriterText } from './TypewriterText';
import { cn } from '@/lib/utils';
import { Copy, Check, User, Bot, Loader2, Globe } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  message: ChatMessageType;
  useTypewriter?: boolean;
}

export const ChatMessage = ({ message, useTypewriter = false }: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);
  const [typewriterComplete, setTypewriterComplete] = useState(!useTypewriter);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = message.type === 'user';
  const isLoading = message.isLoading;
  const sources = message.sources ?? [];

  return (
    <div 
      className={cn(
        "flex gap-3 animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
        isUser 
          ? "bg-primary/20 text-primary neon-border" 
          : "bg-accent/20 text-accent neon-border-cyan"
      )}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message bubble */}
      <div className={cn(
        "max-w-[80%] rounded-lg p-4",
        isUser 
          ? "bg-primary/10 border border-primary/30" 
          : "bg-secondary border border-border"
      )}>
        {isLoading ? (
          <div className="flex items-center gap-3 text-accent">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="font-mono text-sm">Thinking...</span>
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </div>
        ) : isUser ? (
          <p className="text-foreground">{message.content}</p>
        ) : (
          <>
            {sources.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">
                  Sources
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {sources.map((source) => {
                    let domain = '';
                    try {
                      domain = new URL(source.url).hostname.replace(/^www\./, '');
                    } catch {
                      domain = source.url;
                    }
                    return (
                      <a
                        key={`${source.title}-${source.url}`}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group min-w-[180px] max-w-[220px] flex-shrink-0 rounded-lg border border-border bg-muted/30 p-3 transition-all hover:-translate-y-1 hover:shadow-lg"
                      >
                        <div className="flex items-center gap-2 mb-2 text-accent">
                          <div className="w-6 h-6 rounded-md bg-accent/10 flex items-center justify-center">
                            <Globe className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-mono text-muted-foreground truncate">
                            {domain}
                          </span>
                        </div>
                        <div
                          className="text-sm text-foreground/90"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {source.title || domain}
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {useTypewriter && !message.disableTypewriter && !typewriterComplete ? (
              <div className="prose-cyber">
                <TypewriterText 
                  text={message.content} 
                  speed={5}
                  onComplete={() => setTypewriterComplete(true)}
                />
              </div>
            ) : (
              <div className="prose-cyber">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </>
        )}

        {/* Copy button for assistant messages */}
        {!isUser && !isLoading && typewriterComplete && (
          <div className="mt-3 pt-3 border-t border-border/50 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50 gap-2 h-8 px-3"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-success" />
                  <span className="text-xs font-mono">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-xs font-mono">Copy</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
