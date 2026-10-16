import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Minimize2, Maximize2, Loader2, RefreshCw, Satellite, Radio } from 'lucide-react';
import { apiClient } from '../../api/client';
import type { ChatMessage } from '../../types';
import clsx from 'clsx';
import StarBorder from '../StarBorder';

export const FloatingWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (textToSend?: string) => {
        const queryText = textToSend || input;
        if (!queryText.trim() || isLoading) return;

        const userMsg: ChatMessage = { role: 'user', content: queryText, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        // Add a placeholder AI message that we will stream into
        setMessages(prev => [...prev, {
            role: 'ai',
            content: '',
            timestamp: new Date().toISOString()
        }]);

        try {
            let response: Response;
            try {
                response = await fetch('/api/ai/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: queryText, session_id: sessionId }),
                });
                if (!response.ok) throw new Error(`Proxy status: ${response.status}`);
            } catch {
                response = await fetch('http://localhost:8000/api/ai/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: queryText, session_id: sessionId }),
                });
                if (!response.ok) throw new Error(`Direct backend status: ${response.status}`);
            }

            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiResponse = '';

            const newSessionId = response.headers.get('X-Session-Id');
            if (newSessionId) setSessionId(parseInt(newSessionId));

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                aiResponse += chunk;

                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg.role === 'ai') {
                        lastMsg.content = aiResponse;
                    }
                    return newMessages;
                });
            }
        } catch (error) {
            console.error('Chat failed', error);
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMsg = newMessages[newMessages.length - 1];
                if (lastMsg.role === 'ai') {
                    lastMsg.content = "AEGIS Telemetry Error: Communication link with the local Ollama LLM / RAG engine timed out. Verify backend server is running on port 8000.";
                }
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[2000] font-sans">
            {!isOpen && (
                <StarBorder
                    color="#ff9933"
                    trailColor="#ffffff"
                    duration={4}
                    direction="clockwise"
                    stars={1}
                    trailLength={0.3}
                    thickness={1}
                    radius={10}
                    glow={0}
                    hover="lap"
                    sparkle={false}
                    clickPulse
                    theme="dark"
                    onClick={() => setIsOpen(true)}
                    backgroundColor="#1f1e1b"
                    borderColor="#34322d"
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-foreground font-sans font-medium text-xs tracking-wide border border-border shadow-lg hover:border-signal/50 cursor-pointer transition-all"
                >
                    <Satellite className="w-4 h-4 text-signal" />
                    <span>AEGIS Mission AI</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-signal/15 text-signal border border-signal/30 uppercase tracking-wider">Online</span>
                </StarBorder>
            )}

            {isOpen && (
                <div className="w-[420px] max-w-[95vw] h-[580px] bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="h-14 bg-card border-b border-border flex items-center justify-between px-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-signal">
                                <Satellite className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-foreground font-sans font-semibold text-xs tracking-wide">AEGIS Space Copilot</h3>
                                <div className="flex items-center gap-1.5 font-mono">
                                    <span className="w-1.5 h-1.5 rounded-full bg-grove"></span>
                                    <span className="text-[11px] text-muted-foreground">ISTRAC MOX Flight Assistant</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setMessages([])} className="p-1.5 text-muted-foreground hover:text-foreground rounded transition-colors" title="Clear Chat">
                                <RefreshCw className="w-4 h-4" />
                            </button>
                            <button onClick={() => setIsOpen(false)} className="p-1.5 text-muted-foreground hover:text-foreground rounded transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background text-xs">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-4">
                                <Satellite className="w-10 h-10 text-signal/70" />
                                <div className="space-y-1">
                                    <p className="text-foreground font-semibold font-sans text-sm">
                                        AEGIS Flight Security Copilot
                                    </p>
                                    <p className="text-muted-foreground text-xs leading-relaxed max-w-xs font-sans">
                                        Specialized in ISTRAC ground stations, satellite pass windows, and TT&C telemetry flow defense.
                                    </p>
                                </div>

                                {/* Suggested Prompts */}
                                <div className="space-y-2 w-full pt-2">
                                    <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-[0.14em] text-left">
                                        Suggested Inquiries:
                                    </div>
                                    {[
                                        "Why is a False Alarm critical during an 8-min LEO pass?",
                                        "How are ground station SLE ports 5100-5102 protected?",
                                        "Analyze the latest TT&C Uplink Saturation anomaly.",
                                    ].map((prompt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSend(prompt)}
                                            className="w-full text-left p-2.5 rounded-lg bg-card hover:bg-muted border border-border hover:border-signal/40 text-foreground font-mono text-[11px] transition-all cursor-pointer truncate"
                                        >
                                            🛰️ {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={idx} className={clsx("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                                <div className={clsx(
                                    "w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs",
                                    msg.role === 'user' ? "bg-signal/15 text-signal border border-signal/30" : "bg-secondary text-foreground border border-border"
                                )}>
                                    {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                                </div>
                                <div className={clsx(
                                    "max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed font-sans",
                                    msg.role === 'user'
                                        ? "bg-muted text-foreground border border-border rounded-tr-sm"
                                        : "bg-card border border-border text-foreground rounded-tl-sm shadow-sm"
                                )}>
                                    {msg.content.split('\n').map((line, i) => (
                                        <p key={i} className="mb-1 last:mb-0">
                                            {line}
                                        </p>
                                    ))}
                                    <span className="text-[10px] font-mono text-muted-foreground block mt-1 text-right">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-7 h-7 rounded-full bg-signal/15 text-signal border border-signal/30 flex items-center justify-center shrink-0">
                                    <Satellite className="w-3.5 h-3.5 animate-spin" />
                                </div>
                                <div className="bg-card border border-border rounded-2xl rounded-tl-sm p-3 shadow-sm flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-signal animate-bounce delay-0"></span>
                                    <span className="w-2 h-2 rounded-full bg-signal animate-bounce delay-150"></span>
                                    <span className="w-2 h-2 rounded-full bg-signal animate-bounce delay-300"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-card border-t border-border">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Query telemetry, ground stations, or pass windows..."
                                className="w-full pl-4 pr-12 py-2 rounded-lg bg-background border border-border focus:border-signal focus:outline-none text-foreground placeholder:text-muted-foreground text-xs font-mono"
                                disabled={isLoading}
                                autoFocus
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 p-1.5 bg-foreground hover:bg-white disabled:bg-muted text-background disabled:text-muted-foreground font-medium rounded-md transition-colors cursor-pointer"
                            >
                                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FloatingWidget;
