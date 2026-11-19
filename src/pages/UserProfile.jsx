import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import API from '../services/api';
import { toast } from 'react-toastify';
import { 
  User, Mail, Phone, Lock, Camera, Sparkles, ShieldCheck, 
  KeyRound, Cpu, CheckCircle, AlertCircle, Save
} from 'lucide-react';

export default function UserProfile() {
  // Get dashboard context data or local user info
  const outletContext = useOutletContext() || {};
  const { agent } = outletContext;
  
  const localUser = JSON.parse(localStorage.getItem("user") || '{}');

  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: localUser.name || 'User',
    email: localUser.email || '',
    phone: localUser.phone || '',
    role: agent?.agentName ? 'AI Agent Owner' : 'Enterprise User',
    company: agent?.businessName || 'NWeb Console User',
    avatar: localUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    planType: agent?.planType ? agent.planType.toUpperCase() : 'FREE',
    messagesUsed: agent?.messagesUsed || 0,
    usageLimit: agent?.usageLimit || 100
  });

  // Password Modal States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // Sync profile data when agent or localstorage updates
  useEffect(() => {
    if (agent || localUser) {
      setProfileData(prev => ({
        ...prev,
        name: localUser.name || prev.name,
        email: localUser.email || prev.email,
        company: agent?.businessName || prev.company,
        planType: agent?.planType ? agent.planType.toUpperCase() : prev.planType,
        messagesUsed: agent?.messagesUsed ?? prev.messagesUsed,
        usageLimit: agent?.usageLimit ?? prev.usageLimit
      }));
    }
  }, [agent]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Profile Save
// Handle Profile Save (Connected to Backend DB)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.put('/auth/update-profile', {
        name: profileData.name,
        email: profileData.email,
        company: profileData.company,
        avatar: profileData.avatar
      });

      if (res.data && res.data.success) {
        const updatedUser = { ...localUser, ...res.data.user };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        // Dashboard data refresh karein taake Overview tab par bhi naya naam dikhe
        if (outletContext.fetchDashboardData) {
          outletContext.fetchDashboardData();
        }
        toast.success(res.data.message || 'Profile successfully updated!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Change (Connected to Backend DB)
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPassError('New password and confirm password do not match.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }

    try {
      const res = await API.put('/auth/change-password', {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });

      if (res.data && res.data.success) {
        setPassSuccess(res.data.message);
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        toast.success(res.data.message);
        setTimeout(() => setIsPasswordModalOpen(false), 1500);
      }
    } catch (err) {
      const errorText = err.response?.data?.message || 'Error updating password.';
      setPassError(errorText);
      toast.error(errorText);
    }
  };


  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="flex items-center justify-between p-6 rounded-2xl bg-card border border-border shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl text-primary">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">User Profile & Security</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Manage your account credentials, workspace identity, and security</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar & Dynamic Usage */}
        <div className="space-y-6">
          
          {/* Avatar Card */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-xs text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-sky-400/20"></div>
            
            <div className="relative mt-6 inline-block">
              <img 
                src={profileData.avatar} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover border-4 border-card shadow-md mx-auto"
              />
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-2 bg-primary hover:opacity-90 text-primary-foreground rounded-full shadow-md cursor-pointer transition-transform hover:scale-110">
                <Camera className="w-3.5 h-3.5" />
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setProfileData(prev => ({ ...prev, avatar: URL.createObjectURL(e.target.files[0]) }));
                    }
                  }}
                />
              </label>
            </div>

            <h2 className="mt-4 text-base font-bold text-foreground">{profileData.name}</h2>
            <p className="text-xs text-primary font-medium">{profileData.role}</p>
            <div className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Enterprise Account</span>
            </div>
          </div>

          {/* Dynamic Plan & Usage Snapshot */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Subscription</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold">
                {profileData.planType}
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5 text-muted-foreground">
                <span>Monthly AI Messages</span>
                <span className="font-semibold text-foreground">{profileData.messagesUsed} / {profileData.usageLimit}</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min((profileData.messagesUsed / profileData.usageLimit) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-1.5">
                <Cpu className="w-4 h-4 text-sky-500" />
                <span>Neural Core</span>
              </div>
              <span className="text-emerald-500 font-medium">Online</span>
            </div>
          </div>

        </div>

        {/* Right Column: Dynamic Edit Form & Security */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Personal Details Form */}
          <div className="p-6 md:p-8 rounded-2xl bg-card border border-border shadow-xs">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <div>
                <h3 className="text-sm font-bold text-foreground">Workspace & Personal Details</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Update your display name and contact email</p>
              </div>
              <User className="w-5 h-5 text-primary" />
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Full Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={profileData.name} 
                    onChange={handleProfileChange}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email Address</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      name="email" 
                      value={profileData.email} 
                      onChange={handleProfileChange}
                      required
                      className="w-full px-3.5 py-2.5 pl-10 rounded-xl border border-border bg-background text-foreground text-xs outline-none focus:ring-1 focus:ring-primary"
                    />
                    <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Workspace / Business</label>
                  <input 
                    type="text" 
                    name="company" 
                    value={profileData.company} 
                    onChange={handleProfileChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Account Role</label>
                  <input 
                    type="text" 
                    value={profileData.role} 
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted text-muted-foreground text-xs outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-5 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:opacity-90 transition shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Security & Password Card */}
          <div className="p-6 md:p-8 rounded-2xl bg-card border border-border shadow-xs">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <div>
                <h3 className="text-sm font-bold text-foreground">Security Credentials</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Manage account password and security settings</p>
              </div>
              <Lock className="w-5 h-5 text-sky-500" />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-muted/30">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-sky-500/10 rounded-xl text-sky-500">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Password Management</h4>
                  <p className="text-xs text-muted-foreground">Encrypted & secured with hashing</p>
                </div>
              </div>

              <button 
                onClick={() => setIsPasswordModalOpen(true)}
                className="px-4 py-2 bg-background hover:bg-muted border border-border text-foreground font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                Change Password
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-2xl bg-card border border-border shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <h3 className="text-sm font-bold flex items-center space-x-2 text-foreground">
                <KeyRound className="w-4 h-4 text-primary" />
                <span>Change Password</span>
              </h3>
              <button 
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {passError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            {passSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{passSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Current Password</label>
                <input 
                  type="password" 
                  value={passwordForm.oldPassword} 
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">New Password</label>
                <input 
                  type="password" 
                  value={passwordForm.newPassword} 
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Confirm New Password</label>
                <input 
                  type="password" 
                  value={passwordForm.confirmPassword} 
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground text-xs font-medium hover:bg-muted transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold shadow-xs cursor-pointer hover:opacity-90 transition"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}