-- ==============================================================================
-- AWAKENED FIT - SERVER-AUTHORITATIVE PROGRESSION & TRANSACTIONS
-- Migration: 20261110000000_server_authoritative_progression.sql
-- Description: Server-side stored procedures for atomic workout validation,
-- quest claims, streak calculation, and idempotency protection.
-- ==============================================================================

-- 1. FUNCTION: Authoritative Workout Commit & Reward Grant
CREATE OR REPLACE FUNCTION public.commit_workout_authoritative(
    p_session JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_user_id UUID;
    v_hunter_id UUID;
    v_workout_id UUID;
    v_title TEXT;
    v_duration_min INT;
    v_sets JSONB;
    v_set_count INT := 0;
    v_completed_sets INT := 0;
    v_calculated_exp INT := 0;
    v_calculated_tokens INT := 0;
    v_today_str DATE := CURRENT_DATE;
    v_profile RECORD;
    v_new_exp INT;
    v_new_level INT;
    v_new_next_exp INT;
    v_levels_gained INT := 0;
    v_new_streak INT;
    v_idempotency_key TEXT;
    v_existing_tx UUID;
    v_set_record JSONB;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthenticated request. Valid session token required.';
    END IF;

    -- Lookup hunter profile belonging to authenticated user
    SELECT * INTO v_profile FROM public.hunter_profiles WHERE user_id = v_user_id LIMIT 1;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No hunter profile linked to authenticated user %', v_user_id;
    END IF;

    v_hunter_id := v_profile.id;
    v_workout_id := COALESCE((p_session->>'id')::UUID, uuid_generate_v4());
    v_title := COALESCE(p_session->>'title', 'Autonomous Training Protocol');
    v_duration_min := GREATEST(COALESCE((p_session->>'durationMinutes')::INT, 1), 1);
    v_sets := COALESCE(p_session->'sets', '[]'::JSONB);

    -- Check idempotency
    v_idempotency_key := 'workout_' || v_workout_id::TEXT || '_u_' || v_hunter_id::TEXT;
    SELECT id INTO v_existing_tx FROM public.reward_ledger WHERE idempotency_key = v_idempotency_key LIMIT 1;
    IF v_existing_tx IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', true,
            'duplicate', true,
            'message', 'Workout previously verified and processed.'
        );
    END IF;

    -- Audit completed sets
    FOR v_set_record IN SELECT * FROM jsonb_array_elements(v_sets)
    LOOP
        v_set_count := v_set_count + 1;
        IF (v_set_record->>'completed')::BOOLEAN IS TRUE THEN
            v_completed_sets := v_completed_sets + 1;
        END IF;
    END LOOP;

    -- Anti-cheat: Empty sessions receive 0 rewards
    IF v_completed_sets = 0 THEN
        RAISE EXCEPTION 'Invalid workout: zero completed sets. Empty workouts cannot be rewarded.';
    END IF;

    -- Calculate verified rewards (Conservative EXP formula with caps)
    v_calculated_exp := LEAST(v_completed_sets * 25 + LEAST(v_duration_min * 5, 200), 500);
    v_calculated_tokens := GREATEST(ROUND(v_calculated_exp / 10), 10);

    -- Level calculation
    v_new_exp := v_profile.current_exp + v_calculated_exp;
    v_new_level := v_profile.level;
    v_new_next_exp := v_profile.next_level_exp;

    WHILE v_new_exp >= v_new_next_exp LOOP
        v_new_exp := v_new_exp - v_new_next_exp;
        v_new_level := v_new_level + 1;
        v_levels_gained := v_levels_gained + 1;
        v_new_next_exp := 1000 + 250 * (v_new_level - 1);
    END LOOP;

    -- Streak logic (Calendar-day protection)
    SELECT current_days INTO v_new_streak FROM public.hunter_streaks WHERE hunter_id = v_hunter_id;
    IF NOT FOUND THEN
        v_new_streak := 1;
        INSERT INTO public.hunter_streaks (hunter_id, current_days, best_days, last_active_date, total_workouts)
        VALUES (v_hunter_id, 1, 1, v_today_str, 1);
    ELSE
        -- Update streak safely
        UPDATE public.hunter_streaks
        SET current_days = CASE
                WHEN last_active_date = v_today_str THEN current_days
                WHEN last_active_date = v_today_str - INTERVAL '1 day' THEN current_days + 1
                ELSE 1
            END,
            best_days = GREATEST(best_days, CASE
                WHEN last_active_date = v_today_str THEN current_days
                WHEN last_active_date = v_today_str - INTERVAL '1 day' THEN current_days + 1
                ELSE 1
            END),
            last_active_date = v_today_str,
            total_workouts = total_workouts + 1,
            updated_at = now()
        WHERE hunter_id = v_hunter_id;
    END IF;

    -- Update Hunter Profile
    UPDATE public.hunter_profiles
    SET level = v_new_level,
        current_exp = v_new_exp,
        next_level_exp = v_new_next_exp,
        lifetime_exp = lifetime_exp + v_calculated_exp,
        unallocated_stat_points = unallocated_stat_points + v_levels_gained,
        tokens = tokens + v_calculated_tokens,
        evolution_stones = evolution_stones + v_levels_gained,
        updated_at = now()
    WHERE id = v_hunter_id;

    -- Commit Workout Session Record
    INSERT INTO public.workout_sessions (
        id, hunter_id, title, plan_type, environment, state,
        started_at, completed_at, duration_minutes, elapsed_seconds,
        exp_earned, tokens_earned, verified, validation_notes
    ) VALUES (
        v_workout_id, v_hunter_id, v_title,
        COALESCE(p_session->>'planType', 'custom'),
        COALESCE(p_session->>'environment', 'both'),
        'rewarded',
        COALESCE((p_session->>'startedAt')::TIMESTAMPTZ, now()),
        now(),
        v_duration_min,
        COALESCE((p_session->>'elapsedSeconds')::INT, v_duration_min * 60),
        v_calculated_exp,
        v_calculated_tokens,
        true,
        'Server Authoritative: ' || v_completed_sets || ' sets verified.'
    );

    -- Commit Immutable Transaction Ledger
    INSERT INTO public.reward_ledger (
        hunter_id, event_type, source_id, exp_change, token_change,
        stone_change, description, idempotency_key
    ) VALUES (
        v_hunter_id, 'workout_completion', v_workout_id::TEXT,
        v_calculated_exp, v_calculated_tokens, v_levels_gained,
        'Workout verified: +' || v_calculated_exp || ' EXP, +' || v_calculated_tokens || ' Tokens',
        v_idempotency_key
    );

    RETURN jsonb_build_object(
        'success', true,
        'workoutId', v_workout_id,
        'expEarned', v_calculated_exp,
        'tokensEarned', v_calculated_tokens,
        'levelsGained', v_levels_gained,
        'newLevel', v_new_level
    );
