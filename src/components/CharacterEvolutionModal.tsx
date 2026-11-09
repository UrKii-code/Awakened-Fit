import React, { useState } from 'react';
import { HunterProfile } from '../types/hunter';
import { EVOLUTION_TIERS, UNLOCKABLE_TITLES, EvolutionTier } from '../data/evolution';
import { 
  X, 
  Sparkles, 
  Lock, 
  Check, 
  Gem, 
  ShieldCheck, 
  Flame, 
  Zap, 
  Shield 
} from 'lucide-react';

interface CharacterEvolutionModalProps {
  profile: HunterProfile;
  onUpdateTitle: (newTitle: string) => void;
  onEvolve: (tier: EvolutionTier) => void;
  onClose: () => void;
}

export const CharacterEvolutionModal: React.FC<CharacterEvolutionModalProps> = ({
  profile,
  onUpdateTitle,
  onEvolve,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'evolution' | 'titles'>('evolution');
  const tiers = EVOLUTION_TIERS[profile.archetype] || EVOLUTION_TIERS.berserker;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#080d1b] border border-purple-500/30 rounded-3xl shadow-[0_0_40px_rgba(168,85,247,0.2)] overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base font-['Cinzel',serif] text-slate-100">
                Hunter Evolution & Titles
              </h2>
              <div className="text-[11px] text-slate-400 font-mono">
                Persistent Identity Transformation • Evolution Stones: {profile.evolutionStones}
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

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 px-4 pt-2 gap-4 bg-slate-950/60">
          <button
            onClick={() => setActiveTab('evolution')}
            className={`pb-2.5 text-xs font-bold font-mono transition border-b-2 cursor-pointer ${
              activeTab === 'evolution'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Evolution Ascension Tiers
          </button>
          <button
            onClick={() => setActiveTab('titles')}
            className={`pb-2.5 text-xs font-bold font-mono transition border-b-2 cursor-pointer ${
              activeTab === 'titles'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Hunter Titles & Crests
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'evolution' ? (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Ascending to higher tiers transforms your visual crest and unlocks passive training attribute multipliers. Requires reaching designated level milestones and applying earned Evolution Stones.
              </div>

              <div className="space-y-3">
                {tiers.map((tier) => {
                  const isCurrent = profile.title === tier.title;
                  const canUnlock = profile.level >= tier.minLevel && profile.evolutionStones >= tier.requiredStones;
                  const isLocked = profile.level < tier.minLevel;

                  return (
                    <div
                      key={tier.id}
                      className={`p-4 rounded-2xl border transition relative overflow-hidden ${
                        isCurrent
                          ? 'bg-purple-950/30 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                          : isLocked
                          ? 'bg-slate-900/30 border-slate-800/80 opacity-70'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border shadow-md"
                            style={{
                              backgroundColor: '#0c1326',
                              borderColor: tier.accentColor,
                              color: tier.accentColor,
                            }}
                          >
                            T{tier.tierNumber}
                          </div>

                          <div>
                            <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                              <span>{tier.name}</span>
                              {isCurrent && (
                                <span className="text-[10px] px-2 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono">
                                  Current Form
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-purple-300 font-mono">{tier.title}</div>
                          </div>
                        </div>

                        {/* Unlock Button / Badge */}
                        <div>
                          {isCurrent ? (
                            <span className="flex items-center gap-1 text-xs text-purple-400 font-bold">
                              <Check className="w-4 h-4" /> Active
                            </span>
                          ) : isLocked ? (
                            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                              <Lock className="w-3.5 h-3.5" />
                              Req: Lv.{tier.minLevel}
                            </div>
                          ) : (
                            <button
                              onClick={() => onEvolve(tier)}
                              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(168,85,247,0.5)] transition cursor-pointer"
                            >
                              Evolve ({tier.requiredStones} Stones)
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 mb-2">{tier.description}</p>
                      
                      <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-slate-800/60">
                        <span className="text-emerald-400 font-bold">{tier.statBonusDescription}</span>
                        <span className="text-slate-500">Min Rank: {tier.minRank}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Titles represent your hard-earned reputation in the Hunter Registry. Choose an active title to display on your profile and game sync handshake.
              </div>

              <div className="space-y-2">
                {UNLOCKABLE_TITLES.map((t) => {
                  const isActive = profile.title === t.title;

                  return (
                    <div
                      key={t.id}
                      onClick={() => onUpdateTitle(t.title)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        isActive
                          ? 'bg-purple-950/40 border-purple-400 text-purple-200 ring-1 ring-purple-400'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs">{t.title}</div>
                        <div className="text-[10px] text-slate-500">{t.req}</div>
                      </div>

                      {isActive ? (
                        <Check className="w-4 h-4 text-purple-400" />
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500">Equip</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
