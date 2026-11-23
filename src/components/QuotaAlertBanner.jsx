import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AlertTriangle,
    Clock,
    Sparkles,
    ArrowUpRight,
    Infinity as InfinityIcon,
    MessageSquareOff
} from 'lucide-react';

export default function QuotaAlertBanner({ subscription, billingPath = '/dashboard/plans' }) {
    const navigate = useNavigate();

    if (!subscription) return null;

    const isUnlimited = Boolean(subscription.isUnlimited) || subscription.planType === 'golden';
    const is30DaysExpired = Boolean(subscription.isDateExpired) || subscription.planStatus === 'expired';
    const isQuotaExhausted = !isUnlimited && Boolean(subscription.isQuotaExhausted);
    const daysRemaining = subscription.daysRemaining ?? 0;
    const is5DayWarning = !is30DaysExpired && daysRemaining > 0 && daysRemaining <= 5;
    const carryOverChats = subscription.carryOverChats || 0;

    // 1. 30-Day Validity Expired Banner
    if (is30DaysExpired) {
        return (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-red-500/15 text-red-500 shrink-0 mt-0.5">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-extrabold text-red-600 dark:text-red-400">
                                30-Day Subscription Cycle Expired
                            </h3>
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-red-500/15 text-red-500">
                                {subscription.planType || 'Plan'}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            Aapke plan ki 30-day validity khatam ho gayi hai. Remaining chats reset ho chuki hain aur customer AI chat pause hai. Dashboard tabs open hain — service dobara chalane ke liye plan resubscribe karein.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => navigate(billingPath)}
                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-xs"
                >
                    <span>Resubscribe Plan</span>
                    <ArrowUpRight className="w-4 h-4" />
                </button>
            </div>
        );
    }

    // 2. Chat Quota Exhausted Banner (Limited plans only; 30-day cycle still active, sidebar remains unlocked)
    if (isQuotaExhausted) {
        return (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-500 shrink-0 mt-0.5">
                        <MessageSquareOff className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                                Chat Quota Exhausted — Customer AI Chat Paused
                            </h3>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-500">
                                {daysRemaining} {daysRemaining === 1 ? 'Day' : 'Days'} Left in Cycle
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            Aapke <span className="font-bold uppercase text-foreground">{subscription.planType}</span> plan ke chats khatam ho gaye hain (0 chats remaining). Aapka dashboard aur sidebar open hai, lekin customer AI chat tab tak pause rahegi jab tak aap plan resubscribe ya upgrade nahi karte.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => navigate(billingPath)}
                    className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-xs"
                >
                    <span>Resubscribe / Upgrade</span>
                    <ArrowUpRight className="w-4 h-4" />
                </button>
            </div>
        );
    }

    // 3. 5-Day Pre-Expiry Rollover Reminder Banner
    if (is5DayWarning) {
        return (
            <div className="bg-sky-500/10 border border-sky-500/30 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-500 shrink-0 mt-0.5">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-extrabold text-sky-600 dark:text-sky-400">
                                Plan Expiring in {daysRemaining} {daysRemaining === 1 ? 'Day' : 'Days'}
                            </h3>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-sky-500/15 text-sky-500">
                                {isUnlimited
                                    ? 'Unlimited Chats'
                                    : `${subscription.remainingChats ?? 0} Chats Remaining`}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {isUnlimited
                                ? `Aapka Golden plan ${daysRemaining} din mein expire hoga. Abhi renew/upgrade karne par baqi ${daysRemaining} din aapke naye 30-day cycle mein plus ho jayenge.`
                                : `Agar aap abhi resubscribe ya upgrade karte hain, toh aapke baqi ${daysRemaining} din aur ${subscription.remainingChats ?? 0} unused chats naye plan mein carry-over (+) ho jayenge.`}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => navigate(billingPath)}
                    className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-xs"
                >
                    <span>Renew & Carry Over</span>
                    <ArrowUpRight className="w-4 h-4" />
                </button>
            </div>
        );
    }

    // 4. Subtle Carry-Over / Unlimited Status Strip when rollover is active
    if (carryOverChats > 0 && !isUnlimited) {
        return (
            <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs">
                    <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-foreground font-semibold">
                        Rollover Active: <strong className="text-emerald-600 dark:text-emerald-400">+{carryOverChats}</strong> carry-over chats added to your current cycle ({daysRemaining} days left).
                    </span>
                </div>
            </div>
        );
    }

    if (isUnlimited) {
        return (
            <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs">
                    <InfinityIcon className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-foreground font-semibold">
                        Golden Plan Active: <strong className="text-amber-600 dark:text-amber-400">Unlimited Chats</strong> • {daysRemaining} days remaining in 30-day cycle.
                    </span>
                </div>
            </div>
        );
    }

    return null;
}