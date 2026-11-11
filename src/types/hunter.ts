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

export type HunterGender = 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';

export type HunterAgeRange = 
  | 'under_18' 
  | '18_24' 
  | '25_34' 
  | '35_44' 
  | '45_59' 
  | '60_plus';

export type HunterExperience = 
  | 'beginner'    // New to exercise
  | 'returning'   // Restarting after a break
  | 'intermediate'// Exercise regularly
  | 'advanced';   // Experienced with structured training

export type TrainingEnvironmentChoice = 'home' | 'gym' | 'both';

export interface HunterOnboardingData {
  hunterName: string;
  gender: HunterGender;
  archetype: HunterArchetype;
  ageRange: HunterAgeRange;
  isMinorUnder18: boolean;
  fitnessExperience: HunterExperience;
  currentActivityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
  primaryGoal: 'build_strength' | 'boost_endurance' | 'lose_fat' | 'athletic_agility' | 'overall_health';
  secondaryGoals: string[];
  trainingEnvironment: TrainingEnvironmentChoice;
  availableEquipment: string[];
  trainingDaysPerWeek: number;
  preferredDurationMinutes: number;
  physicalLimitations: string[];
  notes?: string;
}

export interface HunterProfile {
  id: string;
  userId?: string;
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
    lastActiveDate: string; // YYYY-MM-DD
    totalWorkouts: number;
    restDaysTaken: number;
    lastRestDate?: string; // YYYY-MM-DD
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
  elapsedSeconds?: number;
  expEarned: number;
  attributeGains: Partial<AttributeScores>;
  tokensEarned: number;
  validationNotes: string;
  isPersonalRecord: boolean;
  verified: boolean;
  isDraft?: boolean;
  lastPausedAt?: string;
}

export interface DraftWorkoutState {
  session: WorkoutSession;
  elapsedSeconds: number;
  activeExerciseIndex: number;
  lastSavedAt: string;
}

export type QuestType = 'daily' | 'weekly' | 'special';

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  category: ExerciseCategory | 'consistency' | 'milestone';
  cycleId: string; // e.g. "daily-2026-11-09" or "weekly-2026-W46"
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

export interface BodyWeightEntry {
  id: string;
  hunterId: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  weightLbs: number;
  notes?: string;
  createdAt: string;
}

export interface BodyMetricsProfile {
  heightCm?: number;
  currentWeightKg?: number;
  targetWeightKg?: number;
  preferredUnit: 'metric' | 'imperial';
}

export interface FitnessGuild {
  id: string;
  name: string;
  tagline: string;
  focus: string;
  memberCount: number;
  isJoined: boolean;
  weeklyGoalDesc: string;
  weeklyGoalCurrent: number;
  weeklyGoalTarget: number;
  accentColor: string;
}

export interface CommunityActivityPost {
  id: string;
  hunterName: string;
  hunterRank: HunterRank;
  workoutTitle: string;
  durationMinutes: number;
  verifiedSets: number;
  expEarned: number;
  timestamp: string;
  kudosCount: number;
  hasKudoed: boolean;
  reflection?: string;
}

export interface LeaderboardEntry {
  rankPosition: number;
  hunterId: string;
  hunterName: string;
  hunterRank: HunterRank;
  activeDaysThisMonth: number;
  consistentSets: number;
  streakDays: number;
  isCurrentUser: boolean;
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'workout_reminder' | 'quest_reset' | 'achievement_unlocked' | 'rank_promotion' | 'community_challenge';
  timestamp: string;
  isRead: boolean;
}

export interface UserPreferences {
  units: 'metric' | 'imperial';
  defaultRestSeconds: number;
  profileVisibility: 'public' | 'friends' | 'private';
  shareWorkoutsToCommunity: boolean;
  notificationsEnabled: {
    workoutReminders: boolean;
    questResets: boolean;
    achievementAlerts: boolean;
    communityAnnouncements: boolean;
  };
}
