import React from 'react';
import { AlertCircle, Loader2, Megaphone } from 'lucide-react';
import { cn } from '../lib/utils';

export default function TopAlertBanner({ planStatus, pendingPaymentDetails, broadcast }) {
    // 🟢 Superadmin Broadcast Banner (Priority view)
    if (broadcast) {
        return (
            <div className="mb-6 p-4 rounded-xl border bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-between text-xs font-medium transition-all shadow-sm">
                <div className="flex items-center gap-3">
                    <Megaphone className="w-4 h-4 text-sky-500 shrink-0" />
                    <div>
                        <h4 className="font-semibold text-sm leading-tight">
                            {broadcast.title || 'System Broadcast Notice'}
                        </h4>
                        <p className="text-muted-foreground mt-0.5 opacity-90">
                            {broadcast.message || broadcast}
                        </p>
                    </div>
                </div>
                <span className="font-mono font-bold text-[11px] px-2.5 py-1 rounded-md bg-background/80 border border-border shadow-xs text-sky-500">
                    BROADCAST
                </span>
            </div>
        );
    }

    if (planStatus !== 'expired' && planStatus !== 'pending_approval') {
        return null;
    }

    const isPending = planStatus === 'pending_approval';

    return (
        <div 
            className={cn(
                "mb-6 p-4 rounded-xl border flex items-center justify-between text-xs font-medium transition-all shadow-sm",
                isPending 
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400" 
                    : "bg-destructive/10 border-destructive/20 text-destructive dark:text-red-400"
            )}
        >
            <div className="flex items-center gap-3">
                {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin text-amber-500 shrink-0" />
                ) : (
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                )}
                <div>
                    <h4 className="font-semibold text-sm leading-tight">
                        {isPending ? 'Payment Under Review' : 'Plan Expired Notice'}
                    </h4>
                    <p className="text-muted-foreground mt-0.5 opacity-90">
                        {isPending 
                            ? 'Aapka payment request submit ho chuki hai. Admin verification 24 hours mein complete ho jayegi.' 
                            : 'Aapka plan expire ho chuka hai. AI chat workspace continue rakhne ke liye plan renew karein.'}
                    </p>
                </div>
            </div>

            <span className="font-mono font-bold text-[11px] px-2.5 py-1 rounded-md bg-background/80 border border-border shadow-xs">
                {isPending 
                    ? `TXN: ${pendingPaymentDetails?.transactionId || '#PENDING'}` 
                    : 'EXPIRED'}
            </span>
        </div>
    );
}