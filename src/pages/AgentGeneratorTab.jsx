import React, { useState, useEffect } from 'react';
import { Bot, Copy, Loader2, Plus, X, Sparkles, ShieldCheck, Cpu, Infinity as InfinityIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../services/api';

const modelsByProvider = {
    openai: ["gpt-4o-mini", "gpt-4o"],
    groq: ["openai/gpt-oss-20b", "openai/gpt-oss-120b", "qwen/qwen3.8-27b"],
    gemini: ["gemini-2.5-flash", "gemini-2.5-pro"]
};

export default function AgentGeneratorTab({ refreshAgent }) {
    const [loading, setLoading] = useState(false);
    const [fetchingAgent, setFetchingAgent] = useState(true);
    const [agentData, setAgentData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        agentId: '',
        agentName: '',
        businessName: '',
        businessDescription: '',
        provider: 'openai',
        selectedModel: 'gpt-4o-mini',
        customApiKey: '',
        routes: [{ routeName: '', routePath: '' }]
    });

    const [modelsList, setModelsList] = useState(modelsByProvider.openai);

    // Fetch Existing Agent on Mount
    const fetchExistingAgent = async () => {
        setFetchingAgent(true);
        try {
            const res = await API.get('/agentDash/get-agent');
            if (res.data.exists && res.data.agent) {
                setAgentData(res.data.agent);
                setIsEditing(false);
            } else {
                setAgentData(null);
            }
        } catch (err) {
            console.error('Failed to check existing agent:', err);
            setAgentData(null);
        } finally {
            setFetchingAgent(false);
        }
    };

    useEffect(() => {
        fetchExistingAgent();
    }, []);

    // Handle Provider Change
    const handleProviderChange = (e) => {
        const provider = e.target.value;
        const availableModels = modelsByProvider[provider] || [];
        setFormData({
            ...formData,
            provider,
            selectedModel: availableModels[0] || ''
        });
        setModelsList(availableModels);
    };

    // Handle Dynamic Routes
    const handleAddRoute = () => {
        setFormData({
            ...formData,
            routes: [...formData.routes, { routeName: '', routePath: '' }]
        });
    };

    const handleRemoveRoute = (index) => {
        const newRoutes = formData.routes.filter((_, i) => i !== index);
        setFormData({ ...formData, routes: newRoutes.length > 0 ? newRoutes : [{ routeName: '', routePath: '' }] });
    };

    const handleRouteChange = (index, field, value) => {
        const newRoutes = [...formData.routes];
        newRoutes[index][field] = value;
        setFormData({ ...formData, routes: newRoutes });
    };

    // Open Edit Mode with pre-filled data
    const handleStartEditing = () => {
        if (!agentData) return;
        setFormData({
            agentId: agentData._id || '',
            agentName: agentData.agentName || '',
            businessName: agentData.businessName || '',
            businessDescription: agentData.businessDescription || '',
            provider: agentData.provider || 'openai',
            selectedModel: agentData.selectedModel || 'gpt-4o-mini',
            customApiKey: agentData.customApiKey || '',
            routes: agentData.routes && agentData.routes.length > 0 ? agentData.routes : [{ routeName: '', routePath: '' }]
        });
        if (agentData.provider && modelsByProvider[agentData.provider]) {
            setModelsList(modelsByProvider[agentData.provider]);
        }
        setIsEditing(true);
    };

    // Form Submit Handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const validRoutes = formData.routes.filter(r => r.routeName && r.routePath);
        const payload = {
            agentId: formData.agentId,
            agentName: formData.agentName,
            businessName: formData.businessName,
            businessDescription: formData.businessDescription,
            provider: formData.provider,
            selectedModel: formData.selectedModel,
            customApiKey: formData.customApiKey,
            routes: validRoutes
        };

        try {
            const res = await API.post('/agentDash/save-agent', payload);
            toast.success(res.data.message || 'AI Agent successfully configured!');
            await fetchExistingAgent();
            if (refreshAgent) refreshAgent();
        } catch (err) {
            console.error("Agent Save Error:", err);
            toast.error(err.response?.data?.message || 'Error saving agent setup.');
        } finally {
            setLoading(false);
        }
    };

    const copyCDNCode = (scriptText) => {
        navigator.clipboard.writeText(scriptText);
        toast.success("CDN Script Copied to Clipboard!");
    };

    if (fetchingAgent) {
        return (
            <div className="flex flex-col items-center justify-center p-16 text-muted-foreground text-xs space-y-3">
                <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
                <span>Loading Agent Configuration...</span>
            </div>
        );
    }

    const hasAgent = agentData && agentData._id && !isEditing;
    const planType = (agentData?.planType || 'free').toLowerCase();
    const isUnlimited = planType === 'golden' || agentData?.usageLimit === null;

    const messagesUsed = agentData?.messagesUsed ?? 0;
    const baseLimit = isUnlimited ? null : (agentData?.usageLimit ?? 15);
    const carryOverChats = isUnlimited ? 0 : (agentData?.carryOverChats ?? 0);
    const totalQuota = isUnlimited ? null : (baseLimit + carryOverChats);

    const remainingChats = isUnlimited ? null : Math.max(0, totalQuota - messagesUsed);
    const isExhausted = !isUnlimited && remainingChats <= 0;

    const percentage = isUnlimited
        ? 100
        : totalQuota > 0
            ? Math.min((messagesUsed / totalQuota) * 100, 100)
            : 100;

    const quotaHeaderText = isUnlimited
        ? `${messagesUsed} Used / Unlimited`
        : `${messagesUsed} / ${totalQuota} Messages`;

    const progressBarColor = isUnlimited
        ? 'bg-amber-500'
        : isExhausted
            ? 'bg-red-500'
            : percentage >= 80
                ? 'bg-amber-500'
                : 'bg-sky-500';

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            {/* Active Metrics Header Widget */}
            {hasAgent && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-card p-4 rounded-xl border border-border shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Security Status</span>
                            <div className="text-xs font-bold text-emerald-500 mt-1 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active & Secure
                            </div>
                        </div>
                        <ShieldCheck className="w-5 h-5 text-emerald-500 opacity-80" />
                    </div>

                    <div className="bg-card p-4 rounded-xl border border-border shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Active Plan Tier</span>
                            <div className="text-base font-black text-sky-500 uppercase mt-1">{planType} PLAN</div>
                        </div>
                        <Sparkles className="w-5 h-5 text-sky-500 opacity-80" />
                    </div>

                    <div className="bg-card p-4 rounded-xl border border-border shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Message Quota</span>
                            <div className="text-base font-black text-foreground mt-1 flex items-center gap-1.5">
                                {isUnlimited ? (
                                    <>
                                        <span>{messagesUsed} used</span>
                                        <span className="text-muted-foreground">/</span>
                                        <span className="text-amber-500 inline-flex items-center gap-1">
                                            <InfinityIcon className="w-4 h-4" /> Unlimited
                                        </span>
                                    </>
                                ) : (
                                    <span>{messagesUsed} / {totalQuota}</span>
                                )}
                            </div>
                            {!isUnlimited && carryOverChats > 0 && (
                                <span className="text-[10px] text-emerald-500 font-semibold block mt-0.5">
                                    Includes +{carryOverChats} carry-over
                                </span>
                            )}
                        </div>
                        <Cpu className="w-5 h-5 text-amber-500 opacity-80" />
                    </div>
                </div>
            )}

            {/* Conditional Form / Dashboard View */}
            {!hasAgent ? (
                <div className="bg-card p-6 md:p-8 rounded-2xl shadow-sm border border-border space-y-6">
                    <div className="border-b border-border pb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-sky-500/10 rounded-xl text-sky-500">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-foreground">
                                    {isEditing ? 'Edit AI Agent Configuration' : 'AI Agent Generator & Setup'}
                                </h2>
                                <p className="text-xs text-muted-foreground">Configure your business persona, AI models, and custom routing</p>
                            </div>
                        </div>
                        {isEditing && (
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-3 py-1.5 bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold rounded-lg transition cursor-pointer"
                            >
                                Cancel
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-foreground mb-1.5">Agent Identity Name</label>
                                <input
                                    type="text"
                                    value={formData.agentName}
                                    onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-background rounded-xl border border-border text-foreground text-xs outline-none focus:ring-1 focus:ring-sky-500"
                                    placeholder="e.g. Sarah - Support Specialist"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-foreground mb-1.5">Business / Organization Name</label>
                                <input
                                    type="text"
                                    value={formData.businessName}
                                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-background rounded-xl border border-border text-foreground text-xs outline-none focus:ring-1 focus:ring-sky-500"
                                    placeholder="e.g. NWeb Enterprises"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-xs font-semibold text-foreground">
                                    Business Description & System Prompt Matrix
                                </label>
                                <span className="text-[10px] text-sky-500 font-mono bg-sky-500/10 px-2 py-0.5 rounded-md">
                                    AI Training Core
                                </span>
                            </div>
                            <textarea
                                rows="7"
                                value={formData.businessDescription}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData(prev => ({ ...prev, businessDescription: val }));
                                }}
                                className="w-full px-4 py-3 bg-background rounded-xl border border-border text-foreground text-xs outline-none focus:ring-2 focus:ring-sky-500 transition font-mono leading-relaxed resize-none"
                                placeholder="[BUSINESS IDENTITY]&#10;You are an expert AI sales and customer support assistant for [Business Name].&#10;&#10;[CORE SERVICES & PRICING]&#10;- Enterprise Web Dev: Starting at $500&#10;- Custom AI Integration: Tailored packages available&#10;&#10;[BEHAVIOR & RULES]&#10;- Always greet customers politely and answer strictly from connected database records.&#10;- Direct unverified users to register via the form tab."
                                required
                            />
                            <p className="text-[11px] text-muted-foreground mt-1.5">
                                Yeh prompt aapke AI ko guide karega ke usne customers se kis tarah baat karni hai aur kya business rules follow karne hain. (Fixed Box Size)
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-foreground mb-1.5">AI Engine Provider</label>
                                <select
                                    value={formData.provider}
                                    onChange={handleProviderChange}
                                    className="w-full px-3.5 py-2.5 bg-background rounded-xl border border-border text-foreground text-xs outline-none focus:ring-1 focus:ring-sky-500"
                                >
                                    <option value="openai">OpenAI (GPT-4o / Mini)</option>
                                    <option value="groq">Groq (Llama / Ultra Fast)</option>
                                    <option value="gemini">Google Gemini (Flash / Pro)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-foreground mb-1.5">Model Architecture</label>
                                <select
                                    value={formData.selectedModel}
                                    onChange={(e) => setFormData({ ...formData, selectedModel: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-background rounded-xl border border-border text-foreground text-xs outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                                >
                                    {modelsList.map((model, idx) => (
                                        <option key={idx} value={model}>{model}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-foreground mb-1.5">API Access Key (Custom Secret)</label>
                            <input
                                type="password"
                                value={formData.customApiKey}
                                onChange={(e) => setFormData({ ...formData, customApiKey: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-background rounded-xl border border-border text-foreground text-xs outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                                placeholder="sk-proj-..."
                            />
                        </div>

                        {/* Routes Container */}
                        <div className="space-y-2 pt-2 border-t border-border">
                            <div className="flex justify-between items-center">
                                <label className="block text-xs font-semibold text-foreground">Website Navigation Routes</label>
                                <button
                                    type="button"
                                    onClick={handleAddRoute}
                                    className="px-2.5 py-1 bg-sky-500/10 text-sky-500 hover:bg-sky-500 hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Route
                                </button>
                            </div>
                            <div className="space-y-2.5">
                                {formData.routes.map((route, index) => (
                                    <div key={index} className="flex gap-2.5 items-center">
                                        <input
                                            type="text"
                                            value={route.routeName}
                                            onChange={(e) => handleRouteChange(index, 'routeName', e.target.value)}
                                            className="flex-1 px-3.5 py-2 bg-background rounded-xl border border-border text-xs text-foreground outline-none focus:ring-1 focus:ring-sky-500"
                                            placeholder="Route Name (e.g. Pricing)"
                                        />
                                        <input
                                            type="text"
                                            value={route.routePath}
                                            onChange={(e) => handleRouteChange(index, 'routePath', e.target.value)}
                                            className="flex-1 px-3.5 py-2 bg-background rounded-xl border border-border text-xs text-foreground outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                                            placeholder="Path (e.g. /pricing)"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveRoute(index)}
                                            className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-xs transition cursor-pointer"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-6"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            <span>{formData.agentId || isEditing ? 'Update AI Agent Configuration' : 'Deploy & Generate AI Agent'}</span>
                        </button>
                    </form>
                </div>
            ) : (
                /* Live Agent Deployed / Embed CDN Section */
                <div className="bg-card p-6 md:p-8 rounded-2xl shadow-sm border border-border space-y-6">
                    <div className="flex justify-between items-center border-b border-border pb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-foreground">AI Agent Active & Deployed</h3>
                                <p className="text-xs text-muted-foreground">Embed widget script on your web application</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20 uppercase tracking-wider">
                            {planType} Tier
                        </span>
                    </div>

                    <div className="bg-muted/40 p-4 rounded-xl border border-border space-y-2.5">
                        <div className="flex justify-between items-center text-xs font-semibold text-foreground">
                            <span>Quota Consumption</span>
                            <span>{quotaHeaderText}</span>
                        </div>
                        <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                            <div
                                className={`${progressBarColor} h-2 rounded-full transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                            <span>
                                {isUnlimited
                                    ? 'Golden plan active — no numeric chat limit'
                                    : carryOverChats > 0
                                        ? `Base: ${baseLimit} + Carry-Over: +${carryOverChats}`
                                        : `Base Quota: ${baseLimit} messages`}
                            </span>
                            {!isUnlimited && (
                                <span className={isExhausted ? 'text-red-500 font-bold' : 'text-foreground font-semibold'}>
                                    {remainingChats} remaining
                                </span>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-foreground mb-2">Embed Script Code (CDN Widget):</label>
                        <div className="relative">
                            <textarea
                                rows="3"
                                readOnly
                                value={`<script src="https://agentic-ai-website-driver.vercel.app/widget.js" data-agent-id="${agentData._id}" async></script>`}
                                className="w-full p-3.5 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl border border-border outline-none resize-none"
                            ></textarea>
                            <button
                                onClick={() => copyCDNCode(`<script src="https://agentic-ai-website-driver.vercel.app/widget.js" data-agent-id="${agentData._id}" async></script>`)}
                                className="absolute top-3 right-3 px-3 py-1.5 bg-sky-500 text-slate-950 rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer hover:bg-sky-400 transition"
                            >
                                <Copy className="w-3.5 h-3.5" /> Copy CDN
                            </button>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleStartEditing}
                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold rounded-xl text-xs transition shadow-xs cursor-pointer hover:opacity-95 flex items-center justify-center gap-2"
                    >
                        <Sparkles className="w-4 h-4" /> Edit Agent Configuration & Prompt
                    </button>
                </div>
            )}
        </div>
    );
}