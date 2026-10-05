-- ═══════════════════════════════════════════════════════════════════════════════
-- FinPath — Supabase Database Schema
-- ═══════════════════════════════════════════════════════════════════════════════
-- Run this in the Supabase SQL Editor:
--   https://supabase.com/dashboard → SQL Editor → New Query → Paste → Run
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. PROFILES — extends Supabase auth.users with app-specific data
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name       TEXT NOT NULL,
    email           TEXT NOT NULL,
    phone           TEXT,
    date_of_birth   DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Automatically update the updated_at timestamp on row changes
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- RLS: Users can only read and write their own profile
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. FINANCIAL SNAPSHOTS — employment, income, expenses, savings
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.financial_snapshots (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    employment_status   TEXT NOT NULL,
    income_range        TEXT NOT NULL,
    monthly_expenses    TEXT NOT NULL,
    current_savings     TEXT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own snapshots"
    ON public.financial_snapshots FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own snapshots"
    ON public.financial_snapshots FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own snapshots"
    ON public.financial_snapshots FOR UPDATE
    USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. FINANCIAL GOALS — goal type, target amount, timeframe, risk
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.financial_goals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    main_goal       TEXT NOT NULL,
    target_amount   TEXT NOT NULL,
    timeframe       TEXT NOT NULL,
    risk_preference TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals"
    ON public.financial_goals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
    ON public.financial_goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
    ON public.financial_goals FOR UPDATE
    USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. FINANCIAL PLANS — links a snapshot + goals into a submitted plan
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.financial_plans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    snapshot_id     UUID NOT NULL REFERENCES public.financial_snapshots(id) ON DELETE CASCADE,
    goals_id        UUID NOT NULL REFERENCES public.financial_goals(id) ON DELETE CASCADE,
    status          TEXT NOT NULL DEFAULT 'submitted',
    submitted_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plans"
    ON public.financial_plans FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plans"
    ON public.financial_plans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. INDEXES — speed up common queries
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_snapshots_user   ON public.financial_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user       ON public.financial_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_plans_user       ON public.financial_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_plans_submitted  ON public.financial_plans(submitted_at DESC);