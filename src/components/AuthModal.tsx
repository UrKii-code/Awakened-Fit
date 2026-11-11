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
  AlertTriangle 
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
  const [activeTab, setActiveTab] = useState<'profile' | 'login' | 'signup' | 'cloud_config'>('profile');
  
  // Login / Signup Form
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [hunterName, setHunterName] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Cloud Config Form
  const existingConfig = AuthService.getStoredConfig();
  const [supabaseUrl, setSupabaseUrl] = useState<string>(existingConfig.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState<string>(existingConfig.anonKey);
  const [isTestingCloud, setIsTestingCloud] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setStatusMessage({ text: 'Authenticating credentials...', isError: false });
    const res = await AuthService.signIn(email, password);
    if (res.success) {
      onSessionUpdated(AuthService.getSession());
      setStatusMessage({ text: res.message, isError: false });
      setTimeout(() => setActiveTab('profile'), 1200);
    } else {
      setStatusMessage({ text: res.message, isError: true });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setStatusMessage({ text: 'Creating Hunter account...', isError: false });
    const res = await AuthService.signUp(email, password, hunterName || 'Candidate');
    if (res.success) {
      onSessionUpdated(AuthService.getSession());
      setStatusMessage({ text: res.message, isError: false });
      setTimeout(() => setActiveTab('profile'), 1200);
    } else {
      setStatusMessage({ text: res.message, isError: true });
    }
  };

  const handleSaveCloudConfig = async () => {
    setIsTestingCloud(true);
    AuthService.saveCloudConfig(supabaseUrl.trim(), supabaseAnonKey.trim());
    
    // Quick test against Supabase REST endpoint
    if (supabaseUrl && supabaseAnonKey) {
      try {
        const res = await fetch(`${supabaseUrl.trim()}/rest/v1/`, {
          headers: {
            'apikey': supabaseAnonKey.trim(),
            'Authorization': `Bearer ${supabaseAnonKey.trim()}`,
          },
        });
        if (res.status === 200 || res.status === 404 || res.ok) {
          setStatusMessage({ text: 'Connected to Supabase PostgreSQL cloud backend!', isError: false });
        } else {
          setStatusMessage({ text: `Connection responded with HTTP ${res.status}`, isError: false });
        }
      } catch (err: any) {
        setStatusMessage({ text: `Could not reach endpoint: ${err.message}`, isError: true });
      }
    } else {
      setStatusMessage({ text: 'Using local offline storage cache.', isError: false });
    }

    onSessionUpdated(AuthService.getSession());
    setIsTestingCloud(false);
  };

  const handleSignOut = () => {
    AuthService.signOut();
    onSessionUpdated(AuthService.getSession());
    setActiveTab('login');
  };

  const handleDeleteAccount = () => {
    if (confirm('CRITICAL PRIVACY WARNING: This will permanently wipe all Hunter data, workout history, and progression records. This action cannot be reversed. Proceed?')) {
      AuthService.deleteAccountAndWipeData();
      onAccountWiped();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg flex flex-col bg-[#080d1b] border border-cyan-500/30 rounded-3xl shadow-[0_0_40px_rgba(0,229,255,0.2)] overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base font-['Cinzel',serif] text-slate-100">
                Hunter Account & Cloud Sync
              </h2>
              <div className="text-[11px] text-slate-400 font-mono">
                {session.isCloudLinked ? 'Connected to Supabase Cloud' : 'Local Authoritative Session'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 px-4 pt-2 gap-3 bg-slate-950/60 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 transition border-b-2 cursor-pointer ${
              activeTab === 'profile' ? 'border-cyan-400 text-cyan-300 font-bold' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Account
          </button>
          {!session.user?.email.includes('hunter@awakened.fit') ? null : (
            <>
              <button
                onClick={() => setActiveTab('login')}
                className={`pb-2.5 transition border-b-2 cursor-pointer ${
                  activeTab === 'login' ? 'border-cyan-400 text-cyan-300 font-bold' : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={`pb-2.5 transition border-b-2 cursor-pointer ${
                  activeTab === 'signup' ? 'border-cyan-400 text-cyan-300 font-bold' : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                Register
              </button>
            </>
          )}
          <button
            onClick={() => setActiveTab('cloud_config')}
            className={`pb-2.5 transition border-b-2 cursor-pointer ${
              activeTab === 'cloud_config' ? 'border-cyan-400 text-cyan-300 font-bold' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Supabase Config
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Status Toast */}
          {statusMessage && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${statusMessage.isError ? 'bg-rose-950/80 border-rose-500/80 text-rose-200' : 'bg-cyan-950/80 border-cyan-500/80 text-cyan-200'}`}>
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* TAB 1: CURRENT PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Authenticated User:</span>
                  <span className="font-bold text-cyan-300 font-mono">{session.user?.email || 'Guest Candidate'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Hunter Codename:</span>
                  <span className="font-bold text-slate-200">{session.user?.hunterName || 'Candidate'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Storage Domain:</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 border border-cyan-800 text-cyan-400">
                    {session.isCloudLinked ? 'Supabase PostgreSQL Cloud' : 'Local Hybrid Cache (Offline First)'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800">
                  <span>Session Token Expiry:</span>
                  <span className="font-mono">7 Days Active</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleSignOut}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="py-2.5 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-700/60 text-rose-300 font-bold transition flex items-center gap-1.5 cursor-pointer"
                  title="Wipe Hunter data per privacy regulations"
                >
                  <Trash2 className="w-4 h-4" />
                  Wipe Data
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SIGN IN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3">
              <div className="space-y-1">
                <label className="text-slate-400 font-mono text-[11px]">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hunter@domain.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-mono text-[11px]">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black uppercase tracking-wider transition cursor-pointer mt-2"
              >
                Sign In to Registry
              </button>
            </form>
          )}

          {/* TAB 3: REGISTER */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-3">
              <div className="space-y-1">
                <label className="text-slate-400 font-mono text-[11px]">Hunter Codename</label>
                <input
                  type="text"
                  value={hunterName}
                  onChange={(e) => setHunterName(e.target.value)}
                  placeholder="e.g. IronHunter"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-mono text-[11px]">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hunter@domain.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-mono text-[11px]">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 text-slate-950 font-black uppercase tracking-wider transition cursor-pointer mt-2"
              >
                Create Hunter Account
              </button>
            </form>
          )}

          {/* TAB 4: CLOUD CONFIG */}
          {activeTab === 'cloud_config' && (
            <div className="space-y-3">
              <div className="text-slate-400 leading-relaxed">
                Connect your external <strong>Supabase PostgreSQL</strong> project. Cloud synchronization routes workout sessions, attributes, and ranks through server-side RLS policies.
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-mono font-semibold">Supabase Project URL</label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xyzproject.supabase.co"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-mono font-semibold">Public Anon Key (Safe for Browser)</label>
                <input
                  type="password"
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 font-mono text-xs"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                <Database className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  The database migration script is prepared at <code className="text-cyan-300">supabase/migrations/</code> ready to run in the Supabase SQL editor.
                </span>
              </div>

              <button
                type="button"
                onClick={handleSaveCloudConfig}
                disabled={isTestingCloud}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black uppercase tracking-wider transition cursor-pointer"
              >
                {isTestingCloud ? 'Testing Connection...' : 'Save & Connect Supabase'}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
