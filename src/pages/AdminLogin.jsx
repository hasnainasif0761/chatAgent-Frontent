import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../services/api';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await API.post('/admin/login', { email, password });
            if (res.data.success) {
                toast.success('Superadmin Authentication Verified!');
                localStorage.setItem('adminToken', res.data.token);
                navigate('/superadmin/dashboard');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Access Denied: Invalid Credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-xl p-8 space-y-6">
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground">Superadmin Secure Portal</h1>
                    <p className="text-xs text-muted-foreground">Restricted access for NWeb platform administrators only</p>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Admin Email</label>
                        <div className="relative">
                            <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                placeholder="huzaifa@gmail.com" 
                                required 
                                className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-amber-500" 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Secure Password</label>
                        <div className="relative">
                            <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder="••••••••" 
                                required 
                                className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-amber-500" 
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Authenticate Admin</span><ArrowRight className="w-3.5 h-3.5" /></>}
                    </button>
                </form>
            </div>
        </div>
    );
}