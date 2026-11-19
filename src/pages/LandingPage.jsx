import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Bot, ArrowRight, ShieldCheck, Database, 
    MessageSquare, Check, Sun, Moon, 
    Sparkles, ChevronDown, Cpu, Zap, Activity, 
    PhoneCall, FileText, Play, Volume2, Layers,
    Lock, Globe, Terminal, CheckCircle2, ArrowUpRight,
    Sliders, Workflow, Server
} from 'lucide-react';

// Apne screenshots ko src/assets/ mein rakh kar in lines ko uncomment karein:
// import dashboardImg from '../assets/image_1d7e81.png';
// import chatbotImg from '../assets/Screenshot 2026-11-18 001758.png';

export default function LandingPage() {
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(false); // Default Light Mode
    const [openFaq, setOpenFaq] = useState(0);
    const [activeWidgetTab, setActiveWidgetTab] = useState('chat'); // 'chat' | 'voice' | 'form'
    const [demoMessages, setDemoMessages] = useState([
        { sender: 'ai', text: 'Hello! How can I help you today? I am synced with your live SQL & Sheets database.' }
    ]);
    const [demoInput, setDemoInput] = useState('');
    const [isCallActive, setIsCallActive] = useState(false);

    // Toggle Dark Mode Class on Root HTML element
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const handleDemoSend = (e) => {
        e.preventDefault();
        if (!demoInput.trim()) return;
        const userMsg = demoInput;
        setDemoMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setDemoInput('');

        setTimeout(() => {
            setDemoMessages(prev => [
                ...prev,
                { sender: 'ai', text: `Queried live database for "${userMsg}". Found 5 matching records in salary_sheet.xlsx with 42ms latency.` }
            ]);
        }, 600);
    };

    const faqs = [
        {
            q: "How does NWeb Console connect to my live SQL & Google Sheets?",
            a: "Our autonomous connector links directly with Supabase, PostgreSQL, MySQL, and Google Sheets via encrypted read-only tunnels. Every row update is indexed immediately so your AI agent answers with 100% live operational accuracy."
        },
        {
            q: "How does the 3-in-1 Omni-Channel Widget (Chat, Voice Call & Form) work?",
            a: "With a single embed script, your website visitors can switch seamlessly between instant AI text chat, low-latency AI voice calls, or structured lead-capture forms—all synced to your tenant dashboard."
        },
        {
            q: "How are tenant workspaces and visitor sessions isolated?",
            a: "Each business account runs inside a strictly isolated multi-tenant architecture. Visitor IP routing, session duration, and message logs are separated per unique Agent ID in MongoDB."
        },
        {
            q: "Can I upgrade plans and upload manual payment proofs?",
            a: "Yes. Businesses can start on the Free Trial (15 messages) and upgrade anytime to Basic, Silver, or Golden tiers by uploading payment slips, which are verified and logged in our permanent audit ledger."
        }
    ];

    return (
        <div 
            style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}
            className="min-h-screen bg-background text-foreground selection:bg-cyan-500/20 flex flex-col transition-colors duration-300 overflow-x-hidden"
        >
            {/* Custom 3D & Animation Styles */}
            <style>{`
                .font-mono-code { font-family: 'JetBrains Mono', monospace; }
                .perspective-container { perspective: 1600px; }
                .card-3d-dashboard {
                    transform: rotateY(6deg) rotateX(3deg);
                    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.6s ease;
                }
                .card-3d-dashboard:hover {
                    transform: rotateY(0deg) rotateX(0deg) translateY(-4px);
                }
                .card-3d-chatbot {
                    transform: rotateY(-12deg) rotateX(4deg) translateZ(30px);
                    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.6s ease;
                }
                .card-3d-chatbot:hover {
                    transform: rotateY(0deg) rotateX(0deg) translateZ(45px) scale(1.02);
                }
                @media (max-width: 1024px) {
                    .card-3d-dashboard, .card-3d-chatbot { transform: none !important; }
                }
            `}</style>

            {/* Top Navigation Bar */}
            <header className="border-b border-border/70 sticky top-0 bg-background/85 backdrop-blur-xl z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    
                    {/* Dummy Enterprise Company Logo */}
                    <div className="flex items-center gap-3.5 cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-blue-600/25 group-hover:scale-105 transition">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                <path d="M2 17l10 5 10-5" />
                                <path d="M2 12l10 5 10-5" />
                            </svg>
                            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-background"></span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-extrabold text-lg tracking-tight text-foreground">NWeb Console</span>
                                <span className="font-mono-code text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-cyan-400 border border-blue-500/20">
                                    AI CORE
                                </span>
                            </div>
                            <span className="text-[11px] font-semibold text-muted-foreground tracking-wide block">
                                Autonomous Agent Infrastructure
                            </span>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="hidden lg:flex items-center gap-8 text-[13px] font-semibold text-muted-foreground">
                        <a href="#showcase" className="hover:text-foreground transition">Live Platform</a>
                        <a href="#workflow" className="hover:text-foreground transition">How It Works</a>
                        <a href="#features" className="hover:text-foreground transition">Capabilities</a>
                        <a href="#pricing" className="hover:text-foreground transition">Pricing</a>
                        <a href="#faqs" className="hover:text-foreground transition">FAQs</a>
                    </nav>

                    {/* Action Controls */}
                    <div className="flex items-center gap-3">
                        {/* Theme Switcher (Default Light) */}
                        <button 
                            onClick={() => setIsDarkMode(!isDarkMode)} 
                            className="px-3 py-2 rounded-xl bg-card hover:bg-muted border border-border text-xs font-bold flex items-center gap-2 text-foreground transition shadow-xs cursor-pointer"
                            aria-label="Toggle color theme"
                        >
                            {isDarkMode ? (
                                <>
                                    <Sun className="w-4 h-4 text-amber-400" />
                                    <span className="hidden sm:inline">Light</span>
                                </>
                            ) : (
                                <>
                                    <Moon className="w-4 h-4 text-indigo-600" />
                                    <span className="hidden sm:inline">Dark</span>
                                </>
                            )}
                        </button>

                        <button 
                            onClick={() => navigate('/authentication')}
                            className="hidden sm:inline-flex px-4 py-2.5 text-[13px] font-bold text-muted-foreground hover:text-foreground transition cursor-pointer"
                        >
                            Sign In
                        </button>
                        <button 
                            onClick={() => navigate('/authentication')}
                            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white font-bold rounded-xl text-[13px] transition shadow-lg shadow-blue-600/25 flex items-center gap-2 cursor-pointer"
                        >
                            <span>Get Started</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section - Robo Call & AI Agent Aesthetic */}
            <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 px-6">
                {/* Ambient AI Mesh Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-tr from-blue-500/12 via-cyan-400/12 to-indigo-500/12 rounded-full blur-3xl pointer-events-none -z-10"></div>

                <div className="max-w-7xl mx-auto">
                    {/* Centered Hero Copy */}
                    <div className="text-center max-w-4xl mx-auto space-y-6">
                        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-600 dark:text-cyan-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                            <span>Enterprise Multi-Tier Voice, Chat & SQL Agent Engine</span>
                        </div>

                        <h1 className="text-4xl sm:text-6xl lg:text-[64px] font-extrabold tracking-tight text-foreground leading-[1.08]">
                            Deploy <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent">Autonomous AI Agents</span> Synced to Live Databases
                        </h1>

                        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
                            Connect Supabase, SQL databases, and Google Sheets in seconds. Launch 24/7 AI chat & voice agents with isolated visitor telemetry and real-time analytics.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
                            <button 
                                onClick={() => navigate('/authentication')}
                                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl text-sm transition shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2.5 cursor-pointer group"
                            >
                                <span>Start Free Trial — 15 Messages</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                            </button>
                            <a 
                                href="#showcase"
                                className="w-full sm:w-auto px-8 py-4 bg-card hover:bg-muted text-foreground border border-border font-bold rounded-2xl text-sm transition shadow-xs flex items-center justify-center gap-2.5 cursor-pointer"
                            >
                                <Play className="w-4 h-4 text-blue-600 fill-blue-600" />
                                <span>Test Live 3D Agent</span>
                            </a>
                        </div>

                        {/* Trust Metrics Strip */}
                        <div className="pt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs font-semibold text-muted-foreground">
                            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Sub-50ms DB Retrieval</span>
                            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Multi-Tenant Isolation</span>
                            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Voice + Chat + Form Widget</span>
                        </div>
                    </div>

                    {/* 3D Interactive Showcase: Admin Tenant Dashboard + 3D Floating Chatbot Model */}
                    <div id="showcase" className="mt-16 lg:mt-20 perspective-container relative">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                            
                            {/* LEFT (8 Cols): Tenant Admin Console Showcase (Matches Screenshot 1) */}
                            <div className="lg:col-span-8 card-3d-dashboard bg-card border border-border/90 rounded-3xl shadow-2xl overflow-hidden">
                                {/* Browser Top Bar */}
                                <div className="px-5 py-3.5 bg-muted/60 border-b border-border flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                                        <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                                        <span className="font-mono-code text-[11px] text-muted-foreground ml-3 bg-background px-3 py-1 rounded-lg border border-border">
                                            console.nweb.ai/dashboard/overview
                                        </span>
                                    </div>
                                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Live DB Synced
                                    </span>
                                </div>

                                {/* Dashboard Content (Uses imported image if available, else high-fidelity interactive UI matching image_1d7e81.png) */}
                                <div className="p-5 sm:p-6 bg-background/60 space-y-5">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <h3 className="text-lg font-extrabold text-foreground">Welcome Back, Ahmed</h3>
                                            <p className="text-xs text-muted-foreground">Real-time enterprise metrics, active sessions & data monitoring from database</p>
                                        </div>
                                        <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-cyan-400 text-xs font-bold">
                                            Average Chat Time: 1.3 mins
                                        </span>
                                    </div>

                                    {/* 6 Telemetry KPI Cards from Screenshot 1 */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                                        <div className="p-3 bg-card border border-border rounded-2xl shadow-2xs">
                                            <span className="text-[10px] font-bold uppercase text-muted-foreground">Sources</span>
                                            <div className="text-lg font-black text-foreground mt-1">1</div>
                                            <span className="text-[10px] text-muted-foreground">SQL / Sheets</span>
                                        </div>
                                        <div className="p-3 bg-card border border-border rounded-2xl shadow-2xs">
                                            <span className="text-[10px] font-bold uppercase text-muted-foreground">Tables</span>
                                            <div className="text-lg font-black text-foreground mt-1">1</div>
                                            <span className="text-[10px] text-muted-foreground">Synced Instances</span>
                                        </div>
                                        <div className="p-3 bg-card border border-border rounded-2xl shadow-2xs">
                                            <span className="text-[10px] font-bold uppercase text-muted-foreground">Processed</span>
                                            <div className="text-lg font-black text-foreground mt-1">5</div>
                                            <span className="text-[10px] text-muted-foreground">Total Rows</span>
                                        </div>
                                        <div className="p-3 bg-card border border-border rounded-2xl shadow-2xs">
                                            <span className="text-[10px] font-bold uppercase text-muted-foreground">Active Source</span>
                                            <div className="text-xs font-extrabold text-emerald-500 mt-1.5 truncate">salary sheet.x...</div>
                                            <span className="text-[10px] text-muted-foreground">Primary Context</span>
                                        </div>
                                        <div className="p-3 bg-card border border-border rounded-2xl shadow-2xs">
                                            <span className="text-[10px] font-bold uppercase text-muted-foreground">Avg Duration</span>
                                            <div className="text-lg font-black text-foreground mt-1">1.3m</div>
                                            <span className="text-[10px] text-emerald-500 font-semibold">From DB Sessions</span>
                                        </div>
                                        <div className="p-3 bg-card border border-border rounded-2xl shadow-2xs">
                                            <span className="text-[10px] font-bold uppercase text-muted-foreground">Total Chats</span>
                                            <div className="text-lg font-black text-foreground mt-1">3</div>
                                            <span className="text-[10px] text-muted-foreground">MongoDB Sessions</span>
                                        </div>
                                    </div>

                                    {/* Live Visitor Locations Table from Screenshot 1 */}
                                    <div className="bg-card border border-border rounded-2xl p-4 shadow-2xs overflow-x-auto">
                                        <div className="text-xs font-extrabold text-foreground mb-3">Live Visitor Locations & Chat Durations</div>
                                        <table className="w-full text-left text-[11px]">
                                            <thead className="text-muted-foreground uppercase border-b border-border">
                                                <tr>
                                                    <th className="pb-2">Visitor Session ID</th>
                                                    <th className="pb-2">Location</th>
                                                    <th className="pb-2">Duration</th>
                                                    <th className="pb-2">Messages</th>
                                                    <th className="pb-2 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/60">
                                                <tr>
                                                    <td className="py-2.5 font-mono-code text-blue-600 dark:text-cyan-400">visitor_nxhpi598boo</td>
                                                    <td className="py-2.5 font-semibold">🔴 Karachi, Pakistan</td>
                                                    <td className="py-2.5 text-muted-foreground">5 seconds</td>
                                                    <td className="py-2.5 text-muted-foreground">1 msgs</td>
                                                    <td className="py-2.5 text-right"><span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 font-bold">View History</span></td>
                                                </tr>
                                                <tr>
                                                    <td className="py-2.5 font-mono-code text-blue-600 dark:text-cyan-400">visitor_pb816uw8gg</td>
                                                    <td className="py-2.5 font-semibold">🔴 Karachi, Pakistan</td>
                                                    <td className="py-2.5 text-muted-foreground">134 seconds</td>
                                                    <td className="py-2.5 text-muted-foreground">13 msgs</td>
                                                    <td className="py-2.5 text-right"><span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 font-bold">View History</span></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT (4 Cols): 3D Floating Interactive Chatbot Widget (Matches Screenshot 2) */}
                            <div className="lg:col-span-4 relative">
                                {/* Glowing Aura Behind 3D Chatbot */}
                                <div className="absolute -inset-3 bg-gradient-to-tr from-cyan-500/30 via-blue-600/20 to-indigo-600/30 rounded-[32px] blur-xl -z-10"></div>

                                <div className="card-3d-chatbot bg-[#0B1120] text-slate-100 border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[460px]">
                                    {/* Widget Header */}
                                    <div className="px-5 py-4 bg-[#070B14] border-b border-slate-800/90 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                                                <Bot className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-sm text-cyan-400 leading-none">IT Experts</h4>
                                                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online • AI Agent
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-slate-800 text-slate-400">3D LIVE</span>
                                    </div>

                                    {/* 3 Mode Switcher Tabs from Screenshot 2 (Chat | Voice Call | Form) */}
                                    <div className="grid grid-cols-3 bg-[#0E1628] border-b border-slate-800 text-xs font-bold">
                                        <button 
                                            onClick={() => setActiveWidgetTab('chat')}
                                            className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer ${activeWidgetTab === 'chat' ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                                        >
                                            <MessageSquare className="w-3.5 h-3.5" /> Chat
                                        </button>
                                        <button 
                                            onClick={() => setActiveWidgetTab('voice')}
                                            className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer ${activeWidgetTab === 'voice' ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                                        >
                                            <PhoneCall className="w-3.5 h-3.5" /> Voice Call
                                        </button>
                                        <button 
                                            onClick={() => setActiveWidgetTab('form')}
                                            className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer ${activeWidgetTab === 'form' ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                                        >
                                            <FileText className="w-3.5 h-3.5" /> Form
                                        </button>
                                    </div>

                                    {/* Widget Body */}
                                    <div className="flex-1 p-4 overflow-y-auto flex flex-col justify-between">
                                        {activeWidgetTab === 'chat' && (
                                            <div className="space-y-3">
                                                {demoMessages.map((m, i) => (
                                                    <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed max-w-[85%] ${m.sender === 'user' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-[#182235] text-slate-200 border border-slate-800'}`}>
                                                            {m.text}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {activeWidgetTab === 'voice' && (
                                            <div className="my-auto text-center space-y-4 py-4">
                                                <div className={`w-20 h-20 mx-auto rounded-full bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center ${isCallActive ? 'animate-pulse ring-4 ring-cyan-500/20' : ''}`}>
                                                    <Volume2 className="w-9 h-9 text-cyan-400" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white">{isCallActive ? 'AI Voice Agent Listening...' : 'Instant Robo Voice Call'}</div>
                                                    <p className="text-[11px] text-slate-400 mt-1">Speak naturally to query your SQL & Sheets data</p>
                                                </div>
                                                <button 
                                                    onClick={() => setIsCallActive(!isCallActive)}
                                                    className={`px-5 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer transition ${isCallActive ? 'bg-rose-500 text-white' : 'bg-cyan-500 text-slate-950'}`}
                                                >
                                                    {isCallActive ? 'End Voice Session' : 'Start Test Call'}
                                                </button>
                                            </div>
                                        )}

                                        {activeWidgetTab === 'form' && (
                                            <div className="space-y-2.5 my-auto">
                                                <div className="text-xs font-bold text-cyan-400">Quick Lead & Callback Form</div>
                                                <input type="text" placeholder="Full Name" className="w-full bg-[#131C31] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none" />
                                                <input type="email" placeholder="Work Email" className="w-full bg-[#131C31] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none" />
                                                <button onClick={() => setActiveWidgetTab('chat')} className="w-full py-2.5 bg-cyan-500 text-slate-950 font-extrabold rounded-xl text-xs cursor-pointer">
                                                    Submit to CRM
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Widget Input Footer */}
                                    <form onSubmit={handleDemoSend} className="p-3 bg-[#070B14] border-t border-slate-800 flex items-center gap-2">
                                        <input 
                                            type="text"
                                            value={demoInput}
                                            onChange={(e) => setDemoInput(e.target.value)}
                                            placeholder="Type message..."
                                            className="flex-1 bg-[#131C31] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-500"
                                        />
                                        <button type="submit" className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold rounded-xl text-xs transition cursor-pointer">
                                            Send
                                        </button>
                                    </form>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            {/* Supported Integrations Bar */}
            <section className="py-10 px-6 border-y border-border bg-muted/30">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                        Native Data & AI Connectors
                    </span>
                    <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-extrabold text-foreground/80">
                        <span className="flex items-center gap-2"><Database className="w-4 h-4 text-emerald-500" /> Supabase</span>
                        <span className="flex items-center gap-2"><Server className="w-4 h-4 text-blue-500" /> PostgreSQL & MySQL</span>
                        <span className="flex items-center gap-2"><Layers className="w-4 h-4 text-green-600" /> Google Sheets & Excel</span>
                        <span className="flex items-center gap-2"><Cpu className="w-4 h-4 text-amber-500" /> Groq & OpenAI LLMs</span>
                        <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-indigo-500" /> MongoDB Telemetry</span>
                    </div>
                </div>
            </section>

            {/* How It Works - 3 Step Robo-Agent Pipeline */}
            <section id="workflow" className="py-24 px-6 max-w-7xl mx-auto w-full">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-cyan-400 bg-blue-500/10 px-3.5 py-1 rounded-full">
                        3-Step Deployment Flow
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                        From Raw Database to Live AI Agent in 3 Minutes
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Zero complex coding required. Connect your data source, customize your agent rules, and embed anywhere.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 bg-card border border-border rounded-3xl shadow-xs relative space-y-4">
                        <span className="font-mono-code text-xs font-extrabold text-blue-600 dark:text-cyan-400 bg-blue-500/10 px-3 py-1 rounded-lg">
                            STEP 01
                        </span>
                        <h3 className="text-lg font-extrabold text-foreground">Connect Live Data Source</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Link your Supabase tables, SQL database, or upload Excel/Google Sheets. Our engine parses schemas and rows automatically.
                        </p>
                    </div>

                    <div className="p-8 bg-card border border-border rounded-3xl shadow-xs relative space-y-4">
                        <span className="font-mono-code text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg">
                            STEP 02
                        </span>
                        <h3 className="text-lg font-extrabold text-foreground">Configure AI Prompt & Voice</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Set custom system instructions, enable Chat, Voice Call, and Form modes, and supply your preferred LLM API keys.
                        </p>
                    </div>

                    <div className="p-8 bg-card border border-border rounded-3xl shadow-xs relative space-y-4">
                        <span className="font-mono-code text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg">
                            STEP 03
                        </span>
                        <h3 className="text-lg font-extrabold text-foreground">Embed & Monitor Telemetry</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Paste one script tag onto your website and monitor live visitor locations, chat durations, and quota usage in real time.
                        </p>
                    </div>
                </div>
            </section>

            {/* Enterprise Feature Highlights Grid */}
            <section id="features" className="py-24 px-6 max-w-7xl mx-auto w-full border-t border-border">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3.5 py-1 rounded-full">
                        Enterprise Architecture
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                        Built for Scale, Isolation & Control
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Every component is engineered for multi-tenant reliability and real-time operational context[cite: 7].
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-7 bg-card rounded-3xl border border-border shadow-xs hover:border-blue-500/40 transition space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-cyan-400 flex items-center justify-center">
                            <Database className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-extrabold text-foreground">Multi-Source Live Sync</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Sync table schemas and rows dynamically from Supabase, MySQL, PostgreSQL, and Google Sheets without manual re-training[cite: 7].
                        </p>
                    </div>

                    <div className="p-7 bg-card rounded-3xl border border-border shadow-xs hover:border-indigo-500/40 transition space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-extrabold text-foreground">4-Tier Plan Lockdown</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Integrated subscription control engine enforcing trial limits, expiration rules, account suspension, and manual payment slip verification[cite: 7].
                        </p>
                    </div>

                    <div className="p-7 bg-card rounded-3xl border border-border shadow-xs hover:border-emerald-500/40 transition space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-extrabold text-foreground">Visitor Session Analytics</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Track visitor city/country routing, average chat durations, and message volume per isolated session ID in MongoDB[cite: 7].
                        </p>
                    </div>

                    <div className="p-7 bg-card rounded-3xl border border-border shadow-xs hover:border-cyan-500/40 transition space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                            <PhoneCall className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-extrabold text-foreground">Omni-Channel Voice & Chat</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Give customers the choice of instant AI text chat, interactive voice calls, or structured lead forms inside one unified widget.
                        </p>
                    </div>

                    <div className="p-7 bg-card rounded-3xl border border-border shadow-xs hover:border-amber-500/40 transition space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-extrabold text-foreground">Bring-Your-Own API Key</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Tenants maintain complete control over their LLM provider keys and token usage with zero middleman markups.
                        </p>
                    </div>

                    <div className="p-7 bg-card rounded-3xl border border-border shadow-xs hover:border-purple-500/40 transition space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                            <Activity className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-extrabold text-foreground">Superadmin 360° Governance</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Monitor daily, monthly, and yearly revenue charts, broadcast global announcements, and audit tenant payment ledgers.
                        </p>
                    </div>
                </div>
            </section>

            {/* Enhanced Pricing Tiers Section */}
            <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto w-full border-t border-border">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-cyan-400 bg-blue-500/10 px-3.5 py-1 rounded-full">
                        Transparent Enterprise Tiers
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                        Flexible Pricing Plans
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Start free and scale effortlessly as your conversational traffic grows[cite: 7].
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                    
                    {/* Free Trial Tier */}
                    <div className="bg-card border border-border p-7 rounded-3xl flex flex-col justify-between shadow-xs hover:shadow-md transition">
                        <div>
                            <span className="text-[11px] font-extrabold uppercase text-muted-foreground tracking-wider">Trial Tier</span>
                            <h3 className="text-xl font-extrabold text-foreground mt-1">Free Plan</h3>
                            <p className="text-xs text-muted-foreground mt-1">Ideal for testing live DB sync</p>
                            <div className="text-4xl font-extrabold text-foreground my-5">$0 <span className="text-xs font-semibold text-muted-foreground">/ trial</span></div>
                            <ul className="space-y-3 text-xs text-muted-foreground mb-8 border-t border-border pt-5">
                                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> 15 Messages Trial Limit[cite: 7]</li>
                                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Standard Database Sync[cite: 7]</li>
                                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Chat & Form Widget</li>
                                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Community Support[cite: 7]</li>
                            </ul>
                        </div>
                        <button 
                            onClick={() => navigate('/authentication')}
                            className="w-full py-3 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl text-xs transition cursor-pointer"
                        >
                            Get Started Free
                        </button>
                    </div>

                    {/* Basic Plan */}
                    <div className="bg-card border border-border p-7 rounded-3xl flex flex-col justify-between shadow-xs hover:shadow-md transition">
                        <div>
                            <span className="text-[11px] font-extrabold uppercase text-blue-600 dark:text-sky-400 tracking-wider">Starter Tier</span>
                            <h3 className="text-xl font-extrabold text-foreground mt-1">Basic Plan</h3>
                            <p className="text-xs text-muted-foreground mt-1">For growing small businesses</p>
                            <div className="text-4xl font-extrabold text-foreground my-5">$29 <span className="text-xs font-semibold text-muted-foreground">/ quota</span></div>
                            <ul className="space-y-3 text-xs text-muted-foreground mb-8 border-t border-border pt-5">
                                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> 500 Messages Quota[cite: 7]</li>
                                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Message-Quota Tracking[cite: 7]</li>
                                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> SQL & Google Sheets Sync</li>
                                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Priority API Routing[cite: 7]</li>
                            </ul>
                        </div>
                        <button 
                            onClick={() => navigate('/authentication')}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-sm"
                        >
                            Select Basic
                        </button>
                    </div>

                    {/* Silver Plan (Most Popular) */}
                    <div className="bg-card border-2 border-blue-600 dark:border-cyan-500 p-7 rounded-3xl flex flex-col justify-between shadow-xl relative">
                        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[10px] font-extrabold px-4 py-1 rounded-full uppercase tracking-wider shadow-md">
                            Most Popular
                        </span>
                        <div>
                            <span className="text-[11px] font-extrabold uppercase text-blue-600 dark:text-cyan-400 tracking-wider">Pro Tier</span>
                            <h3 className="text-xl font-extrabold text-foreground mt-1">Silver Plan</h3>
                            <p className="text-xs text-muted-foreground mt-1">Best for high-traffic web portals</p>
                            <div className="text-4xl font-extrabold text-foreground my-5">$79 <span className="text-xs font-semibold text-muted-foreground">/ high quota</span></div>
                            <ul className="space-y-3 text-xs text-muted-foreground mb-8 border-t border-border pt-5">
                                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> 3,000 Messages Quota[cite: 7]</li>
                                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Voice Call + Chat + Form</li>
                                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Visitor Location Analytics[cite: 7]</li>
                                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Payment Ledger & Slip Proof</li>
                            </ul>
                        </div>
                        <button 
                            onClick={() => navigate('/authentication')}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-95 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-lg shadow-blue-600/25"
                        >
                            Select Silver
                        </button>
                    </div>

                    {/* Golden Plan (Enterprise) */}
                    <div className="bg-card border border-amber-500/50 p-7 rounded-3xl flex flex-col justify-between shadow-xs hover:shadow-md transition relative">
                        <span className="absolute top-5 right-5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                            VIP Enterprise
                        </span>
                        <div>
                            <span className="text-[11px] font-extrabold uppercase text-amber-600 dark:text-amber-400 tracking-wider">Unlimited Tier</span>
                            <h3 className="text-xl font-extrabold text-foreground mt-1">Golden Plan</h3>
                            <p className="text-xs text-muted-foreground mt-1">Full enterprise scale & SLA</p>
                            <div className="text-4xl font-extrabold text-foreground my-5">$149 <span className="text-xs font-semibold text-muted-foreground">/ month</span></div>
                            <ul className="space-y-3 text-xs text-muted-foreground mb-8 border-t border-border pt-5">
                                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Unlimited Messages[cite: 7]</li>
                                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Month-Wise Subscription[cite: 7]</li>
                                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Unlimited SQL & Sheet Nodes</li>
                                <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Dedicated 24/7 Support[cite: 7]</li>
                            </ul>
                        </div>
                        <button 
                            onClick={() => navigate('/authentication')}
                            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl text-xs transition cursor-pointer shadow-sm"
                        >
                            Select Golden
                        </button>
                    </div>

                </div>
            </section>

            {/* FAQs Accordion Section */}
            <section id="faqs" className="py-24 px-6 max-w-4xl mx-auto w-full border-t border-border">
                <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-cyan-400 bg-blue-500/10 px-3.5 py-1 rounded-full">
                        Knowledge Base
                    </span>
                    <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Frequently Asked Questions</h2>
                    <p className="text-sm text-muted-foreground">
                        Technical and billing details about the NWeb Console AI platform
                    </p>
                </div>

                <div className="space-y-3.5">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xs">
                            <button 
                                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                className="w-full p-5 text-left flex justify-between items-center font-bold text-sm text-foreground hover:bg-muted/40 cursor-pointer transition"
                            >
                                <span>{faq.q}</span>
                                <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-300 ${openFaq === idx ? 'rotate-180 text-blue-600 dark:text-cyan-400' : ''}`} />
                            </button>
                            {openFaq === idx && (
                                <div className="px-5 pb-5 text-xs text-muted-foreground leading-relaxed border-t border-border/60 pt-3.5">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Pre-Footer Enterprise CTA Banner */}
            <section className="px-6 pb-20 max-w-7xl mx-auto w-full">
                <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-8 sm:p-12 border border-blue-500/20 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="space-y-3 max-w-xl text-center lg:text-left">
                        <span className="font-mono-code text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                            Ready to Automate Customer Support & Sales?
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Deploy Your First Database-Connected AI Agent Today
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                            Start with 15 free messages—no credit card required. Connect your SQL database or Google Sheet in under 3 minutes.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                        <button 
                            onClick={() => navigate('/authentication')}
                            className="px-7 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold rounded-2xl text-xs transition cursor-pointer shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
                        >
                            <span>Create Free Workspace</span>
                            <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Professional Multi-Column Footer */}
            <footer className="mt-auto border-t border-border pt-16 pb-10 px-6 bg-card">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12 text-xs">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-white flex items-center justify-center font-black">
                                <Cpu className="w-5 h-5" />
                            </div>
                            <span className="font-extrabold text-base text-foreground">NWeb Console</span>
                        </div>
                        <p className="text-muted-foreground leading-relaxed max-w-sm">
                            Enterprise multi-tier AI agent infrastructure connecting live SQL, Supabase, and Google Sheets to autonomous voice and chat assistants.
                        </p>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            All API & Telemetry Nodes Operational
                        </div>
                    </div>

                    <div>
                        <h4 className="font-extrabold text-foreground mb-4 uppercase tracking-wider text-[11px]">Product</h4>
                        <ul className="space-y-2.5 text-muted-foreground font-medium">
                            <li><a href="#showcase" className="hover:text-foreground transition">3D AI Agent Widget</a></li>
                            <li><a href="#workflow" className="hover:text-foreground transition">Database Connectors</a></li>
                            <li><a href="#features" className="hover:text-foreground transition">Visitor Telemetry</a></li>
                            <li><a href="#pricing" className="hover:text-foreground transition">Enterprise Plans</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-extrabold text-foreground mb-4 uppercase tracking-wider text-[11px]">Developers</h4>
                        <ul className="space-y-2.5 text-muted-foreground font-medium">
                            <li><a href="#faqs" className="hover:text-foreground transition">API Documentation</a></li>
                            <li><a href="#faqs" className="hover:text-foreground transition">Webhook Integration</a></li>
                            <li><a href="#faqs" className="hover:text-foreground transition">Multi-Tenant Security</a></li>
                            <li><a href="#faqs" className="hover:text-foreground transition">System FAQs</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-extrabold text-foreground mb-4 uppercase tracking-wider text-[11px]">Legal & Compliance</h4>
                        <ul className="space-y-2.5 text-muted-foreground font-medium">
                            <li><a href="#" className="hover:text-foreground transition">Privacy Policy</a>[cite: 7]</li>
                            <li><a href="#" className="hover:text-foreground transition">Terms of Service</a>[cite: 7]</li>
                            <li><a href="#" className="hover:text-foreground transition">Data Isolation SLA</a></li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-medium">
                    <div>© 2026 NWeb Console. All rights reserved[cite: 7].</div>
                    <div className="font-mono-code text-[11px]">v2.6.0 • Enterprise AI Core</div>
                </div>
            </footer>
        </div>
    );
}