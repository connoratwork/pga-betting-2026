# System Architecture - PGA Championship Betting Pool

## Overview

This document describes the technical architecture of the golf betting website.

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS / PARTICIPANTS                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GITHUB PAGES (Frontend)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  index.html  │  │  styles.css  │  │    app.js    │         │
│  │              │  │              │  │              │         │
│  │  - Home      │  │  - Styling   │  │  - Logic     │         │
│  │  - Draft     │  │  - Responsive│  │  - Firebase  │         │
│  │  - Leaderboard│ │  - Animations│  │  - UI Updates│         │
│  │  - Admin     │  │              │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌──────────────┐                                               │
│  │  config.js   │  ← Firebase Configuration                    │
│  └──────────────┘                                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FIREBASE (Backend)                            │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              FIRESTORE DATABASE (NoSQL)                    │ │
│  │                                                            │ │
│  │  Collections:                                              │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ players                                              │ │ │
│  │  │  - name, tier, oddsRank, espnId                     │ │ │
│  │  │  - round1, round2, round3, round4                   │ │ │
│  │  │  - isCut, lastUpdated                               │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ participants                                         │ │ │
│  │  │  - name, picks (tier1-4), picksNames               │ │ │
│  │  │  - timestamp                                        │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ settings                                             │ │ │
│  │  │  - draft (isOpen)                                   │ │ │
│  │  │  - cutLine (score)                                  │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           CLOUD FUNCTIONS (Serverless)                     │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ updateScores (Scheduled - Every 20 min)             │ │ │
│  │  │  - Fetches from ESPN API                            │ │ │
│  │  │  - Updates player scores                            │ │ │
│  │  │  - Applies cut penalties                            │ │ │
│  │  │  - Runs May 14-17, 2026                             │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ manualUpdateScores (HTTP)                           │ │ │
│  │  │  - Manual trigger for testing                       │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ initializePlayers (HTTP)                            │ │ │
│  │  │  - One-time player data import                      │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ESPN GOLF API (External)                      │
│                                                                  │
│  Endpoint: /apis/site/v2/sports/golf/pga/scoreboard            │
│  Event ID: 401811947 (2026 PGA Championship)                   │
│                                                                  │
│  Provides:                                                       │
│  - Live player scores (round by round)                          │
│  - Cut status                                                    │
│  - Tournament standings                                          │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Participant Submits Picks

```
User → Frontend (app.js) → Firestore (participants collection)
```

1. User enters name and selects 4 players (one per tier)
2. Frontend validates selections
3. Data sent to Firestore via Firebase SDK
4. Confirmation displayed to user

### 2. Automated Score Updates

```
Cron Trigger → Cloud Function → ESPN API → Parse Data → Firestore (players) → Frontend Auto-Refresh
```

1. Cloud Scheduler triggers `updateScores` every 20 minutes
2. Function fetches data from ESPN API
3. Parses player scores and cut status
4. Calculates cut penalties if applicable
5. Updates Firestore player documents
6. Frontend automatically reflects changes (real-time listeners)

### 3. Leaderboard Calculation

```
Frontend → Firestore (participants + players) → Calculate Scores → Display Leaderboard
```

1. Frontend fetches all participants
2. For each participant, fetches their 4 players' scores
3. Calculates total score (sum of all rounds)
4. Sorts by lowest score
5. Displays ranked leaderboard with details

### 4. Admin Operations

```
Admin → Password Auth → Admin Dashboard → Firestore (settings/players)
```

1. Admin logs in with password
2. Can toggle draft status
3. Can update cut line
4. Can manually override scores
5. Can view all picks and players

## Technology Stack

### Frontend
- **HTML5**: Structure and semantic markup
- **CSS3**: Styling, animations, responsive design
- **JavaScript (ES6+)**: Application logic, Firebase integration
- **Firebase SDK**: Real-time database connection

### Backend
- **Firebase Firestore**: NoSQL database
- **Firebase Cloud Functions**: Serverless compute
- **Node.js**: Function runtime environment
- **Firebase Hosting**: Static file hosting (optional)

### Hosting
- **GitHub Pages**: Free static site hosting
- **Custom Domain**: Optional CNAME configuration

### External APIs
- **ESPN Golf API**: Live tournament data

## Security Model

### Firestore Security Rules

