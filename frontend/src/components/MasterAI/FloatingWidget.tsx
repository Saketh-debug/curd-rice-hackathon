import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Minimize2, Maximize2, Loader2, RefreshCw, Satellite, Radio } from 'lucide-react';
import { apiClient } from '../../api/client';
import type { ChatMessage } from '../../types';
import clsx from 'clsx';

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
            const response = await fetch('http://localhost:8000/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: queryText,
                    session_id: sessionId
                }),
            });

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
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-orbitron font-bold text-xs tracking-wider shadow-[0_0_25px_rgba(0,212,255,0.4)] transition-all transform hover:scale-105 cursor-pointer"
                >
                    <Satellite className="w-5 h-5 text-black animate-spin-slow" />
                    <span>AEGIS Mission AI</span>
                </button>
            )}

            {isOpen && (
                <div className="w-[420px] max-w-[95vw] h-[580px] bg-[#070b16] border border-cyan-500/30 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="h-14 bg-[#0a1024] border-b border-slate-800 flex items-center justify-between px-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                                <Satellite className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-white font-orbitron font-bold text-xs tracking-wide">AEGIS Space Copilot</h3>
                                <div className="flex items-center gap-1.5 font-mono">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    <span className="text-[10px] text-slate-400">ISTRAC MOX Flight Assistant</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setMessages([])} className="p-1.5 text-slate-400 hover:text-white rounded transition-colors" title="Clear Chat">
                                <RefreshCw className="w-4 h-4" />
                            </button>
                            <button onClick={() => setIsOpen(false)} className="p-1.5 text-slate-400 hover:text-white rounded transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#050814] text-xs">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-4">
                                <Satellite className="w-10 h-10 text-cyan-400/60" />
                                <div className="space-y-1">
                                    <p className="text-white font-bold font-orbitron text-sm">
                                        AEGIS Flight Security Copilot
                                    </p>
                                    <p className="text-slate-400 text-xs leading-relaxed max-w-xs font-sans">
                                        Specialized in ISTRAC ground stations, satellite pass windows, and TT&C telemetry flow defense.
                                    </p>
                                </div>

                                {/* Suggested Prompts */}
                                <div className="space-y-2 w-full pt-2">
                                    <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest text-left">
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
                                            className="w-full text-left p-2.5 rounded-xl bg-[#0a1022] hover:bg-[#0e1736] border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 font-mono text-[11px] transition-all cursor-pointer truncate"
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
                                    msg.role === 'user' ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                                )}>
                                    {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                                </div>
                                <div className={clsx(
                                    "max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed font-sans",
                                    msg.role === 'user'
                                        ? "bg-cyan-500/15 text-cyan-100 border border-cyan-500/30 rounded-tr-sm"
                                        : "bg-[#0a1022] border border-slate-800 text-slate-300 rounded-tl-sm shadow-sm"
                                )}>
                                    {msg.content.split('\n').map((line, i) => (
                                        <p key={i} className="mb-1 last:mb-0">
                                            {line}
                                        </p>
                                    ))}
                                    <span className="text-[9px] font-mono opacity-40 block mt-1 text-right">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center shrink-0">
                                    <Satellite className="w-3.5 h-3.5 animate-spin" />
                                </div>
                                <div className="bg-[#0a1022] border border-slate-800 rounded-2xl rounded-tl-sm p-3 shadow-sm flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce delay-0"></span>
                                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce delay-150"></span>
                                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce delay-300"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-[#0a1024] border-t border-slate-800">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Query telemetry, ground stations, or pass windows..."
                                className="w-full pl-4 pr-12 py-2.5 rounded-xl bg-[#060a16] border border-slate-800 focus:border-cyan-500 focus:outline-none text-white placeholder-slate-500 text-xs font-mono"
                                disabled={isLoading}
                                autoFocus
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 p-1.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-black font-bold rounded-lg transition-colors cursor-pointer"
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
