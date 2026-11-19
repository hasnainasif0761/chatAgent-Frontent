import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Home, ArrowLeft, Sun, Moon, AlertTriangle } from 'lucide-react';

export default function NotFoundPage() {
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(true);

    // Toggle Dark Mode Class on Root HTML element
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    return (
        <div className="min-h-screen bg-background text-foreground font-sans flex flex-col justify-between p-6 selection:bg-primary/25">
            
            {/* Top Bar with Theme Toggle */}
            <header className="max-w-7xl mx-auto w-full flex items-center justify-between">
                <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/landing')}>
                    <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-xs">
                        <Bot className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm tracking-tight text-foreground">NWeb Console</span>
                </div>

                <button 
                    onClick={() => setIsDarkMode(!isDarkMode)} 
                    className="p-2 rounded-lg bg-card text-xs font-medium shadow-xs border border-border flex items-center gap-1.5 text-foreground transition hover:bg-accent cursor-pointer"
                    title="Toggle Theme"
                >
                    {isDarkMode ? <Sun className="w-4 h-4 text-cyan-400" /> : <Moon className="w-4 h-4 text-amber-500" />}
                </button>
            </header>

            {/* Main Center Error Content */}
            <main className="max-w-md mx-auto w-full text-center space-y-6 py-12">
                <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto border border-destructive/20 shadow-xs">
                    <AlertTriangle className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-6xl font-black tracking-tight text-foreground font-mono">404</h1>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">Page Not Found</h2>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                        Oops! Jo page aap dhoond rahe hain woh shayad move ho gaya hai, delete ho gaya hai, ya galat URL enter hua hai.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-auto px-4 py-2.5 bg-card hover:bg-accent text-foreground border border-border font-semibold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Go Back</span>
                    </button>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="w-full sm:w-auto px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <Home className="w-3.5 h-3.5" />
                        <span>Back to Dashboard</span>
                    </button>
                </div>
            </main>

            {/* Footer */}
            <footer className="text-center text-[11px] text-muted-foreground">
                NWeb Enterprise Suite • Secure Routing Engine
            </footer>

        </div>
    );
}