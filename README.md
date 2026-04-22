# TreeBuddy

TreeBuddy is an Expo + React Native app that motivates eco-friendly habits through daily tasks, XP, streaks, and a growing virtual tree.

## Features

- Daily eco tasks with XP rewards
- Tree growth progression based on earned XP
- Streak tracking for consistent activity
- Camera/video task confirmation flow
- Firebase Auth + Firestore integration
- Automatic demo mode when Firebase is not configured
- Ukrainian and English localization
- iOS, Android, and Web support

## Tech stack

- Expo (SDK 54), React Native, TypeScript
- Expo Router for navigation
- Firebase (Auth + Firestore)
- ESLint for linting

## Requirements

- Node.js 18+ (recommended)
- npm
- Expo-compatible mobile simulator/emulator or physical device (for mobile testing)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create environment file:

   ```bash
   cp .env.example .env
   ```

3. Fill Firebase values in `.env`:

   - `EXPO_PUBLIC_FIREBASE_API_KEY`
   - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
   - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `EXPO_PUBLIC_FIREBASE_APP_ID`

   If these are not set, TreeBuddy runs in demo mode.

## Running the app

```bash
npm run start
```

Useful alternatives:

- `npm run ios`
- `npm run android`
- `npm run web`
- `npm run dev` (tunnel mode)

## Available scripts

- `npm run lint` — run ESLint
- `npm run build:web` — export web build and generate service worker
- `npm run build:android` — run Expo Android prebuild

## Firebase notes

- Firestore security rules are in `firestore.rules`.
- Demo mode stores user progress locally with AsyncStorage.

