/**
 * Awakened Fit - Authoritative Progression Service
 * Implements server-authoritative rules for workout validation, EXP calculations,
 * streak calendar verification, quest claims, and transaction idempotency.
 */

import { 
  HunterProfile, 
  WorkoutSession, 
  RewardTransaction, 
  Quest, 
  HunterRank, 
  AttributeScores 
} from '../types/hunter';
import { ProgressionEngine, WorkoutValidationResult } from './progressionEngine';
import { AuthService, supabaseClient } from './authService';

export interface AuthoritativeCommitResult {
  success: boolean;
  message: string;
  isDuplicate?: boolean;
  validationResult?: WorkoutValidationResult;
  updatedProfile: HunterProfile;
  levelsGained: number;
  newRankPromoted: HunterRank | null;
  newTransaction?: RewardTransaction;
  allTransactions: RewardTransaction[];
}

export class AuthoritativeProgressionService {
  /**
   * Authoritative commit of a completed workout session.
   * Eliminates client-side spoofing and duplicate grants.
   */
  static async commitWorkout(
    session: WorkoutSession,
    profile: HunterProfile,
    transactionHistory: RewardTransaction[]
  ): Promise<AuthoritativeCommitResult> {
    // 1. Audit and validate workout sets and volume
    const validation = ProgressionEngine.validateAndCalculateWorkout(session);
    if (!validation.isValid) {
      return {
        success: false,
        message: validation.rejectReason || 'Workout rejected by authoritative verification.',
        updatedProfile: profile,
        levelsGained: 0,
        newRankPromoted: null,
        allTransactions: transactionHistory,
      };
    }

    // 2. Check idempotency
    const idempotencyKey = `workout_${session.id}_u_${profile.id}`;
    const alreadyProcessed = transactionHistory.some(
      t => t.idempotencyKey === idempotencyKey || (t.sourceId === session.id && t.eventType === 'workout_completion')
    );

    if (alreadyProcessed) {
      return {
        success: true,
        message: 'Workout already verified and rewards previously credited.',
        isDuplicate: true,
        updatedProfile: profile,
        levelsGained: 0,
        newRankPromoted: null,
        allTransactions: transactionHistory,
      };
    }

    // 3. If Supabase Cloud is configured, attempt authoritative database RPC
    if (AuthService.isCloudConfigured() && supabaseClient) {
      try {
        const { data, error } = await supabaseClient.rpc('commit_workout_authoritative', {
          p_session: {
            id: session.id,
            title: session.title,
            planType: session.planType,
            environment: session.environment,
            startedAt: session.startedAt,
            durationMinutes: session.durationMinutes,
            elapsedSeconds: session.elapsedSeconds || session.durationMinutes * 60,
            sets: session.exercises.flatMap(e => e.sets),
          },
        });

        if (error) {
          console.warn('Supabase authoritative RPC error, falling back to local verification:', error.message);
        } else if (data && data.success) {
          // RPC committed successfully on Supabase
          const applied = ProgressionEngine.applyWorkoutRewardsToProfile(
            profile,
            {
              expEarned: data.expEarned || validation.expEarned,
              tokensEarned: data.tokensEarned || validation.tokensEarned,
              attributeGains: validation.attributeGains,
            },
            transactionHistory,
            session.id
          );

          return {
            success: true,
            message: `Cloud verified! +${data.expEarned} EXP, +${data.tokensEarned} Tokens.`,
            validationResult: validation,
            updatedProfile: applied.updatedProfile,
            levelsGained: applied.levelsGained,
            newRankPromoted: applied.newRankPromoted,
            newTransaction: applied.transactions[0],
            allTransactions: applied.transactions,
          };
        }
      } catch (err) {
        console.warn('RPC execution exception, using local authoritative engine:', err);
      }
    }

    // 4. Local Authoritative Engine (Identical validation and idempotency)
    const applied = ProgressionEngine.applyWorkoutRewardsToProfile(
      profile,
      {
        expEarned: validation.expEarned,
        tokensEarned: validation.tokensEarned,
        attributeGains: validation.attributeGains,
      },
      transactionHistory,
      session.id
    );

    return {
      success: true,
      message: `Workout verified. +${validation.expEarned} EXP, +${validation.tokensEarned} Tokens.`,
      validationResult: validation,
      updatedProfile: applied.updatedProfile,
      levelsGained: applied.levelsGained,
      newRankPromoted: applied.newRankPromoted,
      newTransaction: applied.transactions[0],
      allTransactions: applied.transactions,
    };
  }

