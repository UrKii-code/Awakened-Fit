import { Quest, Achievement } from '../types/hunter';

export function getTodayCycleId(): string {
  return `daily-${new Date().toISOString().split('T')[0]}`;
}

export function getCurrentWeekCycleId(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
  const weekNum = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  return `weekly-${now.getFullYear()}-W${weekNum}`;
}

export const INITIAL_DAILY_QUESTS: Quest[] = [
  {
    id: 'quest_daily_workout',
    title: 'Daily Protocol: Complete Assigned Workout',
    description: 'Execute your scheduled training session to maintain physical momentum and Hunter discipline.',
    type: 'daily',
    category: 'strength',
    cycleId: getTodayCycleId(),
    targetCount: 1,
    currentCount: 0,
    isCompleted: false,
    isClaimed: false,
    expReward: 100,
    tokenReward: 15,
    associatedAttribute: 'discipline',
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  },
  {
    id: 'quest_daily_sets',
    title: 'Kinetic Volume: Complete 6 Total Sets',
    description: 'Accumulate at least 6 validated training sets across any recognized movement category.',
    type: 'daily',
    category: 'bodyweight',
    cycleId: getTodayCycleId(),
    targetCount: 6,
    currentCount: 0,
    isCompleted: false,
    isClaimed: false,
    expReward: 60,
    tokenReward: 10,
    associatedAttribute: 'strength',
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  },
  {
    id: 'quest_daily_recovery',
    title: 'Recovery Rite: Joint Mobility & Hydration',
    description: 'Perform at least 5 minutes of targeted mobility stretching or record a designated rest day.',
    type: 'daily',
    category: 'recovery',
    cycleId: getTodayCycleId(),
    targetCount: 1,
    currentCount: 0,
    isCompleted: false,
    isClaimed: false,
    expReward: 40,
    tokenReward: 5,
    associatedAttribute: 'vitality',
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  }
];

export const INITIAL_WEEKLY_QUESTS: Quest[] = [
  {
    id: 'quest_weekly_consistency',
    title: 'Weekly Iron Adherence: 3+ Completed Sessions',
    description: 'Complete 3 planned training sessions within the weekly cycle to anchor baseline conditioning.',
    type: 'weekly',
    category: 'consistency',
    cycleId: getCurrentWeekCycleId(),
    targetCount: 3,
    currentCount: 0,
    isCompleted: false,
    isClaimed: false,
    expReward: 250,
    tokenReward: 50,
    stoneReward: 1,
    associatedAttribute: 'discipline',
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
  },
  {
    id: 'quest_weekly_volume',
    title: 'Hunter Endurance: 75 Minutes Total Activity',
    description: 'Log 75 minutes of genuine workout effort (strength, cardio, or mobility).',
    type: 'weekly',
    category: 'cardio',
    cycleId: getCurrentWeekCycleId(),
    targetCount: 75,
    currentCount: 0,
    isCompleted: false,
    isClaimed: false,
    expReward: 200,
    tokenReward: 40,
    associatedAttribute: 'endurance',
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_awakening',
    title: 'The Awakening',
    description: 'Complete Hunter Onboarding and claim your initial class crest.',
    icon: 'Sparkles',
    category: 'awakening',
    isUnlocked: false,
    apValue: 10,
    tokenReward: 25,
  },
  {
    id: 'ach_first_blood',
    title: 'First Blood on the Iron',
    description: 'Log and validate your very first real-world workout session.',
    icon: 'Dumbbell',
    category: 'strength',
    isUnlocked: false,
    apValue: 20,
    tokenReward: 50,
  },
  {
    id: 'ach_streak_3',
    title: 'Iron Habituation',
    description: 'Maintain a 3-day consistency streak (workouts or scheduled recovery count).',
    icon: 'Flame',
    category: 'dedication',
    isUnlocked: false,
    apValue: 25,
    tokenReward: 60,
  },
  {
    id: 'ach_rank_d',
    title: 'Novice Hunter Ascension',
    description: 'Elevate your Hunter Rank from E to Rank D by reaching Level 5.',
    icon: 'ShieldAlert',
    category: 'progression',
    isUnlocked: false,
    apValue: 50,
    tokenReward: 100,
  },
  {
    id: 'ach_century_sets',
    title: 'Centurion of Effort',
    description: 'Complete 100 lifetime workout sets across all exercise categories.',
    icon: 'Trophy',
    category: 'dedication',
    isUnlocked: false,
    apValue: 75,
    tokenReward: 150,
  },
  {
    id: 'ach_mindful_rest',
    title: 'The Discipline of Rest',
    description: 'Log a conscious recovery day to protect your body from overtraining.',
    icon: 'HeartPulse',
    category: 'dedication',
    isUnlocked: false,
    apValue: 15,
    tokenReward: 30,
  }
];
