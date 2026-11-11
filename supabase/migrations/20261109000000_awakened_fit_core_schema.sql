-- ==============================================================================
-- AWAKENED FIT - AUTHORITATIVE POSTGRESQL & SUPABASE DATABASE SCHEMA
-- Migration: 20261109000000_awakened_fit_core_schema.sql
-- Description: Core tables, constraints, indexes, and Row Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. HUNTER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.hunter_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(64) NOT NULL,
    title VARCHAR(128) NOT NULL DEFAULT 'Newly Awakened',
    archetype VARCHAR(32) NOT NULL CHECK (archetype IN ('berserker', 'phantom', 'guardian', 'arcane')),
    rank VARCHAR(2) NOT NULL DEFAULT 'E' CHECK (rank IN ('E', 'D', 'C', 'B', 'A', 'S')),
    level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
    current_exp INTEGER NOT NULL DEFAULT 0 CHECK (current_exp >= 0),
    next_level_exp INTEGER NOT NULL DEFAULT 1000 CHECK (next_level_exp > 0),
    lifetime_exp BIGINT NOT NULL DEFAULT 0 CHECK (lifetime_exp >= 0),
    unallocated_stat_points INTEGER NOT NULL DEFAULT 0 CHECK (unallocated_stat_points >= 0),
    tokens INTEGER NOT NULL DEFAULT 50 CHECK (tokens >= 0),
    evolution_stones INTEGER NOT NULL DEFAULT 0 CHECK (evolution_stones >= 0),
    achievement_points INTEGER NOT NULL DEFAULT 0 CHECK (achievement_points >= 0),
    is_awakened BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. HUNTER ATTRIBUTES TABLE (Baseline 10.0)
