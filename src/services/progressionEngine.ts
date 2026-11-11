import { 
  HunterProfile, 
  HunterRank, 
  WorkoutSession, 
  AttributeScores, 
  RewardTransaction,
  Quest
} from '../types/hunter';
import { HUNTER_RANKS } from '../data/ranks';

export interface WorkoutValidationResult {
  isValid: boolean;
  rejectReason?: string;
  expEarned: number;
  tokensEarned: number;
  attributeGains: AttributeScores;
  validationNotes: string;
}

export class ProgressionEngine {
  /**
   * Configurable Level EXP Formula per Master Specification Section 6:
   * Provisional formula: EXP_next = 1000 + 250 * (Level - 1)
   */
  static getExpForLevel(level: number, useLinearSpec: boolean = true): number {
    if (level < 1) return 1000;
    if (useLinearSpec) {
      return 1000 + 250 * (level - 1);
    }
    // Alternative polynomial curve
    return Math.floor(1000 * Math.pow(level, 1.25));
  }

  /**
   * Evaluates if a hunter qualifies for a higher rank based on Level and total Attribute thresholds.
   * Rank Requirements:
   * E: Level 1+  (Total Attributes 50)
   * D: Level 5+  (Total Attributes 65)
   * C: Level 15+ (Total Attributes 95)
   * B: Level 30+ (Total Attributes 140)
   * A: Level 50+ (Total Attributes 210)
   * S: Level 75+ (Total Attributes 300)
   */
  static evaluateRank(level: number, attributes: AttributeScores): HunterRank {
    const totalStats = Object.values(attributes).reduce((acc, curr) => acc + curr, 0);

    if (level >= HUNTER_RANKS.S.minLevel && totalStats >= HUNTER_RANKS.S.minTotalAttributes) return 'S';
    if (level >= HUNTER_RANKS.A.minLevel && totalStats >= HUNTER_RANKS.A.minTotalAttributes) return 'A';
    if (level >= HUNTER_RANKS.B.minLevel && totalStats >= HUNTER_RANKS.B.minTotalAttributes) return 'B';
    if (level >= HUNTER_RANKS.C.minLevel && totalStats >= HUNTER_RANKS.C.minTotalAttributes) return 'C';
    if (level >= HUNTER_RANKS.D.minLevel && totalStats >= HUNTER_RANKS.D.minTotalAttributes) return 'D';
    return 'E';
  }

  /**
   * Authoritative server-side workout validation.
   * REJECTS empty workouts (zero completed sets or zero meaningful volume).
   * Does NOT auto-assign minimum workout durations to incomplete sessions.
   */
  static validateAndCalculateWorkout(session: WorkoutSession): WorkoutValidationResult {
    // 1. Audit completed sets
    let totalCompletedSets = 0;
    let strengthScore = 0;
    let enduranceScore = 0;
    let agilityScore = 0;
    let vitalityScore = 0;
    let disciplineScore = 0;

    session.exercises.forEach(ex => {
      const completedSets = ex.sets.filter(s => s.completed);
      totalCompletedSets += completedSets.length;

      completedSets.forEach(set => {
        const reps = set.reps || 0;
        const weight = set.weightKg || 0;
        const duration = set.durationSeconds || 0;

        // Rep factor calibrated to meaningful work
        const repFactor = Math.min(Math.max(reps / 10, 0.5), 2.5);
        const weightFactor = weight > 0 ? Math.min(1 + (weight / 60), 3.0) : 1;
        const volumeFactor = repFactor * weightFactor;

        switch (ex.category) {
          case 'strength':
            strengthScore += 0.35 * volumeFactor;
            vitalityScore += 0.15 * volumeFactor;
            break;
          case 'bodyweight':
            strengthScore += 0.25 * volumeFactor;
            agilityScore += 0.15 * volumeFactor;
            vitalityScore += 0.10 * volumeFactor;
            break;
          case 'cardio':
            enduranceScore += 0.40 * volumeFactor;
            agilityScore += 0.20 * volumeFactor;
            break;
          case 'agility':
            agilityScore += 0.35 * volumeFactor;
            enduranceScore += 0.20 * volumeFactor;
            break;
          case 'mobility':
          case 'recovery':
            agilityScore += 0.15;
            vitalityScore += 0.35;
            break;
          case 'core':
            disciplineScore += 0.25;
            vitalityScore += 0.20;
            break;
        }
      });
    });

    // CRITICAL EXPLOIT FIX: If zero completed sets, reject session from receiving rewards
    if (totalCompletedSets === 0) {
      return {
        isValid: false,
        rejectReason: 'Incomplete Session: Zero completed sets recorded. Empty workouts cannot be rewarded.',
        expEarned: 0,
        tokensEarned: 0,
        attributeGains: { strength: 0, endurance: 0, agility: 0, vitality: 0, discipline: 0 },
        validationNotes: 'Rejected: No verified exercise volume logged.',
      };
    }

    // Exact elapsed duration check (do not grant free minimum duration)
    const exactDurationMinutes = session.durationMinutes > 0 ? session.durationMinutes : 1;

    // Discipline bonus for adhering to structured session
    if (totalCompletedSets >= 4) {
      disciplineScore += 0.5;
    }

    // Calculate EXP based on actual volume and verified time
    const durationExp = Math.min(exactDurationMinutes * 5, 200);
    const setExp = totalCompletedSets * 25;
    const totalExp = Math.round(durationExp + setExp);
    const totalTokens = Math.max(Math.round(totalExp / 10), 10);

    const roundedGains: AttributeScores = {
      strength: Number(strengthScore.toFixed(2)),
      endurance: Number(enduranceScore.toFixed(2)),
      agility: Number(agilityScore.toFixed(2)),
      vitality: Number(vitalityScore.toFixed(2)),
      discipline: Number(disciplineScore.toFixed(2)),
    };

    return {
      isValid: true,
      expEarned: totalExp,
      tokensEarned: totalTokens,
      attributeGains: roundedGains,
      validationNotes: `Authoritative Verification: ${totalCompletedSets} verified sets over ${exactDurationMinutes} min.`,
    };
  }