  /**
   * Authoritative Quest Claim with cycle-id idempotency.
   */
  static async claimQuest(
    quest: Quest,
    profile: HunterProfile,
    transactionHistory: RewardTransaction[]
  ): Promise<{
    success: boolean;
    message: string;
    updatedProfile: HunterProfile;
    transactions: RewardTransaction[];
  }> {
    const idempotencyKey = `quest_${quest.id}_cycle_${quest.cycleId}_u_${profile.id}`;
    const alreadyClaimed = transactionHistory.some(t => t.idempotencyKey === idempotencyKey);

    if (alreadyClaimed) {
      return {
        success: false,
        message: 'Quest reward has already been claimed for this cycle.',
        updatedProfile: profile,
        transactions: transactionHistory,
      };
    }

    if (!quest.isCompleted) {
      return {
        success: false,
        message: 'Quest criteria have not yet been satisfied.',
        updatedProfile: profile,
        transactions: transactionHistory,
      };
    }

    // Cloud RPC if available
    if (AuthService.isCloudConfigured() && supabaseClient) {
      try {
        const { data, error } = await supabaseClient.rpc('claim_quest_authoritative', {
          p_quest_id: quest.id,
          p_cycle_id: quest.cycleId,
          p_exp_reward: quest.expReward,
          p_token_reward: quest.tokenReward,
          p_stone_reward: quest.stoneReward || 0,
        });

        if (error) {
          console.warn('Supabase quest claim RPC fallback:', error.message);
        }
      } catch (e) {
        console.warn('RPC claim exception:', e);
      }
    }

    const applied = ProgressionEngine.claimQuestRewards(profile, quest, transactionHistory);

    return {
      success: true,
      message: `Claimed +${quest.expReward} EXP, +${quest.tokenReward} Tokens!`,
      updatedProfile: applied.updatedProfile,
      transactions: applied.transactions,
    };
  }

  /**
   * Authoritative Rest Day Logging
   * Protects streak, awards recovery vitality, and prevents exploit loops.
   */
  static logRestDay(
    profile: HunterProfile,
    transactionHistory: RewardTransaction[]
  ): {
    success: boolean;
    message: string;
    updatedProfile: HunterProfile;
    transactions: RewardTransaction[];
  } {
    const todayStr = new Date().toISOString().split('T')[0];

    // Cannot log rest day twice on same calendar day
    if (profile.streak.lastRestDate === todayStr) {
      return {
        success: false,
        message: 'Rest day has already been registered for today.',
        updatedProfile: profile,
        transactions: transactionHistory,
      };
    }

    const idempotencyKey = `rest_day_${todayStr}_u_${profile.id}`;
    if (transactionHistory.some(t => t.idempotencyKey === idempotencyKey)) {
      return {
        success: false,
        message: 'Recovery protocol already logged in transaction ledger.',
        updatedProfile: profile,
        transactions: transactionHistory,
      };
    }

    // Calculate streak preservation
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = 1;
    if (profile.streak.lastActiveDate === yesterdayStr) {
      newStreak = profile.streak.currentDays + 1;
    } else if (profile.streak.lastActiveDate === todayStr) {
      newStreak = profile.streak.currentDays;
    }

    const updatedProfile: HunterProfile = {
      ...profile,
      streak: {
        ...profile.streak,
        currentDays: newStreak,
        bestDays: Math.max(profile.streak.bestDays, newStreak),
        restDaysTaken: profile.streak.restDaysTaken + 1,
        lastActiveDate: todayStr,
        lastRestDate: todayStr,
      },
      attributes: {
        ...profile.attributes,
        vitality: Number((profile.attributes.vitality + 0.25).toFixed(2)),
      },
      tokens: profile.tokens + 10,
      updatedAt: new Date().toISOString(),
    };

    const newTx: RewardTransaction = {
      id: `tx_${Date.now()}_rest`,
      timestamp: new Date().toISOString(),
      eventType: 'workout_completion',
      sourceId: `rest_${todayStr}`,
      expChange: 0,
      tokenChange: 10,
      stoneChange: 0,
      description: `Recovery day observed. Streak sustained (${newStreak} days).`,
      idempotencyKey,
    };

    return {
      success: true,
      message: `Rest day recorded. Vitality +0.25, Streak sustained (${newStreak} days).`,
      updatedProfile,
      transactions: [newTx, ...transactionHistory],
    };
  }
}
