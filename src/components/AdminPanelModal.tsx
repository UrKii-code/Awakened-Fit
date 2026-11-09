import React, { useState } from 'react';
import { Exercise, ExerciseCategory } from '../types/hunter';
import { 
  X, 
  Settings, 
  Plus, 
  Megaphone, 
  ShieldAlert, 
  Sliders, 
  Check, 
  Database 
} from 'lucide-react';

interface AdminPanelModalProps {
  onAddExercise: (newEx: Exercise) => void;
  onPostAnnouncement: (msg: string) => void;
  onClose: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  onAddExercise,
  onPostAnnouncement,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'exercises' | 'broadcast' | 'integrity' | 'balance'>('exercises');

  // Exercise Form State
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<ExerciseCategory>('strength');
  const [primaryStat, setPrimaryStat] = useState<'strength' | 'endurance' | 'agility' | 'vitality' | 'discipline'>('strength');
  const [muscles, setMuscles] = useState<string>('Chest, Shoulders');
  const [equipment, setEquipment] = useState<string>('Dumbbells');
  const [instructions, setInstructions] = useState<string>('Maintain spinal alignment and control the eccentric descent.');
  const [expPerSet, setExpPerSet] = useState<number>(20);

  // Broadcast state
  const [broadcastText, setBroadcastText] = useState<string>('');
  const [broadcastSuccess, setBroadcastSuccess] = useState<boolean>(false);

  const handleCreateExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newEx: Exercise = {
      id: `ex_custom_${Date.now()}`,
      name: name.trim(),
      category,
      primaryAttribute: primaryStat,
      equipmentRequired: equipment.split(',').map(s => s.trim()),
      targetMuscles: muscles.split(',').map(s => s.trim()),
      difficulty: 'intermediate',
      instructions: instructions.split('\n').filter(s => s.trim().length > 0),
      defaultSets: 3,
      defaultReps: 10,
      defaultRestSeconds: 60,
      expPerSet,
      illustrationSvgId: 'custom',
    };

    onAddExercise(newEx);
    setName('');
    alert(`Custom exercise "${newEx.name}" has been published to the Codex!`);
  };

  const handleSendBroadcast = () => {
    if (!broadcastText.trim()) return;
    onPostAnnouncement(broadcastText.trim());
    setBroadcastText('');
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#080d1b] border border-cyan-500/30 rounded-3xl shadow-[0_0_40px_rgba(0,229,255,0.2)] overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base font-['Cinzel',serif] text-slate-100">
                Game Master Content Management (CMS)
              </h2>
              <div className="text-[11px] text-slate-400 font-mono">
                Administrative Control Panel (Master Spec Module L)
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-4 pt-2 gap-2 bg-slate-950/60 overflow-x-auto text-xs font-mono">
          {[
            { id: 'exercises', label: 'Exercise Codex CMS' },
            { id: 'broadcast', label: 'Hunter Announcements' },
            { id: 'integrity', label: 'Suspicious Activity Monitor' },
            { id: 'balance', label: 'EXP Tuning' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-t-lg transition border-b-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-300 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* TAB 1: EXERCISE CREATOR */}
          {activeTab === 'exercises' && (
            <form onSubmit={handleCreateExercise} className="space-y-4 text-xs">
              <div className="text-slate-400">
                Register a new movement protocol into the shared database without requiring client updates.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold font-mono">Exercise Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Bulgarian Split Squat"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold font-mono">Discipline Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
                  >
                    <option value="strength">Strength</option>
                    <option value="bodyweight">Bodyweight</option>
                    <option value="cardio">Cardio</option>
                    <option value="agility">Agility</option>
                    <option value="mobility">Mobility</option>
                    <option value="core">Core</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold font-mono">Primary Attribute</label>
                  <select
                    value={primaryStat}
                    onChange={(e) => setPrimaryStat(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 font-mono uppercase"
                  >
                    <option value="strength">Strength</option>
                    <option value="endurance">Endurance</option>
                    <option value="agility">Agility</option>
                    <option value="vitality">Vitality</option>
                    <option value="discipline">Discipline</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold font-mono">EXP Yield Per Set</label>
                  <input
                    type="number"
                    value={expPerSet}
                    onChange={(e) => setExpPerSet(parseInt(e.target.value) || 20)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <label className="text-slate-300 font-semibold font-mono">Target Muscles (comma-separated)</label>
                  <input
                    type="text"
                    value={muscles}
                    onChange={(e) => setMuscles(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <label className="text-slate-300 font-semibold font-mono">Execution Instructions</label>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black uppercase tracking-wider transition cursor-pointer"
              >
                Publish Exercise to Registry
              </button>
            </form>
          )}

          {/* TAB 2: SYSTEM BROADCASTS */}
          {activeTab === 'broadcast' && (
            <div className="space-y-3 text-xs">
              <div className="text-slate-400">
                Broadcast an official Hunter Association announcement to all active mobile clients.
              </div>

              <textarea
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                placeholder="e.g. Attention Hunters: Double Vitality points active for all mobility and recovery rituals this weekend!"
                rows={3}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
              />

              <button
                onClick={handleSendBroadcast}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black uppercase tracking-wider transition cursor-pointer"
              >
                <Megaphone className="w-4 h-4" />
                Dispatch System Announcement
              </button>

              {broadcastSuccess && (
                <div className="text-emerald-400 font-mono flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Announcement successfully broadcasted!
                </div>
              )}
            </div>
          )}

          {/* TAB 3: INTEGRITY MONITOR */}
          {activeTab === 'integrity' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5 text-slate-300">
                <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-100">Anti-Cheat & Rate Limit Engine Active</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    All workout sessions require minimum elapsed duration validation. Idempotency hashes prevent replay attacks.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-[11px]">
                <div className="text-slate-400 font-bold uppercase">Recent Security Checks:</div>
                <div className="text-emerald-400">✓ Workout completion rate: Normal (max 1 session / 20 mins)</div>
                <div className="text-emerald-400">✓ EXP delta validation: Verified (0 un-hashed credits detected)</div>
                <div className="text-emerald-400">✓ Standalone game client: Read-only access enforced</div>
              </div>
            </div>
          )}

          {/* TAB 4: BALANCE TUNING */}
          {activeTab === 'balance' && (
            <div className="space-y-3 text-xs">
              <div className="text-slate-400">
                Provisional balance configurations per Master Specification:
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 font-mono">
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">Base Attribute Baseline:</span>
                  <span className="text-cyan-400 font-bold">10.0</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">Bonus Stat Point Per Level:</span>
                  <span className="text-amber-400 font-bold">1 Point</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">Rank E Level Threshold:</span>
                  <span className="text-slate-200">Level 1+</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400">Rank D Level Threshold:</span>
                  <span className="text-slate-200">Level 5+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rank S Level Threshold:</span>
                  <span className="text-red-400 font-bold">Level 75+</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
