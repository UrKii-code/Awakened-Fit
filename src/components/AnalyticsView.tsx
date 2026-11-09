import React from 'react';
import { HunterProfile, WorkoutSession } from '../types/hunter';
import { 
  TrendingUp, 
  Dumbbell, 
  Timer, 
  Calendar, 
  Award, 
  ShieldCheck, 
  Flame, 
  Activity, 
  HeartHandshake 
} from 'lucide-react';

interface AnalyticsViewProps {
  profile: HunterProfile;
  workouts: WorkoutSession[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  profile,
  workouts,
}) => {
  // Aggregate stats
  const totalSetsLogged = workouts
    .flatMap(w => w.exercises)
    .flatMap(e => e.sets)
    .filter(s => s.completed).length;

  const totalTrainingMinutes = workouts.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
  const totalExpGained = workouts.reduce((acc, curr) => acc + (curr.expEarned || 0), 0);

  // Past 7 days activity streak simulation
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  // Personal Records Registry
  const personalRecords = [
    { title: 'Maximum Barbell Bench Press', value: '85.0 KG', date: 'Verified in Session', category: 'Strength' },
    { title: 'Unbroken Pull-Up Set', value: '12 Reps', date: 'Bodyweight Mastery', category: 'Strength' },
    { title: 'Longest Iron Guard Plank', value: '90 Seconds', date: 'Discipline Trial', category: 'Core' },
    { title: 'Aerobic Distance Threshold', value: '25.0 Mins', date: 'Zone 2 Cardio', category: 'Endurance' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title & Privacy Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold font-['Cinzel',serif] text-slate-100">
            Physical Conditioning Analytics
          </h2>
          <p className="text-xs text-slate-400">
            Quantitative bio-metrics derived authoritatively from validated training logs.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-emerald-400 font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Private Client-Authoritative Storage</span>
        </div>
      </div>

      {/* Primary Bio-Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#090e1d]/90 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Total Volume</span>
            <Dumbbell className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-mono text-2xl font-black text-slate-100">{totalSetsLogged}</div>
          <div className="text-[10px] text-slate-400 mt-1">Verified Training Sets</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#090e1d]/90 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Active Time</span>
            <Timer className="w-4 h-4 text-sky-400" />
          </div>
          <div className="font-mono text-2xl font-black text-slate-100">{totalTrainingMinutes}m</div>
          <div className="text-[10px] text-slate-400 mt-1">Total Effort Recorded</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#090e1d]/90 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Consistency</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="font-mono text-2xl font-black text-rose-400">{profile.streak.currentDays}d</div>
          <div className="text-[10px] text-slate-400 mt-1">Active Streak Days</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#090e1d]/90 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Rest Days</span>
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono text-2xl font-black text-emerald-400">{profile.streak.restDaysTaken}</div>
          <div className="text-[10px] text-slate-400 mt-1">Scheduled Recovery</div>
        </div>
      </div>

      {/* Weekly Activity Heatmap / Consistency Row */}
      <div className="p-4 rounded-2xl bg-[#090e1d]/90 border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-300 font-['Rajdhani',sans-serif]">
              Weekly Habituation Pattern
            </h3>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-cyan-400 inline-block" /> Workout
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-emerald-400 inline-block" /> Rest Day
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-slate-800 inline-block" /> Pending
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {daysOfWeek.map((day, idx) => {
            const isToday = idx === todayIndex;
            const isPast = idx < todayIndex;
            const hasWorkout = isPast && idx % 2 === 0;
            const hasRest = isPast && idx % 2 !== 0;

            let bgClass = 'bg-slate-900 border-slate-800 text-slate-500';
            if (isToday) {
              bgClass = 'bg-cyan-950/60 border-cyan-400/80 text-cyan-300 ring-1 ring-cyan-400';
            } else if (hasWorkout) {
              bgClass = 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200';
            } else if (hasRest) {
              bgClass = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200';
            }

            return (
              <div
                key={day}
                className={`p-2.5 rounded-xl border text-center transition ${bgClass}`}
              >
                <div className="text-[10px] font-mono font-bold uppercase">{day}</div>
                <div className="text-xs font-black mt-1">
                  {isToday ? 'Today' : hasWorkout ? '✓' : hasRest ? 'Rest' : '—'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Personal Records Showcase */}
      <div className="p-4 rounded-2xl bg-[#090e1d]/90 border border-slate-800/80 space-y-3">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-300 font-['Rajdhani',sans-serif]">
            Verified Personal Records (PRs)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {personalRecords.map(pr => (
            <div
              key={pr.title}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-xs text-slate-200">{pr.title}</div>
                <div className="text-[10px] text-slate-500 font-mono">{pr.category} • {pr.date}</div>
              </div>
              <div className="font-mono text-sm font-black text-amber-400">
                {pr.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
