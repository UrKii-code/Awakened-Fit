import React, { useState, useEffect } from 'react';
import { 
  HunterProfile, 
  WorkoutSession, 
  Quest, 
  Achievement, 
  HunterRank, 
  AttributeScores, 
  RewardTransaction,
  Exercise 
} from './types/hunter';
import { StorageService, DEFAULT_HUNTER_PROFILE } from './services/storageService';
import { ProgressionEngine } from './services/progressionEngine';
import { HUNTER_RANKS, ARCHETYPES } from './data/ranks';
import { WORKOUT_TEMPLATES, EXERCISE_LIBRARY } from './data/exercises';
import { EvolutionTier } from './data/evolution';
import { CosmeticItem, COSMETIC_STORE_ITEMS } from './data/store';

// Components
import { HunterHUD } from './components/HunterHUD';
import { AttributeRadar } from './components/AttributeRadar';
import { OnboardingFlow } from './components/OnboardingFlow';
import { WorkoutTrackerModal } from './components/WorkoutTrackerModal';
import { LevelUpModal } from './components/LevelUpModal';
import { GameSyncModal } from './components/GameSyncModal';
import { ExerciseLibraryModal } from './components/ExerciseLibraryModal';
import { AnalyticsView } from './components/AnalyticsView';
import { CharacterEvolutionModal } from './components/CharacterEvolutionModal';
import { ArmoryStoreModal } from './components/ArmoryStoreModal';
import { LedgerModal } from './components/LedgerModal';
import { AdminPanelModal } from './components/AdminPanelModal';

// Icons
import { 
  Dumbbell, 
  Trophy, 
  Calendar, 
  Flame, 
  HeartHandshake, 
  Sparkles, 
  CheckCircle2, 
  Plus, 
  RotateCcw, 
  Smartphone, 
  Monitor, 
  History, 
  Award, 
  BookOpen, 
  TrendingUp, 
  ShoppingBag, 
  FileText, 
  Settings, 
  Megaphone 
} from 'lucide-react';

