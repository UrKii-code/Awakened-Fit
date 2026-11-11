import React, { useState } from 'react';
import { HunterProfile, Achievement, UserPreferences, AttributeScores } from '../types/hunter';
import { AttributeRadar } from './AttributeRadar';
import { HUNTER_RANKS, ARCHETYPES } from '../data/ranks';
import { 
  User, 
  Settings, 
  Award, 
  Shield, 
  Flame, 
  Coins, 
  Gem, 
  Lock, 
  Eye, 
  EyeOff, 
  Bell, 
  Dumbbell, 
  Check, 
  RotateCcw, 
  Sparkles, 
  HelpCircle, 
  Trash2, 
  ChevronRight,
  Sliders,
  ExternalLink
} from 'lucide-react';

interface ProfileViewProps {
  profile: HunterProfile;
  achievements: Achievement[];
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
  onAllocateStat: (statKey: keyof AttributeScores) => void;
  onOpenArmory: () => void;
  onOpenAuth: () => void;
  onResetData: () => void;
}

const AVATAR_OPTIONS = [
  { id: 'av_shadow', label: 'Shadow Hunter', symbol: '⚔️', color: 'from-blue-600 to-indigo-900' },
  { id: 'av_valkyrie', label: 'Iron Valkyrie', symbol: '🛡️', color: 'from-purple-600 to-slate-900' },
  { id: 'av_monk', label: 'Arcane Monk', symbol: '✨', color: 'from-cyan-600 to-blue-950' },
  { id: 'av_phantom', label: 'Phantom Striker', symbol: '⚡', color: 'from-amber-600 to-red-950' },
  { id: 'av_titan', label: 'Guardian Titan', symbol: '🏔️', color: 'from-emerald-600 to-slate-950' },
  { id: 'av_cyber', label: 'Cyber Assassin', symbol: '👁️', color: 'from-sky-500 to-purple-950' },
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  achievements,
  preferences,
  onUpdatePreferences,
  onAllocateStat,
  onOpenArmory,
  onOpenAuth,
  onResetData,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'settings'>('overview');
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>('av_shadow');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);

  const currentRank = HUNTER_RANKS[profile.rank] || HUNTER_RANKS.E;
  const currentArchetype = ARCHETYPES[profile.archetype] || ARCHETYPES.berserker;
  const unlockedAchievements = achievements.filter(a => a.isUnlocked);

  const selectedAvatar = AVATAR_OPTIONS.find(a => a.id === selectedAvatarId) || AVATAR_OPTIONS[0];

  const handleTogglePref = (key: keyof UserPreferences['notificationsEnabled']) => {
    onUpdatePreferences({
      ...preferences,
      notificationsEnabled: {
        ...preferences.notificationsEnabled,
        [key]: !preferences.notificationsEnabled[key],
      },
    });
  };

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      
      {/* Profile Header Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#0c1833] via-[#081329] to-[#060b18] border border-blue-500/30 shadow-[0_0_30px_rgba(38,124,255,0.12)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar with glow */}
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${selectedAvatar.color} border-2 border-cyan-400/80 shadow-[0_0_20px_rgba(0,229,255,0.4)] flex items-center justify-center text-2xl sm:text-3xl shrink-0`}>
              {selectedAvatar.symbol}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-950 text-cyan-300 border border-blue-700/80">
                  Rank {profile.rank} Operative
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Level {profile.level}
                </span>
              </div>

              <h2 className="text-2xl font-black font-['Cinzel',serif] text-slate-100">
                {profile.name}
              </h2>

              <div className="text-xs text-cyan-300 font-mono">
                {profile.title} • <span className="capitalize text-slate-400">{profile.archetype} Archetype</span>
              </div>
            </div>
          </div>

          {/* Quick Currency Badges */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-amber-300 font-mono text-xs">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{profile.tokens} Tokens</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-purple-300 font-mono text-xs">
              <Gem className="w-4 h-4 text-purple-400" />
              <span>{profile.evolutionStones} Stones</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
        {[
          { id: 'overview', label: 'Hunter Overview', icon: <User className="w-4 h-4" /> },
          { id: 'achievements', label: `Achievements (${unlockedAchievements.length}/${achievements.length})`, icon: <Award className="w-4 h-4" /> },
          { id: 'settings', label: 'Settings & Privacy', icon: <Settings className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(38,124,255,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          
          {/* Avatar Selector Tray */}
          <div className="p-4 rounded-2xl bg-[#0a1832]/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-['Rajdhani',sans-serif]">
                Choose Hunter Persona Avatar
              </span>
              <button
                onClick={onOpenArmory}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                Unlock Frames in Armory
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {AVATAR_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedAvatarId(opt.id)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                    selectedAvatarId === opt.id
                      ? 'bg-blue-600/30 border-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${opt.color} flex items-center justify-center text-lg`}>
                    {opt.symbol}
                  </div>
                  <span className="text-[10px] text-slate-300 font-semibold truncate max-w-full">
                    {opt.label.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 5-Attribute Radar */}
          <AttributeRadar
            attributes={profile.attributes}
            unallocatedPoints={profile.unallocatedStatPoints}
            onAllocate={onAllocateStat}
          />

          {/* Physical Onboarding Baseline Review */}
          <div className="p-4 rounded-2xl bg-[#0a1832]/80 border border-slate-800 space-y-3 text-xs">
            <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px] font-['Rajdhani',sans-serif] flex items-center justify-between">
              <span>Onboarding Fitness Baseline</span>
              <span className="text-[10px] text-slate-500 font-mono">Calibrated</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-slate-400">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Experience Level</span>
                <span className="text-slate-200 capitalize font-medium">{profile.onboarding.fitnessExperience}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Training Environment</span>
                <span className="text-slate-200 capitalize font-medium">{profile.onboarding.trainingEnvironment}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Weekly Target</span>
                <span className="text-slate-200 font-medium">{profile.onboarding.trainingDaysPerWeek} Days / Week</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Session Duration</span>
                <span className="text-slate-200 font-medium">{profile.onboarding.preferredDurationMinutes} Minutes</span>
              </div>
              <div className="col-span-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Reported Limitations</span>
                <span className="text-slate-200 font-medium">
                  {profile.onboarding.physicalLimitations?.length > 0 ? profile.onboarding.physicalLimitations.join(', ') : 'None reported (Full mobility)'}
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: ACHIEVEMENTS */}
      {activeTab === 'achievements' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400">
            Realize milestones through physical consistency and verified exercise output.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {achievements.map(ach => (
              <div
                key={ach.id}
                className={`p-4 rounded-2xl border flex items-start gap-3 transition ${
                  ach.isUnlocked
                    ? 'bg-gradient-to-br from-[#0e2246] to-[#071326] border-cyan-500/50 shadow-[0_0_15px_rgba(0,229,255,0.1)]'
                    : 'bg-slate-900/40 border-slate-800/80 opacity-60'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                  ach.isUnlocked ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40' : 'bg-slate-800 text-slate-500'
                }`}>
                  {ach.isUnlocked ? '🏆' : '🔒'}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-100">{ach.title}</span>
                    <span className="text-[10px] font-mono text-amber-300">+{ach.tokenReward} Tokens</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{ach.description}</p>
                  {ach.isUnlocked && ach.unlockedAt && (
                    <div className="text-[10px] text-cyan-400 font-mono pt-0.5">
                      Unlocked on {new Date(ach.unlockedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SETTINGS & PRIVACY */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          
          {/* Account & Cloud Sync Section */}
          <div className="p-4 rounded-2xl bg-[#0a1832]/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-slate-200">Account & Cloud Synchronization</div>
                <div className="text-[11px] text-slate-400">Configure Supabase cloud backend credentials</div>
              </div>

              <button
                onClick={onOpenAuth}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition cursor-pointer"
              >
                Manage Account
              </button>
            </div>
          </div>

          {/* Privacy & Social Sharing */}
          <div className="p-4 rounded-2xl bg-[#0a1832]/80 border border-slate-800 space-y-3">
            <div className="font-bold text-xs text-slate-200">Privacy & Community Sharing</div>
            
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-200 font-semibold">Share Workout Logs to Guild Feed</div>
                  <div className="text-[11px] text-slate-400">Allows other guild members to view and applaud your verified sessions</div>
                </div>
                <button
                  onClick={() => onUpdatePreferences({ ...preferences, shareWorkoutsToCommunity: !preferences.shareWorkoutsToCommunity })}
                  className={`w-11 h-6 rounded-full transition p-0.5 cursor-pointer flex items-center ${
                    preferences.shareWorkoutsToCommunity ? 'bg-blue-600 justify-end' : 'bg-slate-800 justify-start'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <div>
                  <div className="text-slate-200 font-semibold">Leaderboard Profile Visibility</div>
                  <div className="text-[11px] text-slate-400">Choose how your name appears on community rankings</div>
                </div>

                <select
                  value={preferences.profileVisibility}
                  onChange={(e) => onUpdatePreferences({ ...preferences, profileVisibility: e.target.value as any })}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono outline-none"
                >
                  <option value="public">Public (Show Name & Rank)</option>
                  <option value="friends">Guild Only</option>
                  <option value="private">Anonymous / Hidden</option>
                </select>
              </div>
            </div>
          </div>

          {/* Workout Tracker Preferences */}
          <div className="p-4 rounded-2xl bg-[#0a1832]/80 border border-slate-800 space-y-3">
            <div className="font-bold text-xs text-slate-200">Workout & Unit Preferences</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Measurement Units</label>
                <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
                  <button
                    onClick={() => onUpdatePreferences({ ...preferences, units: 'metric' })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      preferences.units === 'metric' ? 'bg-blue-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Metric (kg / cm)
                  </button>
                  <button
                    onClick={() => onUpdatePreferences({ ...preferences, units: 'imperial' })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      preferences.units === 'imperial' ? 'bg-blue-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Imperial (lbs / in)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Default Rest Interval Timer</label>
                <select
                  value={preferences.defaultRestSeconds}
                  onChange={(e) => onUpdatePreferences({ ...preferences, defaultRestSeconds: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono outline-none"
                >
                  <option value={30}>30 Seconds (Cardio / Mobility)</option>
                  <option value={60}>60 Seconds (Standard Hypertrophy)</option>
                  <option value={90}>90 Seconds (Strength & Compound)</option>
                  <option value={120}>120 Seconds (Heavy Power Lifting)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Help & Support */}
          <div className="p-4 rounded-2xl bg-[#0a1832]/80 border border-slate-800 space-y-2 text-xs text-slate-400">
            <div className="font-bold text-slate-200">Help, Safety & Support</div>
            <p>
              Awakened Fit adheres strictly to health-first fitness principles. If you experience sharp joint pain, dizziness, or abnormal shortness of breath during any training protocol, cease activity immediately and consult a healthcare practitioner.
            </p>
          </div>

          {/* Account Deletion / Data Wipe */}
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-600/40 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-rose-300">Account Deletion & Data Reset</div>
                <div className="text-[11px] text-slate-400">Erase all workouts, progression ledgers, and restart onboarding</div>
              </div>

              {isConfirmingDelete ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setIsConfirmingDelete(false);
                      onResetData();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer"
                  >
                    Confirm Wipe
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsConfirmingDelete(true)}
                  className="px-3 py-1.5 rounded-xl bg-rose-950/60 border border-rose-600/60 text-rose-300 hover:bg-rose-900 text-xs font-bold transition cursor-pointer"
                >
                  Wipe Data
                </button>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
