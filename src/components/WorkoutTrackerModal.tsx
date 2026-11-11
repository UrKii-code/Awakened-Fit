import React, { useState, useEffect } from 'react';
import { 
  Exercise, 
  WorkoutSession, 
  WorkoutExerciseLog, 
  WorkoutSetRecord,
  DraftWorkoutState 
} from '../types/hunter';
import { EXERCISE_LIBRARY, WORKOUT_TEMPLATES } from '../data/exercises';
import { StorageService } from '../services/storageService';
import { 
  X, 
  Check, 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Dumbbell, 
  Info, 
  Sparkles, 
  CheckCircle2, 
  Plus, 
  Trash2,
  Save,
  AlertTriangle,
  RefreshCw 
} from 'lucide-react';

interface WorkoutTrackerModalProps {
  hunterId: string;
  onClose: () => void;
  onFinishWorkout: (completedSession: WorkoutSession) => void;
  onDraftSaved?: () => void;
  initialExercises?: WorkoutExerciseLog[];
  initialTitle?: string;
}

export const WorkoutTrackerModal: React.FC<WorkoutTrackerModalProps> = ({
  hunterId,
  onClose,
  onFinishWorkout,
  onDraftSaved,
  initialExercises,
  initialTitle,
}) => {
  // Session setup: select template or custom
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('awakening_trial_home');
  const [isSessionActive, setIsSessionActive] = useState<boolean>(Boolean(initialExercises && initialExercises.length > 0));
  
  // Active session state
  const [sessionTitle, setSessionTitle] = useState<string>(initialTitle || 'Trial of Awakening');
  const [activeExercises, setActiveExercises] = useState<WorkoutExerciseLog[]>(initialExercises || []);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Dedicated Rest Timer
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number>(0);
  const [isRestActive, setIsRestActive] = useState<boolean>(false);
  const [isSubstituterOpen, setIsSubstituterOpen] = useState<boolean>(false);

  // Audio & Haptic cue for Rest Timer completion
  const playRestChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.18); // A5
      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch {
      // Browser audio context policy or restricted iframe
    }
  };

  // Draft state detection on mount
  const [existingDraft, setExistingDraft] = useState<DraftWorkoutState | null>(null);

  useEffect(() => {
    const draft = StorageService.getDraftWorkout();
    if (draft && draft.session.hunterId === hunterId) {
      setExistingDraft(draft);
    }
  }, [hunterId]);

  // Initial load from template (only if not supplied with initialExercises)
  useEffect(() => {
    if (isSessionActive) return; // Do not overwrite if actively in a session
    if (initialExercises && initialExercises.length > 0) return;

    const template = WORKOUT_TEMPLATES.find(t => t.id === selectedTemplateId) || WORKOUT_TEMPLATES[0];
    setSessionTitle(template.title);

    const logs: WorkoutExerciseLog[] = template.exerciseIds.map(exId => {
      const ex = EXERCISE_LIBRARY.find(e => e.id === exId) || EXERCISE_LIBRARY[0];
      const initialSets: WorkoutSetRecord[] = Array.from({ length: ex.defaultSets }, (_, i) => ({
        setNumber: i + 1,
        completed: false,
        reps: ex.defaultReps || 10,
        weightKg: ex.category === 'bodyweight' ? 0 : 20,
        durationSeconds: ex.defaultDurationSeconds,
      }));

      return {
        exerciseId: ex.id,
        exerciseName: ex.name,
        category: ex.category,
        sets: initialSets,
      };
    });

    setActiveExercises(logs);
  }, [selectedTemplateId, isSessionActive, initialExercises]);

  // Stopwatch for overall session duration
  useEffect(() => {
    let interval: any = null;
    if (isSessionActive && isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive, isTimerRunning]);

  // Rest Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (isRestActive && restSecondsRemaining > 0) {
      interval = setInterval(() => {
        setRestSecondsRemaining(prev => {
          if (prev <= 1) {
            setIsRestActive(false);
            playRestChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRestActive, restSecondsRemaining]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentExerciseLog = activeExercises[activeExerciseIndex];
  const currentExerciseData = EXERCISE_LIBRARY.find(e => e.id === currentExerciseLog?.exerciseId);

  const toggleSetCompletion = (setIndex: number) => {
    const updated = [...activeExercises];
    const targetSet = updated[activeExerciseIndex].sets[setIndex];
    const willBeCompleted = !targetSet.completed;
    targetSet.completed = willBeCompleted;
    setActiveExercises(updated);
    setValidationError(null);

    // If completed set, trigger rest timer
    if (willBeCompleted && currentExerciseData?.defaultRestSeconds) {
      setRestSecondsRemaining(currentExerciseData.defaultRestSeconds);
      setIsRestActive(true);
    }
  };

  const updateSetValues = (setIndex: number, field: 'reps' | 'weightKg', val: number) => {
    const updated = [...activeExercises];
    updated[activeExerciseIndex].sets[setIndex][field] = Math.max(0, val);
    setActiveExercises(updated);
  };

  const addSet = () => {
    const updated = [...activeExercises];
    const sets = updated[activeExerciseIndex].sets;
    const lastSet = sets[sets.length - 1];
    sets.push({
      setNumber: sets.length + 1,
      completed: false,
      reps: lastSet ? lastSet.reps : 10,
      weightKg: lastSet ? lastSet.weightKg : 0,
      durationSeconds: lastSet?.durationSeconds,
    });
    setActiveExercises(updated);
  };

  const removeSet = (setIdx: number) => {
    if (activeExercises[activeExerciseIndex].sets.length <= 1) return;
    const updated = [...activeExercises];
    updated[activeExerciseIndex].sets.splice(setIdx, 1);
    updated[activeExerciseIndex].sets.forEach((s, idx) => {
      s.setNumber = idx + 1;
    });
    setActiveExercises(updated);
  };

  const handleSubstituteExercise = (newExercise: Exercise) => {
    const updated = [...activeExercises];
    const oldLog = updated[activeExerciseIndex];
    updated[activeExerciseIndex] = {
      exerciseId: newExercise.id,
      exerciseName: newExercise.name,
      category: newExercise.category,
      sets: oldLog.sets.map(s => ({
        ...s,
        reps: newExercise.defaultReps || s.reps,
        weightKg: newExercise.category === 'bodyweight' ? 0 : s.weightKg,
      })),
      notes: `Substituted from ${oldLog.exerciseName}`,
    };
    setActiveExercises(updated);
    setIsSubstituterOpen(false);
  };

  // Resume Draft handler
  const handleResumeDraft = () => {
    if (!existingDraft) return;
    setSessionTitle(existingDraft.session.title);
    setActiveExercises(existingDraft.session.exercises);
    setElapsedSeconds(existingDraft.elapsedSeconds);
    setActiveExerciseIndex(existingDraft.activeExerciseIndex || 0);
    setIsSessionActive(true);
    setExistingDraft(null);
  };

  // Discard Draft handler
  const handleDiscardDraft = () => {
    StorageService.clearDraftWorkout();
    setExistingDraft(null);
  };

  // Save as Draft handler
  const handleSaveDraft = () => {
    const draftSession: WorkoutSession = {
      id: `draft_${Date.now()}`,
      hunterId,
      title: sessionTitle,
      planType: 'strength_foundations',
      environment: 'home',
      state: 'started',
      exercises: activeExercises,
      startedAt: new Date(Date.now() - elapsedSeconds * 1000).toISOString(),
      durationMinutes: Math.max(Math.round(elapsedSeconds / 60), 1),
      elapsedSeconds,
      expEarned: 0,
      attributeGains: {},
      tokensEarned: 0,
      validationNotes: 'Paused in-progress session',
      isPersonalRecord: false,
      verified: false,
      isDraft: true,
      lastPausedAt: new Date().toISOString(),
    };

    StorageService.saveDraftWorkout({
      session: draftSession,
      elapsedSeconds,
      activeExerciseIndex,
      lastSavedAt: new Date().toISOString(),
    });

    if (onDraftSaved) onDraftSaved();
    onClose();
  };

  // Authoritative Finish Handler (EXPLOIT-PROOF)
  const handleFinish = () => {
    const completedSetsCount = activeExercises.flatMap(e => e.sets).filter(s => s.completed).length;
    
    // Strict Exploit Fix: Reject empty workout from receiving completion rewards
    if (completedSetsCount === 0) {
      setValidationError('Cannot validate session: At least 1 completed set must be recorded to receive EXP and attribute progression. Use "Save Draft" if you wish to pause.');
      return;
    }

    // Exact elapsed duration calculation without arbitrary 5-minute inflation
    const durationMins = Math.max(Math.round(elapsedSeconds / 60), 1);

    const session: WorkoutSession = {
      id: `workout_${Date.now()}`,
      hunterId, // Real authenticated Hunter ID
      title: sessionTitle,
      planType: 'strength_foundations',
      environment: 'home',
      state: 'completed',
      exercises: activeExercises,
      startedAt: new Date(Date.now() - elapsedSeconds * 1000).toISOString(),
      completedAt: new Date().toISOString(),
      durationMinutes: durationMins,
      elapsedSeconds,
      expEarned: 0, // Calculated authoritatively by ProgressionEngine
      attributeGains: {},
      tokensEarned: 0,
      validationNotes: '',
      isPersonalRecord: false,
      verified: true,
    };

    // Clear any active draft upon completed submission
    StorageService.clearDraftWorkout();
    onFinishWorkout(session);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-[#080d1a] border border-cyan-500/30 rounded-3xl shadow-[0_0_40px_rgba(0,229,255,0.15)] overflow-hidden text-slate-100">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-sm sm:text-base font-['Cinzel',serif] text-slate-100">
                {isSessionActive ? sessionTitle : 'Select Workout Protocol'}
              </h2>
              <div className="text-[11px] text-slate-400 font-mono">
                {isSessionActive ? `Hunter ID: ${hunterId} • Elapsed: ${formatTime(elapsedSeconds)}` : 'Authoritative Fitness Engine'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSessionActive && (
              <>
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  title={isTimerRunning ? 'Pause Stopwatch' : 'Resume Stopwatch'}
                  className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-cyan-400 text-xs font-mono transition"
                >
                  {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleSaveDraft}
                  title="Save in-progress workout as draft"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700 text-xs font-mono transition cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Save Draft</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Unfinished Draft Resume Banner */}
          {existingDraft && !isSessionActive && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/70 to-slate-900 border border-amber-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
              <div>
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Timer className="w-4 h-4" />
                  Unfinished Session Found
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  &quot;{existingDraft.session.title}&quot; saved at {new Date(existingDraft.lastSavedAt).toLocaleTimeString()} ({Math.floor(existingDraft.elapsedSeconds / 60)}m elapsed).
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDiscardDraft}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 text-xs font-bold transition cursor-pointer"
                >
                  Discard
                </button>
                <button
                  onClick={handleResumeDraft}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition cursor-pointer"
                >
                  Resume
                </button>
              </div>
            </div>
          )}

          {/* Validation Alert */}
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/80 text-rose-200 text-xs flex items-start gap-2 shadow-lg animate-shake">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {!isSessionActive ? (
            /* PROTOCOL SELECTION SCREEN */
            <div className="space-y-4">
              <div className="text-xs text-slate-300">
                Choose a pre-calibrated combat template or activate custom tracking. Each template maps real sets to your 5 core Hunter attributes.
              </div>

              <div className="space-y-3">
                {WORKOUT_TEMPLATES.map(tmpl => {
                  const isSelected = selectedTemplateId === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => setSelectedTemplateId(tmpl.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition ${
                        isSelected
                          ? 'bg-slate-900/90 border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.25)] ring-1 ring-cyan-400'
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="font-bold text-sm text-cyan-200">{tmpl.title}</div>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          ~{tmpl.estimatedMinutes}m • {tmpl.environment}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{tmpl.description}</p>
                      <div className="text-[11px] text-cyan-400/90 font-mono">
                        Affinity: {tmpl.primaryBenefit}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setIsSessionActive(true)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(0,229,255,0.5)] active:scale-95 transition cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                Initiate Protocol
              </button>
            </div>
          ) : (
            /* ACTIVE WORKOUT SESSION TRACKER */
            <div className="space-y-4">
              {/* Rest Timer Floating Banner */}
              {isRestActive && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border border-cyan-400/60 flex items-center justify-between shadow-lg animate-pulse">
                  <div className="flex items-center gap-2.5">
                    <Timer className="w-5 h-5 text-cyan-400" />
                    <div>
                      <div className="text-xs font-bold text-cyan-200">Rest Interval in Progress</div>
                      <div className="text-[10px] text-slate-400">Catch breath, hydrate, and prepare for next set</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xl font-black text-cyan-300">
                      {formatTime(restSecondsRemaining)}
                    </span>
                    <button
                      onClick={() => setIsRestActive(false)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-cyan-900/60 border border-cyan-700 text-cyan-300 hover:bg-cyan-800"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              )}

              {/* Exercise Carousel Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80">
                {activeExercises.map((ex, idx) => {
                  const isActive = idx === activeExerciseIndex;
                  const allDone = ex.sets.every(s => s.completed);

                  return (
                    <button
                      key={ex.exerciseId}
                      onClick={() => setActiveExerciseIndex(idx)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                        isActive
                          ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                          : allDone
                          ? 'bg-slate-900 border border-emerald-500/50 text-emerald-300'
                          : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {allDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      <span>{ex.exerciseName.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Exercise Detail Card */}
              {currentExerciseData && (
                <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-sm text-slate-100">{currentExerciseData.name}</h3>
                      <div className="text-[10px] text-cyan-400 font-mono">
                        Primary: {currentExerciseData.primaryAttribute.toUpperCase()} • Secondary: {currentExerciseData.secondaryAttribute?.toUpperCase() || 'NONE'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsSubstituterOpen(!isSubstituterOpen)}
                        className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-300 hover:bg-cyan-900 transition cursor-pointer"
                        title="Swap with a joint-friendly or alternative movement"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Substitute</span>
                      </button>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 capitalize">
                        {currentExerciseData.category}
                      </span>
                    </div>
                  </div>

                  {/* Substitution Drawer */}
                  {isSubstituterOpen && (
                    <div className="mb-3 p-3 rounded-xl bg-slate-950 border border-cyan-500/50 space-y-2 animate-fade-in">
                      <div className="flex items-center justify-between text-xs font-bold text-cyan-200">
                        <span>Select Safe Substitution:</span>
                        <button onClick={() => setIsSubstituterOpen(false)} className="text-slate-400 hover:text-white">&times;</button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {EXERCISE_LIBRARY.filter(e => e.id !== currentExerciseData.id).map(cand => (
                          <button
                            key={cand.id}
                            type="button"
                            onClick={() => handleSubstituteExercise(cand)}
                            className="p-2 rounded-lg bg-slate-900 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/60 text-left transition cursor-pointer"
                          >
                            <div className="font-bold text-xs text-slate-200">{cand.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              +{cand.primaryAttribute.toUpperCase()} • {cand.equipmentRequired.join(', ')}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-slate-400 space-y-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                      <Info className="w-3 h-3 text-cyan-400" />
                      Execution Form:
                    </div>
                    {currentExerciseData.instructions.map((inst, i) => (
                      <div key={i} className="text-[11px] leading-tight text-slate-300">
                        • {inst}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sets Table */}
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-[11px] font-mono font-bold text-slate-400 px-2 uppercase">
                  <span className="col-span-2">Set</span>
                  <span className="col-span-3">Weight (KG)</span>
                  <span className="col-span-3">Reps / Sec</span>
                  <span className="col-span-3 text-center">Status</span>
                  <span className="col-span-1"></span>
                </div>

                {currentExerciseLog?.sets.map((set, setIdx) => {
                  return (
                    <div
                      key={set.setNumber}
                      className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl border transition ${
                        set.completed
                          ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                          : 'bg-slate-900/50 border-slate-800'
                      }`}
                    >
                      <div className="col-span-2 font-mono font-bold text-xs text-slate-300 pl-1">
                        #{set.setNumber}
                      </div>

                      <div className="col-span-3">
                        <input
                          type="number"
                          value={set.weightKg ?? 0}
                          onChange={(e) => updateSetValues(setIdx, 'weightKg', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-center text-slate-200 focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div className="col-span-3">
                        <input
                          type="number"
                          value={set.reps ?? 10}
                          onChange={(e) => updateSetValues(setIdx, 'reps', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-center text-slate-200 focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div className="col-span-3 flex justify-center">
                        <button
                          type="button"
                          onClick={() => toggleSetCompletion(setIdx)}
                          className={`w-full py-1 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer ${
                            set.completed
                              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          {set.completed ? 'Done' : 'Log'}
                        </button>
                      </div>

                      <div className="col-span-1 flex justify-end">
                        <button
                          onClick={() => removeSet(setIdx)}
                          className="p-1 text-slate-600 hover:text-rose-400 transition cursor-pointer"
                          title="Remove set"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={addSet}
                  className="w-full py-2 rounded-xl bg-slate-900 border border-dashed border-slate-700 text-xs font-bold text-slate-300 hover:border-cyan-400 hover:text-cyan-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Additional Set
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {isSessionActive && (
          <div className="p-4 border-t border-slate-800/80 bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs font-mono text-slate-400 flex items-center gap-3">
              <span>
                Completed Sets:{' '}
                <span className="text-cyan-400 font-bold">
                  {activeExercises.flatMap(e => e.sets).filter(s => s.completed).length} / {activeExercises.flatMap(e => e.sets).length}
                </span>
              </span>
              <span>•</span>
              <span>Duration: {formatTime(elapsedSeconds)}</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleSaveDraft}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>

              <button
                onClick={handleFinish}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.4)] transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                Validate Workout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
