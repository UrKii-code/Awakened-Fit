import { 
  HunterProfile, 
  WorkoutSession, 
  Quest, 
  Achievement, 
  RewardTransaction,
  DraftWorkoutState,
  BodyWeightEntry,
  BodyMetricsProfile,
  InAppNotification,
  FitnessGuild,
  UserPreferences
} from '../types/hunter';
import { 
  INITIAL_DAILY_QUESTS, 
  INITIAL_WEEKLY_QUESTS, 
  INITIAL_ACHIEVEMENTS,
  getTodayCycleId,
  getCurrentWeekCycleId
} from '../data/quests';
import { ProgressionEngine } from './progressionEngine';

const STORAGE_KEYS = {
  PROFILE: 'awakened_fit_hunter_profile_v1',
  WORKOUTS: 'awakened_fit_workouts_v1',
  DRAFT_WORKOUT: 'awakened_fit_draft_workout_v1',
  QUESTS: 'awakened_fit_quests_v1',
  ACHIEVEMENTS: 'awakened_fit_achievements_v1',
  TRANSACTIONS: 'awakened_fit_transactions_v1',
  WEIGHT_ENTRIES: 'awakened_fit_weight_entries_v1',
  BODY_METRICS: 'awakened_fit_body_metrics_v1',
  NOTIFICATIONS: 'awakened_fit_notifications_v1',
  USER_PREFERENCES: 'awakened_fit_user_preferences_v1',
  GUILDS: 'awakened_fit_guilds_v1',
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  units: 'metric',
  defaultRestSeconds: 60,
  profileVisibility: 'public',
  shareWorkoutsToCommunity: true,
  notificationsEnabled: {
    workoutReminders: true,
    questResets: true,
    achievementAlerts: true,
    communityAnnouncements: true,
  },
};

export const INITIAL_WEIGHT_ENTRIES: BodyWeightEntry[] = [
  {
    id: 'weight_log_1',
    hunterId: 'hunter_default_init',
    date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
    weightKg: 78.5,
    weightLbs: 173.1,
    notes: 'Initial weigh-in after awakening',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'weight_log_2',
    hunterId: 'hunter_default_init',
    date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    weightKg: 77.8,
    weightLbs: 171.5,
    notes: 'Week 1 progress after consistent training',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'weight_log_3',
    hunterId: 'hunter_default_init',
    date: new Date().toISOString().split('T')[0],
    weightKg: 77.2,
    weightLbs: 170.2,
    notes: 'Feeling lighter and stronger',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_GUILDS: FitnessGuild[] = [
  {
    id: 'guild_iron_calisthenics',
    name: 'Iron Calisthenics Guild',
    tagline: 'Mastering gravity, bodyweight progression, and pure relative strength.',
    focus: 'Calisthenics & Relative Strength',
    memberCount: 1420,
    isJoined: true,
    weeklyGoalDesc: 'Collective 10,000 Push-Ups and Dips',
    weeklyGoalCurrent: 7650,
    weeklyGoalTarget: 10000,
    accentColor: '#267CFF',
  },
  {
    id: 'guild_shadow_runners',
    name: 'Shadow Stride Runners',
    tagline: 'High cadence, sprint intervals, and sustained cardiovascular stamina.',
    focus: 'Cardio & Sprint Endurance',
    memberCount: 890,
    isJoined: false,
    weeklyGoalDesc: 'Guild 2,500km Cumulative Distance',
    weeklyGoalCurrent: 1820,
    weeklyGoalTarget: 2500,
    accentColor: '#974DFF',
  },
  {
    id: 'guild_vital_mobility',
    name: 'Zero-Pain Mobility Circle',
    tagline: 'Joint longevity, hip & thoracic openness, and resilient recovery protocols.',
    focus: 'Mobility & Physical Longevity',
    memberCount: 1150,
    isJoined: false,
    weeklyGoalDesc: 'Collective 500 Restorative Sessions',
    weeklyGoalCurrent: 390,
    weeklyGoalTarget: 500,
    accentColor: '#10B981',
  },
  {
    id: 'guild_power_monarchs',
    name: 'Iron Monarchs Lifting Club',
    tagline: 'Heavy compound barbell mastery: squats, deadlifts, and overhead presses.',
    focus: 'Absolute Strength & Barbell Power',
    memberCount: 2040,
    isJoined: false,
    weeklyGoalDesc: '50 Tons of Verified Compound Volume',
    weeklyGoalCurrent: 42,
    weeklyGoalTarget: 50,
    accentColor: '#F59E0B',
  },
];

export const INITIAL_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'notif_welcome',
    title: 'Hunter Protocol Active',
    message: 'Welcome to Awakened Fit. Complete real-world workouts to develop your physical rank.',
    type: 'workout_reminder',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    isRead: false,
  },
  {
    id: 'notif_quest_reset',
    title: 'Daily Protocols Refreshed',
    message: 'New daily fitness quests have arrived. Complete your training to claim Hunter Tokens.',
    type: 'quest_reset',
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    isRead: false,
  },
  {
    id: 'notif_guild_rally',
    title: 'Iron Calisthenics Rally',
    message: 'Your guild has achieved 76% of this week\'s push-up goal! Contribute your sets today.',
    type: 'community_challenge',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    isRead: true,
  },
];

