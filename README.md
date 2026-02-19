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

