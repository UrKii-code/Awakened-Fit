import { 
  HunterProfile, 
  WorkoutSession, 
  Quest, 
  Achievement, 
  RewardTransaction,
  GameSyncPayload
} from '../types/hunter';
import { INITIAL_DAILY_QUESTS, INITIAL_WEEKLY_QUESTS, INITIAL_ACHIEVEMENTS } from '../data/quests';
import { ProgressionEngine } from './progressionEngine';

const STORAGE_KEYS = {
  PROFILE: 'awakened_fit_hunter_profile_v1',
  WORKOUTS: 'awakened_fit_workouts_v1',
  QUESTS: 'awakened_fit_quests_v1',
  ACHIEVEMENTS: 'awakened_fit_achievements_v1',
  TRANSACTIONS: 'awakened_fit_transactions_v1',
};

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
    archetype: 'berserker',
    ageRange: '25-34',
    fitnessExperience: 'beginner',
    currentActivityLevel: 'lightly_active',
    primaryGoal: 'build_strength',
    secondaryGoals: ['overall_health'],
    trainingEnvironment: 'home',
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

  static getQuests(): Quest[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUESTS);
      if (data) {
        return JSON.parse(data);
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

  static generateGameSyncPayload(profile: HunterProfile, achievements: Achievement[]): GameSyncPayload {
    const unlocked = achievements.filter(a => a.isUnlocked).map(a => a.id);
    return {
      version: '1.0.0-unity-bridge',
      generatedAt: new Date().toISOString(),
      account: {
        hunterId: profile.id,
        hunterName: profile.name,
        title: profile.title,
        archetype: profile.archetype,
        rank: profile.rank,
        level: profile.level,
        lifetimeExp: profile.lifetimeExp,
        tokens: profile.tokens,
        evolutionStones: profile.evolutionStones,
      },
      attributes: profile.attributes,
      achievements: {
        totalUnlocked: unlocked.length,
        unlockedIds: unlocked,
      },
      gameIntegrationToken: `af_sync_${btoa(profile.id + ':' + profile.lifetimeExp).substring(0, 24)}`,
    };
  }

  static resetAllData(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.error('Failed to reset local storage', e);
    }
  }
}
