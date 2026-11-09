import React, { useState } from 'react';
import { HunterProfile, Achievement } from '../types/hunter';
import { StorageService } from '../services/storageService';
import { X, Copy, Check, Gamepad2, ShieldCheck, Terminal } from 'lucide-react';

interface GameSyncModalProps {
  profile: HunterProfile;
  achievements: Achievement[];
  onClose: () => void;
}

export const GameSyncModal: React.FC<GameSyncModalProps> = ({
  profile,
  achievements,
  onClose,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'payload' | 'endpoints'>('payload');

  const syncPayload = StorageService.generateGameSyncPayload(profile, achievements);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(syncPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#090e1f] border border-cyan-500/30 rounded-3xl shadow-[0_0_40px_rgba(0,229,255,0.15)] overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base font-['Cinzel',serif] text-slate-100">
                Unity Standalone Game Sync Bridge
              </h2>
              <div className="text-[11px] text-slate-400 font-mono">
                Authoritative Handshake: Mobile App &rarr; Shared Backend &rarr; Unity Engine
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Security Alert */}
        <div className="px-4 py-3 bg-cyan-950/40 border-b border-cyan-800/50 flex items-start gap-2.5 text-xs text-cyan-200">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            <strong>Progression Integrity Rule:</strong> The standalone game has read-only permission to load Hunter level, rank, and attributes. The game cannot fabricate workout logs or grant EXP.
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 px-4 pt-2 gap-4">
          <button
            onClick={() => setActiveTab('payload')}
            className={`pb-2 text-xs font-bold font-mono transition border-b-2 ${
              activeTab === 'payload'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Payload JSON (GET /api/v1/game/sync)
          </button>
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`pb-2 text-xs font-bold font-mono transition border-b-2 ${
              activeTab === 'endpoints'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            API Route Architecture (Section 7)
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3 font-mono text-xs">
          {activeTab === 'payload' ? (
            <div className="relative">
              <button
                onClick={copyToClipboard}
                className="absolute top-2 right-2 flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>

              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-cyan-300/90 overflow-x-auto text-[11px] leading-relaxed">
                {JSON.stringify(syncPayload, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="space-y-2 text-slate-300">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Backend Versioned Endpoints (Authoritative Supabase/PostgreSQL schema):</span>
              </div>

              {[
                { method: 'POST', path: '/api/v1/auth/session', desc: 'Exchange hunter credentials for short-lived game token' },
                { method: 'GET', path: '/api/v1/hunter/profile', desc: 'Retrieve authoritative Hunter identity, level, & rank' },
                { method: 'GET', path: '/api/v1/hunter/attributes', desc: 'Fetch verified STR, END, AGI, VIT, and DIS values' },
                { method: 'GET', path: '/api/v1/progression/ledger', desc: 'Audit immutable reward event ledger' },
                { method: 'GET', path: '/api/v1/game/sync', desc: 'Complete state synchronization for Unity client' },
                { method: 'POST', path: '/api/v1/workouts/validate', desc: 'Mobile-only endpoint for validating physical workouts' },
              ].map(route => (
                <div key={route.path} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${route.method === 'POST' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-sky-950 text-sky-300 border border-sky-800'}`}>
                      {route.method}
                    </span>
                    <span className="text-slate-200">{route.path}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 hidden sm:inline">{route.desc}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Token: <span className="text-purple-400 font-mono">{syncPayload.gameIntegrationToken}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
