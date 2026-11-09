/**
 * Awakened Fit - Domain Models & Types
 * Authorized Authoritative Types for Hunter Progression & Workout Engine
 */

export type HunterRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export interface RankDefinition {
  rank: HunterRank;
  title: string;
  minLevel: number;
  minTotalAttributes: number;
  description: string;
  color: string;
  glowColor: string;
  borderColor: string;
  badgeBg: string;
}

export type HunterArchetype = 'berserker' | 'phantom' | 'guardian' | 'arcane';

export interface ArchetypeInfo {
  id: HunterArchetype;
  name: string;
  title: string;
  description: string;
  primaryStat: keyof AttributeScores;
  secondaryStat: keyof AttributeScores;
  tagline: string;
  iconName: string;
  avatarUrl: string;
  accentColor: string;
  glowColor: string;
}

export interface AttributeScores {
  strength: number;
  endurance: number;
  agility: number;
  vitality: number;
  discipline: number;
}

export interface AttributeDetail {
  current: number;
  lifetime: number;
  recentGain: number;
  associatedActivity: string;
  description: string;
}

export interface HunterOnboardingData {
  hunterName: string;
  archetype: HunterArchetype;
  ageRange: string;
  fitnessExperience: 'beginner' | 'intermediate' | 'advanced' | 'veteran';
  currentActivityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
  primaryGoal: 'build_strength' | 'boost_endurance' | 'lose_fat' | 'athletic_agility' | 'overall_health';
  secondaryGoals: string[];
  trainingEnvironment: 'home' | 'commercial_gym' | 'hybrid' | 'outdoors';
  availableEquipment: string[];
  trainingDaysPerWeek: number;
  preferredDurationMinutes: number;
  physicalLimitations: string[];
  notes?: string;
}

export interface HunterProfile {
  id: string;
  name: string;
  title: string;
  archetype: HunterArchetype;
  rank: HunterRank;
  level: number;
  currentExp: number;
  nextLevelExp: number;
  lifetimeExp: number;
  unallocatedStatPoints: number;
  attributes: AttributeScores;
  tokens: number;
  evolutionStones: number;
  achievementPoints: number;
  streak: {
    currentDays: number;
    bestDays: number;
    lastActiveDate: string;
    totalWorkouts: number;
    restDaysTaken: number;
  };
  onboarding: HunterOnboardingData;
  isAwakened: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ExerciseCategory = 
  | 'strength' 
  | 'cardio' 
  | 'bodyweight' 
  | 'mobility' 
  | 'agility' 
  | 'core' 
  | 'recovery';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  primaryAttribute: keyof AttributeScores;
  secondaryAttribute?: keyof AttributeScores;
  equipmentRequired: string[];
  targetMuscles: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  defaultSets: number;
  defaultReps?: number;
  defaultDurationSeconds?: number;
  defaultRestSeconds: number;
  expPerSet: number;
  illustrationSvgId: string;
}

export interface WorkoutSetRecord {
  setNumber: number;
  completed: boolean;
  reps?: number;
  weightKg?: number;
  durationSeconds?: number;
  rpe?: number; // Rate of Perceived Exertion (1-10)
  targetReps?: number;
  targetWeightKg?: number;
}

export interface WorkoutExerciseLog {
  exerciseId: string;
  exerciseName: string;
  category: ExerciseCategory;
  sets: WorkoutSetRecord[];
  notes?: string;
}

export type WorkoutLifecycleState = 'planned' | 'started' | 'completed' | 'validated' | 'rewarded';

export interface WorkoutSession {
  id: string;
  hunterId: string;
  title: string;
  planType: 'strength_foundations' | 'endurance_surge' | 'agility_matrix' | 'vital_mobility' | 'custom';
  environment: 'home' | 'gym' | 'outdoors';
  state: WorkoutLifecycleState;
  exercises: WorkoutExerciseLog[];
  startedAt: string;
  completedAt?: string;
  durationMinutes: number;
  expEarned: number;
  attributeGains: Partial<AttributeScores>;
  tokensEarned: number;
  validationNotes: string;
  isPersonalRecord: boolean;
  verified: boolean;
}

export type QuestType = 'daily' | 'weekly' | 'special';

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  category: ExerciseCategory | 'consistency' | 'milestone';
  targetCount: number;
  currentCount: number;
  isCompleted: boolean;
  isClaimed: boolean;
  expReward: number;
  tokenReward: number;
  stoneReward?: number;
  associatedAttribute?: keyof AttributeScores;
  expiresAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'strength' | 'dedication' | 'progression' | 'awakening';
  unlockedAt?: string;
  isUnlocked: boolean;
  apValue: number;
  tokenReward: number;
}

export interface RewardTransaction {
  id: string;
  timestamp: string;
  eventType: 'workout_completion' | 'quest_reward' | 'level_up' | 'stat_allocation' | 'rank_promotion';
  sourceId: string;
  expChange: number;
  tokenChange: number;
  stoneChange: number;
  description: string;
  idempotencyKey: string;
}

export interface GameSyncPayload {
  version: string;
  generatedAt: string;
  account: {
    hunterId: string;
    hunterName: string;
    title: string;
    archetype: HunterArchetype;
    rank: HunterRank;
    level: number;
    lifetimeExp: number;
    tokens: number;
    evolutionStones: number;
  };
  attributes: AttributeScores;
  achievements: {
    totalUnlocked: number;
    unlockedIds: string[];
  };
  gameIntegrationToken: string;
}
