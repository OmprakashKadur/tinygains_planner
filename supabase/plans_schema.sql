-- Plans Table
create table plans (
  id text primary key, -- 'monthly', 'yearly'
  name text not null,
  description text,
  price numeric not null,
  currency text default 'INR',
  interval text not null, -- 'month', 'year'
  trial_days integer default 0,
  offer_text text,
  razorpay_plan_id text,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for plans (Public read-only)
alter table plans enable row level security;
create policy "Public can view active plans" on plans for select using (active = true);

-- Seed Plans
insert into plans (id, name, price, interval, trial_days, offer_text, razorpay_plan_id) values
('monthly', 'Monthly Pro', 79, 'month', 0, 'Save with Intro Offer', 'plan_monthly_id_placeholder'),
('yearly', 'Yearly Pro', 699, 'year', 7, 'Best Value', 'plan_yearly_id_placeholder');

-- Update Subscriptions Table
alter table subscriptions 
add column if not exists plan_id text references plans(id),
add column if not exists trial_start timestamp with time zone,
add column if not exists trial_end timestamp with time zone;

-- Update Subscription Status Enum if needed (already has created, active, etc. add trialing?)
-- Postgres enums are hard to update in simple queries sometimes, checking if exists.
-- Assuming 'trialing' might be needed. Alternatively map 'active' + trial_end > now.
-- Let's stick to existing statuses or use a check.
-- Status enum: 'created', 'active', 'paused', 'cancelled', 'past_due'.
-- I'll use 'active' for trial too, just check trial_end.
