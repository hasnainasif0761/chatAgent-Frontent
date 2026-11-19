import React, { useState } from 'react';
import { Crown, Check, ShieldCheck, Loader2, CreditCard, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import API from '../services/api';

export default function PlansBillingTab({ agent, refreshAgent }) {
    const [loadingPlan, setLoadingPlan] = useState(null);

    const handleSelectPlan = async (planName, price) => {
        // If free plan, handle directly
        if (planName === 'Free') {
            toast.info('You are already on the Free trial tier.');
            return;
        }

        // Open SweetAlert2 Checkout & Receipt Modal
        const { value: formValues } = await Swal.fire({
            title: `<span class="text-base font-bold">Upgrade to ${planName} Plan</span>`,
            html: `
                <div class="text-left text-xs space-y-3 mt-2">
                    <p class="text-muted-foreground">You selected the <b>${planName}</b> plan ($${price}). Please enter your transaction reference or bank payment details below for verification.</p>
                    <div>
                        <label class="block font-semibold mb-1">Transaction ID / Receipt Reference</label>
                        <input id="swal-tx-ref" class="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground outline-none" placeholder="e.g. TRX-98234102">
                    </div>
                    <div>
                        <label class="block font-semibold mb-1">Bank / Payment Gateway Name</label>
                        <input id="swal-bank-name" class="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground outline-none" placeholder="e.g. Meezan Bank / Konnect / Stripe">
                    </div>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Submit Payment for Approval',
            cancelButtonText: 'Cancel',
            customClass: {
                popup: 'bg-card text-foreground border border-border rounded-xl shadow-lg',
                confirmButton: 'bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg text-xs shadow-xs',
                cancelButton: 'bg-muted text-muted-foreground font-semibold px-4 py-2 rounded-lg text-xs'
            },
            preConfirm: () => {
                const txRef = document.getElementById('swal-tx-ref').value;
                const bankName = document.getElementById('swal-bank-name').value;
                if (!txRef || !bankName) {
                    Swal.showValidationMessage('Please fill in both transaction reference and bank details');
                }
                return { txRef, bankName };
            }
        });

        if (formValues) {
            setLoadingPlan(planName);
            try {
                const res = await API.post('/agent/upgrade-plan', {
                    planName: planName.toLowerCase(),
                    transactionRef: formValues.txRef,
                    bankName: formValues.bankName
                });

                if (res.data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Payment Submitted!',
                        text: 'Your payment details have been submitted for admin verification. Your account status is now pending approval.',
                        confirmButtonText: 'Got it',
                        customClass: {
                            popup: 'bg-card text-foreground border border-border rounded-xl shadow-lg',
                            confirmButton: 'bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg text-xs'
                        }
                    });
                    if (refreshAgent) refreshAgent();
                }
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to submit plan upgrade request.');
            } finally {
                setLoadingPlan(null);
            }
        }
    };

    const currentPlan = agent?.planName || 'free';
    const planStatus = agent?.planStatus || 'active';

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground">Plans & Billing Management</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Manage your enterprise subscription tiers, quotas, and verification status</p>
            </div>

            {/* Current Status Box */}
            <div className="p-4 bg-card rounded-xl border border-border shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                        <Crown className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Current Tier</span>
                        <h3 className="text-sm font-bold text-foreground capitalize">{currentPlan} Plan ({planStatus})</h3>
                    </div>
                </div>
                <div className="text-xs font-mono px-3 py-1.5 rounded-lg bg-muted text-muted-foreground border border-border">
                    Status: <span className="font-bold uppercase text-foreground">{planStatus}</span>
                </div>
            </div>

            {/* Pricing Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Free Plan */}
                <div className="bg-card border border-border p-5 rounded-2xl flex flex-col justify-between shadow-xs">
                    <div>
                        <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Trial Tier</span>
                        <h3 className="text-base font-bold text-foreground mt-1">Free Plan</h3>
                        <div className="text-xl font-black text-foreground my-3">$0 <span className="text-xs font-normal text-muted-foreground">/ trial</span></div>
                        <ul className="space-y-2 text-xs text-muted-foreground mb-6">
                            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> 15 Messages Permanent Limit</li>
                            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Standard Database Sync</li>
                        </ul>
                    </div>
                    <button 
                        disabled={currentPlan === 'free'}
                        className="w-full py-2 bg-muted text-muted-foreground font-semibold rounded-xl text-xs cursor-not-allowed"
                    >
                        {currentPlan === 'free' ? 'Current Plan' : 'Free Trial'}
                    </button>
                </div>

                {/* Basic Plan */}
                <div className="bg-card border border-border p-5 rounded-2xl flex flex-col justify-between shadow-xs">
                    <div>
                        <span className="text-[10px] font-bold uppercase text-sky-500 tracking-wider">Starter Tier</span>
                        <h3 className="text-base font-bold text-foreground mt-1">Basic Plan</h3>
                        <div className="text-xl font-black text-foreground my-3">$29 <span className="text-xs font-normal text-muted-foreground">/ quota</span></div>
                        <ul className="space-y-2 text-xs text-muted-foreground mb-6">
                            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> 500 Messages Quota</li>
                            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Message-Quota Tracking</li>
                        </ul>
                    </div>
                    <button 
                        onClick={() => handleSelectPlan('Basic', 29)}
                        disabled={loadingPlan === 'Basic'}
                        className="w-full py-2 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                    >
                        {loadingPlan === 'Basic' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                        <span>{currentPlan === 'basic' ? 'Active Plan' : 'Upgrade Basic'}</span>
                    </button>
                </div>

                {/* Silver Plan */}
                <div className="bg-card border border-sky-500/40 p-5 rounded-2xl flex flex-col justify-between shadow-xs relative">
                    <span className="absolute top-3 right-3 bg-sky-500/10 text-sky-500 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase">Popular</span>
                    <div>
                        <span className="text-[10px] font-bold uppercase text-sky-500 tracking-wider">Pro Tier</span>
                        <h3 className="text-base font-bold text-foreground mt-1">Silver Plan</h3>
                        <div className="text-xl font-black text-foreground my-3">$79 <span className="text-xs font-normal text-muted-foreground">/ high quota</span></div>
                        <ul className="space-y-2 text-xs text-muted-foreground mb-6">
                            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> 3,000 Messages Quota</li>
                            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Advanced Analytics</li>
                        </ul>
                    </div>
                    <button 
                        onClick={() => handleSelectPlan('Silver', 79)}
                        disabled={loadingPlan === 'Silver'}
                        className="w-full py-2 bg-gradient-to-r from-sky-600 to-sky-400 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                    >
                        {loadingPlan === 'Silver' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                        <span>{currentPlan === 'silver' ? 'Active Plan' : 'Upgrade Silver'}</span>
                    </button>
                </div>

                {/* Golden Plan */}
                <div className="bg-card border border-amber-500/40 p-5 rounded-2xl flex flex-col justify-between shadow-xs relative">
                    <span className="absolute top-3 right-3 bg-amber-500/10 text-amber-500 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase">Enterprise</span>
                    <div>
                        <span className="text-[10px] font-bold uppercase text-amber-500 tracking-wider">VIP Tier</span>
                        <h3 className="text-base font-bold text-foreground mt-1">Golden Plan</h3>
                        <div className="text-xl font-black text-foreground my-3">$149 <span className="text-xs font-normal text-muted-foreground">/ month</span></div>
                        <ul className="space-y-2 text-xs text-muted-foreground mb-6">
                            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Unlimited Messages</li>
                            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Time / Month-Wise Validity</li>
                        </ul>
                    </div>
                    <button 
                        onClick={() => handleSelectPlan('Golden', 149)}
                        disabled={loadingPlan === 'Golden'}
                        className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                    >
                        {loadingPlan === 'Golden' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Crown className="w-3.5 h-3.5" />}
                        <span>{currentPlan === 'golden' ? 'Active Plan' : 'Upgrade Golden'}</span>
                    </button>
                </div>

            </div>
        </div>
    );
}