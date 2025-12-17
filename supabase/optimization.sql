-- Optimization: Add indexes to frequently queried columns

-- Daily Goals
-- Used in getDailyGoals(date) and getMonthlyDailyGoals(start, end)
CREATE INDEX IF NOT EXISTS idx_daily_goals_user_date ON daily_goals(user_id, date);
-- Used for FK lookups
CREATE INDEX IF NOT EXISTS idx_daily_goals_weekly_goal_id ON daily_goals(weekly_goal_id);

-- Weekly Goals
-- Used in getWeeklyGoals(year, week)
CREATE INDEX IF NOT EXISTS idx_weekly_goals_user_year_week ON weekly_goals(user_id, year, week);
-- Used for FK lookups
CREATE INDEX IF NOT EXISTS idx_weekly_goals_monthly_goal_id ON weekly_goals(monthly_goal_id);

-- Monthly Goals
-- Used in getMonthlyGoals(year, month)
CREATE INDEX IF NOT EXISTS idx_monthly_goals_user_year_month ON monthly_goals(user_id, year, month);
-- Used for FK lookups
CREATE INDEX IF NOT EXISTS idx_monthly_goals_yearly_goal_id ON monthly_goals(yearly_goal_id);

-- Yearly Goals
-- Used in getYearlyGoals(year)
CREATE INDEX IF NOT EXISTS idx_yearly_goals_user_year ON yearly_goals(user_id, year);

-- Subscriptions
-- Used to check status
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status);

-- Analyse to update stats immediately
ANALYZE daily_goals;
ANALYZE weekly_goals;
ANALYZE monthly_goals;
ANALYZE yearly_goals;
