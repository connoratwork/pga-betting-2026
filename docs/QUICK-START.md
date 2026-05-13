# Quick Start Guide - Deploy in 30 Minutes

This guide will get your PGA Championship betting website live as quickly as possible.

## Prerequisites Checklist

- [ ] Node.js installed (v18+)
- [ ] Git installed
- [ ] Google account
- [ ] GitHub account
- [ ] 30 minutes of time

## Step 1: Firebase Setup (10 minutes)

### 1.1 Create Project
1. Go to https://console.firebase.google.com/
2. Click "Add project" → Name it `pga-championship-2026`
3. Disable Analytics → Click "Create project"

### 1.2 Enable Firestore
1. Click "Firestore Database" → "Create database"
2. Select "Production mode" → Choose location (us-central)
3. Click "Enable"

### 1.3 Get Config
1. Click ⚙️ → "Project settings"
2. Scroll to "Your apps" → Click web icon `</>`
3. Register app: `PGA Championship Betting`
4. Copy the `firebaseConfig` object

### 1.4 Update Config File
Open `public/config.js` and replace with your values:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

## Step 2: Deploy to Firebase (10 minutes)

### 2.1 Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### 2.2 Initialize Project
```bash
cd pga-championship-betting
firebase init
```

Select:
- ✅ Firestore
- ✅ Functions  
- ✅ Hosting

Choose:
- Use existing project → Select your project
- Firestore rules: Press Enter (default)
- Firestore indexes: Press Enter (default)
- Functions language: JavaScript
- ESLint: No
- Install dependencies: Yes
- Public directory: **public**
- Single-page app: **Yes**
- GitHub deploys: No

### 2.3 Deploy Everything
```bash
# Deploy Firestore rules
firebase deploy --only firestore

# Install function dependencies
cd functions
npm install
cd ..

# Deploy functions
firebase deploy --only functions
```

## Step 3: Initialize Data (5 minutes)

### 3.1 Add Settings to Firestore

Go to Firebase Console → Firestore Database → Start collection:

**Collection 1: `settings`**
- Document ID: `draft`
- Field: `isOpen` (boolean) = `true`

**Collection 2: `settings`**  
- Document ID: `cutLine`
- Field: `score` (number) = `0`

### 3.2 Add Players

You need to get the actual player list from https://www.pgachampionship.com/odds

Use the template in `docs/PLAYER-DATA-TEMPLATE.json` and update with real data.

Then call the initialization function:
```bash
curl -X POST \
  https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/initializePlayers \
  -H 'Content-Type: application/json' \
  -d @docs/PLAYER-DATA-TEMPLATE.json
```

Replace `YOUR_PROJECT_ID` with your actual project ID.

## Step 4: Deploy to GitHub Pages (5 minutes)

### 4.1 Create GitHub Repo
1. Go to https://github.com/new
2. Name: `pga-championship-betting`
3. Public repository
4. Don't initialize with README
5. Click "Create repository"

### 4.2 Push Code
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/pga-championship-betting.git
git push -u origin main
```

### 4.3 Enable GitHub Pages
1. Go to repository → Settings → Pages
2. Source: Deploy from branch
3. Branch: **main** → Folder: **/ (root)**
4. Click Save

**Your site will be live at:**
`https://YOUR_USERNAME.github.io/pga-championship-betting/`

## Step 5: Test Everything (5 minutes)

### 5.1 Test Website
1. Visit your GitHub Pages URL
2. Click "Make Your Picks"
3. Enter a test name
4. Select one player from each tier
5. Submit picks

### 5.2 Test Admin
1. Click "Admin" tab
2. Login with password: `pga2026admin`
3. Toggle draft status
4. View all picks

### 5.3 Test Score Updates
```bash
curl https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/manualUpdateScores
```

Check Firestore to see if player scores updated.

## You're Done! 🎉

Your betting website is now live and ready for the tournament!

## Pre-Tournament Checklist

**Before May 14, 2026:**
- [ ] Update player list with actual odds from PGA Championship
- [ ] Share website URL with all participants
- [ ] Verify all participants have submitted picks
- [ ] Close draft (Admin Dashboard)
- [ ] Set cut line after Round 2 (typically Friday evening)

## Important URLs

- **Your Website**: `https://YOUR_USERNAME.github.io/pga-championship-betting/`
- **Firebase Console**: `https://console.firebase.google.com/project/YOUR_PROJECT_ID`
- **GitHub Repo**: `https://github.com/YOUR_USERNAME/pga-championship-betting`

## Troubleshooting

### Can't submit picks?
- Check draft is open in Admin Dashboard
- Verify Firebase config in `public/config.js`

### Scores not updating?
- Check function logs: `firebase functions:log`
- Manually trigger: Call `manualUpdateScores` endpoint

### GitHub Pages not working?
- Wait 2-3 minutes for deployment
- Check Settings → Pages for errors
- Verify branch is set to `main`

## Need Help?

See the full [SETUP.md](SETUP.md) guide for detailed instructions and troubleshooting.

---

**Good luck with your betting pool! 🏌️⛳**