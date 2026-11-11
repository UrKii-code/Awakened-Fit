import React, { useState } from 'react';
import { WorkoutSession, BodyWeightEntry, BodyMetricsProfile } from '../types/hunter';
import { 
  TrendingUp, 
  Calendar as CalendarIcon, 
  Flame, 
  Dumbbell, 
  Clock, 
  Scale, 
  Plus, 
  Trash2, 
  Edit3, 
  Info, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Sparkles,
  CheckCircle2,
  HeartHandshake,
  Activity,
  Zap
} from 'lucide-react';

interface ProgressViewProps {
  workouts: WorkoutSession[];
  streakDays: number;
  weightEntries: BodyWeightEntry[];
  bodyMetrics: BodyMetricsProfile;
  onAddWeightEntry: (entry: Omit<BodyWeightEntry, 'id' | 'createdAt'>) => void;
  onDeleteWeightEntry: (id: string) => void;
  onUpdateBodyMetrics: (metrics: BodyMetricsProfile) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  workouts,
  streakDays,
  weightEntries,
  bodyMetrics,
  onAddWeightEntry,
  onDeleteWeightEntry,
  onUpdateBodyMetrics,
}) => {
  const [activeSection, setActiveSection] = useState<'report' | 'history' | 'weight' | 'bmi'>('report');
  
  // History Filter
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);

  // Weight Entry Form Modal/Drawer State
  const [isWeightFormOpen, setIsWeightFormOpen] = useState<boolean>(false);
  const [inputWeight, setInputWeight] = useState<string>('');
  const [inputDate, setInputDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [inputNotes, setInputNotes] = useState<string>('');

  // Height / BMI inputs (strictly optional, no invented default)
  const [userHeightCm, setUserHeightCm] = useState<number | undefined>(bodyMetrics.heightCm);
  const [isEditingHeight, setIsEditingHeight] = useState<boolean>(false);

  // Aggregate Calculations
  const totalWorkouts = workouts.length;
  const totalMinutes = workouts.reduce((acc, w) => acc + (w.durationMinutes || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const totalVerifiedSets = workouts.flatMap(w => w.exercises).flatMap(e => e.sets).filter(s => s.completed).length;
  
  // Estimated calories burned (~7.5 kcal/min for active resistance/calisthenics/cardio)
  const estimatedCaloriesBurned = Math.round(totalMinutes * 7.5);

  // Latest weight
  const sortedWeightEntries = [...weightEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const currentWeightKg = sortedWeightEntries[0]?.weightKg ?? bodyMetrics.currentWeightKg;
  const currentWeightLbs = currentWeightKg ? (currentWeightKg * 2.20462).toFixed(1) : null;

  // BMI Calculation (requires verified height and weight)
  const heightM = (userHeightCm && userHeightCm > 0) ? userHeightCm / 100 : null;
  const calculatedBMI = (currentWeightKg && heightM) 
    ? Number((currentWeightKg / (heightM * heightM)).toFixed(1))
    : null;

  const getBMICategory = (bmi: number | null) => {
    if (!bmi) return { label: 'Pending Measurement', color: 'text-slate-400', bg: 'bg-slate-800', bar: 'w-0' };
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-amber-400', bg: 'bg-amber-500/20', bar: 'w-1/4 bg-amber-400' };
    if (bmi < 25) return { label: 'Normal Weight Range', color: 'text-emerald-400', bg: 'bg-emerald-500/20', bar: 'w-2/4 bg-emerald-400' };
    if (bmi < 30) return { label: 'Overweight Range', color: 'text-sky-400', bg: 'bg-sky-500/20', bar: 'w-3/4 bg-sky-400' };
    return { label: 'Obese Range', color: 'text-rose-400', bg: 'bg-rose-500/20', bar: 'w-full bg-rose-400' };
  };

  const bmiCategory = getBMICategory(calculatedBMI);

  // Handle Save Weight
  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(inputWeight);
    if (isNaN(val) || val <= 0) return;

    const isLbs = bodyMetrics.preferredUnit === 'imperial';
    const weightKg = isLbs ? Number((val / 2.20462).toFixed(1)) : val;
    const weightLbs = isLbs ? val : Number((val * 2.20462).toFixed(1));

    onAddWeightEntry({
      hunterId: 'active_hunter',
      date: inputDate,
      weightKg,
      weightLbs,
      notes: inputNotes.trim() || undefined,
    });

    setInputWeight('');
    setInputNotes('');
    setIsWeightFormOpen(false);
  };

  // Calendar 7-Day Matrix
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const hasWorkout = workouts.some(w => w.startedAt.split('T')[0] === dateStr);
    return {
      dateStr,
      dayName: daysOfWeek[d.getDay()],
      dayNum: d.getDate(),
      hasWorkout,
      isToday: dateStr === today.toISOString().split('T')[0],
    };
  });

  return (
    <div className="space-y-5 font-['Inter',sans-serif]">
      
      {/* Title & Section Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold font-['Cinzel',serif] text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Fitness Progress & Reports
          </h2>
          <p className="text-xs text-slate-400">
            Real-world performance metrics, activity history, and optional body analytics.
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 self-start sm:self-auto overflow-x-auto max-w-full">
          {[
            { id: 'report', label: 'Report', icon: <Activity className="w-3.5 h-3.5" /> },
            { id: 'history', label: 'History', icon: <CalendarIcon className="w-3.5 h-3.5" /> },
            { id: 'weight', label: 'Weight Log', icon: <Scale className="w-3.5 h-3.5" /> },
            { id: 'bmi', label: 'BMI Guidance', icon: <Info className="w-3.5 h-3.5" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                activeSection === tab.id
                  ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(38,124,255,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: COMPREHENSIVE PROGRESS REPORT */}
      {activeSection === 'report' && (
        <div className="space-y-4">
          
          {/* 4-Stat Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0e2145] to-[#071326] border border-blue-500/30 space-y-1">
              <div className="flex items-center justify-between text-blue-300">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Total Workouts</span>
                <Dumbbell className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black font-mono text-slate-100">{totalWorkouts}</div>
              <div className="text-[10px] text-slate-400">Verified Sessions</div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0e2145] to-[#071326] border border-blue-500/30 space-y-1">
              <div className="flex items-center justify-between text-cyan-300">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Time Trained</span>
                <Clock className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black font-mono text-slate-100">{totalHours}h</div>
              <div className="text-[10px] text-slate-400">{totalMinutes} active minutes</div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0e2145] to-[#071326] border border-purple-500/30 space-y-1">
              <div className="flex items-center justify-between text-purple-300">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Verified Sets</span>
                <Zap className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black font-mono text-slate-100">{totalVerifiedSets}</div>
              <div className="text-[10px] text-slate-400">Completed Volume</div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0e2145] to-[#071326] border border-rose-500/30 space-y-1">
              <div className="flex items-center justify-between text-rose-300">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Active Streak</span>
                <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
              </div>
              <div className="text-2xl font-black font-mono text-slate-100">{streakDays} Days</div>
              <div className="text-[10px] text-slate-400">Consecutive Consistency</div>
            </div>
          </div>

          {/* Calorie & Biological Effort Card */}
          <div className="p-4 rounded-2xl bg-[#0a1832]/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-['Rajdhani',sans-serif]">
                  Estimated Active Energy Expenditure
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-700/60 font-mono">
                  Conservative MET Est.
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-amber-300">
                ~{estimatedCaloriesBurned.toLocaleString()} <span className="text-xs text-slate-400 font-sans font-normal">kcal burned across completed sessions</span>
              </div>
              <p className="text-[11px] text-slate-400 max-w-lg">
                Calculated strictly from verified minutes during structured strength, endurance, and calisthenics protocols.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center shrink-0 w-full sm:w-auto">
              <div className="text-[10px] text-slate-400 font-mono">Current Weight</div>
              <div className="text-lg font-bold font-mono text-slate-200">
                {currentWeightKg ? (
                  <>
                    {currentWeightKg} kg <span className="text-xs text-slate-500 font-normal">({currentWeightLbs} lbs)</span>
                  </>
                ) : (
                  <span className="text-xs text-slate-500 italic font-sans">Not Logged (Optional)</span>
                )}
              </div>
            </div>
          </div>

          {/* 7-Day Consistency Matrix */}
          <div className="p-4 rounded-2xl bg-[#0a1832]/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-['Rajdhani',sans-serif]">
                  Past 7-Day Activity Matrix
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {past7Days.filter(d => d.hasWorkout).length} / 7 Days Active
              </span>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {past7Days.map(d => (
                <div
                  key={d.dateStr}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-between min-h-[70px] ${
                    d.hasWorkout
                      ? 'bg-blue-600/20 border-blue-500/60 shadow-[0_0_12px_rgba(38,124,255,0.2)]'
                      : d.isToday
                      ? 'bg-slate-800/80 border-slate-600'
                      : 'bg-slate-900/60 border-slate-800/80'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 font-medium">{d.dayName}</span>
                  <span className={`text-sm font-bold font-mono ${d.hasWorkout ? 'text-cyan-300' : 'text-slate-300'}`}>
                    {d.dayNum}
                  </span>
                  {d.hasWorkout ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SECTION 2: ACTIVITY HISTORY */}
      {activeSection === 'history' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
              {[
                { id: 'all', label: 'All Sessions' },
                { id: 'strength', label: 'Strength' },
                { id: 'bodyweight', label: 'Bodyweight' },
                { id: 'cardio', label: 'Cardio' },
                { id: 'mobility', label: 'Mobility' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setCategoryFilter(f.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                    categoryFilter === f.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <span className="text-[11px] text-slate-400 font-mono">
              {workouts.length} recorded
            </span>
          </div>

          {/* Workout Logs List */}
          {workouts.length === 0 ? (
            <div className="p-8 text-center text-slate-500 rounded-2xl bg-[#0a1832]/60 border border-slate-800 space-y-2">
              <Dumbbell className="w-8 h-8 mx-auto text-slate-600" />
              <div className="text-sm font-semibold text-slate-400">No Workout Sessions Logged Yet</div>
              <p className="text-xs max-w-md mx-auto">
                Begin a workout from the Training tab or Home dashboard to record your verified sets, durations, and attributes.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {workouts
                .filter(w => {
                  if (categoryFilter === 'all') return true;
                  return w.exercises.some(e => e.category === categoryFilter);
                })
                .map(w => {
                  const isExpanded = expandedWorkoutId === w.id;
                  const totalSets = w.exercises.flatMap(e => e.sets).filter(s => s.completed).length;

                  return (
                    <div
                      key={w.id}
                      className="rounded-2xl bg-gradient-to-br from-[#0a1832] to-[#071326] border border-slate-800 overflow-hidden transition"
                    >
                      <div
                        onClick={() => setExpandedWorkoutId(isExpanded ? null : w.id)}
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-900/40 transition"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-100">{w.title}</span>
                            <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-700">
                              {w.planType.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 font-mono">
                            {new Date(w.startedAt).toLocaleDateString()} • {w.durationMinutes} mins • {totalSets} verified sets
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-mono text-xs font-bold text-cyan-400">+{w.expEarned} EXP</div>
                          <div className="text-[10px] text-amber-400 font-mono">+{w.tokensEarned} Tokens</div>
                        </div>
                      </div>

                      {/* Expanded Exercise Breakdown */}
                      {isExpanded && (
                        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 space-y-3 text-xs">
                          <div className="font-semibold text-slate-300 font-mono uppercase tracking-wider text-[11px]">
                            Completed Exercise Logs:
                          </div>

                          <div className="space-y-2">
                            {w.exercises.map((ex, idx) => (
                              <div key={idx} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                                <div className="flex items-center justify-between font-semibold text-slate-200">
                                  <span>{ex.exerciseName}</span>
                                  <span className="text-[10px] font-mono text-slate-400 capitalize">{ex.category}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-400">
                                  {ex.sets.map((s, sIdx) => (
                                    <span
                                      key={sIdx}
                                      className={`px-2 py-0.5 rounded ${
                                        s.completed ? 'bg-blue-950 text-blue-300 border border-blue-700' : 'bg-slate-800 text-slate-500'
                                      }`}
                                    >
                                      Set {s.setNumber}: {s.reps ? `${s.reps} reps` : `${s.durationSeconds}s`} {s.weightKg ? `@ ${s.weightKg}kg` : ''}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: WEIGHT TRACKING */}
      {activeSection === 'weight' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">
                Log your body weight over time to observe healthy physical trends.
              </div>
              <div className="text-[11px] text-slate-500 italic">
                Completely optional: tracking body weight is never required to progress in Awakened Fit.
              </div>
            </div>

            <button
              onClick={() => setIsWeightFormOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-[0_0_12px_rgba(38,124,255,0.3)]"
            >
              <Plus className="w-4 h-4" />
              <span>Log Weight</span>
            </button>
          </div>

          {/* New Entry Modal Form */}
          {isWeightFormOpen && (
            <form onSubmit={handleSaveWeight} className="p-4 rounded-2xl bg-slate-900 border border-blue-500/50 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between font-bold text-xs text-slate-200">
                <span>Record New Weight Entry</span>
                <button type="button" onClick={() => setIsWeightFormOpen(false)} className="text-slate-400 hover:text-slate-200">&times;</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Weight ({bodyMetrics.preferredUnit === 'imperial' ? 'lbs' : 'kg'})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={inputWeight}
                    onChange={(e) => setInputWeight(e.target.value)}
                    placeholder="e.g. 77.5"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={inputDate}
                    onChange={(e) => setInputDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] text-slate-400 block mb-1">Notes (Optional)</label>
                  <input
                    type="text"
                    value={inputNotes}
                    onChange={(e) => setInputNotes(e.target.value)}
                    placeholder="e.g. Morning fasted weigh-in, post-run"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsWeightFormOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 text-xs cursor-pointer hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </form>
          )}

          {/* Interactive Weight History Visualizer */}
          <div className="p-4 rounded-2xl bg-[#0a1832]/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Weight Progression Timeline</span>
              <span className="font-mono text-cyan-400">
                Latest: {currentWeightKg} kg ({currentWeightLbs} lbs)
              </span>
            </div>

            {/* SVG Trend Sparkline */}
            {sortedWeightEntries.length >= 2 ? (
              <div className="h-32 w-full pt-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100">
                  <defs>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#267CFF" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#267CFF" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {(() => {
                    const rev = [...sortedWeightEntries].reverse();
                    const weights = rev.map(e => e.weightKg);
                    const min = Math.min(...weights) - 1;
                    const max = Math.max(...weights) + 1;
                    const range = max - min || 1;

                    const points = rev.map((e, idx) => {
                      const x = (idx / (rev.length - 1)) * 380 + 10;
                      const y = 90 - ((e.weightKg - min) / range) * 80;
                      return `${x},${y}`;
                    }).join(' ');

                    return (
                      <>
                        <polyline
                          fill="none"
                          stroke="#267CFF"
                          strokeWidth="3"
                          points={points}
                        />
                        {rev.map((e, idx) => {
                          const x = (idx / (rev.length - 1)) * 380 + 10;
                          const y = 90 - ((e.weightKg - min) / range) * 80;
                          return (
                            <circle
                              key={idx}
                              cx={x}
                              cy={y}
                              r="4"
                              className="fill-cyan-400 stroke-slate-900 stroke-2"
                            />
                          );
                        })}
                      </>
                    );
                  })()}
                </svg>
              </div>
            ) : (
              <div className="p-4 text-center text-slate-500 text-xs font-mono">
                Log at least 2 entries to display the visual trend chart.
              </div>
            )}
          </div>

          {/* Historical Logs List */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider">
              Weight Log History ({sortedWeightEntries.length})
            </div>

            {sortedWeightEntries.map(entry => (
              <div
                key={entry.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-200">
                      {bodyMetrics.preferredUnit === 'imperial' ? `${entry.weightLbs} lbs` : `${entry.weightKg} kg`}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({bodyMetrics.preferredUnit === 'imperial' ? `${entry.weightKg} kg` : `${entry.weightLbs} lbs`})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {entry.date} {entry.notes && `• ${entry.notes}`}
                  </div>
                </div>

                <button
                  onClick={() => onDeleteWeightEntry(entry.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                  title="Delete log"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* SECTION 4: BODY MASS INDEX (BMI) GUIDANCE */}
      {activeSection === 'bmi' && (
        <div className="space-y-4">
          
          {/* Medical Disclaimer Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/50 via-slate-900 to-purple-950/40 border border-blue-500/40 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-blue-300">
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Medical & Health Context on Body Mass Index</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Body Mass Index (BMI) is a broad population screening tool based solely on height and weight. 
              <strong> It does not measure body fat percentage, muscular mass, bone density, or cardiovascular fitness.</strong> Athletes and strength trainers frequently register in higher categories due to dense muscular hypertrophy.
            </p>
          </div>

          {/* Calculator Card */}
          <div className="p-5 rounded-2xl bg-[#0a1832]/80 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-xs text-slate-400 font-mono uppercase">Calculated Body Mass Index</span>
                <div className="text-3xl font-black font-mono text-slate-100 flex items-baseline gap-2">
                  <span>{calculatedBMI !== null ? calculatedBMI : '--'}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bmiCategory.bg} ${bmiCategory.color}`}>
                    {bmiCategory.label}
                  </span>
                </div>
                {!calculatedBMI && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Enter your height below and record your first weight entry to calculate BMI screening estimate.
                  </p>
                )}
              </div>

              {/* Height Configuration */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Height:</span>
                {isEditingHeight ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      placeholder="e.g. 175"
                      value={userHeightCm ?? ''}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : undefined;
                        setUserHeightCm(val);
                      }}
                      className="w-20 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs font-mono text-slate-100"
                    />
                    <span className="text-xs text-slate-400">cm</span>
                    <button
                      onClick={() => {
                        onUpdateBodyMetrics({ ...bodyMetrics, heightCm: userHeightCm });
                        setIsEditingHeight(false);
                      }}
                      className="px-2 py-1 rounded bg-blue-600 text-white text-[10px] font-bold"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingHeight(false)}
                      className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[10px]"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 font-mono text-xs text-slate-200">
                    <span>{userHeightCm ? `${userHeightCm} cm` : 'Not Logged (Optional)'}</span>
                    <button
                      onClick={() => setIsEditingHeight(true)}
                      className="p-1 text-slate-400 hover:text-cyan-400 cursor-pointer"
                      title={userHeightCm ? 'Edit height' : 'Add height'}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Gauge */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>&lt; 18.5 Underweight</span>
                <span>18.5–24.9 Normal</span>
                <span>25–29.9 Overweight</span>
                <span>30+ Obese</span>
              </div>
              <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 flex">
                <div className="w-1/4 bg-amber-500/70" />
                <div className="w-2/4 bg-emerald-500/70" />
                <div className="w-1/4 bg-sky-500/70" />
                <div className="w-1/4 bg-rose-500/70" />
              </div>
            </div>

            {/* Minor & Young Hunter Safeguards */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300">Age-Appropriate Pediatric Notice:</div>
              <p>
                For adolescents and hunters under 18, standard adult BMI cutoffs are not clinically applicable; percentiles for age and sex should be referenced under qualified medical guidance. Focus should always remain on enjoyable movement, foundational athletic motor skills, and healthy nutrition.
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
