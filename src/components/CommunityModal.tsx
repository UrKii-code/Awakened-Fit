import React, { useState } from 'react';
import { FitnessGuild, CommunityActivityPost, LeaderboardEntry, HunterRank } from '../types/hunter';
import { 
  X, 
  Users, 
  Trophy, 
  Flame, 
  Heart, 
  Shield, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Plus, 
  MessageSquare, 
  Share2,
  Lock,
  Globe,
  Filter
} from 'lucide-react';

interface CommunityModalProps {
  currentHunterName: string;
  currentRank: HunterRank;
  guilds: FitnessGuild[];
  onToggleJoinGuild: (guildId: string) => void;
  onClose: () => void;
}

const INITIAL_COMMUNITY_POSTS: CommunityActivityPost[] = [
  {
    id: 'post_1',
    hunterName: 'Jin-Woo K.',
    hunterRank: 'B',
    workoutTitle: 'Iron Calisthenics Protocol',
    durationMinutes: 42,
    verifiedSets: 18,
    expEarned: 450,
    timestamp: '28m ago',
    kudosCount: 14,
    hasKudoed: false,
    reflection: 'Felt great on weighted pull-ups today! Focused on full scapular retraction.',
  },
  {
    id: 'post_2',
    hunterName: 'Sarah M.',
    hunterRank: 'C',
    workoutTitle: 'Interval Cadence Surge',
    durationMinutes: 30,
    verifiedSets: 10,
    expEarned: 320,
    timestamp: '2h ago',
    kudosCount: 8,
    hasKudoed: true,
    reflection: 'Sprinted through the cold. Endurance attribute is definitely climbing.',
  },
  {
    id: 'post_3',
    hunterName: 'Alex R.',
    hunterRank: 'D',
    workoutTitle: 'Joint Decompression & Restorative Flow',
    durationMinutes: 25,
    verifiedSets: 8,
    expEarned: 240,
    timestamp: '5h ago',
    kudosCount: 19,
    hasKudoed: false,
    reflection: 'Lower back felt stiff yesterday. Dedicated hip mobility session completely resolved it.',
  },
];

const LEADERBOARD_DATA: LeaderboardEntry[] = [
  { rankPosition: 1, hunterId: 'h_1', hunterName: 'Valkyrie_Elena', hunterRank: 'A', activeDaysThisMonth: 26, consistentSets: 194, streakDays: 28, isCurrentUser: false },
  { rankPosition: 2, hunterId: 'h_2', hunterName: 'ShadowStriker', hunterRank: 'A', activeDaysThisMonth: 25, consistentSets: 182, streakDays: 25, isCurrentUser: false },
  { rankPosition: 3, hunterId: 'h_3', hunterName: 'IronTitan', hunterRank: 'B', activeDaysThisMonth: 24, consistentSets: 168, streakDays: 24, isCurrentUser: false },
  { rankPosition: 4, hunterId: 'h_me', hunterName: 'You (Active Hunter)', hunterRank: 'D', activeDaysThisMonth: 18, consistentSets: 120, streakDays: 7, isCurrentUser: true },
  { rankPosition: 5, hunterId: 'h_4', hunterName: 'DisciplineArcane', hunterRank: 'C', activeDaysThisMonth: 18, consistentSets: 112, streakDays: 14, isCurrentUser: false },
  { rankPosition: 6, hunterId: 'h_5', hunterName: 'ZenRunner', hunterRank: 'C', activeDaysThisMonth: 17, consistentSets: 105, streakDays: 12, isCurrentUser: false },
];

