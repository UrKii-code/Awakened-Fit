/**
 * Awakened Fit - Personalized Workout Plan Generator
 * Synthesizes Onboarding physical profile into a custom weekly regimen,
 * with automated injury contraindication filters and exercise substitutions.
 */

import { HunterOnboardingData, Exercise, ExerciseCategory } from '../types/hunter';
import { EXERCISE_LIBRARY } from '../data/exercises';

export interface PlannedDaySession {
  dayNumber: number;
  dayName: string;
  isRestDay: boolean;
  title: string;
  focus: string;
  exercises: Exercise[];
  estimatedMinutes: number;
  safetyNotes?: string[];
}

export interface PersonalizedPlan {
  planTitle: string;
  targetArchetype: string;
  weeklySchedule: PlannedDaySession[];
  adaptationReason: string;
  appliedSubstitutions: Array<{ original: string; substituted: string; reason: string }>;
}

export class PlanGenerator {
  /**
   * Generates a personalized 7-day schedule based on Hunter intake parameters.
   */
  static generatePlan(onboarding: HunterOnboardingData): PersonalizedPlan {
    const daysPerWeek = onboarding.trainingDaysPerWeek || 3;
    const environment = onboarding.trainingEnvironment || 'both';
    const limitations = onboarding.physicalLimitations || [];
    const experience = onboarding.fitnessExperience || 'beginner';
    const duration = onboarding.preferredDurationMinutes || 30;

    // Filter available exercises by environment and equipment
    const gearList = onboarding.availableEquipment || ['Bodyweight'];
    
    const availablePool = EXERCISE_LIBRARY.filter(ex => {
      // Must match equipment or be bodyweight
      const hasEquipment = ex.equipmentRequired.every(gear => 
        gear === 'Bodyweight' || gearList.includes(gear) || (environment === 'gym' && gear !== 'Bodyweight')
      );
      return hasEquipment;
    });

    const substitutions: Array<{ original: string; substituted: string; reason: string }> = [];

    // Filter out contraindicated exercises based on physical limitations
    const safePool = availablePool.filter(ex => {
      if (limitations.includes('Lower Back Sensitivity') && (ex.id === 'deadlift' || ex.targetMuscles.includes('Spinal Erectors'))) {
        substitutions.push({
          original: ex.name,
          substituted: 'Plank / Cat-Cow Restoration',
          reason: 'Lower back protection: heavy spinal shear force eliminated.',
        });
        return false;
      }
      if (limitations.includes('Knee Discomfort') && (ex.id === 'high_intensity_burpees')) {
        substitutions.push({
          original: ex.name,
          substituted: 'Speed Jump Rope / Stationary Cycling',
          reason: 'Knee safeguard: explosive landing shock reduced.',
        });
        return false;
      }
      if (limitations.includes('Shoulder Impingement') && ex.id === 'barbell_bench_press') {
        substitutions.push({
          original: ex.name,
          substituted: 'Push-Ups (Awakened Form)',
          reason: 'Shoulder preservation: natural scapular rhythm prioritized.',
        });
        return false;
      }
      return true;
    });

    // Determine day mapping (e.g. 3 days: Mon / Wed / Fri; 4 days: Mon / Tue / Thu / Fri)
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Choose active days evenly distributed with rest days
    let activeDayIndices: number[] = [];
    if (daysPerWeek === 2) activeDayIndices = [1, 4]; // Tue, Fri
    else if (daysPerWeek === 3) activeDayIndices = [0, 2, 4]; // Mon, Wed, Fri
    else if (daysPerWeek === 4) activeDayIndices = [0, 1, 3, 4]; // Mon, Tue, Thu, Fri
    else if (daysPerWeek === 5) activeDayIndices = [0, 1, 2, 4, 5]; // Mon, Tue, Wed, Fri, Sat
    else if (daysPerWeek >= 6) activeDayIndices = [0, 1, 2, 3, 4, 5]; // Mon-Sat
    else activeDayIndices = [0, 2, 4];

    const weeklySchedule: PlannedDaySession[] = dayNames.map((dayName, idx) => {
      const isActive = activeDayIndices.includes(idx);
      
      if (!isActive) {
        return {
          dayNumber: idx + 1,
          dayName,
          isRestDay: true,
          title: 'Sacred Recovery & Vitality Day',
          focus: 'Tissue rehydration, cellular restoration, and mindful consistency.',
          exercises: safePool.filter(e => e.category === 'mobility' || e.category === 'recovery').slice(0, 2),
          estimatedMinutes: 15,
        };
      }

      // Select 3 to 4 exercises for the active session matching the primary goal
      let dayExercises: Exercise[] = [];
      if (onboarding.primaryGoal === 'build_strength') {
        const strengthPool = safePool.filter(e => e.category === 'strength' || e.category === 'bodyweight');
        const corePool = safePool.filter(e => e.category === 'core' || e.category === 'mobility');
        dayExercises = [...strengthPool.slice(0, 3), ...corePool.slice(0, 1)];
      } else if (onboarding.primaryGoal === 'boost_endurance') {
        const cardioPool = safePool.filter(e => e.category === 'cardio' || e.category === 'agility');
        const bodyweightPool = safePool.filter(e => e.category === 'bodyweight');
        dayExercises = [...cardioPool.slice(0, 2), ...bodyweightPool.slice(0, 2)];
      } else {
        // Balanced
        dayExercises = safePool.slice(0, Math.min(4, safePool.length));
      }

      if (dayExercises.length === 0) {
        dayExercises = safePool.slice(0, 3);
      }

      return {
        dayNumber: idx + 1,
        dayName,
        isRestDay: false,
        title: `${onboarding.archetype.toUpperCase()} Conditioning Protocol: ${dayName}`,
        focus: `${onboarding.primaryGoal.replace('_', ' ').toUpperCase()} • ${environment.toUpperCase()} DOMAIN`,
        exercises: dayExercises,
        estimatedMinutes: duration,
        safetyNotes: limitations.length > 0 ? [`Safeguards active for: ${limitations.join(', ')}`] : undefined,
      };
    });

    return {
      planTitle: `${onboarding.hunterName}'s ${onboarding.archetype.toUpperCase()} Path (Tier: ${experience.toUpperCase()})`,
      targetArchetype: onboarding.archetype,
      weeklySchedule,
      adaptationReason: `Program calibrated for ${daysPerWeek} weekly sessions in a ${environment} environment, prioritizing ${onboarding.primaryGoal.replace('_', ' ')}.`,
      appliedSubstitutions: substitutions,
    };
  }
}
