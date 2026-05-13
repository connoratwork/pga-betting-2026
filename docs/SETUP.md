# PGA Championship Betting Pool - Complete Setup Guide

This guide will walk you through the complete setup process for deploying the 2026 PGA Championship betting website.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git
- A Google account (for Firebase)
- A GitHub account (for hosting)

## Part 1: Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `pga-championship-2026` (or your preferred name)
4. Disable Google Analytics (optional for this project)
5. Click "Create project"

### Step 2: Enable Firestore Database

1. In Firebase Console, click "Firestore Database" in the left menu
2. Click "Create database"
3. Select "Start in production mode"
4. Choose a Cloud Firestore location (e.g., `us-central`)
5. Click "Enable"

### Step 3: Get Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon `</>`
5. Register your app with nickname: `PGA Championship Betting`
6. Copy the `firebaseConfig` object
7. Open `public/config.js` and replace the placeholder values with your actual Firebase config:

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

### Step 4: Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Step 5: Login to Firebase

```bash
firebase login
```

### Step 6: Initialize Firebase in Project

```bash
cd pga-championship-betting
firebase init
```

When prompted:
- Select: **Firestore**, **Functions**, and **Hosting**
- Use an existing project: Select your project
- Firestore rules file: Press Enter (use default `firestore.rules`)
- Firestore indexes file: Press Enter (use default `firestore.indexes.json`)
- Functions language: **JavaScript**
- ESLint: **No** (or Yes if you prefer)
- Install dependencies: **Yes**
- Public directory: **public**
- Single-page app: **Yes**
- GitHub deploys: **No** (we'll use GitHub Pages instead)

### Step 7: Deploy Firestore Rules and Indexes

```bash
firebase deploy --only firestore
```

### Step 8: Install Functions Dependencies

```bash
cd functions
npm install
cd ..
```

### Step 9: Deploy Cloud Functions

```bash
firebase deploy --only functions
```

This will deploy:
- `updateScores` - Scheduled function (runs every 20 minutes during tournament)
- `manualUpdateScores` - HTTP function for manual testing
- `initializePlayers` - HTTP function to populate player data

## Part 2: Initialize Player Data

### Step 1: Scrape Player Data from PGA Championship Odds

You need to manually create a player list based on the odds from https://www.pgachampionship.com/odds

Create a file `player-data.json`:

```json
{
  "players": [
    {
      "name": "Scottie Scheffler",
      "tier": 1,
      "oddsRank": 1,
      "espnId": "3448"
    },
    {
      "name": "Rory McIlroy",
      "tier": 1,
      "oddsRank": 2,
      "espnId": "3470"
    }
    // ... add all players here
  ]
}
```

**Important Notes:**
- Tier 1: Odds rank 1-10
- Tier 2: Odds rank 11-20
- Tier 3: Odds rank 21-30
- Tier 4: Odds rank 31+
- ESPN IDs can be found by searching player names on ESPN Golf

### Step 2: Initialize Players in Firestore

Use curl or Postman to call the initialization function:

```bash
curl -X POST \
  https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/initializePlayers \
  -H 'Content-Type: application/json' \
  -d @player-data.json
```

Replace `YOUR_REGION` and `YOUR_PROJECT_ID` with your actual values.

### Step 3: Initialize Settings

Manually add these documents in Firestore Console:

1. Collection: `settings`, Document ID: `draft`
   ```json
   {
     "isOpen": true
   }
   ```

2. Collection: `settings`, Document ID: `cutLine`
   ```json
   {
     "score": 0
   }
   ```

## Part 3: GitHub Pages Deployment

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click "New repository"
3. Name: `pga-championship-betting`
4. Make it **Public** (required for free GitHub Pages)
5. Don't initialize with README
6. Click "Create repository"

### Step 2: Initialize Git and Push Code

```bash
cd pga-championship-betting
git init
git add .
git commit -m "Initial commit: PGA Championship betting website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/pga-championship-betting.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings" tab
3. Click "Pages" in the left sidebar
4. Under "Source", select branch: **main**
5. Select folder: **/ (root)** or **/public** if you want to serve only the public folder
6. Click "Save"

**Note:** If you want to serve from `/public` folder:
- In repository settings → Pages, select `/public` as the folder
- OR move all files from `public/` to root and update paths

### Step 4: Configure Custom Domain (Optional)

If you have a custom domain:
1. In GitHub Pages settings, enter your custom domain
2. Add DNS records at your domain provider:
   - Type: `A`, Host: `@`, Value: GitHub Pages IPs
   - Type: `CNAME`, Host: `www`, Value: `YOUR_USERNAME.github.io`

### Step 5: Access Your Site

Your site will be available at:
- `https://YOUR_USERNAME.github.io/pga-championship-betting/`

Or if using custom domain:
- `https://yourdomain.com`

## Part 4: Testing

### Test 1: Manual Score Update

Test the score update function:

```bash
curl https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/manualUpdateScores
```

### Test 2: Draft Functionality

1. Visit your GitHub Pages URL
2. Click "Make Your Picks"
3. Enter a name and select players
4. Submit picks
5. Check Firestore Console to verify data was saved

### Test 3: Admin Dashboard

1. Click "Admin" tab
2. Login with password: `pga2026admin`
3. Test toggling draft status
4. Test updating cut line
5. View all picks

### Test 4: Leaderboard

1. Click "Leaderboard" tab
2. Verify participant appears
3. Check that scores display correctly

## Part 5: Pre-Tournament Checklist

**1 Week Before (May 7, 2026):**
- [ ] Verify all players are in database
- [ ] Test score update function
- [ ] Open draft for participants
- [ ] Share website URL with participants

**Day Before Tournament (May 13, 2026):**
- [ ] Verify all participants have submitted picks
- [ ] Close draft (Admin → Toggle Draft Status)
- [ ] Test leaderboard display
- [ ] Verify Cloud Function schedule is active

**Tournament Days (May 14-17, 2026):**
- [ ] Monitor score updates (every 20 minutes)
- [ ] Update cut line after Round 2 (Admin Dashboard)
- [ ] Monitor leaderboard for accuracy
- [ ] Be available for manual score overrides if needed

## Part 6: Maintenance

### Update Player Scores Manually

If automatic updates fail:
1. Login to Admin Dashboard
2. Select player from dropdown
3. Select round
4. Enter score
5. Click "Override Score"

### Update Cut Line

After Round 2 (typically Friday evening):
1. Check official PGA Championship cut line
2. Login to Admin Dashboard
3. Enter cut line score (e.g., +5)
4. Click "Update Cut Line"

### View Logs

Check Cloud Function logs:
```bash
firebase functions:log
```

### Redeploy Functions

If you need to update the Cloud Functions:
```bash
firebase deploy --only functions
```

### Redeploy Website

Push changes to GitHub:
```bash
git add .
git commit -m "Update description"
git push
```

GitHub Pages will automatically rebuild (takes 1-2 minutes).

## Troubleshooting

### Issue: Scores Not Updating

**Solution:**
1. Check Cloud Function logs: `firebase functions:log`
2. Verify ESPN API is accessible
3. Manually trigger update: Call `manualUpdateScores` endpoint
4. Check Firestore rules allow function writes

### Issue: Participants Can't Submit Picks

**Solution:**
1. Verify draft is open (Admin Dashboard)
2. Check Firestore rules allow participant creation
3. Check browser console for errors
4. Verify Firebase config is correct in `config.js`

### Issue: GitHub Pages Not Updating

**Solution:**
1. Check GitHub Actions tab for build errors
2. Verify branch and folder settings in Pages configuration
3. Clear browser cache
4. Wait 2-3 minutes for propagation

### Issue: Admin Login Not Working

**Solution:**
1. Verify password in `config.js` matches what you're entering
2. Check browser console for errors
3. For production, consider implementing Firebase Authentication

## Cost Breakdown (Free Tier Limits)

### Firebase Free Tier:
- **Firestore:** 1GB storage, 50K reads/day, 20K writes/day
- **Cloud Functions:** 2M invocations/month, 400K GB-seconds/month
- **Hosting:** 10GB storage, 360MB/day bandwidth

### Expected Usage:
- **Firestore Reads:** ~100-500/day (well within limit)
- **Firestore Writes:** ~50-100/day (well within limit)
- **Function Invocations:** ~1,500/tournament (20 min intervals × 4 days)
- **Hosting:** <1MB total site size

**Result:** Entire project runs on free tier! 🎉

## Security Notes

### Current Implementation:
- Admin password is hardcoded (simple but not secure)
- Firestore rules allow public reads
- Participants can submit picks without authentication

### Production Recommendations:
1. Implement Firebase Authentication for admin
2. Add rate limiting to prevent spam submissions
3. Use environment variables for sensitive data
4. Add CAPTCHA to prevent bot submissions
5. Implement user authentication for participants

## Support

For issues or questions:
1. Check Firebase Console for errors
2. Review Cloud Function logs
3. Check browser console for frontend errors
4. Verify all configuration values are correct

## Summary

You now have a fully functional golf betting website that:
- ✅ Automatically updates scores from ESPN API
- ✅ Calculates leaderboard in real-time
- ✅ Handles cut penalties automatically
- ✅ Provides admin controls
- ✅ Runs entirely on free tier
- ✅ Hosted on GitHub Pages

**Good luck with your betting pool! 🏌️⛳**