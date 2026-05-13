-- Seed Mock Tests for all CA Subjects
INSERT INTO public.mcq_tests (title, subject, questions_count, time_limit, is_premium, difficulty)
VALUES 
  ('CA Intermediate - Business Law', 'Law', 30, 45, false, 'Medium'),
  ('CA Intermediate - Taxation (GST & Income Tax)', 'Taxation', 40, 60, true, 'Hard'),
  ('CA Intermediate - Costing Basics', 'Costing', 25, 40, false, 'Medium'),
  ('CA Intermediate - Auditing & Assurance', 'Audit', 35, 50, true, 'Hard'),
  ('CA Intermediate - Financial Management', 'FM', 30, 45, true, 'Medium'),
  ('CA Intermediate - Strategic Management', 'Economics', 20, 30, false, 'Easy'),
  ('CA Foundation - Business Correspondence', 'Law', 15, 20, false, 'Easy'),
  ('CA Foundation - Economics & Commercial Knowledge', 'Economics', 30, 40, true, 'Medium');