  /**
   * Applies validated workout rewards to the Hunter Profile idempotently.
   */
  static applyWorkoutRewardsToProfile(
    profile: HunterProfile,
    rewards: {
      expEarned: number;
      tokensEarned: number;
      attributeGains: AttributeScores;
    },
    transactionLog: RewardTransaction[],
    sourceWorkoutId: string
  ): {
    updatedProfile: HunterProfile;
    levelsGained: number;
    newRankPromoted: HunterRank | null;
    transactions: RewardTransaction[];
  } {
    // Duplicate protection via idempotency key
    const existing = transactionLog.find(
      t => t.sourceId === sourceWorkoutId && t.eventType === 'workout_completion'
    );
    if (existing) {
      return {
        updatedProfile: profile,
        levelsGained: 0,
        newRankPromoted: null,
        transactions: transactionLog,
      };
    }

    let newCurrentExp = profile.currentExp + rewards.expEarned;
    let newLevel = profile.level;
    let newNextExp = profile.nextLevelExp;
    let levelsGained = 0;
    let unallocatedPoints = profile.unallocatedStatPoints;

    // Multi-level ascension logic
    while (newCurrentExp >= newNextExp) {
      newCurrentExp -= newNextExp;
      newLevel += 1;
      levelsGained += 1;
      unallocatedPoints += 1; // 1 bonus stat point per level gained
      newNextExp = this.getExpForLevel(newLevel);
    }

    // Update attributes with verified gains
    const newAttributes: AttributeScores = {
      strength: Number((profile.attributes.strength + rewards.attributeGains.strength).toFixed(2)),
      endurance: Number((profile.attributes.endurance + rewards.attributeGains.endurance).toFixed(2)),
      agility: Number((profile.attributes.agility + rewards.attributeGains.agility).toFixed(2)),
      vitality: Number((profile.attributes.vitality + rewards.attributeGains.vitality).toFixed(2)),
      discipline: Number((profile.attributes.discipline + rewards.attributeGains.discipline).toFixed(2)),
    };

    // Recalculate rank
    const calculatedRank = this.evaluateRank(newLevel, newAttributes);
    const newRankPromoted = calculatedRank !== profile.rank ? calculatedRank : null;

    // Strict Calendar-based streak calculation
    const todayStr = new Date().toISOString().split('T')[0];
    const lastActiveStr = profile.streak.lastActiveDate;
    
    let newStreakDays = profile.streak.currentDays;
    
    if (lastActiveStr === todayStr) {
      // Multiple workouts on the same day DO NOT inflate streak (spec fix)
      newStreakDays = profile.streak.currentDays;
    } else {
      // Check if last active was yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastActiveStr === yesterdayStr) {
        newStreakDays = profile.streak.currentDays + 1;
      } else if (!lastActiveStr) {
        newStreakDays = 1;
      } else {
        // Gap of > 1 day resets streak
        newStreakDays = 1;
      }
    }