export const DEFAULT_HUNTER_PROFILE: HunterProfile = {
  id: 'hunter_default_init',
  name: 'Candidate',
  title: 'Unawakened Aspirant',
  archetype: 'berserker',
  rank: 'E',
  level: 1,
  currentExp: 0,
  nextLevelExp: ProgressionEngine.getExpForLevel(1),
  lifetimeExp: 0,
  unallocatedStatPoints: 0,
  attributes: {
    strength: 10,
    endurance: 10,
    agility: 10,
    vitality: 10,
    discipline: 10,
  },
  tokens: 50,
  evolutionStones: 0,
  achievementPoints: 10,
  streak: {
    currentDays: 1,
    bestDays: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
    totalWorkouts: 0,
    restDaysTaken: 0,
  },
  onboarding: {
    hunterName: 'Candidate',
    gender: 'prefer_not_to_say',
    archetype: 'berserker',
    ageRange: '25_34',
    isMinorUnder18: false,
    fitnessExperience: 'beginner',
    currentActivityLevel: 'lightly_active',
    primaryGoal: 'build_strength',
    secondaryGoals: ['overall_health'],
    trainingEnvironment: 'both',
    availableEquipment: ['Bodyweight'],
    trainingDaysPerWeek: 3,
    preferredDurationMinutes: 30,
    physicalLimitations: [],
  },
  isAwakened: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export class StorageService {
  static getProfile(): HunterProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load hunter profile from local storage', e);
    }
    return DEFAULT_HUNTER_PROFILE;
  }

  static saveProfile(profile: HunterProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save hunter profile', e);
    }
  }

  static getWorkouts(): WorkoutSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load workouts', e);
    }
    return [];
  }

  static saveWorkouts(workouts: WorkoutSession[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
    } catch (e) {
      console.error('Failed to save workouts', e);
    }
  }

  /**
   * Draft Unfinished Workout Support (Save & Resume)
   */
  static getDraftWorkout(): DraftWorkoutState | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DRAFT_WORKOUT);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load draft workout', e);
    }
    return null;
  }

  static saveDraftWorkout(draft: DraftWorkoutState): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DRAFT_WORKOUT, JSON.stringify(draft));
    } catch (e) {
      console.error('Failed to save draft workout', e);
    }
  }

  static clearDraftWorkout(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.DRAFT_WORKOUT);
    } catch (e) {
      console.error('Failed to clear draft workout', e);
    }
  }

  /**
   * Calendar Cycle-Aware Quest Management
   * Resets daily quests if calendar day changed, and weekly quests if calendar week changed.
   */
  static getQuests(): Quest[] {
    const todayCycle = getTodayCycleId();
    const currentWeekCycle = getCurrentWeekCycleId();

    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUESTS);
      if (data) {
        const storedQuests: Quest[] = JSON.parse(data);
        
        // Refresh cycles
        return storedQuests.map(q => {
          if (q.type === 'daily' && q.cycleId !== todayCycle) {
            // New day: reset progress
            return {
              ...q,
              cycleId: todayCycle,
              currentCount: 0,
              isCompleted: false,
              isClaimed: false,
              expiresAt: new Date(Date.now() + 86400000).toISOString(),
            };
          }
          if (q.type === 'weekly' && q.cycleId !== currentWeekCycle) {
            // New week: reset progress
            return {
              ...q,
              cycleId: currentWeekCycle,
              currentCount: 0,
              isCompleted: false,
              isClaimed: false,
              expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
            };
          }
          return q;
        });
      }
    } catch (e) {
      console.error('Failed to load quests', e);
    }
    return [...INITIAL_DAILY_QUESTS, ...INITIAL_WEEKLY_QUESTS];
  }

  static saveQuests(quests: Quest[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.QUESTS, JSON.stringify(quests));
    } catch (e) {
      console.error('Failed to save quests', e);
    }
  }

  static getAchievements(): Achievement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load achievements', e);
    }
    return INITIAL_ACHIEVEMENTS;
  }

  static saveAchievements(achievements: Achievement[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
    } catch (e) {
      console.error('Failed to save achievements', e);
    }
  }

  static getTransactions(): RewardTransaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load transactions', e);
    }
    return [];
  }

  static saveTransactions(transactions: RewardTransaction[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions', e);
    }
  }

  // Weight Tracking Records (Spec Section 6)
  static getWeightEntries(): BodyWeightEntry[] {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const data = localStorage.getItem(STORAGE_KEYS.WEIGHT_ENTRIES);
        if (data) return JSON.parse(data);
      } catch (e) {
        console.error('Failed to load weight entries', e);
      }
    }
    return INITIAL_WEIGHT_ENTRIES;
  }

  static saveWeightEntries(entries: BodyWeightEntry[]): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.WEIGHT_ENTRIES, JSON.stringify(entries));
      } catch (e) {
        console.error('Failed to save weight entries', e);
      }
    }
  }

  // Body Metrics Profile (Height, Weight target, units)
  static getBodyMetrics(): BodyMetricsProfile {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const data = localStorage.getItem(STORAGE_KEYS.BODY_METRICS);
        if (data) return JSON.parse(data);
      } catch (e) {
        console.error('Failed to load body metrics', e);
      }
    }
    return {
      heightCm: 178,
      currentWeightKg: 77.2,
      targetWeightKg: 75.0,
      preferredUnit: 'metric',
    };
  }

  static saveBodyMetrics(metrics: BodyMetricsProfile): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.BODY_METRICS, JSON.stringify(metrics));
      } catch (e) {
        console.error('Failed to save body metrics', e);
      }
    }
  }

  // Notifications (Spec Section 10)
  static getNotifications(): InAppNotification[] {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
        if (data) return JSON.parse(data);
      } catch (e) {
        console.error('Failed to load notifications', e);
      }
    }
    return INITIAL_NOTIFICATIONS;
  }

  static saveNotifications(notifs: InAppNotification[]): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
      } catch (e) {
        console.error('Failed to save notifications', e);
      }
    }
  }

  // User Settings & Privacy Preferences (Spec Section 11)
  static getUserPreferences(): UserPreferences {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const data = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
        if (data) return JSON.parse(data);
      } catch (e) {
        console.error('Failed to load user preferences', e);
      }
    }
    return DEFAULT_USER_PREFERENCES;
  }

  static saveUserPreferences(prefs: UserPreferences): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(prefs));
      } catch (e) {
        console.error('Failed to save user preferences', e);
      }
    }
  }

  // Fitness Communities / Guilds (Spec Section 9)
  static getGuilds(): FitnessGuild[] {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const data = localStorage.getItem(STORAGE_KEYS.GUILDS);
        if (data) return JSON.parse(data);
      } catch (e) {
        console.error('Failed to load guilds', e);
      }
    }
    return INITIAL_GUILDS;
  }

  static saveGuilds(guilds: FitnessGuild[]): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.GUILDS, JSON.stringify(guilds));
      } catch (e) {
        console.error('Failed to save guilds', e);
      }
    }
  }

  static resetAllData(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.error('Failed to reset local storage', e);
    }
  }
}
