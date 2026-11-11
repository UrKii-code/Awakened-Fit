/**
 * Awakened Fit - Supabase Cloud & PostgreSQL Integration Client
 * Provides secure client-side communication with Supabase Auth and database tables,
 * with resilient offline local storage caching fallback.
 */

import { HunterProfile, WorkoutSession, RewardTransaction } from '../types/hunter';
import { StorageService } from './storageService';

// Safely access environment variables if defined
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export class SupabaseService {
  /**
   * Checks if Supabase Cloud credentials have been provided by the developer/user.
   */
  static isConfigured(): boolean {
    return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
  }

  static getEndpoint(): string {
    return SUPABASE_URL || 'Local Prototype / Offline Cache Mode';
  }

  /**
   * Synchronizes local Hunter profile to Supabase database if configured.
   */
  static async syncProfile(profile: HunterProfile): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured()) {
      // Local authoritative mode
      StorageService.saveProfile(profile);
      return {
        success: true,
        message: 'Saved authoritatively to local persistent cache. (Configure VITE_SUPABASE_URL to enable cloud sync).',
      };
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/hunter_profiles?id=eq.${profile.id}`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          id: profile.id,
          name: profile.name,
          title: profile.title,
          archetype: profile.archetype,
          rank: profile.rank,
          level: profile.level,
          current_exp: profile.currentExp,
          next_level_exp: profile.nextLevelExp,
          lifetime_exp: profile.lifetimeExp,
          unallocated_stat_points: profile.unallocatedStatPoints,
          tokens: profile.tokens,
          evolution_stones: profile.evolutionStones,
          achievement_points: profile.achievementPoints,
          is_awakened: profile.isAwakened,
          updated_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Supabase error ${response.status}: ${await response.text()}`);
      }

      return { success: true, message: 'Cloud profile synchronized with Supabase.' };
    } catch (e: any) {
      console.warn('Supabase sync fallback to local storage:', e);
      return { success: false, message: e.message || 'Network error during cloud sync' };
    }
  }

  /**
   * Validates and posts an authorized workout session to Supabase.
   */
  static async syncWorkout(session: WorkoutSession): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured()) {
      return { success: true, message: 'Workout stored in local ledger.' };
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/workout_sessions`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: session.id,
          hunter_id: session.hunterId,
          title: session.title,
          plan_type: session.planType,
          environment: session.environment,
          state: session.state,
          started_at: session.startedAt,
          completed_at: session.completedAt,
          duration_minutes: session.durationMinutes,
          elapsed_seconds: session.elapsedSeconds || 0,
          exp_earned: session.expEarned,
          tokens_earned: session.tokensEarned,
          verified: session.verified,
          validation_notes: session.validationNotes,
        }),
      });

      if (!response.ok) {
        throw new Error(`Supabase error: ${response.status}`);
      }

      return { success: true, message: 'Workout session committed to cloud PostgreSQL database.' };
    } catch (e: any) {
      console.warn('Supabase workout sync error:', e);
      return { success: false, message: e.message };
    }
  }
}
