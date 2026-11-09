import { 
  HunterProfile, 
  HunterRank, 
  WorkoutSession, 
  AttributeScores, 
  RewardTransaction,
  Quest
} from '../types/hunter';
import { HUNTER_RANKS } from '../data/ranks';

export class ProgressionEngine {
  /**
   * Calculates EXP needed to ascend from level L to level L+1.
   * Scaled with a soft polynomial curve for healthy, non-punitive pacing.
   */
  static getExpForLevel(level: number): number {
    if (level <= 1) return 150;
    return Math.floor(120 * Math.pow(level, 1.38));
  }

  /**
   * Evaluates if a hunter qualifies for a higher rank.
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
   * Validates a workout session and returns authoritative EXP and Attribute increases.
   * Workout lifecycle: Planned -> Started -> Completed -> Validated -> Rewarded
   */
  static calculateWorkoutRewards(session: WorkoutSession): {
    expEarned: number;
    tokensEarned: number;
    attributeGains: AttributeScores;
    validationNotes: string;
  } {
    // Count total valid completed sets
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
        // Evaluate volume
        const repFactor = Math.min((set.reps || 10) / 10, 2.5);
        const weightFactor = set.weightKg ? Math.min(1 + (set.weightKg / 60), 2.5) : 1;
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

    // Session completion discipline bonus
    if (totalCompletedSets >= 3) {
      disciplineScore += 0.5;
    }

    // Baseline session completion base EXP
    const baseDurationExp = Math.min(Math.max(session.durationMinutes * 4, 30), 180);
    const setExp = totalCompletedSets * 12;
    const totalExp = Math.round(baseDurationExp + setExp);
    const totalTokens = Math.max(Math.round(totalExp / 8), 10);

    const roundedGains: AttributeScores = {
      strength: Number(strengthScore.toFixed(2)),
      endurance: Number(enduranceScore.toFixed(2)),
      agility: Number(agilityScore.toFixed(2)),
      vitality: Number(vitalityScore.toFixed(2)),
      discipline: Number(disciplineScore.toFixed(2)),
    };

    return {
      expEarned: totalExp,
      tokensEarned: totalTokens,
      attributeGains: roundedGains,
      validationNotes: `Authoritative validation: ${totalCompletedSets} sets verified across ${session.durationMinutes} minutes.`,
    };
  }

  /**
   * Applies rewards to a Hunter Profile, handling multi-level ups and unallocated points.
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
    // Duplicate protection via idempotency check
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

    // Check for level up(s)
    while (newCurrentExp >= newNextExp) {
      newCurrentExp -= newNextExp;
      newLevel += 1;
      levelsGained += 1;
      unallocatedPoints += 1; // 1 bonus stat point per level gained (spec requirement)
      newNextExp = this.getExpForLevel(newLevel);
    }

    // Update attributes with rounded gains
    const newAttributes: AttributeScores = {
      strength: Number((profile.attributes.strength + rewards.attributeGains.strength).toFixed(2)),
      endurance: Number((profile.attributes.endurance + rewards.attributeGains.endurance).toFixed(2)),
      agility: Number((profile.attributes.agility + rewards.attributeGains.agility).toFixed(2)),
      vitality: Number((profile.attributes.vitality + rewards.attributeGains.vitality).toFixed(2)),
      discipline: Number((profile.attributes.discipline + rewards.attributeGains.discipline).toFixed(2)),
    };

    // Evaluate rank promotion
    const calculatedRank = this.evaluateRank(newLevel, newAttributes);
    const newRankPromoted = calculatedRank !== profile.rank ? calculatedRank : null;

    // Create immutable transaction record
    const newTx: RewardTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      eventType: 'workout_completion',
      sourceId: sourceWorkoutId,
      expChange: rewards.expEarned,
      tokenChange: rewards.tokensEarned,
      stoneChange: levelsGained > 0 ? levelsGained : 0,
      description: `Workout validated. +${rewards.expEarned} EXP, +${rewards.tokensEarned} Tokens.`,
      idempotencyKey: `workout_${sourceWorkoutId}`,
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
        currentDays: profile.streak.currentDays + 1,
        bestDays: Math.max(profile.streak.bestDays, profile.streak.currentDays + 1),
        lastActiveDate: new Date().toISOString().split('T')[0],
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
   * Applies quest completion rewards idempotently.
   */
  static claimQuestRewards(
    profile: HunterProfile,
    quest: Quest,
    transactionLog: RewardTransaction[]
  ): {
    updatedProfile: HunterProfile;
    transactions: RewardTransaction[];
  } {
    const existing = transactionLog.find(
      t => t.sourceId === quest.id && t.eventType === 'quest_reward'
    );
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

    // Optional associated attribute gain from quest
    const newAttributes = { ...profile.attributes };
    if (quest.associatedAttribute) {
      newAttributes[quest.associatedAttribute] = Number(
        (newAttributes[quest.associatedAttribute] + 0.5).toFixed(2)
      );
    }

    const newTx: RewardTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      eventType: 'quest_reward',
      sourceId: quest.id,
      expChange: quest.expReward,
      tokenChange: quest.tokenReward,
      stoneChange: quest.stoneReward || 0,
      description: `Quest completed: ${quest.title}`,
      idempotencyKey: `quest_${quest.id}`,
    };

    return {
      updatedProfile: {
        ...profile,
        level: newLevel,
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