END;
$$;

-- 2. FUNCTION: Authoritative Quest Claim
CREATE OR REPLACE FUNCTION public.claim_quest_authoritative(
    p_quest_id TEXT,
    p_cycle_id TEXT,
    p_exp_reward INT,
    p_token_reward INT,
    p_stone_reward INT DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_user_id UUID;
    v_hunter_id UUID;
    v_idempotency_key TEXT;
    v_existing_tx UUID;
    v_profile RECORD;
    v_new_exp INT;
    v_new_level INT;
    v_new_next_exp INT;
    v_levels_gained INT := 0;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthenticated quest claim request.';
    END IF;

    SELECT * INTO v_profile FROM public.hunter_profiles WHERE user_id = v_user_id LIMIT 1;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Hunter profile not found.';
    END IF;
    v_hunter_id := v_profile.id;

    -- Strict Idempotency check
    v_idempotency_key := 'quest_' || p_quest_id || '_cycle_' || p_cycle_id || '_u_' || v_hunter_id::TEXT;
    SELECT id INTO v_existing_tx FROM public.reward_ledger WHERE idempotency_key = v_idempotency_key LIMIT 1;
    IF v_existing_tx IS NOT NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Quest already claimed for this cycle.');
    END IF;

    -- Level Calculation
    v_new_exp := v_profile.current_exp + p_exp_reward;
    v_new_level := v_profile.level;
    v_new_next_exp := v_profile.next_level_exp;

    WHILE v_new_exp >= v_new_next_exp LOOP
        v_new_exp := v_new_exp - v_new_next_exp;
        v_new_level := v_new_level + 1;
        v_levels_gained := v_levels_gained + 1;
        v_new_next_exp := 1000 + 250 * (v_new_level - 1);
    END LOOP;

    -- Update Profile
    UPDATE public.hunter_profiles
    SET level = v_new_level,
        current_exp = v_new_exp,
        next_level_exp = v_new_next_exp,
        lifetime_exp = lifetime_exp + p_exp_reward,
        unallocated_stat_points = unallocated_stat_points + v_levels_gained,
        tokens = tokens + p_token_reward,
        evolution_stones = evolution_stones + p_stone_reward,
        updated_at = now()
    WHERE id = v_hunter_id;

    -- Insert into Ledger
    INSERT INTO public.reward_ledger (
        hunter_id, event_type, source_id, exp_change, token_change,
        stone_change, description, idempotency_key
    ) VALUES (
        v_hunter_id, 'quest_reward', p_quest_id,
        p_exp_reward, p_token_reward, p_stone_reward,
        'Quest claimed (' || p_cycle_id || '): +' || p_exp_reward || ' EXP',
        v_idempotency_key
    );

    RETURN jsonb_build_object(
        'success', true,
        'expClaimed', p_exp_reward,
        'tokensClaimed', p_token_reward,
        'newLevel', v_new_level
    );
END;
$$;
