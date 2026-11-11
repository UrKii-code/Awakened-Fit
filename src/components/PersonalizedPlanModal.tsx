import React from 'react';
import { HunterProfile, Exercise } from '../types/hunter';
import { PlanGenerator, PersonalizedPlan, PlannedDaySession } from '../services/planGenerator';
import { 
  X, 
  Calendar, 
  Dumbbell, 
  HeartHandshake, 
  ShieldCheck, 
  Sparkles, 
  Play, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';

interface PersonalizedPlanModalProps {
  profile: HunterProfile;
  onStartDaySession: (session: PlannedDaySession) => void;
  onClose: () => void;
}

export const PersonalizedPlanModal: React.FC<PersonalizedPlanModalProps> = ({
  profile,
  onStartDaySession,
  onClose,
}) => {
  const plan: PersonalizedPlan = PlanGenerator.generatePlan(profile.onboarding);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-[#080d1a] border border-cyan-500/30 rounded-3xl shadow-[0_0_40px_rgba(0,229,255,0.2)] overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base font-['Cinzel',serif] text-slate-100">
                Personalized Hunter Regimen
              </h2>
              <div className="text-[11px] text-slate-400 font-mono">
                {plan.planTitle}
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

        {/* Adaptation & Safety Banner */}
        <div className="p-3.5 bg-gradient-to-r from-cyan-950/40 to-slate-900 border-b border-cyan-800/40 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-cyan-300 font-bold">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Bio-Calibrated Adaptive Program</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            {plan.adaptationReason}
          </p>

          {plan.appliedSubstitutions.length > 0 && (
            <div className="p-2 rounded-xl bg-amber-950/30 border border-amber-600/30 text-[10px] text-amber-300 space-y-1">
              <span className="font-bold uppercase tracking-wider">Active Injury Substitutions:</span>
              {plan.appliedSubstitutions.map((sub, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="text-slate-400 line-through">{sub.original}</span>
                  <span>&rarr;</span>
                  <span className="text-emerald-400 font-bold">{sub.substituted}</span>
                  <span className="text-slate-400">({sub.reason})</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 7-Day Schedule List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {plan.weeklySchedule.map((day) => {
            return (
              <div
                key={day.dayNumber}
                className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  day.isRestDay
                    ? 'bg-slate-900/40 border-slate-800/80'
                    : 'bg-slate-900/80 border-cyan-500/30 hover:border-cyan-400 shadow-sm'
                }`}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold bg-slate-800 text-cyan-400 border border-slate-700">
                      Day {day.dayNumber} • {day.dayName}
                    </span>
                    {day.isRestDay ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                        <HeartHandshake className="w-3 h-3" /> Scheduled Rest
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                        <Clock className="w-3 h-3" /> ~{day.estimatedMinutes} Mins
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-xs sm:text-sm text-slate-100">
                    {day.title}
                  </h3>

                  <p className="text-[11px] text-slate-400 leading-tight">
                    {day.focus}
                  </p>

                  {/* Movements breakdown */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {day.exercises.map(ex => (
                      <span key={ex.id} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300 font-mono">
                        {ex.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  {day.isRestDay ? (
                    <span className="text-[11px] text-slate-500 font-mono px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 inline-block">
                      Rest & Recover
                    </span>
                  ) : (
                    <button
                      onClick={() => onStartDaySession(day)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(0,229,255,0.3)] transition cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      Train Day {day.dayNumber}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
