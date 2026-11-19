import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Mail, Lock, User, ArrowRight, Building, Phone, MapPin, Globe, CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../services/api';
import '../App.css';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        businessName: '',
        email: '',
        phone: '',
        city: '',
        country: '',
        planType: 'free',
        password: ''
    });

    const [paymentSlip, setPaymentSlip] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                // Login Flow
                const res = await API.post('/auth/login', {
                    email: formData.email,
                    password: formData.password
                });

                if (res.data.token) {
                    toast.success('Login successful! Redirecting...');
                    localStorage.setItem('token', res.data.token);
                    if (res.data.user) {
                        localStorage.setItem('user', JSON.stringify(res.data.user));
                    }
                    navigate('/dashboard');
                }
            } else {
                // Register Flow using FormData for file upload support
                const dataForm = new FormData();
                dataForm.append('name', formData.name);
                dataForm.append('businessName', formData.businessName);
                dataForm.append('email', formData.email);
                dataForm.append('phone', formData.phone);
                dataForm.append('city', formData.city);
                dataForm.append('country', formData.country);
                dataForm.append('planType', formData.planType);
                dataForm.append('password', formData.password);

                if (formData.planType !== 'free' && paymentSlip) {
                    dataForm.append('paymentSlip', paymentSlip);
                }

                const res = await API.post('/auth/registerUser', dataForm);

                if (formData.planType === 'free') {
                    if (res.data.token) {
                        toast.success('Account created successfully! Redirecting...');
                        localStorage.setItem('token', res.data.token);
                        if (res.data.user) {
                            localStorage.setItem('user', JSON.stringify(res.data.user));
                        }
                        navigate('/dashboard');
                    }
                } else {
                    // Paid plan registration requiring admin approval
                    toast.info('⏳ Registration submitted! Please wait 24 hours for admin approval of your payment.');
                    setIsLogin(true); // Switch back to login view after successful registration request
                }
            }
        } catch (err) {
            console.log("ya front form",err)
            toast.error(err.response?.data?.message || 'Authentication failed. Please check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 py-10">
            <div className="w-full max-w-lg bg-card rounded-2xl border border-border shadow-lg p-6 md:p-8 space-y-6">
                
                {/* Brand Header */}
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                        <Bot className="w-6 h-6" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground">
                        {isLogin ? 'Welcome Back to NWeb' : 'Create Enterprise Account'}
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        {isLogin ? 'Enter your credentials to access your dashboard' : 'Register your business, select tier & deploy AI agents'}
                    </p>
                </div>

                {/* Login / Register Toggle Tabs */}
                <div className="grid grid-cols-2 p-1 bg-muted rounded-xl border border-border text-xs font-semibold">
                    <button
                        type="button"
                        onClick={() => setIsLogin(true)}
                        className={`py-2 rounded-lg transition ${
                            isLogin ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsLogin(false)}
                        className={`py-2 rounded-lg transition ${
                            !isLogin ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Register
                    </button>
                </div>

                {/* Authentication Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Full Name</label>
                                    <div className="relative">
                                        <User className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Huzaifa Asif"
                                            required={!isLogin}
                                            className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Business Name</label>
                                    <div className="relative">
                                        <Building className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                                        <input
                                            type="text"
                                            name="businessName"
                                            value={formData.businessName}
                                            onChange={handleChange}
                                            placeholder="NWeb Enterprises"
                                            required={!isLogin}
                                            className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+92 300 1234567"
                                            required={!isLogin}
                                            className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">City</label>
                                    <div className="relative">
                                        <MapPin className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            placeholder="Karachi"
                                            required={!isLogin}
                                            className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Country</label>
                                <div className="relative">
                                    <Globe className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        placeholder="Pakistan"
                                        required={!isLogin}
                                        className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Select Subscription Plan</label>
                                <select
                                    name="planType"
                                    value={formData.planType}
                                    onChange={handleChange}
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary font-semibold"
                                >
                                    <option value="free">Free Trial (15 Messages)</option>
                                    <option value="basic">Basic Plan - ($29) - 500 Messages</option>
                                    <option value="silver">Silver Plan - ($79) - 3,000 Message</option>
                                    <option value="golden">Golden Plan ($149) - Unlimited Messages - Month Wise</option>
                                </select>
                            </div>

                            {/* Conditional JazzCash Payment Section */}
                            {formData.planType !== 'free' && (
                                <div className="p-4 bg-muted/50 rounded-xl border border-border space-y-3">
                                    <div className="flex items-center gap-2 text-sky-500 font-bold text-xs uppercase tracking-wider">
                                        <CreditCard className="w-4 h-4" /> JazzCash Manual Payment
                                    </div>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        Please transfer the subscription amount to the account details below and upload your payment slip screenshot.
                                    </p>
                                    <div className="bg-card p-3 rounded-lg border border-border text-xs space-y-1 font-mono">
                                        <div><strong>Account Name:</strong> NWeb Solutions</div>
                                        <div><strong>JazzCash Number:</strong> 0300-1234567</div>
                                        <div><strong>Tier:</strong> {formData.planType.toUpperCase()}</div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-muted-foreground mb-1">Upload Payment Slip</label>
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={(e) => setPaymentSlip(e.target.files[0])}
                                            required={formData.planType !== 'free'}
                                            className="w-full bg-background border border-border rounded-lg p-2 text-xs text-muted-foreground file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground cursor-pointer"
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Email Address</label>
                        <div className="relative">
                            <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@company.com"
                                required
                                className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Password</label>
                        <div className="relative">
                            <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <span>{isLogin ? 'Sign In to Console' : (formData.planType === 'free' ? 'Register & Access Dashboard' : 'Submit Registration & Payment')}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </>
                        )}
                    </button>
                </form>

            </div>
        </div>
    );
}