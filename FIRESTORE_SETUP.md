# Firebase Firestore Setup

## Security Rules

Add these security rules to your Firestore in Firebase Console:

1. Go to **Firestore Database** → **Rules**
2. Replace the default rules with this:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - each user can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      // User's check-ins - subcollection
      match /checkIns/{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
    }
  }
}
```

## Data Structure

The app now stores check-in data in Firestore with this structure:

```
users/
  {userId}/
    checkIns/
      {date}/
        - userId: string
        - date: string (YYYY-MM-DD)
        - ratings: object
          - stress: number (1-10)
          - energy: number (1-10)
          - mood: number (1-10)
          - focus: number (1-10)
        - prompts: object
          - proud: string
          - stressed: string
          - challenge: string
          - grateful: string
          - intention: string
        - createdAt: Timestamp
        - updatedAt: Timestamp
```

## How It Works

1. **CheckIn Page**: When you save a check-in, it stores data in Firestore under your user ID
2. **Other Pages**: Pages like Buddy, Patterns, Wins, and Weekly use the `useCheckInData` hook to fetch and analyze all your check-ins
3. **Real-time Sync**: All data is synced in real-time across all pages

## Features Added

✅ Save check-in data to Firebase Firestore  
✅ Load existing check-ins on page refresh  
✅ Share data across all pages via custom hook  
✅ Helper functions: averages, streaks, date ranges  
✅ Secure: Each user can only access their own data  

## Usage Example

```typescript
import { useCheckInData } from '@/hooks/useCheckInData';

function MyComponent() {
  const { 
    checkIns, 
    isLoading, 
    getAverageRating,
    getStreakCount 
  } = useCheckInData();

  const avgMood = getAverageRating('mood');
  const streak = getStreakCount();

  return (
    <div>
      <p>Average Mood: {avgMood}</p>
      <p>Streak: {streak} days</p>
    </div>
  );
}
```
