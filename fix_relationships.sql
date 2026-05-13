-- Ensure PostgREST can join profiles with other tables
-- We add a foreign key from test_results to profiles
ALTER TABLE public.test_results 
DROP CONSTRAINT IF EXISTS test_results_user_id_fkey,
ADD CONSTRAINT test_results_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- We add a foreign key from subscriptions to profiles
ALTER TABLE public.subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey,
ADD CONSTRAINT subscriptions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- We add a foreign key from payments to profiles
ALTER TABLE public.payments 
DROP CONSTRAINT IF EXISTS payments_user_id_fkey,
ADD CONSTRAINT payments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
