import React, { useState } from 'react';
import { Exercise, ExerciseCategory } from '../types/hunter';
import { EXERCISE_LIBRARY } from '../data/exercises';
import { 
  X, 
  Search, 
  Dumbbell, 
  Filter, 
  Info, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  PlusCircle, 
  Activity, 
  Wind, 
  Brain, 
  ShieldAlert 
} from 'lucide-react';

interface ExerciseLibraryModalProps {
  onClose: () => void;
  onSelectForWorkout?: (exercise: Exercise) => void;
  userLimitations?: string[];
}

export const ExerciseLibraryModal: React.FC<ExerciseLibraryModalProps> = ({
  onClose,
  onSelectForWorkout,
  userLimitations = [],
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const categories: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'All Disciplines' },
    { id: 'strength', label: 'Strength' },
    { id: 'bodyweight', label: 'Bodyweight' },
    { id: 'cardio', label: 'Cardio' },
    { id: 'agility', label: 'Agility' },
    { id: 'mobility', label: 'Mobility' },
    { id: 'core', label: 'Core / Will' },
  ];

  const filteredExercises = EXERCISE_LIBRARY.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.targetMuscles.some(m => m.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ex.equipmentRequired.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || ex.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Safety filter check
  const hasCaution = (ex: Exercise): string | null => {
    if (userLimitations.includes('Lower Back Sensitivity') && (ex.id === 'deadlift' || ex.targetMuscles.includes('Spinal Erectors'))) {
      return 'Caution: Heavy spinal loading. Recommended: lighten weight or substitute with chest-supported movements.';
    }
    if (userLimitations.includes('Knee Discomfort') && (ex.id === 'high_intensity_burpees' || ex.targetMuscles.includes('Quadriceps'))) {
      return 'Caution: High knee impact. Recommended: control eccentric speed or substitute with cycling.';
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#080d1b] border border-cyan-500/30 rounded-3xl shadow-[0_0_40px_rgba(0,229,255,0.15)] overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base font-['Cinzel',serif] text-slate-100">
                Hunter Exercise Codex
              </h2>
              <div className="text-[11px] text-slate-400 font-mono">
                {EXERCISE_LIBRARY.length} Master Movement Protocols & Biological Affinities
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

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/60 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by movement name, muscle group, or gear..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer text-xs font-semibold ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid List & Detail View */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredExercises.map(ex => {
            const isSelected = selectedExercise?.id === ex.id;
            const caution = hasCaution(ex);

            return (
              <div
                key={ex.id}
                onClick={() => setSelectedExercise(ex)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-2.5 ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-400 ring-1 ring-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-100">{ex.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400 uppercase">
                      {ex.category}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                    <span>Target: {ex.targetMuscles.slice(0, 2).join(', ')}</span>
                    <span>•</span>
                    <span className="text-slate-500">{ex.equipmentRequired.join(', ')}</span>
                  </div>

                  {caution && (
                    <div className="mt-2 p-2 rounded-lg bg-amber-950/40 border border-amber-600/40 text-[10px] text-amber-300 flex items-start gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{caution}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400 font-bold">+{ex.primaryAttribute.toUpperCase()}</span>
                    {ex.secondaryAttribute && (
                      <span className="text-slate-500">/ +{ex.secondaryAttribute.toUpperCase()}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400">~{ex.expPerSet} EXP/set</span>
                    {onSelectForWorkout && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectForWorkout(ex);
                        }}
                        className="px-2 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 font-bold transition flex items-center gap-1"
                      >
                        <PlusCircle className="w-3 h-3" />
                        Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Exercise Full Instruction Drawer */}
        {selectedExercise && (
          <div className="p-4 border-t border-slate-800 bg-[#060a14] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400" />
                <h4 className="font-bold text-xs text-slate-200">
                  {selectedExercise.name} Form Mechanics
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Rest Interval: {selectedExercise.defaultRestSeconds}s
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
              {selectedExercise.instructions.map((inst, i) => (
                <div key={i} className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 leading-relaxed">
                  <span className="font-bold text-cyan-400 mr-1">#{i + 1}</span>
                  {inst}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
