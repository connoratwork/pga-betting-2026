# Deployment Checklist for 2026 PGA Championship Betting Pool

Use this checklist to ensure everything is properly deployed before the tournament starts on **May 14, 2026**.

## Phase 1: Firebase Setup ✅

### Firebase Project Creation
- [ ] Created Firebase project at https://console.firebase.google.com/
- [ ] Project name: `pga-championship-2026` (or your chosen name)
- [ ] Firestore Database enabled in production mode
- [ ] Location selected: `us-central` (or your preferred region)

### Firebase Configuration
- [ ] Obtained Firebase config from Project Settings
- [ ] Updated `public/config.js` with actual Firebase credentials
- [ ] Verified all config values are correct (no placeholders)

### Firebase CLI Setup
- [ ] Installed Firebase CLI: `npm install -g firebase-tools`
- [ ] Logged in: `firebase login`
- [ ] Initialized project: `firebase init`
- [ ] Selected Firestore, Functions, and Hosting

### Firebase Deployment
- [ ] Deployed Firestore rules: `firebase deploy --only firestore`
- [ ] Installed function dependencies: `cd functions && npm install`
- [ ] Deployed Cloud Functions: `firebase deploy --only functions`
- [ ] Verified functions are live in Firebase Console

## Phase 2: Database Initialization ✅

### Firestore Collections Setup
- [ ] Created `settings` collection with `draft` document
  - Field: `isOpen` (boolean) = `true`
- [ ] Created `settings` collection with `cutLine` document
  - Field: `score` (number) = `0`

### Player Data
- [ ] Visited https://www.pgachampionship.com/odds
- [ ] Collected top 40+ players with odds rankings
- [ ] Updated `docs/PLAYER-DATA-TEMPLATE.json` with actual data
- [ ] Found ESPN IDs for all players (search on ESPN Golf)
- [ ] Called `initializePlayers` function to populate database
- [ ] Verified players appear in Firestore Console

### Data Verification
- [ ] Checked Firestore has `players` collection with all players
- [ ] Verified tier assignments (1-10, 11-20, 21-30, 31+)
- [ ] Confirmed odds rankings are correct
- [ ] Verified ESPN IDs are accurate

## Phase 3: GitHub Pages Deployment ✅

### GitHub Repository
- [ ] Created new public repository on GitHub
- [ ] Repository name: `pga-championship-betting`
- [ ] Initialized git in local project: `git init`
- [ ] Added remote: `git remote add origin [URL]`
- [ ] Committed all files: `git add . && git commit -m "Initial commit"`
- [ ] Pushed to GitHub: `git push -u origin main`

### GitHub Pages Configuration
- [ ] Enabled GitHub Pages in repository Settings
- [ ] Selected branch: `main`
- [ ] Selected folder: `/ (root)` or `/public`
- [ ] Waited for deployment (1-2 minutes)
- [ ] Verified site is live at GitHub Pages URL

### Website Verification
- [ ] Visited GitHub Pages URL
- [ ] Confirmed website loads correctly
- [ ] Tested navigation between sections
- [ ] Verified Firebase connection works

## Phase 4: Functionality Testing ✅

### Draft System Testing
- [ ] Navigated to "Make Your Picks" section
- [ ] Entered test participant name
- [ ] Selected one player from each tier
- [ ] Successfully submitted picks
- [ ] Verified picks appear in Firestore Console
- [ ] Confirmed picks appear in Admin Dashboard

### Admin Dashboard Testing
- [ ] Logged into Admin Dashboard
- [ ] Password works: `pga2026admin`
- [ ] Toggled draft status (open/closed)
- [ ] Updated cut line score
- [ ] Viewed all participant picks
- [ ] Tested manual score override
- [ ] Viewed player management section

### Leaderboard Testing
- [ ] Navigated to Leaderboard section
- [ ] Confirmed test participant appears
- [ ] Verified score calculations are correct
- [ ] Checked last updated timestamp displays

### Score Update Testing
- [ ] Manually triggered score update function
- [ ] Verified function executes without errors
- [ ] Checked Firestore for updated player scores
- [ ] Confirmed leaderboard updates automatically

## Phase 5: Pre-Tournament Preparation ✅

