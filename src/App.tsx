import React, { useState, useEffect } from 'react';
import { 
  HunterProfile, 
  WorkoutSession, 
  Quest, 
  Achievement, 
  HunterRank, 
  AttributeScores, 
  RewardTransaction,
  Exercise,
  WorkoutExerciseLog,
  BodyWeightEntry,
  BodyMetricsProfile,
  InAppNotification,
  FitnessGuild,
  UserPreferences
} from './types/hunter';
import { StorageService, DEFAULT_HUNTER_PROFILE } from './services/storageService';
import { ProgressionEngine } from './services/progressionEngine';
import { AuthService, AuthSession } from './services/authService';
import { PlannedDaySession } from './services/planGenerator';
import { HUNTER_RANKS, ARCHETYPES } from './data/ranks';
import { WORKOUT_TEMPLATES, EXERCISE_LIBRARY } from './data/exercises';
import { EvolutionTier } from './data/evolution';
import { CosmeticItem, COSMETIC_STORE_ITEMS } from './data/store';
import { SupabaseService } from './services/supabaseClient';
import { AuthoritativeProgressionService } from './services/authoritativeProgression';

// Components
import { HomeDashboardView } from './components/HomeDashboardView';
import { HunterHUD } from './components/HunterHUD';
import { AttributeRadar } from './components/AttributeRadar';
import { OnboardingFlow } from './components/OnboardingFlow';
import { WorkoutTrackerModal } from './components/WorkoutTrackerModal';
import { PersonalizedPlanModal } from './components/PersonalizedPlanModal';
import { AuthModal } from './components/AuthModal';
import { LevelUpModal } from './components/LevelUpModal';
import { CommunityModal } from './components/CommunityModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { ProgressView } from './components/ProgressView';
import { ProfileView } from './components/ProfileView';
import { ExerciseLibraryModal } from './components/ExerciseLibraryModal';
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
  Megaphone,
  User,
  Users,
  Bell,
  Clock,
  Coins
} from 'lucide-react';

