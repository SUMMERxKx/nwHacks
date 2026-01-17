# Firebase Configuration

To set up Firebase authentication for this app, follow these steps:

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a new project"
3. Enter your project name and follow the setup wizard
4. Choose your location and billing settings

## 2. Register Your App

1. In the Firebase console, click the web icon (</> ) to register your app
2. Enter your app name (e.g., "nwHacks")
3. You'll receive your Firebase config

## 3. Set Environment Variables

Create a `.env.local` file in the project root with your Firebase credentials:

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

You can find these values in:
- Firebase Console → Project Settings (gear icon)
- Select your app
- Copy the config object

## 4. Enable Authentication Methods

1. In Firebase Console, go to **Authentication**
2. Click **Get started**
3. Enable **Email/Password** provider
4. (Optional) Enable **Google** sign-in

## 5. Security Rules

For Firestore (if you add it), set basic security rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Features Added

- ✅ Login page with email/password authentication
- ✅ Sign up capability
- ✅ Protected routes (auto-redirect to login if not authenticated)
- ✅ Firebase Auth integration
- ✅ Loading states

## Usage

The app will now:
1. Show the login page at `/login` for unauthenticated users
2. Redirect to login if user is not authenticated
3. Show the app interface after successful login
4. Auto-redirect authenticated users away from login page