### Player Data Finalization (May 7-13, 2026)
- [ ] Verified all players in field are in database
- [ ] Updated any last-minute player changes
- [ ] Confirmed tier assignments are accurate
- [ ] Double-checked ESPN IDs are correct

### Participant Communication
- [ ] Shared website URL with all participants
- [ ] Explained draft rules and scoring system
- [ ] Set deadline for pick submissions
- [ ] Sent reminder emails/messages

### Draft Management
- [ ] Monitored participant submissions
- [ ] Verified all participants submitted picks
- [ ] Closed draft on May 13, 2026 (day before tournament)
- [ ] Confirmed draft status shows "Closed"

### Final Verification (May 13, 2026)
- [ ] All participants have submitted picks
- [ ] Draft is closed
- [ ] Cloud Function schedule is active
- [ ] Website is accessible to all participants
- [ ] Admin dashboard is functional
- [ ] Backup plan in place for manual updates

## Phase 6: Tournament Week (May 14-17, 2026) ✅

### Daily Monitoring
- [ ] **Thursday (Round 1)**: Monitor score updates every 20 minutes
- [ ] **Friday (Round 2)**: Monitor scores and prepare for cut
- [ ] **Friday Evening**: Set cut line in Admin Dashboard
- [ ] **Saturday (Round 3)**: Verify cut penalties applied correctly
- [ ] **Sunday (Round 4)**: Monitor final round and determine winner

### Cut Line Management (Friday Evening)
- [ ] Check official PGA Championship cut line
- [ ] Login to Admin Dashboard
- [ ] Update cut line score (e.g., +5, +3, etc.)
- [ ] Verify cut players receive penalty scores
- [ ] Confirm leaderboard reflects cut penalties

### Issue Resolution
- [ ] Monitor Cloud Function logs for errors
- [ ] Be available for manual score overrides if needed
- [ ] Respond to participant questions
- [ ] Fix any technical issues promptly

### Winner Announcement (Sunday Evening)
- [ ] Verify final scores are accurate
- [ ] Confirm leaderboard shows correct winner
- [ ] Announce winner to all participants
- [ ] Celebrate! 🏆

## Emergency Procedures 🚨

### If Automatic Updates Fail
1. Check Cloud Function logs: `firebase functions:log`
2. Manually trigger update: Call `manualUpdateScores` endpoint
3. Use Admin Dashboard to override individual scores
4. Monitor ESPN API for accessibility issues

### If Website Goes Down
1. Check GitHub Pages status
2. Verify Firebase hosting is active
3. Check for any configuration errors
4. Redeploy if necessary: `git push`

### If Database Issues Occur
1. Check Firestore Console for errors
2. Verify security rules are correct
3. Check quota limits (should be well within free tier)
4. Contact Firebase support if needed

## Post-Tournament Tasks ✅

### Data Preservation
- [ ] Export final leaderboard data
- [ ] Save participant picks for records
- [ ] Document any issues encountered
- [ ] Archive tournament results

### Cleanup (Optional)
- [ ] Keep website live for historical reference
- [ ] Or delete Firebase project to clean up
- [ ] Archive GitHub repository
- [ ] Share final results with participants

## Contact Information

### Important URLs
- **Website**: `https://YOUR_USERNAME.github.io/pga-championship-betting/`
- **Firebase Console**: `https://console.firebase.google.com/project/YOUR_PROJECT_ID`
- **GitHub Repo**: `https://github.com/YOUR_USERNAME/pga-championship-betting`
- **ESPN API**: `https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard?event=401811947`

### Support Resources
- Firebase Documentation: https://firebase.google.com/docs
- GitHub Pages Documentation: https://docs.github.com/pages
- ESPN API Documentation: (unofficial, reverse-engineered)

## Notes

- Tournament starts: **Thursday, May 14, 2026 at 7:00 AM ET**
- Cut typically made: **Friday evening after Round 2**
- Tournament ends: **Sunday, May 17, 2026 evening**
- All times are Eastern Time (tournament location)

## Success Criteria ✅

Your deployment is successful when:
- ✅ Website is live and accessible
- ✅ All participants can submit picks
- ✅ Admin dashboard is functional
- ✅ Scores update automatically every 20 minutes
- ✅ Leaderboard calculates correctly
- ✅ Cut penalties apply automatically
- ✅ Everything runs on free tier

---

**Good luck with your betting pool! May the best picks win! 🏌️⛳🏆**