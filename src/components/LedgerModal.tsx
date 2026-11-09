import React, { useState } from 'react';
import { RewardTransaction } from '../types/hunter';
import { 
  X, 
  FileText, 
  ShieldCheck, 
  Download, 
  ArrowUpRight, 
  Sparkles, 
  Coins, 
  Gem, 
  Copy, 
  Check 
} from 'lucide-react';

interface LedgerModalProps {
  transactions: RewardTransaction[];
  onClose: () => void;
}

export const LedgerModal: React.FC<LedgerModalProps> = ({
  transactions,
  onClose,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const copyLedgerJson = () => {
    navigator.clipboard.writeText(JSON.stringify(transactions, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#090e1f] border border-cyan-500/30 rounded-3xl shadow-[0_0_40px_rgba(0,229,255,0.2)] overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base font-['Cinzel',serif] text-slate-100">
                Authoritative Reward Event Ledger
              </h2>
              <div className="text-[11px] text-slate-400 font-mono">
                Immutable Transaction Log • {transactions.length} Verified Records
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyLedgerJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Export JSON'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Security / Verification Banner */}
        <div className="px-4 py-2.5 bg-cyan-950/30 border-b border-cyan-800/40 flex items-center gap-2 text-xs text-cyan-200">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong>Progression Integrity Ledger:</strong> Every EXP delta, token award, and evolution stone is signed with an idempotency key to prevent replay attacks and duplicate grant exploits.
          </span>
        </div>

        {/* Transactions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 font-mono">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No transactions recorded yet. Complete a workout or claim a daily quest to populate the ledger.
            </div>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200 uppercase text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {tx.eventType.replace('_', ' ')}
                    </span>
                    <span className="text-slate-300 text-xs font-sans font-semibold">
                      {tx.description}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-500 flex items-center gap-3">
                    <span>{new Date(tx.timestamp).toLocaleString()}</span>
                    <span>•</span>
                    <span className="text-cyan-400/80">Key: {tx.idempotencyKey}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {tx.expChange > 0 && (
                    <span className="text-cyan-400 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> +{tx.expChange} EXP
                    </span>
                  )}
                  {tx.tokenChange > 0 && (
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Coins className="w-3 h-3" /> +{tx.tokenChange} T
                    </span>
                  )}
                  {tx.stoneChange > 0 && (
                    <span className="text-purple-400 font-bold flex items-center gap-1">
                      <Gem className="w-3 h-3" /> +{tx.stoneChange} Stone
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
