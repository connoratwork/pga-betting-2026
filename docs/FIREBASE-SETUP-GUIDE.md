# Firebase Setup - Step-by-Step Guide

This guide will walk you through setting up Firebase from scratch with screenshots descriptions and exact steps.

## Prerequisites

- A Google account (Gmail)
- 10 minutes of time

---

## Step 1: Create Firebase Project

### 1.1 Go to Firebase Console

1. Open your web browser
2. Navigate to: **https://console.firebase.google.com/**
3. Click the **"Sign in"** button in the top right
4. Sign in with your Google account

### 1.2 Create New Project

1. You'll see the Firebase Console homepage
2. Click the **"Add project"** button (or **"Create a project"** if this is your first project)
3. You'll see a large card with a plus icon

### 1.3 Project Name

1. **Step 1 of 3**: Enter project name
   - Type: `pga-championship-2026` (or any name you prefer)
   - Note: Firebase will create a unique project ID below (e.g., `pga-championship-2026-a1b2c`)
   - Click **"Continue"**

### 1.4 Google Analytics (Optional)

1. **Step 2 of 3**: Google Analytics
   - You'll see "Enable Google Analytics for this project"
   - **Toggle it OFF** (we don't need analytics for this project)
   - This saves setup time and keeps things simple
   - Click **"Continue"**

### 1.5 Create Project

1. **Step 3 of 3**: Review
   - Accept the Firebase terms
   - Click **"Create project"**
   - Wait 30-60 seconds while Firebase creates your project
   - You'll see a progress indicator

### 1.6 Project Ready

1. When you see "Your new project is ready"
2. Click **"Continue"**
3. You're now in your Firebase project dashboard!

---

## Step 2: Enable Firestore Database

### 2.1 Navigate to Firestore

1. In the left sidebar, look for **"Databases & Storage"** section
2. You'll see three subsections:
   - **PostgreSQL** (SQL Connect)
   - **NoSQL** (Firestore, Realtime Database)
   - **Object Storage** (Storage)
3. Under the **"NoSQL"** section, click on **"Firestore"**
4. You'll see a page saying "Cloud Firestore" with a "Create database" button

⚠️ **Important**: Make sure you select **"Firestore"** (not "Realtime Database")

### 2.2 Create Database

1. Click the **"Create database"** button
2. A modal will appear: "Create database"

### 2.3 Security Rules

1. **Step 1 of 2**: Secure rules for Cloud Firestore
   - You'll see two options:
     - ⚪ Start in production mode (recommended)
     - ⚪ Start in test mode
   - Select **"Start in production mode"** (we'll deploy custom rules later)
   - Click **"Next"**

### 2.4 Set Location

1. **Step 2 of 2**: Set Cloud Firestore location
   - Choose a location close to you or your users
   - Recommended: **"us-central"** (Iowa) for US users
   - Other options: `us-east1`, `us-west1`, `europe-west1`, etc.
   - ⚠️ **Important**: This cannot be changed later!
   - Click **"Enable"**

### 2.5 Database Created

1. Wait 30-60 seconds while Firestore is provisioned
2. You'll see the Firestore Database console
3. It will be empty (no collections yet)
4. You should see tabs: Data, Rules, Indexes, Usage

---

## Step 3: Get Firebase Configuration

### 3.1 Go to Project Settings

1. Click the **gear icon ⚙️** next to "Project Overview" in the top left
2. Select **"Project settings"** from the dropdown menu
3. You'll be on the "General" tab

### 3.2 Register Web App

1. Scroll down to **"Your apps"** section
2. You'll see icons for different platforms (iOS, Android, Web, Unity)
3. Click the **Web icon** `</>`
4. A modal appears: "Add Firebase to your web app"

### 3.3 Register App

1. **App nickname**: Enter `PGA Championship Betting`
2. **Firebase Hosting**: Leave unchecked (we're using GitHub Pages)
3. Click **"Register app"**

### 3.4 Copy Configuration

1. You'll see a code snippet with your Firebase configuration
2. It looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC1234567890abcdefghijklmnop",
  authDomain: "pga-championship-2026-a1b2c.firebaseapp.com",
  projectId: "pga-championship-2026-a1b2c",
  storageBucket: "pga-championship-2026-a1b2c.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  measurementId: "G-XXXXXXXXXX"  // Optional - only if you enabled Analytics
};
```

3. **Copy this entire object** (you'll need it in the next step)
   - Note: If you see `measurementId`, that's fine - copy it too!
   - This appears if you enabled Google Analytics (we disabled it, but it may still show)
4. Click **"Continue to console"**

---

## Step 4: Update Your Config File

### 4.1 Open Your Project

1. Open your code editor (VS Code, etc.)
2. Navigate to your project folder: `pga-championship-betting`
3. Open the file: `public/config.js`

### 4.2 Replace Configuration

1. You'll see placeholder values:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

2. **Replace the entire `firebaseConfig` object** with the one you copied from Firebase Console

3. Your file should now look like:

```javascript
// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyC1234567890abcdefghijklmnop",
    authDomain: "pga-championship-2026-a1b2c.firebaseapp.com",
    projectId: "pga-championship-2026-a1b2c",
    storageBucket: "pga-championship-2026-a1b2c.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890",
    measurementId: "G-XXXXXXXXXX"  // Include this if it appears in your config
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Admin password (in production, use Firebase Authentication)
const ADMIN_PASSWORD = "pga2026admin";

// ESPN API Configuration
const ESPN_API_URL = "https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard?event=401811947";
```

4. **Save the file** (Cmd+S or Ctrl+S)

---

## Step 5: Verify Your Setup

### 5.1 Check Project ID

1. Go back to Firebase Console
2. Look at the top of the page
3. You should see your project name and ID
4. Make note of your **Project ID** (e.g., `pga-championship-2026-a1b2c`)
5. You'll need this for deployment commands

### 5.2 Verify Firestore

1. Click **"Firestore Database"** in the left sidebar
2. You should see an empty database (no collections yet)
3. This is correct - we'll add data later

### 5.3 Check Billing (Optional)

1. Click the **gear icon ⚙️** → **"Usage and billing"**
2. You should see **"Spark plan (No-cost)"**
3. This confirms you're on the free tier
4. No credit card required!

---

## Step 6: What You've Accomplished

✅ Created a Firebase project
✅ Enabled Firestore Database
✅ Obtained Firebase configuration
✅ Updated your `config.js` file
✅ Verified you're on the free tier

---

## Next Steps

Now that Firebase is set up, you're ready to:

1. **Install Firebase CLI** and deploy your project
2. **Initialize player data** in Firestore
3. **Deploy Cloud Functions** for automated score updates
4. **Deploy to GitHub Pages** for hosting

See the main [SETUP.md](SETUP.md) guide for the next steps!

---

## Troubleshooting

### Can't find "Create database" button?
- Make sure you clicked "Firestore Database" not "Realtime Database"
- They are different products - we need Firestore

### Configuration not working?
- Make sure you copied the entire `firebaseConfig` object
- Check for any typos or missing commas
- Verify all quotes are correct (no smart quotes)

### Project ID doesn't match?
- Firebase auto-generates a unique ID by adding random characters
- This is normal and expected
- Use the exact ID shown in Firebase Console

### Need to change location?
- Unfortunately, Firestore location cannot be changed after creation
- You would need to create a new Firebase project
- Choose carefully in Step 2.4!

---

## Important Notes

⚠️ **Security**: Your Firebase config contains your API key. This is safe to commit to GitHub for web apps because:
- Firebase security is enforced by Firestore Rules (not the API key)
- The API key just identifies your project
- We'll deploy proper security rules that restrict access

⚠️ **Project ID**: Keep your project ID handy - you'll need it for:
- Firebase CLI commands
- Cloud Function URLs
- Deployment scripts

⚠️ **Free Tier**: As long as you stay within these limits, Firebase is completely free:
- 1GB storage
- 50K reads/day
- 20K writes/day
- 20K deletes/day

Your betting pool will easily stay within these limits!

---

## Quick Reference

**Firebase Console**: https://console.firebase.google.com/
**Your Project**: https://console.firebase.google.com/project/YOUR_PROJECT_ID
**Firestore**: https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore

---

**Firebase setup complete! 🎉 Ready for deployment!**