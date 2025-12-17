-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ----------------------------
-- Enums
-- ----------------------------
create type subscription_plan as enum ('free', 'pro');
create type subscription_status as enum ('created', 'active', 'paused', 'cancelled', 'past_due');
create type energy_level as enum ('low', 'medium', 'high');
create type focus_block_type as enum ('deep', 'light', 'admin');
create type focus_block_status as enum ('planned', 'active', 'done', 'abandoned');
create type goal_status as enum ('not_started', 'in_progress', 'completed', 'postponed');

-- ----------------------------
-- Profiles Table
-- ----------------------------
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Profiles
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------
-- Subscriptions Table
-- ----------------------------
create table subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  razorpay_subscription_id text,
  plan subscription_plan default 'free',
  status subscription_status default 'created',
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table subscriptions enable row level security;
create policy "Users can view own subscription" on subscriptions for select using (auth.uid() = user_id);

-- ----------------------------
-- Planner Hierarchy Tables
-- ----------------------------

-- Yearly Goals
create table yearly_goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  year integer not null,
  title text not null,
  description text,
  status goal_status default 'not_started',
  color text default '#6200EE', -- MD3 Purple
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table yearly_goals enable row level security;
create policy "Users can view own yearly goals" on yearly_goals for select using (auth.uid() = user_id);
create policy "Users can insert own yearly goals" on yearly_goals for insert with check (auth.uid() = user_id);
create policy "Users can update own yearly goals" on yearly_goals for update using (auth.uid() = user_id);
create policy "Users can delete own yearly goals" on yearly_goals for delete using (auth.uid() = user_id);

-- Monthly Goals
create table monthly_goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  yearly_goal_id uuid references yearly_goals(id) on delete set null,
  year integer not null,
  month integer not null, -- 1-12
  title text not null,
  status goal_status default 'not_started',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table monthly_goals enable row level security;
create policy "Users can view own monthly goals" on monthly_goals for select using (auth.uid() = user_id);
create policy "Users can insert own monthly goals" on monthly_goals for insert with check (auth.uid() = user_id);
create policy "Users can update own monthly goals" on monthly_goals for update using (auth.uid() = user_id);
create policy "Users can delete own monthly goals" on monthly_goals for delete using (auth.uid() = user_id);

-- Weekly Goals
create table weekly_goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  monthly_goal_id uuid references monthly_goals(id) on delete set null,
  year integer not null,
  week integer not null, -- ISO Week 1-52
  title text not null,
  status goal_status default 'not_started',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table weekly_goals enable row level security;
create policy "Users can view own weekly goals" on weekly_goals for select using (auth.uid() = user_id);
create policy "Users can insert own weekly goals" on weekly_goals for insert with check (auth.uid() = user_id);
create policy "Users can update own weekly goals" on weekly_goals for update using (auth.uid() = user_id);
create policy "Users can delete own weekly goals" on weekly_goals for delete using (auth.uid() = user_id);


-- ----------------------------
-- Daily Goals (Replacing Daily Intent & Focus Blocks)
-- ----------------------------
create table daily_goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  weekly_goal_id uuid references weekly_goals(id) on delete set null,
  date date not null default CURRENT_DATE,
  title text not null,
  status goal_status default 'not_started',
  priority text default 'medium', -- low, medium, high
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Daily Goals
alter table daily_goals enable row level security;

create policy "Users can view their own daily goals"
on daily_goals for select
using (auth.uid() = user_id);

create policy "Users can insert their own daily goals"
on daily_goals for insert
with check (auth.uid() = user_id);

create policy "Users can update their own daily goals"
on daily_goals for update
using (auth.uid() = user_id);

create policy "Users can delete their own daily goals"
on daily_goals for delete
using (auth.uid() = user_id);

-- ----------------------------
-- Daily Reflections Table
-- ----------------------------
create table daily_reflections (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  date date not null default CURRENT_DATE,
  what_went_well text,
  energy_drains text,
  intent_respected boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);
alter table daily_reflections enable row level security;
create policy "Users can view own reflections" on daily_reflections for select using (auth.uid() = user_id);
create policy "Users can insert own reflections" on daily_reflections for insert with check (auth.uid() = user_id);
create policy "Users can update own reflections" on daily_reflections for update using (auth.uid() = user_id);

-- ----------------------------
-- Legacy Tables (Optional - Kept for reference or backward compat if needed)
-- ----------------------------

-- Daily Intents (Deprecated by Daily Goals)
create table daily_intents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  week_goal_id uuid references weekly_goals(id) on delete set null, -- Optional link
  date date not null default CURRENT_DATE,
  intent_text text not null,
  energy_level energy_level not null default 'medium',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);
alter table daily_intents enable row level security;
create policy "Users can view own intents" on daily_intents for select using (auth.uid() = user_id);
create policy "Users can insert own intents" on daily_intents for insert with check (auth.uid() = user_id);
create policy "Users can update own intents" on daily_intents for update using (auth.uid() = user_id);
create policy "Users can delete own intents" on daily_intents for delete using (auth.uid() = user_id);

-- Focus Blocks (Deprecated)
create table focus_blocks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  date date not null default CURRENT_DATE,
  task_name text not null,
  block_type focus_block_type default 'deep',
  status focus_block_status default 'planned',
  position integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table focus_blocks enable row level security;
create policy "Users can view own blocks" on focus_blocks for select using (auth.uid() = user_id);
create policy "Users can insert own blocks" on focus_blocks for insert with check (auth.uid() = user_id);
create policy "Users can update own blocks" on focus_blocks for update using (auth.uid() = user_id);
create policy "Users can delete own blocks" on focus_blocks for delete using (auth.uid() = user_id);

-- Focus Sessions
create table focus_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  block_id uuid references focus_blocks(id) on delete set null,
  duration_seconds integer not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table focus_sessions enable row level security;
create policy "Users can view own sessions" on focus_sessions for select using (auth.uid() = user_id);
create policy "Users can insert own sessions" on focus_sessions for insert with check (auth.uid() = user_id);

-- ----------------------------
-- Analytics View
-- ----------------------------
create or replace view user_analytics_daily as
select
  user_id,
  date(created_at) as day,
  sum(duration_seconds) as total_focus_seconds,
  count(*) as total_sessions
from focus_sessions
group by user_id, date(created_at);
