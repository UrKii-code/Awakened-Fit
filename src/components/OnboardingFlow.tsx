import React, { useState } from 'react';
import { 
  HunterProfile, 
  HunterArchetype, 
  HunterOnboardingData 
} from '../types/hunter';
import { ARCHETYPES } from '../data/ranks';
import { BrandLogo } from './BrandLogo';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Dumbbell, 
  Home, 
  Building2, 
  ShieldAlert, 
  HeartHandshake, 
  Flame, 
  Zap, 
  Shield 
} from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: (profile: HunterProfile) => void;
  onCancel?: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 9;

  // Form state
  const [hunterName, setHunterName] = useState<string>('');
  const [archetype, setArchetype] = useState<HunterArchetype>('berserker');
  const [ageRange, setAgeRange] = useState<string>('25-34');
  const [fitnessExperience, setFitnessExperience] = useState<'beginner' | 'intermediate' | 'advanced' | 'veteran'>('beginner');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active'>('lightly_active');
  const [primaryGoal, setPrimaryGoal] = useState<'build_strength' | 'boost_endurance' | 'lose_fat' | 'athletic_agility' | 'overall_health'>('build_strength');
  const [secondaryGoals, setSecondaryGoals] = useState<string[]>(['overall_health']);
  const [environment, setEnvironment] = useState<'home' | 'commercial_gym' | 'hybrid' | 'outdoors'>('home');
  const [equipment, setEquipment] = useState<string[]>(['Bodyweight']);
  const [daysPerWeek, setDaysPerWeek] = useState<number>(3);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [limitations, setLimitations] = useState<string[]>([]);
  const [isAwakening, setIsAwakening] = useState<boolean>(false);

  const equipmentOptions = [
    'Bodyweight',
    'Dumbbells',
    'Barbell & Plates',
    'Pull-Up Bar',
    'Resistance Bands',
    'Kettlebells',
    'Cardio Machines',
    'Yoga Mat',
  ];

  const limitationOptions = [
    'Lower Back Sensitivity',
    'Knee Discomfort',
    'Shoulder Impingement',
    'Wrist Strain',
    'High Blood Pressure / Cardiac Cautions',
    'None / Fully Cleared',
  ];

  const toggleEquipment = (item: string) => {
    if (equipment.includes(item)) {
      if (equipment.length > 1) {
        setEquipment(equipment.filter(e => e !== item));
      }
    } else {
      setEquipment([...equipment, item]);
    }
  };

  const toggleLimitation = (item: string) => {
    if (item === 'None / Fully Cleared') {
      setLimitations(['None / Fully Cleared']);
      return;
    }
    const filtered = limitations.filter(l => l !== 'None / Fully Cleared');
    if (filtered.includes(item)) {
      setLimitations(filtered.filter(l => l !== item));
    } else {
      setLimitations([...filtered, item]);
    }
  };

  const handleFinalAwakening = () => {
    setIsAwakening(true);

    setTimeout(() => {
      const selectedArch = ARCHETYPES[archetype];
      
      const onboardingData: HunterOnboardingData = {
        hunterName: hunterName.trim() || 'Shadow Hunter',
        archetype,
        ageRange,
        fitnessExperience,
        currentActivityLevel: activityLevel,
        primaryGoal,
        secondaryGoals,
        trainingEnvironment: environment,
        availableEquipment: equipment,
        trainingDaysPerWeek: daysPerWeek,
        preferredDurationMinutes: durationMinutes,
        physicalLimitations: limitations,
      };

      // Base attributes 10 with archetype affinity
      const baseAttributes = {
        strength: 10 + (archetype === 'berserker' ? 2 : 0),
        endurance: 10 + (archetype === 'phantom' ? 1 : 0),
        agility: 10 + (archetype === 'phantom' ? 2 : (archetype === 'arcane' ? 1 : 0)),
        vitality: 10 + (archetype === 'guardian' ? 2 : (archetype === 'berserker' ? 1 : 0)),
        discipline: 10 + (archetype === 'arcane' ? 2 : (archetype === 'guardian' ? 1 : 0)),
      };

      const newProfile: HunterProfile = {
        id: `hunter_${Date.now()}`,
        name: hunterName.trim() || 'Shadow Hunter',
        title: selectedArch.title,
        archetype,
        rank: 'E',
        level: 1,
        currentExp: 0,
        nextLevelExp: 150,
        lifetimeExp: 0,
        unallocatedStatPoints: 1, // 1 starting stat point for awakening!
        attributes: baseAttributes,
        tokens: 100, // Welcome bounty
        evolutionStones: 1,
        achievementPoints: 10,
        streak: {
          currentDays: 1,
          bestDays: 1,
          lastActiveDate: new Date().toISOString().split('T')[0],
          totalWorkouts: 0,
          restDaysTaken: 0,
        },
        onboarding: onboardingData,
        isAwakened: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onComplete(newProfile);
    }, 2200);
  };

  return (
    <div className="relative min-h-[90vh] flex flex-col justify-between max-w-2xl mx-auto p-4 sm:p-6 bg-[#080d1a] border border-cyan-500/20 rounded-3xl shadow-[0_0_35px_rgba(0,229,255,0.08)] my-4">
      {/* Runic Glow Overlays */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Progress Bar & Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <BrandLogo size="sm" />
          <span className="text-xs font-mono font-bold text-cyan-400 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80">
            Rite of Awakening {step} / {totalSteps}
          </span>
        </div>

        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mb-6 border border-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 transition-all duration-300 shadow-[0_0_8px_rgba(0,229,255,0.6)]"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Dynamic Step Content */}
      <div className="py-2 flex-1">
        {/* STEP 1: Welcome Screen & The Hunter Code */}
        {step === 1 && (
          <div className="text-center space-y-5 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.3)]">
              <Sparkles className="w-10 h-10 text-cyan-300 animate-pulse" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-['Cinzel',serif] tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-sky-100 to-purple-200">
              Awaken Your Inner Hunter
            </h2>

            <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              In this realm, words mean nothing without sweat. Every rep, sprint, and deliberate recovery in the real world directly expands your Hunter attributes, unlocks legendary ranks, and equips your avatar.
            </p>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-left text-xs text-slate-400 space-y-2 max-w-md mx-auto">
              <div className="font-bold text-cyan-300 uppercase tracking-wider text-[11px] font-['Rajdhani',sans-serif]">
                The Three Iron Precepts:
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>Real-world effort authoritatively drives all game progression.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>Rest & recovery days are honored as sacred discipline—never penalized.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>Your Hunter data is private, secure, and ready to carry into the game.</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Hunter Name & Identity */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-xl font-bold font-['Cinzel',serif] text-cyan-200">
              Name Your Hunter
            </h3>
            <p className="text-xs text-slate-400">
              Choose the designation that will be engraved into your Hunter Registry and shared with the standalone game client.
            </p>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-['Rajdhani',sans-serif]">
                Hunter Alias / Codename
              </label>
              <input
                type="text"
                value={hunterName}
                onChange={(e) => setHunterName(e.target.value)}
                placeholder="e.g. Sung, Valkyrie, IronClad"
                className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition font-mono text-sm"
                autoFocus
              />
            </div>

            <div className="text-xs text-slate-500 italic">
              Rank E candidates typically retain their title as &quot;Newly Awakened&quot; until Level 5.
            </div>
          </div>
        )}

        {/* STEP 3: Archetype Selection */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h3 className="text-xl font-bold font-['Cinzel',serif] text-cyan-200">
                Select Your Combat Archetype
              </h3>
              <p className="text-xs text-slate-400">
                Your archetype determines your initial attribute affinities and future evolution paths.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {(Object.keys(ARCHETYPES) as HunterArchetype[]).map((key) => {
                const arch = ARCHETYPES[key];
                const isSelected = archetype === key;

                return (
                  <div
                    key={key}
                    onClick={() => setArchetype(key)}
                    className={`relative p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-900/90 border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.3)] ring-1 ring-cyan-400'
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${arch.accentColor}25`, color: arch.accentColor }}
                      >
                        {key === 'berserker' && <Flame className="w-4 h-4" />}
                        {key === 'phantom' && <Zap className="w-4 h-4" />}
                        {key === 'guardian' && <Shield className="w-4 h-4" />}
                        {key === 'arcane' && <Sparkles className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-100">{arch.name}</div>
                        <div className="text-[10px] text-cyan-400 font-mono uppercase">{arch.title}</div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                      {arch.description}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-300">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                        Primary: +{arch.primaryStat.toUpperCase()}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                        Sec: +{arch.secondaryStat.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Primary Fitness Goal */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-xl font-bold font-['Cinzel',serif] text-cyan-200">
              Primary Objective
            </h3>
            <p className="text-xs text-slate-400">
              Your workouts and quest generation will adapt specifically to prioritize this fitness outcome.
            </p>

            <div className="space-y-2.5 pt-1">
              {[
                { id: 'build_strength', label: 'Raw Strength & Muscle Density', desc: 'Focus on progressive resistance, heavy bodyweight & barbell power.', icon: <Dumbbell className="w-4 h-4 text-amber-400" /> },
                { id: 'boost_endurance', label: 'Cardio & Stamina Engine', desc: 'Develop high-volume cardiovascular resilience, tempo running & cycling.', icon: <Zap className="w-4 h-4 text-sky-400" /> },
                { id: 'athletic_agility', label: 'Speed, Agility & Explosive Power', desc: 'Sprints, plyometrics, calisthenics control, and rapid interval bursts.', icon: <Flame className="w-4 h-4 text-emerald-400" /> },
                { id: 'overall_health', label: 'Functional Longevity & Vitality', desc: 'Balanced full-body mobility, joint resilience, and consistent wellness.', icon: <Shield className="w-4 h-4 text-purple-400" /> },
              ].map((g) => {
                const isSelected = primaryGoal === g.id;
                return (
                  <div
                    key={g.id}
                    onClick={() => setPrimaryGoal(g.id as any)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-400 ring-1 ring-cyan-400'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 shrink-0">
                      {g.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm text-slate-200">{g.label}</div>
                      <div className="text-xs text-slate-400">{g.desc}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-1" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: Experience & Current Activity */}
        {step === 5 && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="text-xl font-bold font-['Cinzel',serif] text-cyan-200">
              Physical Baseline
            </h3>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-['Rajdhani',sans-serif]">
                Fitness Experience
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'beginner', title: 'Beginner', desc: '0 - 6 months' },
                  { id: 'intermediate', title: 'Intermediate', desc: '6m - 2 years' },
                  { id: 'advanced', title: 'Advanced', desc: '2 - 5 years' },
                  { id: 'veteran', title: 'Veteran Athlete', desc: '5+ years' },
                ].map((exp) => (
                  <button
                    key={exp.id}
                    type="button"
                    onClick={() => setFitnessExperience(exp.id as any)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                      fitnessExperience === exp.id
                        ? 'bg-slate-900 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400'
                        : 'bg-slate-900/40 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs">{exp.title}</div>
                    <div className="text-[10px] text-slate-500">{exp.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-['Rajdhani',sans-serif]">
                Current Daily Activity
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'sedentary', label: 'Desk Job / Sedentary' },
                  { id: 'lightly_active', label: 'Light (1-2 walks/wk)' },
                  { id: 'moderately_active', label: 'Moderate (Active daily)' },
                  { id: 'very_active', label: 'Heavy Labor / Athletic' },
                ].map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setActivityLevel(act.id as any)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium cursor-pointer transition ${
                      activityLevel === act.id
                        ? 'bg-slate-900 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Environment & Equipment */}
        {step === 6 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-xl font-bold font-['Cinzel',serif] text-cyan-200">
              Training Domain & Arsenal
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-['Rajdhani',sans-serif]">
                Where will you train?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'home', label: 'Home', icon: <Home className="w-3.5 h-3.5" /> },
                  { id: 'commercial_gym', label: 'Gym', icon: <Building2 className="w-3.5 h-3.5" /> },
                  { id: 'hybrid', label: 'Hybrid', icon: <Dumbbell className="w-3.5 h-3.5" /> },
                ].map((env) => (
                  <button
                    key={env.id}
                    type="button"
                    onClick={() => setEnvironment(env.id as any)}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      environment === env.id
                        ? 'bg-slate-900 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    {env.icon}
                    {env.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-['Rajdhani',sans-serif]">
                Select Available Gear
              </label>
              <div className="grid grid-cols-2 gap-2">
                {equipmentOptions.map((item) => {
                  const isChecked = equipment.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleEquipment(item)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition ${
                        isChecked
                          ? 'bg-cyan-950/40 border-cyan-500/80 text-cyan-200'
                          : 'bg-slate-900/40 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span>{item}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Weekly Schedule & Duration */}
        {step === 7 && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="text-xl font-bold font-['Cinzel',serif] text-cyan-200">
              Training Schedule & Commitment
            </h3>
            <p className="text-xs text-slate-400">
              Consistency outmatches raw volume. We schedule mandatory rest days to keep your streak intact.
            </p>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                <span>Training Days Per Week</span>
                <span className="font-mono text-cyan-400 text-sm">{daysPerWeek} Days</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[2, 3, 4, 5, 6].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDaysPerWeek(d)}
                    className={`p-3 rounded-xl border font-bold text-sm cursor-pointer transition ${
                      daysPerWeek === d
                        ? 'bg-slate-900 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <div className="text-[11px] text-slate-500 text-center">
                Remaining {7 - daysPerWeek} days are scheduled as Vitality & Recovery intervals.
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                <span>Preferred Session Length</span>
                <span className="font-mono text-cyan-400 text-sm">{durationMinutes} Minutes</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[20, 30, 45, 60].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDurationMinutes(m)}
                    className={`p-3 rounded-xl border font-bold text-xs cursor-pointer transition ${
                      durationMinutes === m
                        ? 'bg-slate-900 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: Limitations & Safety Filter */}
        {step === 8 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 text-amber-400">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <h3 className="text-xl font-bold font-['Cinzel',serif] text-slate-100">
                Hunter Safeguards & Limitations
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Select any joints or areas with prior injuries. The workout engine will automatically substitute high-impact exercises with safer alternatives.
            </p>

            <div className="space-y-2 pt-1">
              {limitationOptions.map((lim) => {
                const isSelected = limitations.includes(lim);
                return (
                  <button
                    key={lim}
                    type="button"
                    onClick={() => toggleLimitation(lim)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left text-xs font-medium cursor-pointer transition ${
                      isSelected
                        ? 'bg-amber-950/30 border-amber-500/70 text-amber-200'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>{lim}</span>
                    {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 9: The Awakening Ceremony */}
        {step === 9 && (
          <div className="text-center space-y-6 py-4 animate-fade-in">
            {isAwakening ? (
              <div className="space-y-4 py-8">
                <div className="w-24 h-24 mx-auto relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-cyan-400/40 rounded-full blur-xl animate-ping" />
                  <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-[0_0_30px_rgba(0,229,255,0.8)]">
                    E
                  </div>
                </div>
                <h3 className="text-2xl font-black font-['Cinzel',serif] text-cyan-300 animate-pulse">
                  Awakening Hunter Crest...
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Synthesizing biological profile into persistent Hunter attributes...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.4)]">
                  <HeartHandshake className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-2xl font-black font-['Cinzel',serif] text-slate-100">
                    Ready to Awaken
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    Your profile has been calibrated. Press below to seal your Hunter covenant.
                  </p>
                </div>

                {/* Summary Card */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 max-w-sm mx-auto text-left text-xs space-y-2">
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">Hunter Alias:</span>
                    <span className="font-bold text-cyan-300">{hunterName.trim() || 'Shadow Hunter'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">Class Archetype:</span>
                    <span className="font-bold text-purple-300 capitalize">{archetype}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">Starting Rank:</span>
                    <span className="font-bold text-slate-200">Rank E (Newly Awakened)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Schedule:</span>
                    <span className="font-bold text-slate-200">{daysPerWeek} Days / {durationMinutes} min</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons Footer */}
      {!isAwakening && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/70 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={() => {
                if (step === 2 && !hunterName.trim()) {
                  setHunterName('Shadow Hunter');
                }
                setStep(step + 1);
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,229,255,0.4)] transition cursor-pointer"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalAwakening}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(0,229,255,0.6)] animate-pulse transition cursor-pointer"
            >
              Commence Awakening
              <Sparkles className="w-4 h-4 fill-slate-950" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
