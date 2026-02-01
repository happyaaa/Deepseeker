import { useState, useCallback, useEffect } from 'react';
import { 
  ResearchSession, 
  ChatMessage, 
  ProcessLog, 
  ResearchResponse 
} from '@/types/research';

const API_URL = 'http://localhost:8000/api/research';
const HISTORY_URL = 'http://localhost:8000/api/history';

export const useResearchAgent = () => {
  const [sessions, setSessions] = useState<ResearchSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [processLogs, setProcessLogs] = useState<ProcessLog[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch(HISTORY_URL);
        if (!response.ok) {
          throw new Error(`History API error: ${response.status}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          return;
        }
        const historySessions: ResearchSession[] = data.map((row) => {
          const timestamp = row.created_at ? new Date(row.created_at) : new Date();
          return {
            id: String(row.id ?? crypto.randomUUID()),
            query: row.query ?? '',
            timestamp,
            status: 'completed',
            response: {
              final_report: row.markdown_content ?? '',
              process_logs: row.logs ?? [],
              sources: row.sources ?? []
            }
          };
        });
        setSessions((prev) => {
          if (prev.length === 0) {
            return historySessions;
          }
          const existingIds = new Set(prev.map((s) => s.id));
          const merged = [...historySessions.filter((s) => !existingIds.has(s.id)), ...prev];
          return merged;
        });
      } catch (error) {
        console.error('History API error:', error);
      }
    };

    loadHistory();
  }, []);

  const createNewSession = useCallback(() => {
    const newSession: ResearchSession = {
      id: crypto.randomUUID(),
      query: '',
      timestamp: new Date(),
      status: 'in_progress'
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setMessages([]);
    setProcessLogs([]);
    return newSession;
  }, []);

  const selectSession = useCallback((session: ResearchSession) => {
    setActiveSessionId(session.id);
    if (session.response) {
      setMessages([
        {
          id: crypto.randomUUID(),
          type: 'user',
          content: session.query,
          timestamp: session.timestamp
        },
        {
          id: crypto.randomUUID(),
          type: 'assistant',
          content: session.response.final_report,
          timestamp: new Date(session.timestamp.getTime() + 1000),
          processLogs: session.response.process_logs,
          sources: session.response.sources,
          disableTypewriter: true
        }
      ]);
      setProcessLogs(session.response.process_logs);
    } else {
      setMessages([]);
      setProcessLogs([]);
    }
  }, []);

  const deleteSession = useCallback((id: string) => {
    fetch(`${HISTORY_URL}/${id}`, { method: 'DELETE' })
      .catch((error) => console.error('History delete error:', error));
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(null);
      setMessages([]);
      setProcessLogs([]);
    }
  }, [activeSessionId]);

  const submitQuery = useCallback(async (query: string) => {
    // Create or use existing session
    let sessionId = activeSessionId;
    if (!sessionId) {
      const newSession = createNewSession();
      sessionId = newSession.id;
    }

    // Update session with query
    setSessions(prev => prev.map(s => 
      s.id === sessionId 
        ? { ...s, query, status: 'in_progress' as const } 
        : s
    ));

    // Add user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: 'user',
      content: query,
      timestamp: new Date()
    };

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setIsProcessing(true);
    setProcessLogs([]);

    // Simulate initial processing steps
    const simulateProgress = async () => {
      const steps: ProcessLog[] = [
        { step: 'INIT', status: 'running', message: 'Initializing research agent...' },
      ];
      setProcessLogs([...steps]);
      
      await new Promise(r => setTimeout(r, 500));
      steps[0].status = 'success';
      steps.push({ step: 'PARSE', status: 'running', message: 'Parsing query parameters...' });
      setProcessLogs([...steps]);
      
      await new Promise(r => setTimeout(r, 400));
      steps[1].status = 'success';
      steps.push({ step: 'SEARCH', status: 'running', message: 'Searching knowledge base...' });
      setProcessLogs([...steps]);
    };

    try {
      // Start progress simulation
      simulateProgress();

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: ResearchResponse = await response.json();

      // Update process logs with actual API response
      setProcessLogs(data.process_logs);

      // Update session
      setSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { ...s, status: 'completed' as const, response: data } 
          : s
      ));

      // Replace loading message with actual response
      setMessages(prev => prev.map(msg => 
            msg.isLoading 
          ? {
              ...msg,
              content: data.final_report,
              isLoading: false,
              processLogs: data.process_logs,
              sources: data.sources,
              disableTypewriter: false
            }
          : msg
      ));

    } catch (error) {
      console.error('Research API error:', error);
      
      // Update with error state
      const errorLogs: ProcessLog[] = [
        { step: 'INIT', status: 'success', message: 'Agent initialized' },
        { step: 'CONNECT', status: 'error', message: 'Failed to connect to research API. Is the server running?' }
      ];
      setProcessLogs(errorLogs);

      setSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { ...s, status: 'failed' as const } 
          : s
      ));

      // Replace loading message with error
      setMessages(prev => prev.map(msg => 
        msg.isLoading 
          ? {
              ...msg,
              content: `**Error:** Unable to connect to the research API at \`${API_URL}\`.\n\nPlease ensure:\n- The backend server is running on port 8000\n- The endpoint \`/api/research\` is accessible\n- CORS is properly configured`,
              isLoading: false
            }
          : msg
      ));
    } finally {
      setIsProcessing(false);
    }
  }, [activeSessionId, createNewSession]);

  return {
    sessions,
    activeSessionId,
    messages,
    processLogs,
    isProcessing,
    createNewSession,
    selectSession,
    deleteSession,
    submitQuery
  };
};
