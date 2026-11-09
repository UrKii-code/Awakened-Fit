import React from 'react';
import { HunterProfile } from '../types/hunter';
import { HUNTER_RANKS, ARCHETYPES } from '../data/ranks';
import { BrandLogo } from './BrandLogo';
import { Flame, Coins, Gem, Share2, PlusCircle, Shield } from 'lucide-react';

interface HunterHUDProps {
  profile: HunterProfile;
  onOpenSync: () => void;
  onStartWorkout: () => void;
  onOpenProfile: () => void;
}

export const HunterHUD: React.FC<HunterHUDProps> = ({
  profile,
  onOpenSync,
  onStartWorkout,
  onOpenProfile,
}) => {
  const currentRank = HUNTER_RANKS[profile.rank] || HUNTER_RANKS.E;
  const archetype = ARCHETYPES[profile.archetype] || ARCHETYPES.berserker;
  const expPercentage = Math.min(Math.round((profile.currentExp / profile.nextLevelExp) * 100), 100);

  return (
    <header className="sticky top-0 z-30 w-full bg-[#060913]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand & Left Profile Segment */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <BrandLogo size="md" showSubtitle />

          {/* Quick Action Mobile Trigger */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              onClick={onOpenSync}
              title="Game Sync API"
              className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-cyan-400 active:scale-95 transition"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onStartWorkout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-xs uppercase shadow-md active:scale-95 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Train
            </button>
          </div>
        </div>

        {/* Center / Right Progression HUD */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-3 sm:gap-6">
          {/* Hunter Rank Badge & Level */}
          <div 
            onClick={onOpenProfile}
            className="flex items-center gap-2.5 cursor-pointer p-1.5 rounded-xl hover:bg-slate-900/60 transition group"
          >
            {/* Rank Shield */}
            <div 
              className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg border ${currentRank.borderColor} shadow-lg`}
              style={{
                backgroundColor: '#0c1222',
                color: currentRank.color,
                boxShadow: `0 0 12px ${currentRank.glowColor}`,
              }}
            >
              {profile.rank}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-slate-100 group-hover:text-cyan-300 transition">
                  {profile.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-400 font-mono">
                  LV.{profile.level}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 capitalize flex items-center gap-1">
                <Shield className="w-2.5 h-2.5 text-slate-500" />
                {archetype.name} • {currentRank.title}
              </span>
            </div>
          </div>

          {/* EXP Progress Gauge */}
          <div className="flex-1 sm:w-44 min-w-[130px]">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
              <span className="text-cyan-400 font-semibold">EXP</span>
              <span>
                {profile.currentExp} / {profile.nextLevelExp} ({expPercentage}%)
              </span>
            </div>
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 transition-all duration-500 shadow-[0_0_8px_rgba(0,229,255,0.7)]"
                style={{ width: `${expPercentage}%` }}
              />
            </div>
          </div>

          {/* Currency Currencies (Tokens & Evolution Stones) */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-amber-300 font-mono text-xs">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{profile.tokens}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-purple-300 font-mono text-xs">
              <Gem className="w-3.5 h-3.5 text-purple-400" />
              <span>{profile.evolutionStones}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-rose-400 font-mono text-xs">
              <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>{profile.streak.currentDays}d</span>
            </div>
          </div>

          {/* Desktop Call to Action */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={onOpenSync}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-cyan-400 hover:text-cyan-300 active:scale-95 transition"
              title="Unity Game Sync API Payload"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onStartWorkout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,229,255,0.4)] active:scale-95 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              Start Workout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
