-- Update handle_new_user to create a default trial subscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Create Profile
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');

  -- Create Default 7-Day Trial Subscription
  -- Assuming 'pro' plan or similar. We use 'yearly' or 'monthly' IDs?
  -- User didn't specify WHICH plan the trial is for, but usually it's "Pro" access.
  -- I'll use a placeholder 'trial' plan ID or just set status='active' with a null plan_id?
  -- Subscriptions table has 'plan_id'.
  -- Let's assign them to 'yearly' (as it's best value) or just generic 'trial'.
  -- The previous schema has 'plan' enum ('free', 'pro').
  -- My new schema uses 'plans' table.
  -- I will try to assign plan_id='yearly' but set status='active' and trial dates.
  
  insert into public.subscriptions (user_id, status, plan_id, trial_start, trial_end)
  values (
    new.id, 
    'active', 
    'yearly', -- Default to Yearly trial? Or null? Let's use 'yearly' so they see "Yearly Pro" features.
    now(),
    now() + interval '7 days'
  );

  return new;
end;
$$ language plpgsql security definer;
