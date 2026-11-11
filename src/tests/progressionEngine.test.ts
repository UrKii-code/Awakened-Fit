/**
 * Awakened Fit - Verification & Automated Test Suite
 * Tests core RPG formulas, exploit prevention, calendar streak rules, and quest cycle calculations.
 */

import { ProgressionEngine } from '../services/progressionEngine';
import { DEFAULT_HUNTER_PROFILE } from '../services/storageService';
import { PlanGenerator } from '../services/planGenerator';
import { AuthService } from '../services/authService';
import { WorkoutSession } from '../types/hunter';
import { getTodayCycleId, getCurrentWeekCycleId } from '../data/quests';

export function runTestSuite(): { passed: number; failed: number; results: { test: string; ok: boolean; message?: string }[] } {
  const results: { test: string; ok: boolean; message?: string }[] = [];

  function assert(name: string, condition: boolean, failMsg?: string) {
    if (condition) {
      results.push({ test: name, ok: true });
    } else {
      results.push({ test: name, ok: false, message: failMsg || 'Assertion failed' });
    }
  }

  // 1. EXP Formula Verification: 1000 + 250 * (Level - 1)
  assert('EXP for Level 1 is 1000', ProgressionEngine.getExpForLevel(1) === 1000);
  assert('EXP for Level 2 is 1250', ProgressionEngine.getExpForLevel(2) === 1250);
  assert('EXP for Level 5 is 2000', ProgressionEngine.getExpForLevel(5) === 2000);
  assert('EXP for Level 10 is 3250', ProgressionEngine.getExpForLevel(10) === 3250);

  // 2. Exploit Prevention: 0 completed sets must be strictly rejected
  const emptySession: WorkoutSession = {
    id: 'test_empty_session',
    hunterId: 'test_hunter',
    title: 'Zero Effort Workout',
    planType: 'custom',
    environment: 'home',
    state: 'completed',
    startedAt: new Date(Date.now() - 300000).toISOString(),
    completedAt: new Date().toISOString(),
    durationMinutes: 5,
    exercises: [
      {
        exerciseId: 'push_up',
        exerciseName: 'Push-Up',
        category: 'bodyweight',
        sets: [
          { setNumber: 1, reps: 10, weightKg: 0, completed: false },
          { setNumber: 2, reps: 10, weightKg: 0, completed: false },
        ],
      },
    ],
    expEarned: 0,
    tokensEarned: 0,
    attributeGains: {},
    validationNotes: '',
    isPersonalRecord: false,
    verified: false,
  };
  const emptyValidation = ProgressionEngine.validateAndCalculateWorkout(emptySession);
  assert('Zero completed sets is rejected', emptyValidation.isValid === false, emptyValidation.rejectReason);

  // 3. Valid Workout Session rewards validation
  const validSession: WorkoutSession = {
    id: 'test_valid_session',
    hunterId: 'test_hunter',
    title: 'Trial of Awakening',
    planType: 'strength_foundations',
    environment: 'home',
    state: 'completed',
    startedAt: new Date(Date.now() - 1200000).toISOString(),
    completedAt: new Date().toISOString(),
    durationMinutes: 20,
    exercises: [
      {
        exerciseId: 'push_up',
        exerciseName: 'Push-Up',
        category: 'bodyweight',
        sets: [
          { setNumber: 1, reps: 12, weightKg: 0, completed: true },
          { setNumber: 2, reps: 10, weightKg: 0, completed: true },
          { setNumber: 3, reps: 8, weightKg: 0, completed: true },
        ],
      },
      {
        exerciseId: 'air_squat',
        exerciseName: 'Air Squat',
        category: 'bodyweight',
        sets: [
          { setNumber: 1, reps: 15, weightKg: 0, completed: true },
          { setNumber: 2, reps: 15, weightKg: 0, completed: true },
        ],
      },
    ],
    expEarned: 0,
    tokensEarned: 0,
    attributeGains: {},
    validationNotes: '',
    isPersonalRecord: false,
    verified: false,
  };
  const validValidation = ProgressionEngine.validateAndCalculateWorkout(validSession);
  assert('Session with 5 completed sets is valid', validValidation.isValid === true);
  assert('Valid session grants > 0 EXP', validValidation.expEarned > 0);
  assert('Valid session grants > 0 Tokens', validValidation.tokensEarned > 0);

  // 4. Idempotent Reward Processing: Duplicate session cannot award double EXP
  const baseProfile = { ...DEFAULT_HUNTER_PROFILE, currentExp: 0, level: 1 };
  const firstApplication = ProgressionEngine.applyWorkoutRewardsToProfile(baseProfile, validValidation, [], validSession.id);
  const secondApplication = ProgressionEngine.applyWorkoutRewardsToProfile(
    firstApplication.updatedProfile,
    validValidation,
    firstApplication.transactions,
    validSession.id
  );
  assert(
    'Duplicate workout processing does not duplicate EXP',
    secondApplication.updatedProfile.currentExp === firstApplication.updatedProfile.currentExp
  );

  // 5. Calendar Streak Integrity: Same day does not increase streak twice
  const todayStr = new Date().toISOString().split('T')[0];
  const profileWithTodayActivity = {
    ...baseProfile,
    streak: { ...baseProfile.streak, currentDays: 3, lastActiveDate: todayStr },
  };
  const streakValidation = ProgressionEngine.applyWorkoutRewardsToProfile(
    profileWithTodayActivity,
    validValidation,
    [],
    'streak_test_session_id'
  );
  assert('Activity on the same calendar day preserves streak at 3', streakValidation.updatedProfile.streak.currentDays === 3);

  // 6. Stat Points Allocation
  const profileWithPoints = {
    ...baseProfile,
    unallocatedStatPoints: 1,
  };
  const allocatedProfile = ProgressionEngine.allocateStatPoint(profileWithPoints, 'strength');
  assert('Allocating point reduces unallocated points to 0', allocatedProfile.unallocatedStatPoints === 0);
  assert('Allocating point increases STR attribute', allocatedProfile.attributes.strength === 11);

  // 7. Quest Cycle IDs
  const todayCycle = getTodayCycleId();
  const weekCycle = getCurrentWeekCycleId();
  assert('Daily cycle starts with daily- prefix', todayCycle.startsWith('daily-'));
  assert('Weekly cycle starts with weekly- prefix', weekCycle.startsWith('weekly-'));

  // 8. Personalized Plan Generator & Safety Adaptation
  const youthProfile = {
    ...DEFAULT_HUNTER_PROFILE.onboarding,
    ageRange: 'under_18' as any,
    physicalLimitations: ['lower_back_pain'],
  };
  const youthPlan = PlanGenerator.generatePlan(youthProfile);
  assert('Youth plan schedule has 7 days', youthPlan.weeklySchedule.length === 7);
  assert('Adaptations recorded in plan', youthPlan.appliedSubstitutions.length > 0 || youthPlan.adaptationReason.length > 0);

  // 9. Auth Service Session
  const session = AuthService.getSession();
  assert('Auth session exists and initialized', session !== null);

  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;

  return { passed, failed, results };
}
