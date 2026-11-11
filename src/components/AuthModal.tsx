import React, { useState } from 'react';
import { AuthService, AuthSession } from '../services/authService';
import { 
  X, 
  User, 
  Cloud, 
  Lock, 
  Mail, 
  ShieldCheck, 
  LogOut, 
  Trash2, 
  Check, 
  Key, 
  Database, 
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Send
} from 'lucide-react';

interface AuthModalProps {
  session: AuthSession;
  onSessionUpdated: (session: AuthSession) => void;
  onAccountWiped: () => void;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  session,
  onSessionUpdated,
  onAccountWiped,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'account' | 'login' | 'signup' | 'forgot_password'>(
    session.isAuthenticated ? 'account' : 'login'
  );
  
  // Login / Signup Form
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [hunterName, setHunterName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const isCloudActive = AuthService.isCloudConfigured();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setStatusMessage({ text: 'Please provide both email and password.', isError: true });
      return;
    }

    setLoading(true);
    setStatusMessage({ text: 'Verifying hunter credentials...', isError: false });
    
    const res = await AuthService.signIn(email, password);
    setLoading(false);

    if (res.success) {
      const newSession = AuthService.getSession();
      onSessionUpdated(newSession);
      setStatusMessage({ text: res.message, isError: false });
      setTimeout(() => {
        setActiveTab('account');
        setStatusMessage(null);
      }, 900);
    } else {
      setStatusMessage({ text: res.message, isError: true });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setStatusMessage({ text: 'Email and password are required.', isError: true });
      return;
    }

    if (password.length < 6) {
      setStatusMessage({ text: 'Password must be at least 6 characters.', isError: true });
      return;
    }

    setLoading(true);
    setStatusMessage({ text: 'Awakening hunter account...', isError: false });

    const res = await AuthService.signUp(email, password, hunterName || 'Candidate');
    setLoading(false);

    if (res.success) {
      const newSession = AuthService.getSession();
      onSessionUpdated(newSession);
      setStatusMessage({ text: res.message, isError: false });
      if (!res.requiresEmailConfirmation) {
        setTimeout(() => {
          setActiveTab('account');
          setStatusMessage(null);
        }, 1200);
      }
    } else {
      setStatusMessage({ text: res.message, isError: true });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatusMessage({ text: 'Please enter your account email.', isError: true });
      return;
    }

    setLoading(true);
    const res = await AuthService.resetPassword(email);
    setLoading(false);
    setStatusMessage({ text: res.message, isError: !res.success });
  };

  const handleSignOut = async () => {
    await AuthService.signOut();
    const newSession = AuthService.getSession();
    onSessionUpdated(newSession);
    setActiveTab('login');
    setStatusMessage({ text: 'Hunter signed out successfully.', isError: false });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-[#09152b] border border-cyan-800/60 shadow-[0_0_35px_rgba(0,229,255,0.25)] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-900/40 bg-[#060e1e]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Cinzel',serif] text-base font-bold text-slate-100">
                Hunter Citadel Auth
              </h3>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                <span className={`w-2 h-2 rounded-full ${isCloudActive ? 'bg-emerald-400 shadow-[0_0_6px_#10B981]' : 'bg-cyan-400'}`} />
                {isCloudActive ? 'Supabase Cloud Connected' : 'Local Offline Mode'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-cyan-950 bg-[#071224] text-xs font-['Rajdhani',sans-serif] font-bold">
          {session.isAuthenticated ? (
            <button
              onClick={() => setActiveTab('account')}
              className={`flex-1 py-2.5 text-center transition ${
                activeTab === 'account'
                  ? 'border-b-2 border-cyan-400 text-cyan-300 bg-cyan-950/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hunter Profile
            </button>
          ) : (
            <>
              <button
                onClick={() => { setActiveTab('login'); setStatusMessage(null); }}
                className={`flex-1 py-2.5 text-center transition ${
                  activeTab === 'login'
                    ? 'border-b-2 border-cyan-400 text-cyan-300 bg-cyan-950/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setActiveTab('signup'); setStatusMessage(null); }}
                className={`flex-1 py-2.5 text-center transition ${
                  activeTab === 'signup'
                    ? 'border-b-2 border-cyan-400 text-cyan-300 bg-cyan-950/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Awaken (Register)
              </button>
            </>
          )}
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className={`mx-6 mt-4 p-3 rounded-xl text-xs font-medium border flex items-start gap-2 ${
            statusMessage.isError
              ? 'bg-red-950/50 border-red-800 text-red-200'
              : 'bg-emerald-950/50 border-emerald-800 text-emerald-200'
          }`}>
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6">

          {/* TAB: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Hunter Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hunter@awakened.fit"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-400 font-mono transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Secret Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-400 font-mono transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={() => { setActiveTab('forgot_password'); setStatusMessage(null); }}
                  className="text-cyan-400 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,229,255,0.4)] transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Sign In to Hunter Citadel
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-400">Need to awaken your account? </span>
                <button
                  type="button"
                  onClick={() => { setActiveTab('signup'); setStatusMessage(null); }}
                  className="text-xs text-cyan-300 font-bold hover:underline cursor-pointer"
                >
                  Register here
                </button>
              </div>
            </form>
          )}

          {/* TAB: SIGNUP */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Hunter Codex Codename
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={hunterName}
                    onChange={(e) => setHunterName(e.target.value)}
                    placeholder="Shadow Sovereign"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hunter@awakened.fit"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-400 font-mono transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-400 font-mono transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(151,77,255,0.4)] transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Awaken Hunter Profile
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-400">Already an awakened hunter? </span>
                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); setStatusMessage(null); }}
                  className="text-xs text-cyan-300 font-bold hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}

          {/* TAB: FORGOT PASSWORD */}
          {activeTab === 'forgot_password' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-xs text-slate-300">
                Enter your registered hunter email. We will send a secure password recovery transmission.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Account Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hunter@awakened.fit"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-400 font-mono transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                Send Recovery Transmission
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('login'); setStatusMessage(null); }}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                ← Back to Login
              </button>
            </form>
          )}

          {/* TAB: ACCOUNT INFO (When Authenticated) */}
          {activeTab === 'account' && session.user && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-slate-100">{session.user.hunterName}</div>
                    <div className="text-xs text-slate-400 font-mono">{session.user.email}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    session.user.isEmailVerified
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {session.user.isEmailVerified ? 'Verified Hunter' : 'Unverified Email'}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-2 flex items-center justify-between">
                  <span>Hunter ID:</span>
                  <span className="font-mono text-cyan-400 truncate max-w-[180px]">{session.user.id}</span>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Database Link:</span>
                  <span className="font-mono text-slate-300">
                    {session.isCloudLinked ? 'Supabase PostgreSQL' : 'Local Storage'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSignOut}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 border border-slate-700"
                >
                  <LogOut className="w-4 h-4 text-slate-400" />
                  Sign Out
                </button>
              </div>

              {/* GDPR Wipe */}
              <div className="pt-2 border-t border-slate-800/80">
                <button
                  onClick={async () => {
                    await AuthService.deleteAccountAndWipeData();
                    onAccountWiped();
                    onClose();
                  }}
                  className="w-full py-2 rounded-xl bg-red-950/40 hover:bg-red-950/70 border border-red-800/50 text-red-300 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  Wipe Local Data & Sign Out (GDPR)
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