export default function App() {
  // Master State
  const [profile, setProfile] = useState<HunterProfile>(DEFAULT_HUNTER_PROFILE);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  
  // Additional Domain State (Weight, Metrics, Notifications, Preferences, Guilds)
  const [weightEntries, setWeightEntries] = useState<BodyWeightEntry[]>(() => StorageService.getWeightEntries());
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetricsProfile>(() => StorageService.getBodyMetrics());
  const [notifications, setNotifications] = useState<InAppNotification[]>(() => StorageService.getNotifications());
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(() => StorageService.getUserPreferences());
  const [guilds, setGuilds] = useState<FitnessGuild[]>(() => StorageService.getGuilds());

  // Cosmetic state
  const [ownedCosmetics, setOwnedCosmetics] = useState<string[]>([]);
  const [equippedAura, setEquippedAura] = useState<string | null>(null);

  // Navigation: 5 core sections (training, quest, home, progress, profile)
  const [activeTab, setActiveTab] = useState<'training' | 'quests' | 'home' | 'progress' | 'profile'>('home');
  const [poppingTab, setPoppingTab] = useState<string | null>('home');
  const [popKey, setPopKey] = useState<number>(0);

  const handleTabSwitch = (tabId: 'training' | 'quests' | 'home' | 'progress' | 'profile') => {
    setActiveTab(tabId);
    setPoppingTab(tabId);
    setPopKey(prev => prev + 1);
  };
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  
  // Auth session
  const [authSession, setAuthSession] = useState<AuthSession>(() => AuthService.getSession());

  // Modals
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState<boolean>(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState<boolean>(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState<boolean>(false);
  const [isExerciseCodexOpen, setIsExerciseCodexOpen] = useState<boolean>(false);
  const [isEvolutionModalOpen, setIsEvolutionModalOpen] = useState<boolean>(false);
  const [isArmoryOpen, setIsArmoryOpen] = useState<boolean>(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Custom Workout session passed from Plan or Codex
  const [activeCustomWorkout, setActiveCustomWorkout] = useState<{
    title: string;
    exercises: WorkoutExerciseLog[];
  } | null>(null);
  const [trainingFilter, setTrainingFilter] = useState<'all' | 'home' | 'gym'>('all');

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

  // Initial Load from Storage & Supabase Auth
  useEffect(() => {
    AuthService.init();
    const unsub = AuthService.onAuthStateChange((newSession) => {
      setAuthSession(newSession);
      if (newSession.user) {
        setProfile(prev => ({
          ...prev,
          userId: newSession.user?.id,
          name: prev.name === 'Candidate' ? newSession.user!.hunterName : prev.name,
        }));
      }
    });

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

    return () => unsub();
  }, []);

  const showNotice = (msg: string) => {
    setBannerNotice(msg);
    setTimeout(() => setBannerNotice(null), 4000);
  };

  // Onboarding Complete Handler
  const handleOnboardingComplete = (newProfile: HunterProfile) => {
    setProfile(newProfile);
    StorageService.saveProfile(newProfile);
    SupabaseService.syncProfile(newProfile);
    showNotice(`Awakening Verified! Welcome, Hunter ${newProfile.name}.`);
  };

  // Workout Session Finished & Validated Handler
  const handleFinishWorkout = async (session: WorkoutSession) => {
    setIsWorkoutModalOpen(false);

    // 1. Authoritative server-style validation and commit
    const result = await AuthoritativeProgressionService.commitWorkout(
      session,
      profile,
      transactions
    );

    if (!result.success) {
      showNotice(result.message);
      return;
    }

    if (result.isDuplicate) {
      showNotice(result.message);
      return;
    }

    // 2. Update Quests (daily workout, sets volume)
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

    // 3. Update Achievements (First Blood, Century Sets)
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
    setTransactions(result.allTransactions);
    setProfile(result.updatedProfile);

    StorageService.saveWorkouts(updatedWorkouts);
    StorageService.saveQuests(updatedQuests);
    StorageService.saveAchievements(updatedAchievements);
    StorageService.saveTransactions(result.allTransactions);
    StorageService.saveProfile(result.updatedProfile);

    // Asynchronously dispatch to Supabase backend if configured
    SupabaseService.syncWorkout(session);
    SupabaseService.syncProfile(result.updatedProfile);

    // If level-up occurred, show modal
    if (result.levelsGained > 0 || result.newRankPromoted) {
      setLevelUpData({
        isOpen: true,
        level: result.updatedProfile.level,
        levelsGained: result.levelsGained,
        newRankPromoted: result.newRankPromoted,
      });
    } else {
      showNotice(result.message);
    }

    setActiveCustomWorkout(null);
  };

  // Launch a session from Personalized 7-Day Plan
  const handleStartPlanDay = (session: PlannedDaySession) => {
    setIsPlanModalOpen(false);
    if (session.isRestDay) {
      handleLogRestDay();
      return;
    }

    const logs: WorkoutExerciseLog[] = session.exercises.map(ex => ({
      exerciseId: ex.id,
      exerciseName: ex.name,
      category: ex.category,
      sets: Array.from({ length: ex.defaultSets }, (_, i) => ({
        setNumber: i + 1,
        completed: false,
        reps: ex.defaultReps || 10,
        weightKg: ex.category === 'bodyweight' ? 0 : 20,
        durationSeconds: ex.defaultDurationSeconds,
      })),
    }));

    setActiveCustomWorkout({
      title: `${session.focus} (${session.dayName})`,
      exercises: logs,
    });
    setIsWorkoutModalOpen(true);
  };

  // Weight & Body Metrics Handlers (Spec Section 6)
  const handleAddWeightEntry = (entry: Omit<BodyWeightEntry, 'id' | 'createdAt'>) => {
    const newEntry: BodyWeightEntry = {
      ...entry,
      id: `wt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newEntry, ...weightEntries];
    setWeightEntries(updated);
    StorageService.saveWeightEntries(updated);
    showNotice(`Weight entry recorded: ${userPreferences.units === 'imperial' ? `${newEntry.weightLbs} lbs` : `${newEntry.weightKg} kg`}`);
  };

  const handleDeleteWeightEntry = (id: string) => {
    const updated = weightEntries.filter(w => w.id !== id);
    setWeightEntries(updated);
    StorageService.saveWeightEntries(updated);
    showNotice('Weight record deleted.');
  };

  const handleUpdateBodyMetrics = (metrics: BodyMetricsProfile) => {
    setBodyMetrics(metrics);
    StorageService.saveBodyMetrics(metrics);
    showNotice('Body metrics updated.');
  };

  const handleUpdatePreferences = (prefs: UserPreferences) => {
    setUserPreferences(prefs);
    StorageService.saveUserPreferences(prefs);
    showNotice('Preferences saved.');
  };

  const handleToggleJoinGuild = (guildId: string) => {
    const updated = guilds.map(g => {
      if (g.id === guildId) {
        const willJoin = !g.isJoined;
        return {
          ...g,
          isJoined: willJoin,
          memberCount: willJoin ? g.memberCount + 1 : g.memberCount - 1,
        };
      }
      return g;
    });
    setGuilds(updated);
    StorageService.saveGuilds(updated);
    const target = updated.find(g => g.id === guildId);
    showNotice(target?.isJoined ? `Joined "${target.name}"!` : `Left "${target?.name}".`);
  };

  const handleMarkAllNotificationsAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
    StorageService.saveNotifications(updated);
    showNotice('All notifications marked as read.');
  };

  // Stat point allocation handler
  const handleAllocateStat = (statKey: keyof AttributeScores) => {
    const updated = ProgressionEngine.allocateStatPoint(profile, statKey);
    setProfile(updated);
    StorageService.saveProfile(updated);
    showNotice(`+1 ${statKey.toUpperCase()} allocated! Total: ${updated.attributes[statKey].toFixed(1)}`);
  };

  // Quest Reward Claim Handler
  const handleClaimQuest = async (quest: Quest) => {
    if (!quest.isCompleted || quest.isClaimed) return;

    const result = await AuthoritativeProgressionService.claimQuest(quest, profile, transactions);
    if (!result.success) {
      showNotice(result.message);
      return;
    }

    const updatedQuests = quests.map(q => q.id === quest.id ? { ...q, isClaimed: true } : q);

    setQuests(updatedQuests);
    setTransactions(result.transactions);
    setProfile(result.updatedProfile);

    StorageService.saveQuests(updatedQuests);
    StorageService.saveTransactions(result.transactions);
    StorageService.saveProfile(result.updatedProfile);
    SupabaseService.syncProfile(result.updatedProfile);

    showNotice(result.message);
  };

  // Sacred Rest Day Logger (Calendar-based streak protection)
  const handleLogRestDay = () => {
    const result = AuthoritativeProgressionService.logRestDay(profile, transactions);
    if (!result.success) {
      showNotice(result.message);
      return;
    }

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

    setProfile(result.updatedProfile);
    setTransactions(result.transactions);
    setQuests(updatedQuests);
    setAchievements(updatedAchievements);

    StorageService.saveProfile(result.updatedProfile);
    StorageService.saveTransactions(result.transactions);
    StorageService.saveQuests(updatedQuests);
    StorageService.saveAchievements(updatedAchievements);
    SupabaseService.syncProfile(result.updatedProfile);

    showNotice(result.message);
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
          <span>AWAKENED FIT • STABILIZED CORE</span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="text-[10px] text-cyan-400/80 hidden md:inline">
            {SupabaseService.isConfigured() ? 'Supabase Cloud: Synced' : 'Storage: Resilient Local / Cloud Ready'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsArmoryOpen(true)}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/40 border border-amber-600/40 text-amber-300 hover:bg-amber-900/60 transition cursor-pointer"
            title="Hunter Token Armory"
          >
            <ShoppingBag className="w-3 h-3" />
            <span className="hidden sm:inline">Armory</span>
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
          unreadNotificationCount={notifications.filter(n => !n.isRead).length}
          onOpenNotifications={() => setIsNotificationsModalOpen(true)}
          onOpenCommunity={() => setIsCommunityModalOpen(true)}
          onStartWorkout={() => {
            setActiveCustomWorkout(null);
            setIsWorkoutModalOpen(true);
          }}
          onOpenProfile={() => handleTabSwitch('profile')}
          onOpenAuth={() => setIsAuthModalOpen(true)}
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

          {/* TAB 1: HOME DASHBOARD (Spec Section 4 & Part 7 Redesign) */}
          {activeTab === 'home' && (
            <HomeDashboardView
              profile={profile}
              workouts={workouts}
              quests={quests}
              achievements={achievements}
              onStartWorkout={(workout) => {
                setActiveCustomWorkout(workout ? { title: workout.title, exercises: workout.exercises } : null);
                setIsWorkoutModalOpen(true);
              }}
              onOpenCustomPlan={() => setIsPlanModalOpen(true)}
              onLogRestDay={handleLogRestDay}
              onClaimQuest={handleClaimQuest}
              onAllocateStat={handleAllocateStat}
              onOpenNotifications={() => setIsNotificationsModalOpen(true)}
              onOpenProfile={() => handleTabSwitch('profile')}
              unreadNotificationsCount={notifications.filter(n => !n.isRead).length}
            />
          )}

          {/* TAB 2: TRAINING SYSTEM (Spec Section 5) */}
          {activeTab === 'training' && (
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
                    onClick={() => {
                      setActiveCustomWorkout(null);
                      setIsWorkoutModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Train
                  </button>
                </div>
              </div>

              {/* Personalized Regimen Spotlight Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/50 border border-cyan-500/40 shadow-[0_0_25px_rgba(0,229,255,0.1)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                      Personalized 7-Day Program
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {profile.onboarding.trainingDaysPerWeek} Days/Wk • {profile.onboarding.trainingEnvironment}
                    </span>
                  </div>
                  <div className="font-bold text-sm text-slate-100">
                    Automated Regimen with Injury Safeguards & Rest Balancing
                  </div>
                  <div className="text-xs text-slate-400 max-w-xl">
                    Tailored specifically to your experience level, available equipment, and physical limitation constraints. Launch directly into any scheduled day.
                  </div>
                </div>

                <button
                  onClick={() => setIsPlanModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.3)] shrink-0 active:scale-95"
                >
                  <Calendar className="w-4 h-4" />
                  View 7-Day Plan
                </button>
              </div>

              {/* Workout Category Filter Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                {[
                  { id: 'all', label: 'All Protocols' },
                  { id: 'home', label: 'Home & Calisthenics' },
                  { id: 'gym', label: 'Gym & Free Weights' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setTrainingFilter(cat.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      trainingFilter === cat.id
                        ? 'bg-[#267CFF] text-white shadow-[0_0_12px_rgba(38,124,255,0.4)]'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Available Templates Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {WORKOUT_TEMPLATES
                  .filter(tmpl => trainingFilter === 'all' || tmpl.environment === trainingFilter || tmpl.environment === 'both')
                  .map(tmpl => (
                  <div
                    key={tmpl.id}
                    className="p-4 rounded-2xl bg-[#10264A]/80 border border-slate-800 hover:border-[#267CFF]/60 transition flex flex-col justify-between space-y-3.5"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-sm text-cyan-200">{tmpl.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-cyan-400 font-mono capitalize">
                          {tmpl.environment} • {tmpl.estimatedMinutes}m
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{tmpl.description}</p>
                      <div className="mt-2 text-[11px] text-slate-400 font-mono flex items-center gap-2">
                        <span>{tmpl.exerciseIds.length} Movements</span>
                        <span>•</span>
                        <span className="text-emerald-400">Target: {tmpl.primaryBenefit}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const exercises: WorkoutExerciseLog[] = tmpl.exerciseIds.map(exId => {
                          const def = EXERCISE_LIBRARY.find(e => e.id === exId);
                          return {
                            exerciseId: exId,
                            exerciseName: def?.name || exId,
                            category: def?.category || 'strength',
                            targetMuscleGroup: def?.targetMuscles?.[0] || 'Full Body',
                            sets: Array.from({ length: def?.defaultSets || 3 }, (_, sIdx) => ({
                              setNumber: sIdx + 1,
                              reps: def?.defaultReps || 10,
                              weightKg: 0,
                              durationSeconds: def?.defaultDurationSeconds || 0,
                              completed: false,
                            })),
                          };
                        });
                        setActiveCustomWorkout({
                          title: tmpl.title,
                          exercises,
                        });
                        setIsWorkoutModalOpen(true);
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#267CFF] to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-slate-950 text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(38,124,255,0.3)]"
                    >
                      <Dumbbell className="w-3.5 h-3.5 fill-slate-950" />
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
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-200">{w.title}</span>
                            {w.isPersonalRecord && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono font-bold">
                                PR
                              </span>
                            )}
                          </div>
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
                  Real physical consistency yields persistent tokens, EXP, and evolution stones.
                </p>
              </div>

              {/* Daily Quests Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider font-['Rajdhani',sans-serif]">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Daily Quests ({quests.filter(q => q.type === 'daily' && q.isCompleted).length} / {quests.filter(q => q.type === 'daily').length})
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Resets Daily at 00:00</span>
                </div>

                <div className="space-y-2.5">
                  {quests.filter(q => q.type === 'daily').map(quest => {
                    const pct = Math.min(Math.round((quest.currentCount / quest.targetCount) * 100), 100);

                    return (
                      <div
                        key={quest.id}
                        className={`p-4 rounded-2xl border transition ${
                          quest.isClaimed
                            ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                            : quest.isCompleted
                            ? 'bg-cyan-950/30 border-cyan-500/50 shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                            : 'bg-slate-900/70 border-slate-800'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-100">{quest.title}</span>
                              {quest.associatedAttribute && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-mono uppercase">
                                  +{quest.associatedAttribute}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">{quest.description}</p>
                            
                            <div className="flex items-center gap-3 text-[10px] font-mono pt-1">
                              <span className="text-cyan-400">+{quest.expReward} EXP</span>
                              <span className="text-amber-400">+{quest.tokenReward} Tokens</span>
                              {quest.stoneReward && (
                                <span className="text-purple-400">+{quest.stoneReward} Stone</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 sm:self-center">
                            <div className="w-24 text-right">
                              <div className="text-[11px] font-mono text-slate-300 font-bold">
                                {quest.currentCount} / {quest.targetCount}
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
                                <div 
                                  className="h-full rounded-full bg-gradient-to-r from-[#267CFF] to-cyan-400"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>

                            {quest.isClaimed ? (
                              <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-500 text-xs font-mono font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Claimed
                              </span>
                            ) : quest.isCompleted ? (
                              <button
                                onClick={() => handleClaimQuest(quest)}
                                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(245,158,11,0.4)] transition cursor-pointer active:scale-95"
                              >
                                Claim
                              </button>
                            ) : (
                              <span className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-500 text-xs font-mono">
                                In Progress
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Weekly Quests Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider font-['Rajdhani',sans-serif]">
                    <Flame className="w-4 h-4 text-purple-400" />
                    Weekly Objectives ({quests.filter(q => q.type === 'weekly' && q.isCompleted).length} / {quests.filter(q => q.type === 'weekly').length})
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Resets Every Monday</span>
                </div>

                <div className="space-y-2.5">
                  {quests.filter(q => q.type === 'weekly').map(quest => {
                    const pct = Math.min(Math.round((quest.currentCount / quest.targetCount) * 100), 100);

                    return (
                      <div
                        key={quest.id}
                        className={`p-4 rounded-2xl border transition ${
                          quest.isClaimed
                            ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                            : quest.isCompleted
                            ? 'bg-purple-950/30 border-purple-500/50 shadow-[0_0_15px_rgba(151,77,255,0.2)]'
                            : 'bg-slate-900/70 border-slate-800'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-100">{quest.title}</span>
                              {quest.associatedAttribute && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-purple-300 font-mono uppercase">
                                  +{quest.associatedAttribute}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">{quest.description}</p>
                            
                            <div className="flex items-center gap-3 text-[10px] font-mono pt-1">
                              <span className="text-cyan-400">+{quest.expReward} EXP</span>
                              <span className="text-amber-400">+{quest.tokenReward} Tokens</span>
                              {quest.stoneReward && (
                                <span className="text-purple-400">+{quest.stoneReward} Evolution Stone</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 sm:self-center">
                            <div className="w-24 text-right">
                              <div className="text-[11px] font-mono text-slate-300 font-bold">
                                {quest.currentCount} / {quest.targetCount}
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
                                <div 
                                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-400"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>

                            {quest.isClaimed ? (
                              <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-500 text-xs font-mono font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Claimed
                              </span>
                            ) : quest.isCompleted ? (
                              <button
                                onClick={() => handleClaimQuest(quest)}
                                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-400 hover:from-purple-400 hover:to-indigo-300 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(151,77,255,0.4)] transition cursor-pointer active:scale-95"
                              >
                                Claim
                              </button>
                            ) : (
                              <span className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-500 text-xs font-mono">
                                In Progress
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
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

          {/* TAB 4: FITNESS PROGRESS & REPORTS (Spec Section 6) */}
          {activeTab === 'progress' && (
            <ProgressView
              workouts={workouts}
              streakDays={profile.streak.currentDays}
              weightEntries={weightEntries}
              bodyMetrics={bodyMetrics}
              onAddWeightEntry={handleAddWeightEntry}
              onDeleteWeightEntry={handleDeleteWeightEntry}
              onUpdateBodyMetrics={handleUpdateBodyMetrics}
            />
          )}

          {/* TAB 5: PROFILE & SETTINGS (Spec Section 11) */}
          {activeTab === 'profile' && (
            <ProfileView
              profile={profile}
              achievements={achievements}
              preferences={userPreferences}
              onUpdatePreferences={handleUpdatePreferences}
              onAllocateStat={handleAllocateStat}
              onOpenArmory={() => setIsArmoryOpen(true)}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onResetData={handleResetData}
            />
          )}

        </main>

        {/* Bottom Mobile Navigation Bar - (Training, Quest, Home, Progress, Profile) */}
        <nav className="sticky bottom-0 z-30 w-full bg-[#050811]/95 backdrop-blur-xl border-t border-cyan-900/40 shadow-[0_-10px_25px_rgba(2,6,23,0.8)] px-2 pt-1 pb-2">
          <div className="max-w-md mx-auto grid grid-cols-5 items-end gap-1.5 relative">
            {[
              { id: 'training' as const, label: 'Training', icon: Dumbbell, isCenter: false },
              { id: 'quests' as const, label: 'Quest', icon: Trophy, isCenter: false },
              { id: 'home' as const, label: 'Home', icon: Sparkles, isCenter: true },
              { id: 'progress' as const, label: 'Progress', icon: TrendingUp, isCenter: false },
              { id: 'profile' as const, label: 'Profile', icon: Award, isCenter: false },
            ].map(tab => {
              const isActive = activeTab === tab.id;
              const isPopping = poppingTab === tab.id;
              const Icon = tab.icon;

              if (tab.isCenter) {
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabSwitch(tab.id)}
                    className={`relative flex flex-col items-center justify-center -translate-y-2 py-1.5 px-1 rounded-2xl transition-all duration-300 cursor-pointer select-none ${
                      isActive
                        ? 'bg-gradient-to-b from-cyan-950/90 via-blue-950/80 to-[#071326] border border-cyan-400 text-cyan-300 animate-mana-pulse scale-105 shadow-[0_0_22px_rgba(0,229,255,0.45)]'
                        : 'bg-slate-950/90 border border-slate-800/90 text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-900/80'
                    }`}
                  >
                    {/* Ambient Mana Aura Ring */}
                    {isActive && (
                      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500/35 via-purple-500/30 to-blue-500/35 blur-md animate-mana-aura pointer-events-none -z-10" />
                    )}

                    {/* Active Mana Crystal Top Bead */}
                    {isActive && (
                      <span className="absolute -top-1.5 w-2.5 h-1 rounded-full bg-cyan-300 shadow-[0_0_10px_#00E5FF]" />
                    )}

                    {/* Icon Container with "Level Up" Pop & Mana Glow */}
                    <div className="relative flex items-center justify-center p-1.5">
                      {isPopping && (
                        <div
                          key={`burst-${popKey}`}
                          className="absolute inset-0 rounded-full border-2 border-cyan-400/90 animate-spark-burst pointer-events-none"
                        />
                      )}
                      <div
                        key={isPopping ? `icon-${tab.id}-${popKey}` : `icon-${tab.id}`}
                        className={`${isPopping ? 'animate-level-up-pop' : ''} transition-transform`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-300 filter drop-shadow-[0_0_8px_rgba(0,229,255,0.85)]' : 'text-slate-400'}`} />
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold font-['Rajdhani',sans-serif] tracking-widest uppercase transition-colors ${
                      isActive ? 'text-cyan-300 font-black drop-shadow-[0_0_6px_rgba(0,229,255,0.7)]' : 'text-slate-400'
                    }`}>
                      {tab.label}
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabSwitch(tab.id)}
                  className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden select-none ${
                    isActive
                      ? 'bg-gradient-to-b from-cyan-950/70 via-blue-950/50 to-[#071326] border border-cyan-400/60 text-cyan-300 animate-mana-pulse scale-[1.03]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 hover:scale-[1.01]'
                  }`}
                >
                  {/* Ambient Mana Pulse Aura */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-cyan-500/10 blur-sm animate-mana-aura pointer-events-none -z-10" />
                  )}

                  {/* Active Mana Indicator */}
                  {isActive && (
                    <span className="absolute top-0 w-4 h-0.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00E5FF]" />
                  )}

                  {/* Icon with "Level Up" Pop animation */}
                  <div className="relative flex items-center justify-center p-0.5">
                    {isPopping && (
                      <div
                        key={`burst-${popKey}`}
                        className="absolute inset-0 rounded-full border border-cyan-400/80 animate-spark-burst pointer-events-none"
                      />
                    )}
                    <div
                      key={isPopping ? `icon-${tab.id}-${popKey}` : `icon-${tab.id}`}
                      className={`${isPopping ? 'animate-level-up-pop' : ''} transition-transform`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-300 filter drop-shadow-[0_0_6px_rgba(0,229,255,0.75)]' : 'text-slate-400'}`} />
                    </div>
                  </div>

                  <span className={`text-[10px] font-semibold mt-1 font-['Rajdhani',sans-serif] tracking-wider uppercase transition-colors ${
                    isActive ? 'text-cyan-200 font-bold drop-shadow-[0_0_4px_rgba(0,229,255,0.6)]' : 'text-slate-400'
                  }`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {isWorkoutModalOpen && (
        <WorkoutTrackerModal
          hunterId={profile.id}
          initialExercises={activeCustomWorkout?.exercises}
          initialTitle={activeCustomWorkout?.title}
          onClose={() => {
            setIsWorkoutModalOpen(false);
            setActiveCustomWorkout(null);
          }}
          onFinishWorkout={handleFinishWorkout}
          onDraftSaved={() => showNotice('Workout session paused and saved as draft. Resume anytime!')}
        />
      )}

      {isPlanModalOpen && (
        <PersonalizedPlanModal
          profile={profile}
          onStartDaySession={handleStartPlanDay}
          onClose={() => setIsPlanModalOpen(false)}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
          session={authSession}
          onSessionUpdated={(updated) => {
            setAuthSession(updated);
            if (updated.user && updated.user.hunterName) {
              const updatedProfile = { ...profile, name: updated.user.hunterName };
              setProfile(updatedProfile);
              StorageService.saveProfile(updatedProfile);
            }
            showNotice('Account credentials synchronized.');
          }}
          onAccountWiped={() => {
            setIsAuthModalOpen(false);
            handleResetData();
          }}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}

      {isExerciseCodexOpen && (
        <ExerciseLibraryModal
          onClose={() => setIsExerciseCodexOpen(false)}
          userLimitations={profile.onboarding.physicalLimitations}
          onSelectForWorkout={() => {
            setIsExerciseCodexOpen(false);
            setActiveCustomWorkout(null);
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

      {isCommunityModalOpen && (
        <CommunityModal
          currentHunterName={profile.name}
          currentRank={profile.rank}
          guilds={guilds}
          onToggleJoinGuild={handleToggleJoinGuild}
          onClose={() => setIsCommunityModalOpen(false)}
        />
      )}

      {isNotificationsModalOpen && (
        <NotificationCenterModal
          notifications={notifications}
          preferences={userPreferences}
          onMarkAllAsRead={handleMarkAllNotificationsAsRead}
          onUpdatePreferences={handleUpdatePreferences}
          onClose={() => setIsNotificationsModalOpen(false)}
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
