import React, { useEffect, useState } from 'react';
import {
    CheckCircle2,
    Lock,
    RefreshCw,
    TrendingUp,
    Calendar,
    MessageSquare,
    Sparkles,
    Loader2,
    History
} from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../services/api';
import QuotaAlertBanner from '../components/QuotaAlertBanner';

const PLANS = [
    {
        key: 'free',
        name: 'Free Starter',
        price: 0,
        quota: 15,
        days: 30,
        rank: 0,
        description: 'Trial tier — cannot be resubscribed once moved to paid plans.'
    },
    {
        key: 'basic',
        name: 'Basic Plan',
        price: 29,
        quota: 500,
        days: 30,
        rank: 1,
        description: 'Ideal for small businesses starting with AI customer chat.'
    },
    {
        key: 'silver',
        name: 'Silver Growth',
        price: 79,
        quota: 3000,
        days: 30,
        rank: 2,
        description: 'Built for growing teams with higher daily customer chat volume.'
    },
    {
        key: 'golden',
        name: 'Golden Enterprise',
        price: 149,
        quota: 15000,
        days: 30,
        rank: 3,
        description: 'High-capacity plan for scaling businesses and heavy AI traffic.'
    }
];

export default function PlanBillingPage() {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submittingPlan, setSubmittingPlan] = useState(null);
    const [paymentSlip, setPaymentSlip] = useState('');

    const fetchStatus = async () => {
        try {
            setLoading(true);
            const res = await API.get('/subscription/status');
            if (res.data?.success) {
                setSubscription(res.data.subscription);
            }
        } catch (err) {
            toast.error('Failed to load subscription details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const handlePlanAction = async (targetPlanKey) => {
        if (targetPlanKey === 'free') return;

        try {
            setSubmittingPlan(targetPlanKey);
            const res = await API.post('/subscription/resubscribe-or-upgrade', {
                targetPlanType: targetPlanKey,
                paymentSlip: paymentSlip.trim()
            });

            if (res.data?.success) {
                toast.success(res.data.message);
                setPaymentSlip('');
                await fetchStatus();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not process plan action.');
        } finally {
            setSubmittingPlan(null);
        }
    };

    const currentPlanKey = subscription?.planType || 'free';
    const currentPlanObj = PLANS.find((p) => p.key === currentPlanKey) || PLANS[0];
    const remainingChats = subscription?.remainingChats ?? 0;
    const daysRemaining = subscription?.daysRemaining ?? 0;
    const isDateExpired = Boolean(subscription?.isDateExpired || subscription?.planStatus === 'expired');

    const previewCarryOver = !isDateExpired && remainingChats > 0 ? remainingChats : 0;
    const previewDays =
        !isDateExpired && daysRemaining > 0 && daysRemaining <= 5 ? 30 + daysRemaining : 30;

    return (
        <div className="min-h-screen bg-background text-foreground p-6 md:p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Plan & Billing</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Resubscribe your current plan or upgrade to a higher tier anytime
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={fetchStatus}
                        className="px-3.5 py-2 rounded-xl bg-card border border-border hover:bg-muted text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
                    >
                        <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
                        <span>Refresh Status</span>
                    </button>
                </div>

                {/* Persistent Quota / Expiry Alert Banner */}
                <QuotaAlertBanner subscription={subscription} billingPath="/billing" />

                {loading ? (
                    <div className="p-16 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                        <span>Loading your subscription & chat quota...</span>
                    </div>
                ) : (
                    <>
                        {/* Current Quota & Validity Summary */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-card border border-border p-4 rounded-2xl">
                                <div className="text-[11px] font-bold uppercase text-muted-foreground">
                                    Current Plan
                                </div>
                                <div className="text-xl font-black uppercase text-amber-600 mt-1">
                                    {currentPlanObj.name}
                                </div>
                                <div className="text-[11px] text-muted-foreground mt-1 capitalize">
                                    Status: <strong>{subscription?.planStatus || 'active'}</strong>
                                </div>
                            </div>

                            <div className="bg-card border border-border p-4 rounded-2xl">
                                <div className="flex items-center justify-between text-[11px] font-bold uppercase text-muted-foreground">
                                    <span>Remaining Chats</span>
                                    <MessageSquare className="w-4 h-4 text-sky-500" />
                                </div>
                                <div className="text-xl font-black mt-1">
                                    {remainingChats}{' '}
                                    <span className="text-xs font-semibold text-muted-foreground">
                                        / {subscription?.effectiveLimit ?? 0}
                                    </span>
                                </div>
                                <div className="text-[11px] text-muted-foreground mt-1">
                                    Carry-over included: <strong>{subscription?.carryOverChats ?? 0}</strong>
                                </div>
                            </div>

                            <div className="bg-card border border-border p-4 rounded-2xl">
                                <div className="flex items-center justify-between text-[11px] font-bold uppercase text-muted-foreground">
                                    <span>Validity Left</span>
                                    <Calendar className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div className="text-xl font-black mt-1">{daysRemaining} Days</div>
                                <div className="text-[11px] text-muted-foreground mt-1">
                                    {daysRemaining <= 5 && !isDateExpired
                                        ? '5-day renewal window: remaining days will add (+30d)'
                                        : 'Standard 30-day billing cycle'}
                                </div>
                            </div>

                            <div className="bg-card border border-border p-4 rounded-2xl">
                                <div className="flex items-center justify-between text-[11px] font-bold uppercase text-muted-foreground">
                                    <span>Customer AI Chat</span>
                                    <Sparkles className="w-4 h-4 text-amber-500" />
                                </div>
                                <div
                                    className={`text-xl font-black mt-1 ${
                                        subscription?.canCustomerChat ? 'text-emerald-600' : 'text-red-600'
                                    }`}
                                >
                                    {subscription?.canCustomerChat ? 'Active' : 'Paused'}
                                </div>
                                <div className="text-[11px] text-muted-foreground mt-1">
                                    Dashboard remains accessible
                                </div>
                            </div>
                        </div>

                        {/* Optional Payment Reference / Slip Input */}
                        <div className="bg-card border border-border p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="text-xs">
                                <span className="font-bold">Payment Slip / Reference (Optional):</span>{' '}
                                <span className="text-muted-foreground">
                                    Next renewal grants <strong>{previewDays} days</strong> and adds{' '}
                                    <strong>{previewCarryOver}</strong> carry-over chats if eligible.
                                </span>
                            </div>
                            <input
                                type="text"
                                value={paymentSlip}
                                onChange={(e) => setPaymentSlip(e.target.value)}
                                placeholder="Transaction ID or slip note..."
                                className="sm:w-72 bg-background border border-border rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-amber-500"
                            />
                        </div>

                        {/* Plans Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            {PLANS.map((plan) => {
                                const isFree = plan.key === 'free';
                                const isCurrentPlan = plan.key === currentPlanKey;
                                const isHigherPlan = plan.rank > currentPlanObj.rank;
                                const isBusy = submittingPlan === plan.key;

                                // Free hamesha disabled; current plan par Resubscribe; higher plan par Upgrade
                                const isDisabled = isFree || (!isCurrentPlan && !isHigherPlan);

                                let buttonLabel = 'Unavailable';
                                if (isFree) {
                                    buttonLabel = 'Free Disabled';
                                } else if (isCurrentPlan) {
                                    buttonLabel = 'Resubscribe';
                                } else if (isHigherPlan) {
                                    buttonLabel = 'Upgrade';
                                }

                                const totalChatsIfSelected = plan.quota + previewCarryOver;

                                return (
                                    <div
                                        key={plan.key}
                                        className={`bg-card rounded-2xl p-5 border flex flex-col justify-between transition ${
                                            isCurrentPlan
                                                ? 'border-amber-500 ring-2 ring-amber-500/20'
                                                : 'border-border'
                                        } ${isFree ? 'opacity-65' : ''}`}
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <h2 className="text-base font-black">{plan.name}</h2>
                                                {isCurrentPlan && (
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-amber-500/15 text-amber-600">
                                                        Current
                                                    </span>
                                                )}
                                            </div>

                                            <div className="text-2xl font-black">
                                                ${plan.price}
                                                <span className="text-xs font-semibold text-muted-foreground">
                                                    {' '}
                                                    / {plan.days} days
                                                </span>
                                            </div>

                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                {plan.description}
                                            </p>

                                            <div className="pt-2 border-t border-border space-y-1.5 text-xs">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-muted-foreground">Plan Quota:</span>
                                                    <strong className="text-foreground">{plan.quota} chats</strong>
                                                </div>
                                                {!isFree && previewCarryOver > 0 && (
                                                    <div className="flex items-center justify-between text-emerald-600 font-semibold">
                                                        <span>Rollover (+{previewCarryOver}):</span>
                                                        <span>{totalChatsIfSelected} total chats</span>
                                                    </div>
                                                )}
                                                {!isFree && (
                                                    <div className="flex items-center justify-between text-muted-foreground">
                                                        <span>Validity Granted:</span>
                                                        <strong className="text-foreground">{previewDays} days</strong>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-5">
                                            <button
                                                type="button"
                                                disabled={isDisabled || isBusy}
                                                onClick={() => handlePlanAction(plan.key)}
                                                className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
                                                    isDisabled
                                                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                                        : isCurrentPlan
                                                        ? 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer'
                                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                                                }`}
                                            >
                                                {isBusy ? (
                                                    <>
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        <span>Processing...</span>
                                                    </>
                                                ) : isFree ? (
                                                    <>
                                                        <Lock className="w-3.5 h-3.5" />
                                                        <span>{buttonLabel}</span>
                                                    </>
                                                ) : isCurrentPlan ? (
                                                    <>
                                                        <RefreshCw className="w-3.5 h-3.5" />
                                                        <span>{buttonLabel}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <TrendingUp className="w-3.5 h-3.5" />
                                                        <span>{buttonLabel}</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Subscription & Quota History */}
                        {subscription?.subscriptionLogs?.length > 0 && (
                            <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                                <div className="flex items-center gap-2 text-xs font-black uppercase text-foreground">
                                    <History className="w-4 h-4 text-amber-500" />
                                    <span>Recent Subscription & Quota Activity</span>
                                </div>
                                <div className="divide-y divide-border text-xs">
                                    {subscription.subscriptionLogs.map((log, idx) => (
                                        <div
                                            key={idx}
                                            className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                                        >
                                            <div>
                                                <span className="font-bold uppercase text-amber-600 mr-2">
                                                    {log.action}
                                                </span>
                                                <span className="text-foreground">{log.note}</span>
                                            </div>
                                            <span className="text-[11px] text-muted-foreground">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}