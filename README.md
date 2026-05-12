# HomeServ Platform

A premium, responsive home service platform built with Next.js and Firebase.

## Features
- **Responsive Design**: Works on Desktop and Mobile.
- **Admin Dashboard**:
  - Manage users (Approve, Suspend, Delete).
  - Toggle Auto-approval for new accounts.
  - Category management.
  - Support inbox for user messages.
- **Worker Dashboard**:
  - Create and manage service offers.
  - Accept or refuse client requests.
  - Chat with clients after acceptance.
  - History management.
- **Client Dashboard**:
  - Browse service offers.
  - Request services and track status.
  - Chat with workers.
- **Profile**: Edit personal information and bio.

## Setup Instructions

1. **Firebase Project**:
   - Create a project on [Firebase Console](https://console.firebase.google.com/).
   - Enable **Authentication** (Email/Password).
   - Create a **Firestore Database**.
   - Get your web app configuration keys.

2. **Environment Variables**:
   - Create a `.env.local` file in the root directory.
   - Copy the keys from `.env.example` and fill in your Firebase details.

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

5. **Initial Admin Setup**:
   - Register a new account.
   - Manually change the `role` field to `admin` in the Firestore `users` collection for your account.

## Deployment to Vercel
1. Connect your GitHub repository to Vercel.
2. Add the environment variables in the Vercel project settings.
3. Deploy!
