import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function RecentSetupsTab({ recentSetups, onRefresh }) {
    // 🟢 Safety check: Ensure recentSetups is always treated as an array
    const setupsList = Array.isArray(recentSetups) 
        ? recentSetups 
        : (recentSetups?.setups || recentSetups?.recentSetups || []);

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground">View Recent Database Setups</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">History of all connected SQL databases, Google Sheets, and Excel files</p>
                </div>
                {onRefresh && (
                    <button onClick={onRefresh} className="px-3.5 py-2 bg-card border border-border text-foreground rounded-lg text-xs font-semibold hover:bg-muted transition flex items-center gap-1.5 cursor-pointer shadow-xs">
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh List
                    </button>
                )}
            </div>
            
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-foreground">
                        <thead className="bg-muted text-muted-foreground uppercase tracking-wider border-b border-border">
                            <tr>
                                <th className="p-3.5">Setup ID</th>
                                <th className="p-3.5">Source / DB Name</th>
                                <th className="p-3.5">Tables/Columns Included</th>
                                <th className="p-3.5">Timestamp</th>
                                <th className="p-3.5 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {setupsList.length > 0 ? (
                                setupsList.map((s, idx) => (
                                    <tr key={s._id || idx} className="hover:bg-muted/40 transition">
                                        <td className="p-3.5 font-mono text-[10px] text-muted-foreground">{s._id}</td>
                                        <td className="p-3.5 font-bold text-foreground">{s.dbName || s.sourceName || 'SQL / Sheet Source'}</td>
                                        <td className="p-3.5 text-muted-foreground">Synced Tables/Columns</td>
                                        <td className="p-3.5 text-muted-foreground">{s.createdAt ? new Date(s.createdAt).toLocaleString() : 'N/A'}</td>
                                        <td className="p-3.5 text-right">
                                            <span className="text-xs text-sky-500 font-bold">Active User Profile</span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-muted-foreground">
                                        No database setups found. Connect a database or sheet first.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}