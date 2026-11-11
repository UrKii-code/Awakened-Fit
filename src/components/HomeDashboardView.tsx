import React from 'react';
import { 
  HunterProfile, 
  WorkoutSession, 
  Quest, 
  Achievement, 
  AttributeScores 
} from '../types/hunter';
import { HUNTER_RANKS, ARCHETYPES } from '../data/ranks';
import { WORKOUT_TEMPLATES } from '../data/exercises';
import { AttributeRadar } from './AttributeRadar';
import { 
  Dumbbell, 
  Flame, 
  Trophy, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Bell, 
  ArrowRight, 
  HeartHandshake, 
  Coins, 
  Award, 
  ShieldCheck, 
  TrendingUp, 
  Target,
  ChevronRight,
  Zap
} from 'lucide-react';

interface HomeDashboardViewProps {
  profile: HunterProfile;
  workouts: WorkoutSession[];
  quests: Quest[];
  achievements: Achievement[];
  onStartWorkout: (workout?: any) => void;
  onOpenCustomPlan: () => void;
  onLogRestDay: () => void;
  onClaimQuest: (quest: Quest) => void;
  onAllocateStat: (statKey: keyof AttributeScores) => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  unreadNotificationsCount: number;
}

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  profile,
  workouts,
  quests,
  achievements,
  onStartWorkout,
  onOpenCustomPlan,
  onLogRestDay,
  onClaimQuest,
  onAllocateStat,
  onOpenNotifications,
  onOpenProfile,
  unreadNotificationsCount,
}) => {
  const currentRankInfo = HUNTER_RANKS[profile.rank] || HUNTER_RANKS.E;
  const currentArchetype = ARCHETYPES[profile.archetype] || ARCHETYPES.berserker;

  // Dynamic greeting based on user local hour
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 
    ? 'Good Morning' 
    : currentHour < 18 
    ? 'Good Afternoon' 
    : 'Good Evening';

  // Today's workout completion check
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayWorkout = workouts.find(w => w.startedAt.split('T')[0] === todayDateStr);
  const isWorkoutDoneToday = Boolean(todayWorkout);

  // Today's recommended protocol
  const recommendedWorkout = WORKOUT_TEMPLATES[0];

  // Weekly Goal Calculation
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);

  const workoutsThisWeek = workouts.filter(w => new Date(w.startedAt) >= startOfWeek).length;
  const targetDaysPerWeek = profile.onboarding.trainingDaysPerWeek || 3;
  const weeklyProgressPct = Math.min(Math.round((workoutsThisWeek / targetDaysPerWeek) * 100), 100);

  // EXP progress percentage
  const expPercentage = Math.min(
    Math.round((profile.currentExp / (profile.nextLevelExp || 1000)) * 100),
    100
  );

  // Recent Achievements
  const recentAchievements = achievements
    .filter(a => a.isUnlocked)
    .sort((a, b) => (new Date(b.unlockedAt || 0).getTime() - new Date(a.unlockedAt || 0).getTime()))
    .slice(0, 3);

  const inProgressAchievements = achievements
    .filter(a => !a.isUnlocked)
    .slice(0, 2);

  return (
    <div className="space-y-6 animate-fade-in pb-4">
      
      {/* 1. TOP GREETING & NOTIFICATION HEADER */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[11px] font-mono text-cyan-400 font-semibold tracking-wider uppercase">
            Protocol Operational
          </span>
          <h1 className="text-xl sm:text-2xl font-black font-['Cinzel',serif] text-slate-100 flex items-center gap-2">
            <span>{greeting}, {profile.name}</span>
          </h1>
        </div>

        <button
          onClick={onOpenNotifications}
          className="relative p-2.5 rounded-2xl bg-[#10264A] hover:bg-[#153261] border border-cyan-800/50 text-cyan-300 transition shadow-[0_0_12px_rgba(0,229,255,0.15)] cursor-pointer"
          title="Notification Center"
        >
          <Bell className="w-5 h-5 text-cyan-300" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold flex items-center justify-center border-2 border-[#071326] shadow-[0_0_8px_#f43f5e]">
              {unreadNotificationsCount}
            </span>
          )}
        </button>
      </div>

      {/* 2. HUNTER PROFILE, AVATAR & EXP HUD CARD */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#10264A] via-[#0d1e3c] to-[#071326] border border-cyan-500/30 shadow-[0_0_25px_rgba(38,124,255,0.15)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#267CFF]/15 via-[#974DFF]/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Persona Avatar */}
            <div 
              onClick={onOpenProfile}
              className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#267CFF] to-[#974DFF] p-0.5 shadow-[0_0_15px_rgba(38,124,255,0.4)] cursor-pointer hover:scale-105 transition"
            >
              <div className="w-full h-full rounded-2xl bg-[#071326] flex items-center justify-center overflow-hidden">
                <span className="text-2xl font-black font-['Cinzel',serif] text-cyan-300">
                  {currentArchetype.name.charAt(0)}
                </span>
              </div>
              <div 
                className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md text-[9px] font-mono font-black text-slate-950 border border-slate-900"
                style={{ backgroundColor: currentRankInfo.color }}
              >
                {profile.rank}
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-100 font-['Rajdhani',sans-serif]">
                  Level {profile.level} Hunter
                </span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-cyan-950/80 border border-cyan-700 text-cyan-300">
                  {currentRankInfo.title}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {profile.title} • <span className="text-cyan-400 capitalize">{profile.archetype}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-right">
              <div className="text-[10px] text-slate-400 font-mono">Tokens</div>
              <div className="text-sm font-black font-mono text-amber-300 flex items-center gap-1 justify-end">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>{profile.tokens}</span>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-right">
              <div className="text-[10px] text-slate-400 font-mono">Streak</div>
              <div className="text-sm font-black font-mono text-rose-400 flex items-center gap-1 justify-end">
                <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span>{profile.streak.currentDays}d</span>
              </div>
            </div>
          </div>
        </div>

        {/* EXP Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" />
              EXP to Level {profile.level + 1}
            </span>
            <span className="text-cyan-300 font-bold">
              {profile.currentExp} / {profile.nextLevelExp} ({expPercentage}%)
            </span>
          </div>

          <div className="h-2 w-full rounded-full bg-slate-950 border border-slate-800 overflow-hidden p-0.5">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[#267CFF] via-cyan-400 to-[#974DFF] transition-all duration-500 shadow-[0_0_10px_rgba(0,229,255,0.5)]"
              style={{ width: `${expPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. TODAY'S WORKOUT & PROMINENT WORKOUT LAUNCHER HERO */}
      <div className="p-5 rounded-3xl bg-[#10264A] border border-[#267CFF]/40 shadow-[0_0_30px_rgba(38,124,255,0.2)] space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-[#267CFF]/20 border border-[#267CFF]/60 text-cyan-300 text-[10px] font-mono font-bold uppercase tracking-wider">
              Today&apos;s Recommended Protocol
            </span>
            {isWorkoutDoneToday && (
              <span className="px-2 py-0.5 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-[10px] font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Done Today
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> ~{recommendedWorkout.estimatedMinutes} min
          </span>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-bold font-['Cinzel',serif] text-slate-100">
            {recommendedWorkout.title}
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {recommendedWorkout.description}
          </p>
          <div className="flex items-center gap-2 mt-2 text-[11px] font-mono text-cyan-300">
            <span>{recommendedWorkout.exerciseIds.length} Exercises</span>
            <span>•</span>
            <span className="capitalize">{recommendedWorkout.difficulty} Intensity</span>
            <span>•</span>
            <span className="text-emerald-400">+{recommendedWorkout.exerciseIds.length * 3 * 25} Potential EXP</span>
          </div>
        </div>

        {/* Large Touch-Friendly Primary CTA Button */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            onClick={() => onStartWorkout(recommendedWorkout)}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#267CFF] via-cyan-400 to-[#267CFF] hover:from-[#1f66d4] hover:to-cyan-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(38,124,255,0.5)] active:scale-98 transition cursor-pointer flex items-center justify-center gap-2.5"
          >
            <Dumbbell className="w-5 h-5 fill-slate-950" />
            <span>{isWorkoutDoneToday ? 'Train Additional Session' : 'Start Workout Now'}</span>
          </button>

          <button
            onClick={onOpenCustomPlan}
            className="py-3 px-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
            title="Custom 7-Day Plan"
          >
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>Regimen</span>
          </button>

          <button
            onClick={onLogRestDay}
            className="py-3 px-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-emerald-400 font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
            title="Preserve streak on designated recovery day"
          >
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
            <span>Rest Day</span>
          </button>
        </div>
      </div>

      {/* 4. WEEKLY TRAINING GOAL & ACTIVITY STATISTICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        
        {/* Weekly Goal Progress */}
        <div className="p-4 rounded-2xl bg-[#10264A]/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5 font-['Rajdhani',sans-serif]">
              <Target className="w-4 h-4 text-[#267CFF]" /> Weekly Training Goal
            </span>
            <span className="font-mono text-cyan-400 font-bold">
              {workoutsThisWeek} / {targetDaysPerWeek} Days
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#267CFF] to-emerald-400 transition-all duration-300"
              style={{ width: `${weeklyProgressPct}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {weeklyProgressPct >= 100 ? 'Weekly goal fulfilled! Momentum sustained.' : `${targetDaysPerWeek - workoutsThisWeek} sessions remaining this week.`}
          </div>
        </div>

        {/* Total Verified Sets */}
        <div className="p-4 rounded-2xl bg-[#10264A]/80 border border-slate-800 space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400">Total Verified Volume</div>
          <div className="text-xl font-black font-mono text-cyan-300">
            {workouts.flatMap(w => w.exercises).flatMap(e => e.sets).filter(s => s.completed).length} Sets
          </div>
          <div className="text-[10px] text-slate-400">
            Across {workouts.length} total logged sessions
          </div>
        </div>

        {/* Total Time Trained */}
        <div className="p-4 rounded-2xl bg-[#10264A]/80 border border-slate-800 space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400">Time Under Tension</div>
          <div className="text-xl font-black font-mono text-purple-300">
            {(workouts.reduce((acc, w) => acc + (w.durationMinutes || 0), 0) / 60).toFixed(1)} Hours
          </div>
          <div className="text-[10px] text-slate-400">
            Structured real-world exercise
          </div>
        </div>
      </div>

      {/* 5. DAILY QUEST SUMMARY */}
      <div className="p-5 rounded-3xl bg-[#10264A]/90 border border-slate-800 space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-200 font-['Rajdhani',sans-serif]">
              Today&apos;s Daily Quests
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {quests.filter(q => q.type === 'daily' && q.isCompleted).length} / {quests.filter(q => q.type === 'daily').length} Completed
          </span>
        </div>

        <div className="space-y-2.5">
          {quests.filter(q => q.type === 'daily').map(quest => {
            const pct = Math.min(Math.round((quest.currentCount / quest.targetCount) * 100), 100);

            return (
              <div 
                key={quest.id}
                className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition ${
                  quest.isClaimed
                    ? 'bg-slate-950/40 border-slate-800/50 opacity-60'
                    : quest.isCompleted
                    ? 'bg-cyan-950/30 border-cyan-500/50 shadow-[0_0_12px_rgba(0,229,255,0.15)]'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-200">{quest.title}</span>
                    {quest.associatedAttribute && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 font-mono uppercase">
                        +{quest.associatedAttribute}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">{quest.description}</div>
                  
                  {/* Progress bar */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#267CFF] to-cyan-400 transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {quest.currentCount}/{quest.targetCount}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  {quest.isClaimed ? (
                    <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Claimed
                    </span>
                  ) : quest.isCompleted ? (
                    <button
                      onClick={() => onClaimQuest(quest)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(245,158,11,0.4)] active:scale-95 transition cursor-pointer"
                    >
                      Claim +{quest.expReward} EXP
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400 px-2 py-1 rounded bg-slate-950 border border-slate-800">
                      In Progress
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. FIVE FITNESS ATTRIBUTES (RADAR & SCORE CARDS) */}
      <div className="space-y-3">
        <AttributeRadar
          attributes={profile.attributes}
          unallocatedPoints={profile.unallocatedStatPoints}
          onAllocate={onAllocateStat}
        />
      </div>

      {/* 7. RECENT ACHIEVEMENTS & MILESTONES */}
      <div className="p-5 rounded-3xl bg-[#10264A]/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-200 font-['Rajdhani',sans-serif]">
              Hunter Achievements & Trophies
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {achievements.filter(a => a.isUnlocked).length} / {achievements.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {recentAchievements.map(ach => (
            <div 
              key={ach.id}
              className="p-3 rounded-xl bg-slate-900/60 border border-purple-500/30 flex items-center gap-3"
            >
              <div className="p-2 rounded-lg bg-purple-950/60 border border-purple-700/60 text-purple-300">
                <Trophy className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 truncate">{ach.title}</span>
                  <span className="text-[10px] font-mono text-amber-300">+{ach.tokenReward} T</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">{ach.description}</div>
              </div>
            </div>
          ))}

          {inProgressAchievements.map(ach => (
            <div 
              key={ach.id}
              className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center gap-3 opacity-70"
            >
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-500">
                <Award className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 truncate">{ach.title}</span>
                  <span className="text-[10px] font-mono text-slate-500">+{ach.tokenReward} T</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">{ach.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