CREATE TABLE IF NOT EXISTS public.hunter_attributes (
    hunter_id UUID PRIMARY KEY REFERENCES public.hunter_profiles(id) ON DELETE CASCADE,
    strength NUMERIC(7,2) NOT NULL DEFAULT 10.00 CHECK (strength >= 10.00),
    endurance NUMERIC(7,2) NOT NULL DEFAULT 10.00 CHECK (endurance >= 10.00),
    agility NUMERIC(7,2) NOT NULL DEFAULT 10.00 CHECK (agility >= 10.00),
    vitality NUMERIC(7,2) NOT NULL DEFAULT 10.00 CHECK (vitality >= 10.00),
    discipline NUMERIC(7,2) NOT NULL DEFAULT 10.00 CHECK (discipline >= 10.00),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. ONBOARDING & FITNESS PREFERENCES
CREATE TABLE IF NOT EXISTS public.hunter_onboarding (
    hunter_id UUID PRIMARY KEY REFERENCES public.hunter_profiles(id) ON DELETE CASCADE,
    gender VARCHAR(32) NOT NULL,
    age_range VARCHAR(32) NOT NULL,
    is_minor_under_18 BOOLEAN NOT NULL DEFAULT FALSE,
    fitness_experience VARCHAR(32) NOT NULL,
    activity_level VARCHAR(32) NOT NULL,
    primary_goal VARCHAR(64) NOT NULL,
    secondary_goals TEXT[] DEFAULT '{}',
    training_environment VARCHAR(32) NOT NULL CHECK (training_environment IN ('home', 'gym', 'both')),
    available_equipment TEXT[] DEFAULT '{}',
    training_days_per_week SMALLINT NOT NULL DEFAULT 3,
    preferred_duration_minutes SMALLINT NOT NULL DEFAULT 30,
    physical_limitations TEXT[] DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. HUNTER STREAKS & HABITUATION
CREATE TABLE IF NOT EXISTS public.hunter_streaks (
    hunter_id UUID PRIMARY KEY REFERENCES public.hunter_profiles(id) ON DELETE CASCADE,
    current_days INTEGER NOT NULL DEFAULT 0 CHECK (current_days >= 0),
    best_days INTEGER NOT NULL DEFAULT 0 CHECK (best_days >= 0),
    last_active_date DATE,
    last_rest_date DATE,
    total_workouts INTEGER NOT NULL DEFAULT 0 CHECK (total_workouts >= 0),
    rest_days_taken INTEGER NOT NULL DEFAULT 0 CHECK (rest_days_taken >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. WORKOUT SESSIONS (Authorized Physical Effort)
CREATE TABLE IF NOT EXISTS public.workout_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hunter_id UUID NOT NULL REFERENCES public.hunter_profiles(id) ON DELETE CASCADE,
    title VARCHAR(128) NOT NULL,
    plan_type VARCHAR(64) NOT NULL,
    environment VARCHAR(32) NOT NULL,
    state VARCHAR(32) NOT NULL DEFAULT 'completed' CHECK (state IN ('planned', 'started', 'completed', 'validated', 'rewarded')),
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes >= 0),
    elapsed_seconds INTEGER NOT NULL DEFAULT 0,
    exp_earned INTEGER NOT NULL DEFAULT 0 CHECK (exp_earned >= 0),
    tokens_earned INTEGER NOT NULL DEFAULT 0 CHECK (tokens_earned >= 0),
    is_personal_record BOOLEAN NOT NULL DEFAULT FALSE,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    validation_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. WORKOUT SETS TABLE
CREATE TABLE IF NOT EXISTS public.workout_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
    exercise_id VARCHAR(64) NOT NULL,
    exercise_name VARCHAR(128) NOT NULL,
    set_number SMALLINT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    reps SMALLINT DEFAULT 0,
    weight_kg NUMERIC(6,2) DEFAULT 0.00,
    duration_seconds INTEGER DEFAULT 0,
    rpe SMALLINT CHECK (rpe >= 1 AND rpe <= 10)
);

-- 7. PROGRESSION & REWARD TRANSACTION LEDGER (Immutable)
CREATE TABLE IF NOT EXISTS public.reward_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hunter_id UUID NOT NULL REFERENCES public.hunter_profiles(id) ON DELETE CASCADE,
    event_type VARCHAR(64) NOT NULL CHECK (event_type IN ('workout_completion', 'quest_reward', 'level_up', 'stat_allocation', 'rank_promotion')),
    source_id VARCHAR(128) NOT NULL,
    exp_change INTEGER NOT NULL DEFAULT 0,
    token_change INTEGER NOT NULL DEFAULT 0,
    stone_change INTEGER NOT NULL DEFAULT 0,
    description TEXT NOT NULL,
    idempotency_key VARCHAR(255) NOT NULL UNIQUE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. QUESTS & ACHIEVEMENTS TRACKING
CREATE TABLE IF NOT EXISTS public.quest_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hunter_id UUID NOT NULL REFERENCES public.hunter_profiles(id) ON DELETE CASCADE,
    quest_def_id VARCHAR(64) NOT NULL,
    cycle_id VARCHAR(64) NOT NULL, -- e.g. 'daily-2026-11-09' or 'weekly-2026-W46'
    current_count INTEGER NOT NULL DEFAULT 0,
    target_count INTEGER NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    is_claimed BOOLEAN NOT NULL DEFAULT FALSE,
    exp_reward INTEGER NOT NULL,
    token_reward INTEGER NOT NULL,
    stone_reward INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT unique_hunter_quest_cycle UNIQUE (hunter_id, quest_def_id, cycle_id)
);

-- ==============================================================================
-- INDEXES FOR SCALE & QUERY OPTIMIZATION
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_hunter_profiles_user_id ON public.hunter_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_hunter_id ON public.workout_sessions(hunter_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_started_at ON public.workout_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_reward_ledger_hunter_id ON public.reward_ledger(hunter_id);
CREATE INDEX IF NOT EXISTS idx_reward_ledger_idempotency ON public.reward_ledger(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_quest_instances_hunter_cycle ON public.quest_instances(hunter_id, cycle_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.hunter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hunter_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hunter_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hunter_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_instances ENABLE ROW LEVEL SECURITY;

-- Hunters can only read/update their own profile records
CREATE POLICY "Users view own hunter profile" ON public.hunter_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users update own hunter profile" ON public.hunter_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users insert own hunter profile" ON public.hunter_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Attributes RLS
CREATE POLICY "Users view own attributes" ON public.hunter_attributes
    FOR SELECT USING (
        hunter_id IN (SELECT id FROM public.hunter_profiles WHERE user_id = auth.uid())
    );

-- Workouts RLS
CREATE POLICY "Users manage own workouts" ON public.workout_sessions
    FOR ALL USING (
        hunter_id IN (SELECT id FROM public.hunter_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users manage own sets" ON public.workout_sets
    FOR ALL USING (
        workout_session_id IN (
            SELECT id FROM public.workout_sessions WHERE hunter_id IN (
                SELECT id FROM public.hunter_profiles WHERE user_id = auth.uid()
            )
        )
    );

-- Ledger RLS: Read-only for users (inserts handled by trusted functions)
CREATE POLICY "Users view own ledger" ON public.reward_ledger
    FOR SELECT USING (
        hunter_id IN (SELECT id FROM public.hunter_profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users view own quests" ON public.quest_instances
    FOR ALL USING (
        hunter_id IN (SELECT id FROM public.hunter_profiles WHERE user_id = auth.uid())
    );
