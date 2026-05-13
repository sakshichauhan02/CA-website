-- Seed Data for Mock Tests and Questions
-- Run this in your Supabase SQL Editor

-- 1. Ensure the mcq_tests table exists
CREATE TABLE IF NOT EXISTS public.mcq_tests (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  questions_count INTEGER DEFAULT 0,
  time_limit INTEGER DEFAULT 60,
  is_premium BOOLEAN DEFAULT FALSE,
  difficulty TEXT DEFAULT 'Medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Ensure the questions table has the necessary columns
-- This script ensures all required columns exist before inserting
DO $$ 
BEGIN 
  -- Ensure test_id exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='test_id') THEN
    ALTER TABLE public.questions ADD COLUMN test_id BIGINT REFERENCES public.mcq_tests(id) ON DELETE CASCADE;
  END IF;

  -- Ensure explanation exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='explanation') THEN
    ALTER TABLE public.questions ADD COLUMN explanation TEXT;
  END IF;

  -- Ensure question_text exists (the error suggests it might be missing or named differently)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='question_text') THEN
    -- If 'question' exists, we'll keep it, but our INSERTs below use 'question_text'
    -- To stay consistent with your app's main schema, we'll add 'question_text'
    ALTER TABLE public.questions ADD COLUMN question_text TEXT;
  END IF;
  
  -- Ensure other standard columns exist just in case
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='correct_answer') THEN
    ALTER TABLE public.questions ADD COLUMN correct_answer TEXT;
  END IF;
END $$;

-- 3. Use a DO block to insert tests and questions safely
DO $$
DECLARE
    free_test_id BIGINT;
    premium_test_id BIGINT;
BEGIN
    -- Insert Mock Tests
    INSERT INTO public.mcq_tests (title, subject, questions_count, time_limit, is_premium, difficulty)
    VALUES ('CA Foundation - Accounts Basics', 'Accounting', 5, 15, false, 'Easy')
    RETURNING id INTO free_test_id;

    INSERT INTO public.mcq_tests (title, subject, questions_count, time_limit, is_premium, difficulty)
    VALUES ('CA Foundation - Advanced Accounting', 'Accounting', 5, 20, true, 'Hard')
    RETURNING id INTO premium_test_id;

    -- Insert Questions for 'CA Foundation - Accounts Basics'
    -- Note: We use 'question_text' here as it's the primary name in your supabase_schema.sql
    INSERT INTO public.questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation)
    VALUES 
    (free_test_id, 'Which of the following is the basic Accounting Equation?', 'Assets = Liabilities + Capital', 'Assets = Liabilities - Capital', 'Capital = Assets + Liabilities', 'Liabilities = Assets + Capital', 'A', 'The fundamental accounting equation is Assets = Liabilities + Owner''s Equity (Capital).'),
    (free_test_id, 'Which type of account is "Bank Account"?', 'Nominal Account', 'Real Account', 'Personal Account', 'Representative Personal Account', 'C', 'A bank account represents a person/entity and is thus classified as a Personal Account (specifically an Artificial Personal Account).'),
    (free_test_id, 'The process of recording transactions in the Journal is called:', 'Posting', 'Journalising', 'Tallying', 'Balancing', 'B', 'Recording transactions in the journal is known as journalising.'),
    (free_test_id, 'Cash book is a form of:', 'Ledger', 'Journal', 'Both Journal & Ledger', 'Trial Balance', 'C', 'A cash book is a subsidiary book (journal) as well as a principal book (ledger) because it records transactions and shows balances.'),
    (free_test_id, 'Which of the following is a liability?', 'Cash', 'Stock', 'Creditors', 'Machinery', 'C', 'Creditors represent an obligation to pay money to suppliers, which is a liability.');

    -- Insert Questions for 'CA Foundation - Advanced Accounting'
    INSERT INTO public.questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation)
    VALUES 
    (premium_test_id, 'In Consignment, the relationship between Consignor and Consignee is that of:', 'Debtor and Creditor', 'Principal and Agent', 'Seller and Buyer', 'Partners', 'B', 'The consignor is the principal who sends goods, and the consignee acts as an agent to sell them.'),
    (premium_test_id, 'When shares are issued at a price higher than their face value, it is called:', 'Issue at Par', 'Issue at Discount', 'Issue at Premium', 'Bonus Issue', 'C', 'Issuing shares above face value (e.g., $10 share for $12) is called issuing at a premium.'),
    (premium_test_id, 'Goodwill brought in by a new partner in cash is shared by old partners in their:', 'Old Profit Sharing Ratio', 'Sacrificing Ratio', 'New Profit Sharing Ratio', 'Capital Ratio', 'B', 'The premium for goodwill is shared by old partners in the ratio in which they sacrifice their share for the new partner.'),
    (premium_test_id, 'Which of the following methods of inventory valuation is based on the assumption that goods are sold in the order they are received?', 'LIFO', 'Weighted Average', 'FIFO', 'Specific Identification', 'C', 'FIFO (First-In, First-Out) assumes that the earliest goods purchased are the first ones sold.'),
    (premium_test_id, 'Del-credere commission is calculated on:', 'Cash Sales', 'Credit Sales', 'Total Sales', 'Net Profit', 'C', 'Unless otherwise specified in the agreement, del-credere commission is usually calculated on total sales, although its purpose is to cover risk of bad debts on credit sales.');

    -- Update questions_count for accuracy
    UPDATE public.mcq_tests SET questions_count = 5 WHERE id IN (free_test_id, premium_test_id);

END $$;
