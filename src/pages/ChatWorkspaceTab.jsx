import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, RotateCcw, AlertTriangle } from 'lucide-react';
import API from '../services/api';
import { toast } from 'react-toastify';

export default function ChatWorkspaceTab({ agent }) {
    const isAgentReady = Boolean(
        agent?._id &&
        agent?.businessDescription?.trim() &&
        agent?.provider &&
        agent?.customApiKey?.trim()
    );

    const activeAgentName = agent?.agentName || agent?.businessName || 'Enterprise AI';

    const getInitialMessage = () => ([
        {
            sender: 'bot',
            text: isAgentReady
                ? `Hello! Main ${activeAgentName} hoon. Bataiye, aaj main aapki kya madad kar sakta hoon?`
                : `⚠️ Aap ne abhi tak apna AI Agent generate nahi kiya hai. Pehle Agent Generator tab mein ja kar apna agent generate aur configure karein, phir yahan testing karein.`
        }
    ]);

    const [messages, setMessages] = useState(getInitialMessage);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        setMessages(getInitialMessage());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [agent?._id, isAgentReady]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const sendMessage = async () => {
        const userMsg = input.trim();
        if (!userMsg || loading) return;

        setInput('');
        setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);

        if (!isAgentReady) {
            const warningMsg =
                '⚠️ Pehle Agent Generator tab mein ja kar apna AI Agent generate aur configure karein, phir yahan testing karein.';
            toast.warning('Pehle Agent Generator tab mein ja kar agent generate karein!');
            setMessages((prev) => [...prev, { sender: 'bot', text: warningMsg }]);
            return;
        }

        setLoading(true);
        try {
            const res = await API.post('public/platform-sales-chat', {
                message: userMsg,
                visitorId: 'workspace_admin_tester',
                agentId: agent._id
            });

            if (res.data?.success && res.data?.reply) {
                setMessages((prev) => [...prev, { sender: 'bot', text: res.data.reply }]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    { sender: 'bot', text: '⚠️ Empty response received from AI agent.' }
                ]);
            }
        } catch (err) {
            console.error('Chat Workspace Error:', err);
            const errMsg =
                err.response?.data?.reply ||
                err.response?.data?.message ||
                'Failed to receive response from AI agent workspace.';
            toast.error(errMsg);
            setMessages((prev) => [
                ...prev,
                { sender: 'bot', text: errMsg.startsWith('⚠️') ? errMsg : `⚠️ ${errMsg}` }
            ]);
        } finally {
            setLoading(false);
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        sendMessage();
    };

    const handleResetChat = () => {
        if (loading) return;
        setMessages(getInitialMessage());
    };

    return (
        <div className="space-y-4 max-w-5xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex items-center justify-between gap-2">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground">AI Chat Workspace Sandbox</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Test your agent&apos;s live responses and context retrieval in real time
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleResetChat}
                    disabled={loading}
                    className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset Chat
                </button>
            </div>

            {!isAgentReady && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                        Agent abhi generate nahi hua hai — pehle <strong>Agent Generator</strong> tab mein ja kar apna AI Agent configure aur deploy karein, phir yahan chat testing karein.
                    </span>
                </div>
            )}

            {/* Chat Box Container */}
            <div className="flex-1 bg-card rounded-xl border border-border shadow-xs flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-3.5 border-b border-border bg-muted/30 flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                        <div className={`w-2 h-2 rounded-full ${isAgentReady ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                        <span className="text-xs font-semibold text-foreground">
                            {isAgentReady
                                ? `Active Sandbox Session (${activeAgentName})`
                                : 'Agent Not Configured'}
                        </span>
                    </div>
                    {isAgentReady && (
                        <span className="text-[11px] font-mono uppercase text-muted-foreground">
                            {agent.provider} • {agent.selectedModel}
                        </span>
                    )}
                </div>

                {/* Message Log */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {messages.map((m, idx) => (
                        <div key={idx} className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${m.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground border border-border'}`}>
                                {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                            </div>
                            <div className={`max-w-[75%] p-3 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${m.sender === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted text-foreground rounded-tl-none border border-border'}`}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex items-center gap-2 text-muted-foreground text-xs italic p-2">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> Agent is thinking...
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-card flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={
                            isAgentReady
                                ? 'Type a test message to your agent...'
                                : 'Pehle Agent Generator tab mein ja kar agent generate karein...'
                        }
                        className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        <span>Send</span>
                    </button>
                </form>
            </div>
        </div>
    );
}