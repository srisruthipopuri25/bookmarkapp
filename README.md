# Smart Bookmark App

A real-time private bookmark manager built with Next.js (App Router), Supabase, and Tailwind CSS.

Live URL: https://bookmarkapp-tau.vercel.app  
GitHub Repository: https://github.com/srisruthipopuri25/bookmarkapp

---

## Overview

This application allows users to authenticate using Google OAuth and manage personal bookmarks. Each user's bookmarks are private and automatically synced in real time across multiple browser tabs.

The project focuses on security (Row Level Security), real-time behavior, and clean architecture using the Next.js App Router.

---

## Features

- Google OAuth authentication (no email/password)
- User-specific private bookmarks
- Add bookmark (URL + title)
- Delete bookmark
- Real-time updates across open tabs
- Multi-tab session synchronization
- Deployed on Vercel
- Logout

---

## Tech Stack

- Next.js (App Router)
- Supabase (Authentication, PostgreSQL, Realtime)
- Tailwind CSS
- Vercel (Deployment)

---

## Database Design & Security

The `bookmarks` table contains:

- id (uuid)
- user_id (references auth.users)
- url (text)
- title (text)
- created_at (timestamp)

Row Level Security (RLS) is enabled on the table.

Policies enforce:

- Users can only view their own bookmarks
- Users can only insert bookmarks with their own user_id
- Users can only delete their own bookmarks


## Problems Faced and How I Solved Them
1. OAuth redirecting to the wrong domain
Problem: While testing locally, logging in with Google redirected me to the deployed Vercel URL instead of localhost.
Root Cause: 
The Supabase “Site URL” was configured incorrectly and included the production domain. When a redirect URL does not match exactly, Supabase falls back to the Site URL.
Solution:
Updated the Site URL to http://localhost:3000 during development.
Added both localhost and production URLs under Redirect URLs.
Ensured that redirectTo in the login function matched an allowed redirect URL exactly.
This clarified how Supabase handles fallback redirect logic.

2. Google “Access blocked: Supabase can only be used within its organization”
Problem: Google OAuth blocked external users from signing in.
Root Cause: The OAuth consent screen in Google Cloud was configured as “Internal”, restricting usage to a specific organization.
Solution:
Switched the consent screen to “External”.
Published the application in Google Cloud Console.
Verified the Supabase callback URL properly

3. Bookmarks not appearing until page refresh
Problem: After inserting a bookmark, it did not appear immediately in the UI.
Root Cause: The UI relied entirely on Supabase Realtime subscription. The subscription did not always trigger instantly for the inserting client.

Solution: 
Used .select() after insert to return the inserted row.
Immediately updated local state with the returned row.
Kept realtime subscription for cross-tab synchronization.
This improved responsiveness and user experience.

4. Multi-tab session synchronization issues
Problem: Logging in or out in one tab did not update other open tabs immediately.
Solution:
Implemented: supabase.auth.onAuthStateChange()
This ensures session changes propagate across tabs.

5. Logout did not prompt account selection again
Problem: After logging out, clicking “Login with Google” automatically signed in with the previous account.
Root Cause: Google maintains its own session independent of Supabase.
Solution: Added: queryParams: { prompt: "select_account" } to force account selection during login.

6. Real-time table not updating
Problem: Realtime subscription initially did not trigger.
Root Cause: The table was not enabled for replication in Supabase.
Solution: Enabled replication for the bookmarks table under Database → Replication.