export default function App() {
  // Master State
  const [profile, setProfile] = useState<HunterProfile>(DEFAULT_HUNTER_PROFILE);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  
  // Cosmetic state
  const [ownedCosmetics, setOwnedCosmetics] = useState<string[]>([]);
  const [equippedAura, setEquippedAura] = useState<string | null>(null);

  // Navigation
  const [activeTab, setActiveTab] = useState<'hub' | 'workouts' | 'quests' | 'analytics' | 'character'>('hub');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  
  // Modals
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [isExerciseCodexOpen, setIsExerciseCodexOpen] = useState<boolean>(false);
  const [isEvolutionModalOpen, setIsEvolutionModalOpen] = useState<boolean>(false);
  const [isArmoryOpen, setIsArmoryOpen] = useState<boolean>(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  const [levelUpData, setLevelUpData] = useState<{
    isOpen: boolean;
    level: number;
    levelsGained: number;
    newRankPromoted: HunterRank | null;
  }>({
    isOpen: false,
    level: 1,
    levelsGained: 0,
    newRankPromoted: null,
  });

  // Notifications banner
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Initial Load from Storage
  useEffect(() => {
    const loadedProfile = StorageService.getProfile();
    const loadedWorkouts = StorageService.getWorkouts();
    const loadedQuests = StorageService.getQuests();
    const loadedAchievements = StorageService.getAchievements();
    const loadedTransactions = StorageService.getTransactions();

    setProfile(loadedProfile);
    setWorkouts(loadedWorkouts);
    setQuests(loadedQuests);
    setAchievements(loadedAchievements);
    setTransactions(loadedTransactions);

    // Load saved cosmetic inventory
    try {
      const savedOwned = localStorage.getItem('awakened_fit_cosmetics_v1');
      if (savedOwned) setOwnedCosmetics(JSON.parse(savedOwned));
      const savedAura = localStorage.getItem('awakened_fit_equipped_aura_v1');
      if (savedAura) setEquippedAura(savedAura);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const showNotice = (msg: string) => {
    setBannerNotice(msg);
    setTimeout(() => setBannerNotice(null), 4000);
  };

  // Onboarding Complete Handler
  const handleOnboardingComplete = (newProfile: HunterProfile) => {
    setProfile(newProfile);
    StorageService.saveProfile(newProfile);
    showNotice(`Awakening Verified! Welcome, Hunter ${newProfile.name}.`);
  };

  // Workout Session Finished & Validated Handler
  const handleFinishWorkout = (session: WorkoutSession) => {
    setIsWorkoutModalOpen(false);

    // 1. Authoritative calculation of rewards
    const rewards = ProgressionEngine.calculateWorkoutRewards(session);
    session.expEarned = rewards.expEarned;
    session.tokensEarned = rewards.tokensEarned;
    session.attributeGains = rewards.attributeGains;
    session.validationNotes = rewards.validationNotes;
    session.state = 'rewarded';

    // 2. Apply to profile
    const result = ProgressionEngine.applyWorkoutRewardsToProfile(
      profile,
      rewards,
      transactions,
      session.id
    );

    // 3. Update Quests (daily workout, sets volume)
    const totalCompletedSets = session.exercises.flatMap(e => e.sets).filter(s => s.completed).length;
    const updatedQuests = quests.map(q => {
      let current = q.currentCount;
      if (q.id === 'quest_daily_workout') current = 1;
      if (q.id === 'quest_daily_sets') current += totalCompletedSets;
      if (q.id === 'quest_weekly_consistency') current += 1;
      if (q.id === 'quest_weekly_volume') current += session.durationMinutes;

      const isCompleted = current >= q.targetCount;
      return { ...q, currentCount: current, isCompleted };
    });

    // 4. Update Achievements (First Blood, etc.)
    const updatedAchievements = achievements.map(a => {
      if (a.id === 'ach_first_blood' && !a.isUnlocked) {
        return { ...a, isUnlocked: true, unlockedAt: new Date().toISOString() };
      }
      if (a.id === 'ach_century_sets' && !a.isUnlocked) {
        const lifetimeSets = [...workouts, session].flatMap(w => w.exercises).flatMap(e => e.sets).filter(s => s.completed).length;
        if (lifetimeSets >= 100) {
          return { ...a, isUnlocked: true, unlockedAt: new Date().toISOString() };
        }
      }
      return a;
    });

    // Persist all updates
    const updatedWorkouts = [session, ...workouts];
    setWorkouts(updatedWorkouts);
    setQuests(updatedQuests);
    setAchievements(updatedAchievements);
    setTransactions(result.transactions);
    setProfile(result.updatedProfile);

    StorageService.saveWorkouts(updatedWorkouts);
    StorageService.saveQuests(updatedQuests);
    StorageService.saveAchievements(updatedAchievements);
    StorageService.saveTransactions(result.transactions);
    StorageService.saveProfile(result.updatedProfile);

    // If level-up occurred, show modal
    if (result.levelsGained > 0) {
      setLevelUpData({
        isOpen: true,
        level: result.updatedProfile.level,
        levelsGained: result.levelsGained,
        newRankPromoted: result.newRankPromoted,
      });
    } else {
      showNotice(`Workout Validated: +${rewards.expEarned} EXP, +${rewards.tokensEarned} Tokens gained!`);
    }
  };

  // Stat point allocation handler
  const handleAllocateStat = (statKey: keyof AttributeScores) => {
    const updated = ProgressionEngine.allocateStatPoint(profile, statKey);
    setProfile(updated);
    StorageService.saveProfile(updated);
    showNotice(`+1 ${statKey.toUpperCase()} allocated! Total: ${updated.attributes[statKey].toFixed(1)}`);
  };

  // Quest Reward Claim Handler
  const handleClaimQuest = (quest: Quest) => {
    if (!quest.isCompleted || quest.isClaimed) return;

    const result = ProgressionEngine.claimQuestRewards(profile, quest, transactions);
    const updatedQuests = quests.map(q => q.id === quest.id ? { ...q, isClaimed: true } : q);

    setQuests(updatedQuests);
    setTransactions(result.transactions);
    setProfile(result.updatedProfile);

    StorageService.saveQuests(updatedQuests);
    StorageService.saveTransactions(result.transactions);
    StorageService.saveProfile(result.updatedProfile);

    showNotice(`Quest Claimed: +${quest.expReward} EXP, +${quest.tokenReward} Tokens!`);
  };

  // Sacred Rest Day Logger
  const handleLogRestDay = () => {
    const updatedProfile: HunterProfile = {
      ...profile,
      streak: {
        ...profile.streak,
        currentDays: profile.streak.currentDays + 1,
        bestDays: Math.max(profile.streak.bestDays, profile.streak.currentDays + 1),
        restDaysTaken: profile.streak.restDaysTaken + 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
      },
      attributes: {
        ...profile.attributes,
        vitality: Number((profile.attributes.vitality + 0.25).toFixed(2)),
      },
      tokens: profile.tokens + 10,
    };

    const updatedQuests = quests.map(q => {
      if (q.id === 'quest_daily_recovery') {
        return { ...q, currentCount: 1, isCompleted: true };
      }
      return q;
    });

    const updatedAchievements = achievements.map(a => {
      if (a.id === 'ach_mindful_rest' && !a.isUnlocked) {
        return { ...a, isUnlocked: true, unlockedAt: new Date().toISOString() };
      }
      return a;
    });

    setProfile(updatedProfile);
    setQuests(updatedQuests);
    setAchievements(updatedAchievements);

    StorageService.saveProfile(updatedProfile);
    StorageService.saveQuests(updatedQuests);
    StorageService.saveAchievements(updatedAchievements);

    showNotice('Rest & Recovery logged. Streak preserved (+0.25 Vitality, +10 Tokens).');
  };

  // Cosmetic purchase handler
  const handlePurchaseCosmetic = (item: CosmeticItem) => {
    if (profile.tokens < item.tokenPrice) {
      showNotice('Insufficient Hunter Tokens.');
      return;
    }

    const updatedTokens = profile.tokens - item.tokenPrice;
    const updatedOwned = [...ownedCosmetics, item.id];
    const updatedProfile = { ...profile, tokens: updatedTokens };

    setProfile(updatedProfile);
    setOwnedCosmetics(updatedOwned);
    setEquippedAura(item.id);

    StorageService.saveProfile(updatedProfile);
    localStorage.setItem('awakened_fit_cosmetics_v1', JSON.stringify(updatedOwned));
    localStorage.setItem('awakened_fit_equipped_aura_v1', item.id);

    showNotice(`Acquired and equipped "${item.name}"!`);
  };

  const handleEquipCosmetic = (itemId: string) => {
    setEquippedAura(itemId);
    localStorage.setItem('awakened_fit_equipped_aura_v1', itemId);
    const item = COSMETIC_STORE_ITEMS.find(i => i.id === itemId);
    showNotice(`Equipped ${item?.name || 'Aura'}.`);
  };

  // Title update handler
  const handleUpdateTitle = (newTitle: string) => {
    const updated = { ...profile, title: newTitle };
    setProfile(updated);
    StorageService.saveProfile(updated);
    showNotice(`Title Equipped: "${newTitle}"`);
  };

  // Evolution handler
  const handleEvolve = (tier: EvolutionTier) => {
    if (profile.evolutionStones < tier.requiredStones) {
      showNotice('Insufficient Evolution Stones.');
      return;
    }

    const updated: HunterProfile = {
      ...profile,
      title: tier.title,
      evolutionStones: profile.evolutionStones - tier.requiredStones,
      attributes: {
        ...profile.attributes,
        strength: Number((profile.attributes.strength + 1).toFixed(2)),
        vitality: Number((profile.attributes.vitality + 1).toFixed(2)),
      },
    };

    setProfile(updated);
    StorageService.saveProfile(updated);
    showNotice(`Ascension Complete! Reached Tier ${tier.tierNumber}: ${tier.name}`);
  };

  // Reset demo data handler
  const handleResetData = () => {
    if (confirm('Reset Hunter profile and return to Onboarding? All progress will be re-initialized.')) {
      StorageService.resetAllData();
      setProfile(DEFAULT_HUNTER_PROFILE);
      setWorkouts([]);
      showNotice('Profile reset to unawakened state.');
    }
  };

  // If user is not yet awakened, show full-screen Onboarding
  if (!profile.isAwakened) {
    return (
      <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col justify-center items-center p-3 sm:p-6 font-['Inter',sans-serif]">
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  const currentRank = HUNTER_RANKS[profile.rank] || HUNTER_RANKS.E;
  const currentArchetype = ARCHETYPES[profile.archetype] || ARCHETYPES.berserker;
  const equippedItem = COSMETIC_STORE_ITEMS.find(i => i.id === equippedAura);

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 font-['Inter',sans-serif] flex flex-col items-center">
      
      {/* Viewport Frame Toggle & Game Master Bar */}
      <div className="w-full bg-[#03060c] border-b border-slate-900 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>AWAKENED FIT • PHASE 6 ONLINE</span>
        </div>

        <div className="flex items-center gap-2">
          {/* GM Tools Quick Triggers */}
          <button
            onClick={() => setIsArmoryOpen(true)}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/40 border border-amber-600/40 text-amber-300 hover:bg-amber-900/60 transition cursor-pointer"
            title="Hunter Token Armory"
          >
            <ShoppingBag className="w-3 h-3" />
            <span className="hidden sm:inline">Armory</span>
          </button>

          <button
            onClick={() => setIsLedgerOpen(true)}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-600/40 text-cyan-300 hover:bg-cyan-900/60 transition cursor-pointer"
            title="Progression Event Ledger"
          >
            <FileText className="w-3 h-3" />
            <span className="hidden sm:inline">Ledger</span>
          </button>

          <button
            onClick={() => setIsAdminOpen(true)}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950/40 border border-purple-600/40 text-purple-300 hover:bg-purple-900/60 transition cursor-pointer"
            title="Game Master CMS"
          >
            <Settings className="w-3 h-3" />
            <span className="hidden sm:inline">CMS</span>
          </button>

          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded border transition cursor-pointer ${
              isMobileFrame 
                ? 'bg-cyan-950/80 border-cyan-500/80 text-cyan-300' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isMobileFrame ? <Smartphone className="w-3 h-3 text-cyan-400" /> : <Monitor className="w-3 h-3" />}
            <span className="hidden sm:inline">{isMobileFrame ? '390px' : 'Fluid'}</span>
          </button>
          
          <button
            onClick={handleResetData}
            title="Reset profile to start onboarding again"
            className="p-1 text-slate-600 hover:text-rose-400 transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div 
        className={`w-full flex-1 flex flex-col transition-all duration-300 ${
          isMobileFrame 
            ? 'max-w-[420px] my-4 rounded-[40px] border-[6px] border-slate-800 shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden bg-[#070b18]' 
            : 'max-w-5xl'
        }`}
      >
        {/* Sticky Header HUD */}
        <HunterHUD
          profile={profile}
          onOpenSync={() => setIsSyncModalOpen(true)}
          onStartWorkout={() => setIsWorkoutModalOpen(true)}
          onOpenProfile={() => setActiveTab('character')}
        />

        {/* Global Toast Notification */}
        {bannerNotice && (
          <div className="sticky top-16 z-40 mx-4 my-2 p-2.5 rounded-xl bg-cyan-950/95 border border-cyan-400/80 text-cyan-200 text-xs font-semibold flex items-center justify-between shadow-[0_0_20px_rgba(0,229,255,0.3)] animate-fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-300 shrink-0" />
              <span>{bannerNotice}</span>
            </div>
            <button onClick={() => setBannerNotice(null)} className="text-cyan-400 text-xs">&times;</button>
          </div>
        )}

        {/* Main View Area */}
        <main className="flex-1 p-3.5 sm:p-6 space-y-6">

          {/* TAB 1: HUNTER HUB */}
          {activeTab === 'hub' && (
            <div className="space-y-6">
              
              {/* Hunter Banner with Aura Glow */}
              <div 
                className="relative rounded-3xl bg-gradient-to-br from-[#0c1328] via-[#090e1f] to-[#060913] border border-cyan-500/30 p-5 sm:p-6 shadow-[0_0_30px_rgba(0,229,255,0.08)] overflow-hidden"
                style={{
                  boxShadow: equippedItem ? equippedItem.glowEffect : undefined,
                }}
              >
                <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-bl from-cyan-500/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-950/90 border border-cyan-800 text-cyan-400">
                        Rank {profile.rank} Operative
                      </span>
                      {equippedItem && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 border border-amber-700 text-amber-300">
                          {equippedItem.name}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        {profile.title}
                      </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black font-['Cinzel',serif] text-slate-100">
                      {profile.name}
                    </h1>

                    <p className="text-xs text-slate-400 max-w-md">
                      Next recommended protocol: {WORKOUT_TEMPLATES[0].title}. Validated effort elevates STR and VIT attributes.
                    </p>
                  </div>

                  <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setIsWorkoutModalOpen(true)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,229,255,0.4)] active:scale-95 transition cursor-pointer"
                    >
                      <Dumbbell className="w-4 h-4 fill-slate-950" />
                      Begin Workout
                    </button>

                    <button
                      onClick={handleLogRestDay}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-emerald-400 text-xs font-bold transition cursor-pointer"
                      title="Log a mindful rest day to preserve streak without working out"
                    >
                      <HeartHandshake className="w-3.5 h-3.5" />
                      Log Rest Day
                    </button>
                  </div>
                </div>
              </div>

              {/* 5-Attribute Radar */}
              <AttributeRadar
                attributes={profile.attributes}
                unallocatedPoints={profile.unallocatedStatPoints}
                onAllocate={handleAllocateStat}
              />

              {/* Daily Quests List */}
              <div className="rounded-2xl bg-[#090e1d]/90 border border-slate-800/80 p-4 shadow-xl">
                <div className="flex items-center justify-between mb-3 border-b border-slate-800/60 pb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-300 font-['Rajdhani',sans-serif]">
                      Daily Protocols & Quests
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Resets in 14h 22m
                  </span>
                </div>

                <div className="space-y-2.5">
                  {quests.filter(q => q.type === 'daily').map((quest) => {
                    const progressPercent = Math.min(Math.round((quest.currentCount / quest.targetCount) * 100), 100);

                    return (
                      <div
                        key={quest.id}
                        className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition ${
                          quest.isClaimed
                            ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                            : quest.isCompleted
                            ? 'bg-cyan-950/20 border-cyan-500/60 shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                            : 'bg-slate-900/60 border-slate-800'
                        }`}
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-200">{quest.title}</span>
                            {quest.associatedAttribute && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400 font-mono">
                                +{quest.associatedAttribute.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{quest.description}</div>

                          <div className="flex items-center gap-2 pt-1">
                            <div className="flex-1 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full bg-gradient-to-r from-cyan-400 to-sky-500 transition-all duration-300"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">
                              {quest.currentCount} / {quest.targetCount}
                            </span>
                          </div>
                        </div>

                        <div>
                          {quest.isClaimed ? (
                            <span className="flex items-center gap-1 text-[11px] text-slate-500 font-mono px-3 py-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              Claimed
                            </span>
                          ) : quest.isCompleted ? (
                            <button
                              onClick={() => handleClaimQuest(quest)}
                              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(245,158,11,0.5)] active:scale-95 transition cursor-pointer"
                            >
                              Claim +{quest.expReward} EXP
                            </button>
                          ) : (
                            <span className="text-[11px] font-mono text-slate-500 px-3 py-1 rounded bg-slate-900 border border-slate-800">
                              In Progress
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WORKOUTS & TEMPLATES */}
          {activeTab === 'workouts' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-['Cinzel',serif] text-slate-100">
                    Training Protocols & History
                  </h2>
                  <p className="text-xs text-slate-400">
                    Explore calibrated workout templates or consult the Exercise Codex.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsExerciseCodexOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-bold transition cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    Codex
                  </button>

                  <button
                    onClick={() => setIsWorkoutModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Train
                  </button>
                </div>
              </div>

              {/* Available Templates Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {WORKOUT_TEMPLATES.map(tmpl => (
                  <div
                    key={tmpl.id}
                    className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 transition flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-cyan-200">{tmpl.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          {tmpl.estimatedMinutes}m • {tmpl.environment}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{tmpl.description}</p>
                    </div>

                    <button
                      onClick={() => setIsWorkoutModalOpen(true)}
                      className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Dumbbell className="w-3.5 h-3.5" />
                      Select & Train
                    </button>
                  </div>
                ))}
              </div>

              {/* Logged Workouts History */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider font-['Rajdhani',sans-serif]">
                  <History className="w-4 h-4 text-cyan-400" />
                  Validated Workout History ({workouts.length})
                </div>

                {workouts.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2">
                    <Dumbbell className="w-8 h-8 text-slate-600 mx-auto" />
                    <div className="text-sm font-bold text-slate-400">No Workouts Logged Yet</div>
                    <div className="text-xs text-slate-500 max-w-sm mx-auto">
                      Complete your first training session to manifest genuine biological attributes and claim your &quot;First Blood&quot; achievement.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {workouts.map(w => (
                      <div
                        key={w.id}
                        className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <div className="font-bold text-xs text-slate-200">{w.title}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {new Date(w.startedAt).toLocaleDateString()} • {w.durationMinutes} mins • {w.exercises.flatMap(e => e.sets).filter(s => s.completed).length} verified sets
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-mono font-bold text-xs text-cyan-400">+{w.expEarned} EXP</div>
                          <div className="text-[10px] text-amber-400 font-mono">+{w.tokensEarned} Tokens</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: QUESTS & TROPHIES */}
          {activeTab === 'quests' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold font-['Cinzel',serif] text-slate-100">
                  Quests & Hunter Trophies
                </h2>
                <p className="text-xs text-slate-400">
                  Real physical consistency yields persistent tokens and evolution stones.
                </p>
              </div>

              {/* Achievements Grid */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider font-['Rajdhani',sans-serif]">
                  <Award className="w-4 h-4 text-amber-400" />
                  Lifetime Achievements ({achievements.filter(a => a.isUnlocked).length} / {achievements.length})
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {achievements.map(ach => (
                    <div
                      key={ach.id}
                      className={`p-3.5 rounded-2xl border flex items-center gap-3 transition ${
                        ach.isUnlocked
                          ? 'bg-slate-900/90 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                          : 'bg-slate-900/40 border-slate-800 opacity-50'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl border ${ach.isUnlocked ? 'bg-amber-500/20 text-amber-300 border-amber-400/50' : 'bg-slate-800 text-slate-600 border-slate-700'}`}>
                        <Trophy className="w-5 h-5" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-200">{ach.title}</span>
                          <span className="text-[10px] font-mono text-amber-400">+{ach.tokenReward} T</span>
                        </div>
                        <div className="text-[11px] text-slate-400">{ach.description}</div>
                        {ach.isUnlocked && ach.unlockedAt && (
                          <div className="text-[9px] text-emerald-400 font-mono mt-0.5">
                            Unlocked: {new Date(ach.unlockedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: QUANTITATIVE ANALYTICS */}
          {activeTab === 'analytics' && (
            <AnalyticsView
              profile={profile}
              workouts={workouts}
            />
          )}

          {/* TAB 5: CHARACTER IDENTITY & EVOLUTION */}
          {activeTab === 'character' && (
            <div className="space-y-6">
              <div className="rounded-3xl bg-gradient-to-br from-[#0e162d] via-[#090f22] to-[#060913] border border-cyan-500/30 p-5 sm:p-6 shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  {/* Avatar Representation */}
                  <div 
                    className="w-24 h-24 rounded-3xl flex items-center justify-center font-black text-4xl border-2 shadow-[0_0_25px_rgba(0,229,255,0.4)] transition-all"
                    style={{
                      borderColor: currentRank.color,
                      color: currentRank.color,
                      backgroundColor: '#0a1020',
                      boxShadow: equippedItem ? equippedItem.glowEffect : undefined,
                    }}
                  >
                    {profile.rank}
                  </div>

                  <div className="text-center sm:text-left space-y-1">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="font-bold text-lg text-slate-100">{profile.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono">
                        Level {profile.level}
                      </span>
                    </div>

                    <div className="text-xs text-purple-300 font-mono">
                      {profile.title} • {currentArchetype.name}
                    </div>

                    <p className="text-xs text-slate-400 max-w-sm">
                      {currentRank.description}
                    </p>
                  </div>
                </div>

                {/* Quick Actions Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-800">
                  <div className="text-xs text-slate-300">
                    Stones: <span className="font-mono font-bold text-purple-400">{profile.evolutionStones}</span> • Tokens: <span className="font-mono font-bold text-amber-400">{profile.tokens}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsArmoryOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Armory
                    </button>

                    <button
                      onClick={() => setIsEvolutionModalOpen(true)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Evolution Studio
                    </button>
                  </div>
                </div>
              </div>

              {/* Unity Game Sync Action */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-500/40 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-purple-200">Standalone Unity Game Integration</div>
                  <div className="text-xs text-slate-400">Inspect the live JSON payload ready for the standalone client</div>
                </div>
                <button
                  onClick={() => setIsSyncModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  Open Bridge
                </button>
              </div>

              {/* Onboarding Preferences Review */}
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px] font-['Rajdhani',sans-serif]">
                  Onboarding Baseline Profile:
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-400">
                  <div>Environment: <span className="text-slate-200 capitalize">{profile.onboarding.trainingEnvironment}</span></div>
                  <div>Weekly Commitment: <span className="text-slate-200">{profile.onboarding.trainingDaysPerWeek} Days/wk</span></div>
                  <div>Primary Goal: <span className="text-slate-200 capitalize">{profile.onboarding.primaryGoal.replace('_', ' ')}</span></div>
                  <div>Session Length: <span className="text-slate-200">{profile.onboarding.preferredDurationMinutes} mins</span></div>
                  <div className="col-span-2">
                    Limitations: <span className="text-slate-200">{profile.onboarding.physicalLimitations.join(', ') || 'None reported'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* Bottom Mobile Navigation Bar */}
        <nav className="sticky bottom-0 z-30 w-full bg-[#060913]/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-2">
          <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
            {[
              { id: 'hub', label: 'Hub', icon: <Sparkles className="w-4 h-4" /> },
              { id: 'workouts', label: 'Training', icon: <Dumbbell className="w-4 h-4" /> },
              { id: 'quests', label: 'Quests', icon: <Trophy className="w-4 h-4" /> },
              { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
              { id: 'character', label: 'Identity', icon: <Award className="w-4 h-4" /> },
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition cursor-pointer ${
                    isActive
                      ? 'text-cyan-300 bg-cyan-950/50 shadow-[0_0_10px_rgba(0,229,255,0.2)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.icon}
                  <span className="text-[10px] font-semibold mt-1 font-['Rajdhani',sans-serif] tracking-wider uppercase">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Modals */}
      {isWorkoutModalOpen && (
        <WorkoutTrackerModal
          onClose={() => setIsWorkoutModalOpen(false)}
          onFinishWorkout={handleFinishWorkout}
        />
      )}

      {isExerciseCodexOpen && (
        <ExerciseLibraryModal
          onClose={() => setIsExerciseCodexOpen(false)}
          userLimitations={profile.onboarding.physicalLimitations}
          onSelectForWorkout={() => {
            setIsExerciseCodexOpen(false);
            setIsWorkoutModalOpen(true);
          }}
        />
      )}

      {isEvolutionModalOpen && (
        <CharacterEvolutionModal
          profile={profile}
          onUpdateTitle={handleUpdateTitle}
          onEvolve={handleEvolve}
          onClose={() => setIsEvolutionModalOpen(false)}
        />
      )}

      {isArmoryOpen && (
        <ArmoryStoreModal
          currentTokens={profile.tokens}
          ownedItemIds={ownedCosmetics}
          equippedAuraId={equippedAura}
          onPurchase={handlePurchaseCosmetic}
          onEquip={handleEquipCosmetic}
          onClose={() => setIsArmoryOpen(false)}
        />
      )}

      {isLedgerOpen && (
        <LedgerModal
          transactions={transactions}
          onClose={() => setIsLedgerOpen(false)}
        />
      )}

      {isAdminOpen && (
        <AdminPanelModal
          onAddExercise={(newEx) => {
            setCustomExercises(prev => [...prev, newEx]);
            showNotice(`Custom Exercise "${newEx.name}" registered to Codex!`);
          }}
          onPostAnnouncement={(msg) => {
            showNotice(`System Broadcast: "${msg}"`);
          }}
          onClose={() => setIsAdminOpen(false)}
        />
      )}

      {isSyncModalOpen && (
        <GameSyncModal
          profile={profile}
          achievements={achievements}
          onClose={() => setIsSyncModalOpen(false)}
        />
      )}

      {levelUpData.isOpen && (
        <LevelUpModal
          level={levelUpData.level}
          levelsGained={levelUpData.levelsGained}
          newRankPromoted={levelUpData.newRankPromoted}
          onClose={() => setLevelUpData(prev => ({ ...prev, isOpen: false }))}
        />
      )}
    </div>
  );
}
