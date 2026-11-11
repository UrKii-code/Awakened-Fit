/**
 * Awakened Fit - Supabase Cloud & PostgreSQL Integration Client
 * Provides secure communication using the official @supabase/supabase-js client,
 * using authenticated user access tokens (not public anon keys) for RLS enforcement.
 */

import { HunterProfile, WorkoutSession } from '../types/hunter';
import { StorageService } from './storageService';
import { AuthService, supabaseClient } from './authService';

export class SupabaseService {
  /**
   * Checks if Supabase Cloud credentials have been provided by environment variables.
   */
  static isConfigured(): boolean {
    return AuthService.isCloudConfigured();
  }

  static getEndpoint(): string {
    return AuthService.getEndpoint() || 'Local Offline Mode';
  }

  /**
   * Synchronizes Hunter profile to Supabase using the user's authenticated session.
   * Enforces RLS by passing the authenticated user's JWT.
   */
  static async syncProfile(profile: HunterProfile): Promise<{ success: boolean; message: string }> {
    // Always persist to local cache first
    StorageService.saveProfile(profile);

    if (!this.isConfigured() || !supabaseClient) {
      return {
        success: true,
        message: 'Saved securely to local storage.',
      };
    }

    const session = AuthService.getSession();
    if (!session.isAuthenticated || !session.user) {
      return {
        success: true,
        message: 'Saved locally. Sign in to sync with Supabase Cloud.',
      };
    }

    try {
      // Upsert hunter profile record with authenticated user ownership
      const { error } = await supabaseClient
        .from('hunter_profiles')
        .upsert({
          id: profile.id,
          user_id: session.user.id, // Enforce authenticated owner
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
        }, { onConflict: 'id' });

      if (error) {
        throw error;
      }

      // Upsert attributes
      const { error: attrError } = await supabaseClient
        .from('hunter_attributes')
        .upsert({
          hunter_id: profile.id,
          strength: profile.attributes.strength,
          endurance: profile.attributes.endurance,
          agility: profile.attributes.agility,
          vitality: profile.attributes.vitality,
          discipline: profile.attributes.discipline,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'hunter_id' });

      if (attrError) {
        console.warn('Attribute cloud sync warning:', attrError.message);
      }

      return { success: true, message: 'Cloud profile synchronized with Supabase.' };
    } catch (e: any) {
      console.warn('Supabase sync fallback:', e);
      return { success: false, message: e.message || 'Error during cloud sync.' };
    }
  }

  /**
   * Commits a validated workout session to Supabase with authenticated ownership.
   */
  static async syncWorkout(session: WorkoutSession): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured() || !supabaseClient) {
      return { success: true, message: 'Workout stored in local ledger.' };
    }

    const auth = AuthService.getSession();
    if (!auth.isAuthenticated || !auth.user) {
      return { success: true, message: 'Saved to local workout log.' };
    }

    try {
      const { error } = await supabaseClient
        .from('workout_sessions')
        .insert({
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
        });

      if (error) {
        throw error;
      }

      // Sync sets if present
      const setsToInsert = session.exercises.flatMap(ex =>
        ex.sets.map(s => ({
          workout_session_id: session.id,
          exercise_id: ex.exerciseId,
          exercise_name: ex.exerciseName,
          set_number: s.setNumber,
          completed: s.completed,
          reps: s.reps || 0,
          weight_kg: s.weightKg || 0,
          duration_seconds: s.durationSeconds || 0,
          rpe: s.rpe || null,
        }))
      );

      if (setsToInsert.length > 0) {
        await supabaseClient.from('workout_sets').insert(setsToInsert);
      }

      return { success: true, message: 'Workout session committed to cloud PostgreSQL database.' };
    } catch (e: any) {
      console.warn('Supabase workout sync error:', e);
      return { success: false, message: e.message };
    }
  }
}
