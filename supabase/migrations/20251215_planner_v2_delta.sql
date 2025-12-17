-- ----------------------------
-- Planner v2 Migration Delta
-- ----------------------------

-- 1. Create Goal Status Enum
create type goal_status as enum ('not_started', 'in_progress', 'completed', 'postponed');

-- 2. Create Planner Hierarchy Tables

-- Yearly Goals
create table yearly_goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  year integer not null,
  title text not null,
  description text,
  status goal_status default 'not_started',
  color text default '#6200EE',
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
  month integer not null,
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
  week integer not null,
  title text not null,
  status goal_status default 'not_started',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table weekly_goals enable row level security;
create policy "Users can view own weekly goals" on weekly_goals for select using (auth.uid() = user_id);
create policy "Users can insert own weekly goals" on weekly_goals for insert with check (auth.uid() = user_id);
create policy "Users can update own weekly goals" on weekly_goals for update using (auth.uid() = user_id);
create policy "Users can delete own weekly goals" on weekly_goals for delete using (auth.uid() = user_id);

-- Daily Goals
create table daily_goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  weekly_goal_id uuid references weekly_goals(id) on delete set null,
  date date not null default CURRENT_DATE,
  title text not null,
  status goal_status default 'not_started',
  priority text default 'medium',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table daily_goals enable row level security;
create policy "Users can view their own daily goals" on daily_goals for select using (auth.uid() = user_id);
create policy "Users can insert their own daily goals" on daily_goals for insert with check (auth.uid() = user_id);
create policy "Users can update their own daily goals" on daily_goals for update using (auth.uid() = user_id);
create policy "Users can delete their own daily goals" on daily_goals for delete using (auth.uid() = user_id);
