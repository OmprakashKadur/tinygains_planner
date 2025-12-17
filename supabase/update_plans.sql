-- Update Razorpay Plan IDs
-- Replace 'YOUR_ACTUAL_MONTHLY_PLAN_ID' and 'YOUR_ACTUAL_YEARLY_PLAN_ID' 
-- with the IDs from your Razorpay Dashboard (e.g., plan_K1234567890)

UPDATE public.plans
SET razorpay_plan_id = 'm_plan' -- e.g. plan_L...
WHERE id = 'monthly';

UPDATE public.plans
SET razorpay_plan_id = 'y_plan' -- e.g. plan_M...
WHERE id = 'yearly';

-- Verify the update
SELECT * FROM public.plans;
