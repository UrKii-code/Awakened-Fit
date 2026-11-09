import React from 'react';
import { HunterRank } from '../types/hunter';
import { HUNTER_RANKS } from '../data/ranks';
import { Sparkles, Trophy, ArrowUpCircle } from 'lucide-react';

interface LevelUpModalProps {
  level: number;
  levelsGained: number;
  newRankPromoted: HunterRank | null;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  level,
  levelsGained,
  newRankPromoted,
  onClose,
}) => {
  const rankInfo = newRankPromoted ? HUNTER_RANKS[newRankPromoted] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0a0f21] border border-cyan-400/50 rounded-3xl p-6 text-center shadow-[0_0_50px_rgba(0,229,255,0.3)] overflow-hidden">
        {/* Arcane Background Bursts */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          {/* Badge Icon */}
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-cyan-400 via-sky-300 to-indigo-500 p-0.5 shadow-[0_0_30px_rgba(0,229,255,0.7)] flex items-center justify-center animate-bounce">
            <div className="w-full h-full bg-[#080d1a] rounded-[22px] flex items-center justify-center">
              <Trophy className="w-10 h-10 text-cyan-300" />
            </div>
          </div>

          <div>
            <div className="text-xs uppercase font-mono font-bold tracking-widest text-cyan-400 mb-1">
              Biological Ascendance Verified
            </div>
            <h2 className="text-3xl font-black font-['Cinzel',serif] text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-purple-200">
              Level {level} Attained!
            </h2>
            <div className="text-xs text-slate-300 mt-1">
              +{levelsGained} Hunter Level{levelsGained > 1 ? 's' : ''} Gained through real effort
            </div>
          </div>

          {/* Rank Promotion Banner if attained */}
          {rankInfo && (
            <div 
              className="p-3.5 rounded-2xl border flex items-center gap-3 text-left shadow-lg"
              style={{
                backgroundColor: '#0c1326',
                borderColor: rankInfo.color,
                boxShadow: `0 0 20px ${rankInfo.glowColor}`,
              }}
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-2xl border"
                style={{
                  color: rankInfo.color,
                  borderColor: rankInfo.color,
                }}
              >
                {rankInfo.rank}
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-cyan-300 tracking-wider">
                  Rank Ascension
                </div>
                <div className="font-bold text-sm text-slate-100">{rankInfo.title}</div>
                <div className="text-[11px] text-slate-400 line-clamp-1">{rankInfo.description}</div>
              </div>
            </div>
          )}

          {/* Rewards List */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-left space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Ascension Rewards:
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
              <span className="flex items-center gap-2">
                <ArrowUpCircle className="w-4 h-4 text-amber-400" />
                Selectable Stat Points
              </span>
              <span className="font-mono text-amber-400">+{levelsGained} Point{levelsGained > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Evolution Material
              </span>
              <span className="font-mono text-purple-400">+{levelsGained} Stone{levelsGained > 1 ? 's' : ''}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(0,229,255,0.6)] hover:brightness-110 active:scale-95 transition cursor-pointer"
          >
            Claim & Allocate Stats
          </button>
        </div>
      </div>
    </div>
  );
};