    // Signed transaction record
    const newTx: RewardTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      eventType: 'workout_completion',
      sourceId: sourceWorkoutId,
      expChange: rewards.expEarned,
      tokenChange: rewards.tokensEarned,
      stoneChange: levelsGained > 0 ? levelsGained : 0,
      description: `Workout verified. +${rewards.expEarned} EXP, +${rewards.tokensEarned} Tokens.`,
      idempotencyKey: `workout_${sourceWorkoutId}_u_${profile.id}`,
    };

    const updatedProfile: HunterProfile = {
      ...profile,
      level: newLevel,
      currentExp: newCurrentExp,
      nextLevelExp: newNextExp,
      lifetimeExp: profile.lifetimeExp + rewards.expEarned,
      rank: calculatedRank,
      unallocatedStatPoints: unallocatedPoints,
      attributes: newAttributes,
      tokens: profile.tokens + rewards.tokensEarned,
      evolutionStones: profile.evolutionStones + (levelsGained > 0 ? levelsGained : 0),
      streak: {
        ...profile.streak,
        currentDays: newStreakDays,
        bestDays: Math.max(profile.streak.bestDays, newStreakDays),
        lastActiveDate: todayStr,
        totalWorkouts: profile.streak.totalWorkouts + 1,
      },
      updatedAt: new Date().toISOString(),
    };

    return {
      updatedProfile,
      levelsGained,
      newRankPromoted,
      transactions: [newTx, ...transactionLog],
    };
  }

  /**
   * Allocates a bonus stat point selected by the user.
   */
  static allocateStatPoint(
    profile: HunterProfile,
    attributeKey: keyof AttributeScores
  ): HunterProfile {
    if (profile.unallocatedStatPoints <= 0) {
      return profile;
    }

    const updatedAttributes = {
      ...profile.attributes,
      [attributeKey]: profile.attributes[attributeKey] + 1,
    };

    const newRank = this.evaluateRank(profile.level, updatedAttributes);

    return {
      ...profile,
      unallocatedStatPoints: profile.unallocatedStatPoints - 1,
      attributes: updatedAttributes,
      rank: newRank,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Applies quest completion rewards idempotently with cycle ID protection.
   */
  static claimQuestRewards(
    profile: HunterProfile,
    quest: Quest,
    transactionLog: RewardTransaction[]
  ): {
    updatedProfile: HunterProfile;
    transactions: RewardTransaction[];
  } {
    // Unique cycle ID protection
    const idempotencyKey = `quest_${quest.id}_cycle_${quest.cycleId}_u_${profile.id}`;
    const existing = transactionLog.find(t => t.idempotencyKey === idempotencyKey);
    if (existing) {
      return { updatedProfile: profile, transactions: transactionLog };
    }

    let newCurrentExp = profile.currentExp + quest.expReward;
    let newLevel = profile.level;
    let newNextExp = profile.nextLevelExp;
    let unallocatedPoints = profile.unallocatedStatPoints;

    while (newCurrentExp >= newNextExp) {
      newCurrentExp -= newNextExp;
      newLevel += 1;
      unallocatedPoints += 1;
      newNextExp = this.getExpForLevel(newLevel);
    }

    const newAttributes = { ...profile.attributes };
    if (quest.associatedAttribute) {
      newAttributes[quest.associatedAttribute] = Number(
        (newAttributes[quest.associatedAttribute] + 0.5).toFixed(2)
      );
    }

    const newRank = this.evaluateRank(newLevel, newAttributes);

    const newTx: RewardTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      eventType: 'quest_reward',
      sourceId: quest.id,
      expChange: quest.expReward,
      tokenChange: quest.tokenReward,
      stoneChange: quest.stoneReward || 0,
      description: `Quest verified (${quest.cycleId}): ${quest.title}`,
      idempotencyKey,
    };

    return {
      updatedProfile: {
        ...profile,
        level: newLevel,
        rank: newRank,
        currentExp: newCurrentExp,
        nextLevelExp: newNextExp,
        lifetimeExp: profile.lifetimeExp + quest.expReward,
        unallocatedStatPoints: unallocatedPoints,
        attributes: newAttributes,
        tokens: profile.tokens + quest.tokenReward,
        evolutionStones: profile.evolutionStones + (quest.stoneReward || 0),
        updatedAt: new Date().toISOString(),
      },
      transactions: [newTx, ...transactionLog],
    };
  }
}