```javascript
// Players: Read by all, write by functions only
match /players/{playerId} {
  allow read: if true;
  allow write: if false; // Only Cloud Functions
}

// Participants: Read by all, create by anyone, modify by functions only
match /participants/{participantId} {
  allow read: if true;
  allow create: if true; // Anyone can submit picks
  allow update, delete: if false;
}

// Settings: Read by all, write by functions only
match /settings/{settingId} {
  allow read: if true;
  allow write: if false;
}
```

### Authentication
- **Admin**: Simple password-based (hardcoded)
- **Participants**: No authentication required (open submission)
- **Production Recommendation**: Implement Firebase Authentication

## Scalability

### Current Limits (Free Tier)
- **Firestore Reads**: 50,000/day
- **Firestore Writes**: 20,000/day
- **Cloud Functions**: 2M invocations/month
- **Hosting**: 10GB storage, 360MB/day bandwidth

### Expected Usage
- **Participants**: 10-50 people
- **Firestore Reads**: ~500/day (well within limit)
- **Firestore Writes**: ~100/day (well within limit)
- **Function Invocations**: ~1,500/tournament (20 min × 4 days)
- **Bandwidth**: <1MB total site

### Scaling Considerations
- Can handle 100+ participants without issues
- Can scale to 1000+ participants on free tier
- For larger scale, consider:
  - Caching leaderboard data
  - Rate limiting submissions
  - Upgrading to paid Firebase plan

## Performance Optimizations

### Frontend
- Minimal dependencies (only Firebase SDK)
- CSS animations for smooth UX
- Debounced API calls
- Local state management

### Backend
- Indexed Firestore queries
- Batch writes for efficiency
- Scheduled functions (not continuous)
- Efficient data structure

### Caching
- Browser caching for static assets
- Firestore real-time listeners (no polling)
- GitHub Pages CDN distribution

## Monitoring & Logging

### Available Logs
- **Cloud Functions**: `firebase functions:log`
- **Firestore**: Firebase Console → Firestore → Usage tab
- **Hosting**: GitHub Actions deployment logs

### Key Metrics to Monitor
- Function execution time
- Firestore read/write counts
- Error rates
- API response times

## Disaster Recovery

### Backup Strategy
- Firestore automatic backups (Firebase handles)
- Git version control for code
- Export participant data before tournament

### Rollback Procedures
- Revert Git commits: `git revert`
- Redeploy functions: `firebase deploy --only functions`
- Manual data correction via Admin Dashboard

## Future Enhancements

### Potential Features
1. **User Authentication**: Firebase Auth for participants
2. **Email Notifications**: Tournament updates via SendGrid
3. **Live Chat**: Real-time participant chat
4. **Historical Data**: Multi-tournament tracking
5. **Mobile App**: React Native or Flutter app
6. **Advanced Analytics**: Player statistics and trends
7. **Betting Odds Integration**: Live odds updates
8. **Payment Integration**: Entry fees and payouts

### Technical Improvements
1. **TypeScript**: Type safety
2. **React/Vue**: Modern framework
3. **Testing**: Unit and integration tests
4. **CI/CD**: Automated deployment pipeline
5. **Monitoring**: Application Performance Monitoring (APM)
6. **Error Tracking**: Sentry or similar

## Cost Analysis

### Free Tier Usage
- **Firebase**: $0.00 (within limits)
- **GitHub Pages**: $0.00 (public repo)
- **ESPN API**: $0.00 (unofficial, no key required)
- **Domain**: $0.00 (using GitHub Pages subdomain)

### Total Cost: **$0.00** ✅

### Paid Tier Considerations
If you exceed free tier:
- **Firebase Blaze Plan**: Pay-as-you-go
- **Custom Domain**: ~$12/year
- **Estimated Cost**: Still <$5/month for small tournaments

## Compliance & Legal

### Data Privacy
- No personal data collected beyond names
- No email addresses or payment info
- GDPR compliant (minimal data collection)
- No cookies or tracking

### Terms of Use
- Betting pool is for entertainment only
- No real money gambling (unless legally permitted)
- Participants agree to rules when submitting picks

## Support & Maintenance

### Regular Maintenance
- Monitor during tournament (May 14-17)
- Update cut line after Round 2
- Verify score accuracy
- Respond to participant questions

### Post-Tournament
- Archive results
- Export data for records
- Optional: Keep site live for reference
- Optional: Delete Firebase project

---

**Architecture designed for simplicity, reliability, and zero cost! 🏌️⛳**