import React, { useEffect, useState } from 'react';
import {
    RefreshCw,
    TrendingUp,
    Calendar,
    MessageSquare,
    Sparkles,
    Loader2,
    History,
    X,
    Upload,
    Infinity as InfinityIcon,
    Clock,
    Lock
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
        isUnlimited: false,
        days: 30,
        rank: 0,
        description: 'Trial tier — cannot be resubscribed once moved to paid plans.'
    },
    {
        key: 'basic',
        name: 'Basic Plan',
        price: 29,
        quota: 500,
        isUnlimited: false,
        days: 30,
        rank: 1,
        description: 'Flexible plan for small businesses starting with AI customer chat.'
    },
    {
        key: 'silver',
        name: 'Silver Growth',
        price: 79,
        quota: 3000,
        isUnlimited: false,
        days: 30,
        rank: 2,
        description: 'Built for growing teams with higher daily customer chat volume.'
    },
    {
        key: 'golden',
        name: 'Golden Enterprise',
        price: 149,
        quota: null,
        isUnlimited: true,
        days: 30,
        rank: 3,
        description: 'Unlimited chats with 30-day validity for high-volume AI traffic.'
    }
];

export default function PlanBillingPage() {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modal & Form State
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [transactionId, setTransactionId] = useState('');
    const [slipFile, setSlipFile] = useState(null);
    const [slipNote, setSlipNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchStatus = async () => {
        try {
            setLoading(true);
            const res = await API.get('/upgrade/status');
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

    const openPlanModal = (plan) => {
        if (plan.key === 'free') return;
        if (subscription?.planStatus === 'pending_approval') {
            toast.info('Aapki pichli payment request pehle se pending approval mein hai.');
            return;
        }
        setSelectedPlan(plan);
        setTransactionId('');
        setSlipFile(null);
        setSlipNote('');
    };

    const closePlanModal = () => {
        if (submitting) return;
        setSelectedPlan(null);
        setTransactionId('');
        setSlipFile(null);
        setSlipNote('');
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPlan) return;

        if (!transactionId.trim()) {
            toast.error('Please enter Transaction ID.');
            return;
        }
        if (!slipFile && !slipNote.trim()) {
            toast.error('Please attach payment screenshot or enter payment slip reference.');
            return;
        }

        try {
            setSubmitting(true);

            let res;
            if (slipFile) {
                const formData = new FormData();
                formData.append('targetPlanType', selectedPlan.key);
                formData.append('planType', selectedPlan.key);
                formData.append('transactionId', transactionId.trim());
                formData.append('paymentSlip', slipFile);
                if (slipNote.trim()) {
                    formData.append('slipNote', slipNote.trim());
                }
                res = await API.post('/upgrade/resubscribe-or-upgrade', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                res = await API.post('/upgrade/resubscribe-or-upgrade', {
                    targetPlanType: selectedPlan.key,
                    planType: selectedPlan.key,
                    transactionId: transactionId.trim(),
                    paymentSlip: slipNote.trim()
                });
            }

            if (res.data?.success) {
                toast.success(
                    res.data.message || 'Plan request submitted! Status is now Pending Approval.'
                );
                closePlanModal();
                await fetchStatus();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not submit plan request.');
        } finally {
            setSubmitting(false);
        }
    };

    const currentPlanKey = subscription?.planType || 'free';
    const currentPlanObj = PLANS.find((p) => p.key === currentPlanKey) || PLANS[0];
    const isCurrentUnlimited = Boolean(subscription?.isUnlimited) || currentPlanKey === 'golden';
    const isPendingApproval = subscription?.planStatus === 'pending_approval';

    const remainingChats = isCurrentUnlimited ? null : (subscription?.remainingChats ?? 0);
    const daysRemaining = subscription?.daysRemaining ?? 0;
    const isDateExpired = Boolean(subscription?.isDateExpired || subscription?.planStatus === 'expired');

    const previewCarryOver =
        !isCurrentUnlimited && !isDateExpired && (remainingChats || 0) > 0
            ? remainingChats
            : 0;

    const previewDays =
        !isDateExpired && daysRemaining > 0 && daysRemaining <= 5 ? 30 + daysRemaining : 30;

    const modalCarryOver =
        selectedPlan && !selectedPlan.isUnlimited ? previewCarryOver : 0;
    const modalTotalChats =
        selectedPlan && !selectedPlan.isUnlimited
            ? (selectedPlan.quota || 0) + modalCarryOver
            : null;

    return (
        <div className="min-h-screen bg-background text-foreground p-6 md:p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Plan & Billing</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Resubscribe your current plan or switch to any paid plan anytime
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

                {/* Pending Approval Notice */}
                {isPendingApproval && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
                        <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div className="text-xs">
                            <div className="font-extrabold text-amber-600 dark:text-amber-400">
                                Payment Verification Pending Approval
                            </div>
                            <p className="text-muted-foreground mt-0.5">
                                Aapki plan request submit ho chuki hai aur Superadmin approval ka intezar hai. Approve hone ke baad carry-over chats aur validity apply ho jayegi.
                            </p>
                        </div>
                    </div>
                )}

                {/* Persistent Quota / Expiry Alert Banner */}
                <QuotaAlertBanner subscription={subscription} billingPath="/dashboard/plans" />

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
                                    {isCurrentUnlimited ? (
                                        <InfinityIcon className="w-4 h-4 text-amber-500" />
                                    ) : (
                                        <MessageSquare className="w-4 h-4 text-sky-500" />
                                    )}
                                </div>
                                <div className="text-xl font-black mt-1">
                                    {isCurrentUnlimited ? (
                                        'Unlimited'
                                    ) : (
                                        <>
                                            {remainingChats}{' '}
                                            <span className="text-xs font-semibold text-muted-foreground">
                                                / {subscription?.effectiveLimit ?? 0}
                                            </span>
                                        </>
                                    )}
                                </div>
                                <div className="text-[11px] text-muted-foreground mt-1">
                                    {isCurrentUnlimited ? (
                                        'No numeric chat cap'
                                    ) : (
                                        <>
                                            Carry-over included: <strong>{subscription?.carryOverChats ?? 0}</strong>
                                        </>
                                    )}
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

                        {/* Plans Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            {PLANS.map((plan) => {
                                const isFree = plan.key === 'free';
                                const isCurrentPlan = plan.key === currentPlanKey;
                                const isHigherPlan = plan.rank > currentPlanObj.rank;

                                // Free hamesha disabled; baqi sab paid plans (Basic, Silver, Golden) select/resubscribe/upgrade ho sakte hain
                                const isDisabled = isFree || isPendingApproval;

                                let buttonLabel = 'Select Plan';
                                if (isFree) {
                                    buttonLabel = 'Free Disabled';
                                } else if (isPendingApproval) {
                                    buttonLabel = 'Pending Approval';
                                } else if (isCurrentPlan) {
                                    buttonLabel = 'Resubscribe';
                                } else if (isHigherPlan) {
                                    buttonLabel = 'Upgrade';
                                } else {
                                    buttonLabel = 'Switch Plan';
                                }

                                const cardCarryOver = !plan.isUnlimited ? previewCarryOver : 0;
                                const totalChatsIfSelected = !plan.isUnlimited
                                    ? (plan.quota || 0) + cardCarryOver
                                    : null;

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
                                                    <strong className="text-foreground">
                                                        {plan.isUnlimited ? 'Unlimited' : `${plan.quota} chats`}
                                                    </strong>
                                                </div>
                                                {!isFree && !plan.isUnlimited && cardCarryOver > 0 && (
                                                    <div className="flex items-center justify-between text-emerald-600 font-semibold">
                                                        <span>Rollover (+{cardCarryOver}):</span>
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
                                                disabled={isDisabled}
                                                onClick={() => openPlanModal(plan)}
                                                className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${
                                                    isDisabled
                                                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                                        : isCurrentPlan
                                                        ? 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer'
                                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                                                }`}
                                            >
                                                {isFree ? (
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

            {/* Plan Resubscribe / Upgrade / Switch Form Modal */}
            {selectedPlan && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between border-b border-border pb-3.5">
                            <div>
                                <h2 className="text-base font-black text-foreground">
                                    {selectedPlan.key === currentPlanKey
                                        ? `Resubscribe ${selectedPlan.name}`
                                        : `Select ${selectedPlan.name}`}
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Complete payment proof — request will go for Superadmin approval
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closePlanModal}
                                className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Plan Price & Total Quota Breakdown */}
                        <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground font-semibold">Plan Price:</span>
                                <span className="text-base font-black text-foreground">
                                    ${selectedPlan.price} / {previewDays} days
                                </span>
                            </div>

                            {selectedPlan.isUnlimited ? (
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground font-semibold">Total Chat Quota:</span>
                                    <span className="font-black text-amber-600">Unlimited</span>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">New Plan Quota:</span>
                                        <span className="font-bold text-foreground">
                                            {selectedPlan.quota} messages
                                        </span>
                                    </div>
                                    {modalCarryOver > 0 && (
                                        <div className="flex items-center justify-between text-emerald-600 font-semibold">
                                            <span>Remaining Messages from Previous Plan:</span>
                                            <span>+{modalCarryOver} messages</span>
                                        </div>
                                    )}
                                    <div className="pt-2 border-t border-border flex items-center justify-between">
                                        <span className="font-bold text-foreground">Total Quota Messages:</span>
                                        <span className="text-sm font-black text-sky-600 dark:text-sky-400">
                                            {modalTotalChats} messages
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-foreground mb-1.5">
                                    Transaction ID *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    placeholder="e.g. TXN-987654321"
                                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-foreground mb-1.5">
                                    Payment Screenshot *
                                </label>
                                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-amber-500 rounded-xl p-4 cursor-pointer transition bg-background/60">
                                    <Upload className="w-5 h-5 text-amber-500 mb-1.5" />
                                    <span className="font-semibold text-foreground">
                                        {slipFile ? slipFile.name : 'Click to upload payment screenshot'}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground mt-0.5">
                                        PNG, JPG, JPEG
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setSlipFile(e.target.files?.[0] || null)}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            <div>
                                <label className="block font-bold text-foreground mb-1.5">
                                    Slip Note / Reference (Optional if screenshot attached)
                                </label>
                                <input
                                    type="text"
                                    value={slipNote}
                                    onChange={(e) => setSlipNote(e.target.value)}
                                    placeholder="Bank / JazzCash / Easypaisa reference note..."
                                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-2">
                                <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={closePlanModal}
                                    className="px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Submitting...</span>
                                        </>
                                    ) : (
                                        <span>Submit for Approval</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}