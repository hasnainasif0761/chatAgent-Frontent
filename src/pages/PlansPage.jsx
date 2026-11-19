import React, { useState } from 'react';
import { Crown, Check, Upload, Loader2, Zap, Sparkles, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../services/api';

export default function PlansPage({ user, onPlanUpdated }) {
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [transactionId, setTransactionId] = useState('');
    const [paymentSlip, setPaymentSlip] = useState(null);
    const [loading, setLoading] = useState(false);

    const currentPlan = user?.planType || 'free';
    const planStatus = user?.planStatus || 'active';
    const isPending = planStatus === 'pending_approval';

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setPaymentSlip(e.target.files[0]);
        }
    };

    const handleUpgradeSubmit = async (e) => {
        e.preventDefault();
        
        // Strict Enterprise Protection Check
        if (isPending) {
            toast.error('You already have a subscription request pending superadmin review.');
            return;
        }

        if (!transactionId.trim()) {
            toast.error('Please enter your JazzCash Transaction ID.');
            return;
        }

        if (!paymentSlip && selectedPlan !== 'free') {
            toast.error('Please upload your JazzCash payment proof slip.');
            return;
        }

        const formData = new FormData();
        formData.append('planType', selectedPlan);
        formData.append('transactionId', transactionId);
        if (paymentSlip) {
            formData.append('paymentSlip', paymentSlip);
        }

        try {
            setLoading(true);
            const res = await API.put('/upgrade/upgrade-plan', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                toast.success(res.data.message || 'Subscription request submitted successfully!');
                setSelectedPlan(null);
                setTransactionId('');
                setPaymentSlip(null);
                if (onPlanUpdated) onPlanUpdated();
            }
        } catch (err) {
            console.log(err)
            toast.error(err.response?.data?.message || 'Failed to submit subscription upgrade.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 py-6 px-4 font-sans">
            {/* Header section */}
            <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold uppercase tracking-wider border border-amber-500/20">
                    <Crown className="w-3.5 h-3.5" /> Enterprise Subscriptions & Billing
                </div>
                <h1 className="text-3xl font-black tracking-tight text-foreground">Upgrade Your AI Business Engine</h1>
                <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                    Select a tier that scales with your enterprise workload. Secure manual payments processed via JazzCash Official Merchant: <span className="text-amber-500 font-mono font-bold">03111243675</span>.
                </p>
            </div>

            {/* Pending Approval Warning Banner */}
            {isPending && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3 shadow-xs">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <h4 className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400">Subscription Verification in Progress</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Your payment slip is currently under review by our superadmin team. New upgrade requests are temporarily locked until your active verification is completed. For urgent approvals, share your transaction ID with support at <span className="font-mono font-bold text-foreground">03111243675</span>.
                        </p>
                    </div>
                </div>
            )}

            {/* Current Plan Banner */}
            <div className="bg-card border border-border p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                        <Zap className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Current Active Tier</span>
                        <div className="text-lg font-black uppercase text-foreground flex items-center gap-2">
                            {currentPlan} Plan 
                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${planStatus === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                {planStatus}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="text-xs text-muted-foreground text-center sm:text-right">
                    Official JazzCash Account: <span className="text-amber-500 font-mono font-bold">03111243675</span><br />
                    <span className="text-muted-foreground/80">Instant support via SMS / WhatsApp.</span>
                </div>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Free Plan */}
                <div className={`bg-card border rounded-2xl p-6 flex flex-col justify-between space-y-6 relative transition-all ${currentPlan === 'free' ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-lg' : 'border-border'}`}>
                    {currentPlan === 'free' && <span className="absolute -top-3 left-6 px-3 py-0.5 bg-sky-500 text-slate-950 font-bold text-[10px] rounded-full uppercase">Current Plan</span>}
                    <div className="space-y-3">
                        <h3 className="text-base font-bold text-foreground">Free Trial</h3>
                        <div className="text-3xl font-black text-foreground">$0 <span className="text-xs font-normal text-muted-foreground">/ month</span></div>
                        <p className="text-xs text-muted-foreground">Basic testing access with limited monthly message quotas.</p>
                        <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-sky-500" /> 30 Messages Limit</li>
                            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-sky-500" /> Standard Widget CDN</li>
                            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-sky-500" /> Basic Database Sync</li>
                        </ul>
                    </div>
                    <button disabled className="w-full py-2.5 bg-muted text-muted-foreground font-bold rounded-xl text-xs cursor-not-allowed opacity-75">
                        {currentPlan === 'free' ? 'Active Tier' : 'Included'}
                    </button>
                </div>

                {/* Basic Plan ($29) */}
                <div className={`bg-card border rounded-2xl p-6 flex flex-col justify-between space-y-6 relative transition-all ${currentPlan === 'basic' ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-lg' : 'border-border'}`}>
                    {currentPlan === 'basic' && <span className="absolute -top-3 left-6 px-3 py-0.5 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-full uppercase">Current Plan</span>}
                    <div className="space-y-3">
                        <h3 className="text-base font-bold text-foreground">Basic Business</h3>
                        <div className="text-3xl font-black text-foreground">$29 <span className="text-xs font-normal text-muted-foreground">/ month</span></div>
                        <p className="text-xs text-muted-foreground">Essential automation for growing service providers.</p>
                        <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-500" /> 1,000 Monthly Messages</li>
                            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-500" /> Custom Business Context</li>
                            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-500" /> Priority Email Support</li>
                        </ul>
                    </div>
                    <button 
                        onClick={() => setSelectedPlan('basic')} 
                        disabled={isPending}
                        className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                        {isPending ? <><Clock className="w-3.5 h-3.5 animate-spin" /> Verification Pending</> : 'Upgrade to Basic'}
                    </button>
                </div>

                {/* Silver Plan ($79) */}
                <div className={`bg-card border-2 rounded-2xl p-6 flex flex-col justify-between space-y-6 relative transition-all shadow-xl ${currentPlan === 'silver' ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-sky-500/60 bg-gradient-to-b from-sky-500/5 to-transparent'}`}>
                    <span className="absolute -top-3 right-6 px-3 py-0.5 bg-sky-500 text-slate-950 font-bold text-[10px] rounded-full uppercase flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Most Popular
                    </span>
                    <div className="space-y-3">
                        <h3 className="text-base font-bold text-foreground">Silver Enterprise</h3>
                        <div className="text-3xl font-black text-foreground">$79 <span className="text-xs font-normal text-muted-foreground">/ month</span></div>
                        <p className="text-xs text-muted-foreground">Advanced multi-route support with higher limits.</p>
                        <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-sky-500" /> 5,000 Monthly Messages</li>
                            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-sky-500" /> Advanced Route Integration</li>
                            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-sky-500" /> 24/7 Dedicated Support</li>
                        </ul>
                    </div>
                    <button 
                        onClick={() => setSelectedPlan('silver')} 
                        disabled={isPending}
                        className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                        {isPending ? <><Clock className="w-3.5 h-3.5 animate-spin" /> Verification Pending</> : 'Upgrade to Silver'}
                    </button>
                </div>

                {/* Golden Plan ($149) */}
                <div className={`bg-card border rounded-2xl p-6 flex flex-col justify-between space-y-6 relative transition-all ${currentPlan === 'golden' ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-lg' : 'border-border'}`}>
                    {currentPlan === 'golden' && <span className="absolute -top-3 left-6 px-3 py-0.5 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-full uppercase">Current Plan</span>}
                    <div className="space-y-3">
                        <h3 className="text-base font-bold text-foreground">Golden Elite</h3>
                        <div className="text-3xl font-black text-foreground">$149 <span className="text-xs font-normal text-muted-foreground">/ month</span></div>
                        <p className="text-xs text-muted-foreground">Unlimited power for high-volume enterprise operations.</p>
                        <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500" /> Unlimited Messages</li>
                            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500" /> Custom LLM Model Selection</li>
                            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-purple-500" /> VIP White-glove Onboarding</li>
                        </ul>
                    </div>
                    <button 
                        onClick={() => setSelectedPlan('golden')} 
                        disabled={isPending}
                        className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                        {isPending ? <><Clock className="w-3.5 h-3.5 animate-spin" /> Verification Pending</> : 'Upgrade to Golden'}
                    </button>
                </div>

            </div>

            {/* JazzCash Payment Modal Popup */}
            {selectedPlan && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-6">
                        <div className="flex justify-between items-center border-b border-border pb-4">
                            <div>
                                <h2 className="text-base font-black text-foreground uppercase tracking-wider">JazzCash Manual Payment</h2>
                                <p className="text-xs text-muted-foreground">Merchant Account: <span className="text-amber-500 font-mono font-bold">03111243675</span> (NWeb Enterprise)</p>
                            </div>
                            <button onClick={() => setSelectedPlan(null)} className="p-1.5 bg-muted rounded-lg text-foreground hover:bg-muted-foreground/20 cursor-pointer">✕</button>
                        </div>

                        <form onSubmit={handleUpgradeSubmit} className="space-y-4 text-xs">
                            <div className="bg-muted/40 p-3.5 rounded-xl border border-border space-y-1">
                                <span className="font-bold text-foreground uppercase">Selected Tier: <span className="text-amber-500">{selectedPlan}</span></span>
                                <p className="text-[11px] text-muted-foreground">Transfer the exact amount to <span className="font-mono font-bold text-foreground">03111243675</span> via JazzCash, enter your Transaction ID, and upload your payment slip below.</p>
                            </div>

                            {/* Transaction ID Input */}
                            <div>
                                <label className="block font-semibold text-muted-foreground mb-1.5">JazzCash Transaction ID / TID <span className="text-destructive">*</span></label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. TID-984521367" 
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    required
                                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono"
                                />
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="block font-semibold text-muted-foreground mb-1.5">Upload Payment Proof Slip (Image/PDF)</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="file" 
                                        accept="image/*,.pdf" 
                                        onChange={handleFileChange} 
                                        required 
                                        className="w-full bg-background border border-border rounded-xl p-2 text-xs text-foreground file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500/10 file:text-amber-500 hover:file:bg-amber-500/20 cursor-pointer" 
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end gap-2">
                                <button type="button" onClick={() => setSelectedPlan(null)} className="px-4 py-2.5 bg-muted text-foreground font-bold rounded-xl">Cancel</button>
                                <button type="submit" disabled={loading} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs">
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Upload className="w-4 h-4" /> Submit Payment Proof</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}