export const CommunityModal: React.FC<CommunityModalProps> = ({
  currentHunterName,
  currentRank,
  guilds,
  onToggleJoinGuild,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'guilds' | 'feed' | 'leaderboard'>('guilds');
  const [posts, setPosts] = useState<CommunityActivityPost[]>(INITIAL_COMMUNITY_POSTS);
  const [leaderboardFilter, setLeaderboardFilter] = useState<'consistency' | 'sets'>('consistency');
  const [userSharingMode, setUserSharingMode] = useState<'public' | 'guild' | 'private'>('public');

  const handleToggleKudos = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          hasKudoed: !p.hasKudoed,
          kudosCount: p.hasKudoed ? p.kudosCount - 1 : p.kudosCount + 1,
        };
      }
      return p;
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in font-['Inter',sans-serif]">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-[#071326] border border-cyan-500/30 rounded-3xl shadow-[0_0_40px_rgba(38,124,255,0.25)] overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#0a1832]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-600/30 to-purple-600/20 border border-blue-500/40 text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base font-['Cinzel',serif] text-slate-100 tracking-wide">
                Hunter Community & Leaderboard
              </h2>
              <div className="text-[11px] text-slate-400 font-mono">
                Train together. Celebrate real consistency. Zero pay-to-win.
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-slate-800/80 bg-slate-900/40">
          {[
            { id: 'guilds', label: 'Fitness Guilds', icon: <Shield className="w-4 h-4" /> },
            { id: 'feed', label: 'Activity Feed', icon: <MessageSquare className="w-4 h-4" /> },
            { id: 'leaderboard', label: 'Fair Leaderboard', icon: <Trophy className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(38,124,255,0.4)]'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">

          {/* TAB 1: FITNESS GUILDS */}
          {activeTab === 'guilds' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-purple-950/30 border border-blue-500/30 text-xs text-slate-300 flex items-center justify-between">
                <div>
                  <span className="font-bold text-blue-300">Guild Solidarity:</span> Join squads with matched training focuses. Your real workout sets contribute directly to weekly communal goals.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {guilds.map(guild => {
                  const progressPct = Math.min(Math.round((guild.weeklyGoalCurrent / guild.weeklyGoalTarget) * 100), 100);

                  return (
                    <div
                      key={guild.id}
                      className={`p-4 rounded-2xl border transition flex flex-col justify-between space-y-3 ${
                        guild.isJoined
                          ? 'bg-gradient-to-b from-[#0e2145] to-[#08152c] border-blue-500/60 shadow-[0_0_15px_rgba(38,124,255,0.15)]'
                          : 'bg-[#0a1832]/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-sm text-slate-100">{guild.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-blue-300 border border-slate-700">
                            {guild.memberCount.toLocaleString()} members
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 mb-3">{guild.tagline}</p>

                        {/* Weekly Communal Challenge Progress */}
                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-300 font-semibold">{guild.weeklyGoalDesc}</span>
                            <span className="font-mono text-cyan-400">{progressPct}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 text-right">
                            {guild.weeklyGoalCurrent.toLocaleString()} / {guild.weeklyGoalTarget.toLocaleString()} completed
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onToggleJoinGuild(guild.id)}
                        className={`w-full py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 ${
                          guild.isJoined
                            ? 'bg-blue-600/30 border border-blue-500 text-blue-200 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-500/60'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_12px_rgba(38,124,255,0.3)]'
                        }`}
                      >
                        {guild.isJoined ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                            Joined • Tap to Leave
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            Join Guild
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: ACTIVITY FEED */}
          {activeTab === 'feed' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Recent verified workout accomplishments from your fellow hunters</span>
                <span className="text-cyan-400 font-mono">Live Sync</span>
              </div>

              {posts.map(post => (
                <div
                  key={post.id}
                  className="p-4 rounded-2xl bg-gradient-to-br from-[#0a1832] to-[#071326] border border-slate-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-xs font-black text-white shadow-[0_0_10px_rgba(38,124,255,0.4)]">
                        {post.hunterName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-200">{post.hunterName}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-950 border border-blue-700 text-blue-300">
                            Rank {post.hunterRank}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{post.timestamp}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-xs font-bold text-cyan-400">+{post.expEarned} EXP</div>
                      <div className="text-[10px] text-slate-400 font-mono">{post.durationMinutes}m • {post.verifiedSets} sets</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <div className="font-semibold text-xs text-slate-300">{post.workoutTitle}</div>
                    {post.reflection && (
                      <p className="text-[11px] text-slate-400 mt-1 italic">
                        &quot;{post.reflection}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleToggleKudos(post.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        post.hasKudoed
                          ? 'bg-rose-950/60 border border-rose-500/60 text-rose-300'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${post.hasKudoed ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{post.kudosCount} Kudos</span>
                    </button>

                    <span className="text-[10px] text-slate-500 font-mono">
                      Verified Biological Effort
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: FAIR LEADERBOARD */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-4">
              
              {/* Fair Ranking Rule Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-blue-950/30 border border-emerald-500/30 text-xs text-slate-300 space-y-1">
                <div className="flex items-center gap-2 font-bold text-emerald-300">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Fair Health-First Ranking Policy</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Awakened Fit ranks hunters based on <strong>calendar consistency and verified active training days</strong>, never dangerous continuous volume. Rest and recovery are honored.
                </p>
              </div>

              {/* Filter */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLeaderboardFilter('consistency')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      leaderboardFilter === 'consistency'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Monthly Active Days
                  </button>
                  <button
                    onClick={() => setLeaderboardFilter('sets')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      leaderboardFilter === 'sets'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Consistent Sets
                  </button>
                </div>

                <div className="text-[11px] font-mono text-slate-400">
                  Cycle: November 2026
                </div>
              </div>

              {/* Table */}
              <div className="rounded-2xl bg-[#0a1832]/80 border border-slate-800 overflow-hidden divide-y divide-slate-800">
                {LEADERBOARD_DATA.map(entry => (
                  <div
                    key={entry.hunterId}
                    className={`p-3.5 flex items-center justify-between transition ${
                      entry.isCurrentUser
                        ? 'bg-blue-950/40 border-l-4 border-l-cyan-400'
                        : 'hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 text-center font-bold font-mono text-xs">
                        {entry.rankPosition === 1 && <span className="text-amber-400 text-base">🥇</span>}
                        {entry.rankPosition === 2 && <span className="text-slate-300 text-base">🥈</span>}
                        {entry.rankPosition === 3 && <span className="text-amber-600 text-base">🥉</span>}
                        {entry.rankPosition > 3 && <span className="text-slate-400">#{entry.rankPosition}</span>}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${entry.isCurrentUser ? 'text-cyan-300' : 'text-slate-200'}`}>
                            {entry.hunterName}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                            Rank {entry.hunterRank}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {entry.streakDays}d streak • {entry.consistentSets} verified sets
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-cyan-400">
                        {leaderboardFilter === 'consistency' ? `${entry.activeDaysThisMonth} Days Active` : `${entry.consistentSets} Sets`}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {entry.activeDaysThisMonth >= 20 ? 'Master Consistent' : 'Active Aspirant'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
