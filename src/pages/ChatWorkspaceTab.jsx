import React, { useState } from 'react';
import { MessageSquare, Send, Bot, User, Loader2 } from 'lucide-react';
import API from '../services/api';
import { toast } from 'react-toastify';

export default function ChatWorkspaceTab({ agent }) {
    const [messages, setMessages] = useState([
        { sender: 'bot', text: `Hello! Main ${agent?.name || 'Enterprise AI'} hoon. Bataiye, aaj main aapki kya madad kar sakta hoon?` }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const res = await API.post('/platform-sales-chat', {
                message: userMsg,
                visitorId: 'workspace_admin_tester',
                agentId: agent?._id
            });

            if (res.data.success) {
                setMessages((prev) => [...prev, { sender: 'bot', text: res.data.reply }]);
            }
        } catch (err) {
            toast.error('Failed to receive response from AI agent workspace.');
            setMessages((prev) => [...prev, { sender: 'bot', text: '⚠️ Error: Unable to fetch response from backend.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
            <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground">AI Chat Workspace Sandbox</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Test your agent's live responses and context retrieval in real time</p>
            </div>

            {/* Chat Box Container */}
            <div className="flex-1 bg-card rounded-xl border border-border shadow-xs flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-3.5 border-b border-border bg-muted/30 flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs font-semibold text-foreground">Active Sandbox Session ({agent?.name || 'Agent'})</span>
                </div>

                {/* Message Log */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {messages.map((m, idx) => (
                        <div key={idx} className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${m.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground border border-border'}`}>
                                {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                            </div>
                            <div className={`max-w-[75%] p-3 rounded-xl text-xs leading-relaxed ${m.sender === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted text-foreground rounded-tl-none border border-border'}`}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex items-center gap-2 text-muted-foreground text-xs italic p-2">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> Agent is thinking...
                        </div>
                    )}
                </div>

                {/* Input Bar */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-card flex gap-2">
                    <input 
                        type="text" 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)} 
                        placeholder="Type a test message to your agent..." 
                        className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                        <Send className="w-3.5 h-3.5" /> Send
                    </button>
                </form>
            </div>
        </div>
    );
}