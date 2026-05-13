# CA Mentor Authentication Setup Guide

This document outlines the steps to configure and verify the authentication system built with Next.js 14 and Supabase.

## 1. Supabase Project Setup

1.  Go to the [Supabase Dashboard](https://supabase.com/dashboard).
2.  Create a new project named **CA Mentor**.
3.  Go to **Authentication > Providers** and ensure **Email** is enabled.
    *   Enable "Confirm email" (Highly Recommended).
    *   Disable "Allow unconfirmed email logins" if you want to strictly enforce verification.
4.  Go to **Authentication > URL Configuration**:
    *   **Site URL**: `http://localhost:3000` (for local development).
    *   **Redirect URLs**: Add `http://localhost:3000/auth/callback`.

## 2. Environment Variables

Create a `.env.local` file in your project root and add the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 3. Database Schema

Run the following SQL in your Supabase SQL Editor to enable profile synchronization and role management:

```sql
-- Add role to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';

-- Update the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## 4. Verification

1.  **Signup**: Go to `/signup`, fill in the details. You should receive a Supabase verification email.
2.  **Login**: Once verified, you can log in at `/login`.
3.  **Protection**: Try accessing `/dashboard` without logging in; you should be redirected to `/login`.
4.  **Forgot Password**: Test the flow at `/forgot-password`. You will receive a reset link that directs you back to `/reset-password`.

## 5. Folder Structure Summary

*   `app/auth/actions.ts`: Server Actions for all auth logic.
*   `app/auth/callback/route.ts`: Redirect handler for Supabase emails.
*   `app/(auth)/login/page.tsx`: Premium login UI.
*   `app/(auth)/signup/page.tsx`: Premium signup UI.
*   `utils/supabase/`: Core Supabase client, server, and middleware utilities.
