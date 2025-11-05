# 📱 Simple Phone Login & Reports - Supabase Setup

This is a simple phone number-based login system (no OTP, no SMS verification) integrated with a reports system.

## 🎯 How It Works

1. **User enters phone number** → App checks if user exists in database
2. **If new user** → Creates profile in `user_profiles` table
3. **If existing user** → Retrieves user profile
4. **Stores user info locally** → Uses AsyncStorage to remember login
5. **User can create reports** → Reports are linked to user via `user_id`

## 🚀 Setup Instructions

### Step 1: Run the Migration

1. Open your Supabase Dashboard at [https://app.supabase.com](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `migrations/001_setup_phone_auth_and_reports.sql`
6. Paste into the SQL editor
7. Click **Run** (or press `Ctrl+Enter`)

### Step 2: Verify Tables Created

Go to **Table Editor** and verify these tables exist:
- `user_profiles` - Stores user information
- `reports` - Stores user reports with `user_id` foreign key

### Step 3: Verify Storage Bucket

Go to **Storage** and verify:
- `reports` bucket exists
- Bucket is set to **Public**

### Step 4: Test the App

1. Run your React Native app
2. Enter any phone number (e.g., `09123456789`)
3. Click **Login**
4. You should be redirected to the Report Form
5. Create a test report
6. Check the `reports` table in Supabase - you should see the `user_id` populated

## 📊 Database Schema

### `user_profiles` Table
- id (UUID, Primary Key)
- phone (VARCHAR, Unique, Required)
- full_name (VARCHAR, Optional)
- created_at (Timestamp)
- updated_at (Timestamp)

### `reports` Table
- id (BIGSERIAL, Primary Key)
- user_id (UUID, Foreign Key → user_profiles.id)
- type (VARCHAR) - Category: general, maintenance, incident, accident
- description (TEXT, Required)
- location (VARCHAR)
- image (TEXT) - URL to uploaded image
- responded (BOOLEAN, Default: false)
- created_at (Timestamp)
- updated_at (Timestamp)

## 🔐 Security (RLS Policies)

The migration sets up Row Level Security policies that allow:
- ✅ Anyone can view user profiles
- ✅ Anyone can create user profiles (for registration)
- ✅ Anyone can update user profiles
- ✅ Anyone can view all reports
- ✅ Anyone can create reports
- ✅ Anyone can update/delete reports
- ✅ Anyone can upload/view/delete images in storage

**Note:** This is a simple authentication system without strict security. For production apps, you should implement proper authentication and restrict RLS policies to authenticated users only.

## 📱 App Code Changes

The following files have been updated to support simple phone login:

### `app/index.tsx` - Login Screen
- Simple phone number input
- No OTP verification
- Creates/finds user in database
- Stores user info in AsyncStorage

### `app/(tabs)/report_form.tsx` - Report Form
- Gets `userId` from AsyncStorage
- Includes `user_id` when creating reports
- Checks if user is logged in before submission

### `app/(tabs)/_layout.tsx` - Tab Layout
- Logout button clears AsyncStorage
- Redirects to login screen

## 🧪 Testing

### Test User Login
1. Enter phone: 09123456789
2. Click Login
3. Check user_profiles table - new user should be created
4. Try logging in again with same number - should work

### Test Report Creation
1. Login with phone number
2. Fill out report form
3. Submit report
4. Check reports table - user_id should match your user

### Test Logout
1. Click Logout button in header
2. Should redirect to login screen
3. AsyncStorage should be cleared

## 🗂️ Files in This Directory

- **`migrations/001_setup_phone_auth_and_reports.sql`** - Main migration script
- **`migrations/002_rollback.sql`** - Rollback script (if you need to undo changes)
- **`README.md`** - This file

## 🔄 Rollback

If you need to undo the changes:

1. Go to SQL Editor in Supabase Dashboard
2. Copy contents of `migrations/002_rollback.sql`
3. Execute the SQL

**Warning:** This will delete all data in `user_profiles` and `reports` tables!

## 🐛 Troubleshooting

### "relation already exists" error
- The table already exists. Either drop it manually or use the rollback script first.

### "user_id cannot be null" error
- Make sure user is logged in before creating reports
- Check AsyncStorage has `userId` stored

### Images not uploading
- Check storage bucket exists and is public
- Check storage policies are created
- Verify bucket name is `reports`

### Reports not showing user_id
- Check migration ran successfully
- Verify `user_id` column exists in reports table
- Check app code is getting userId from AsyncStorage

---

**Last Updated:** 2025-11-03
**Version:** 1.0 (Simple Phone Login - No OTP)
