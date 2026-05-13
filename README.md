# 🏌️ 2026 PGA Championship Betting Pool

A fully automated golf betting website for the 2026 PGA Championship at Valhalla Golf Club (May 14-17, 2026).

## Features

- **Automated Score Updates**: Scores sync automatically from ESPN API every 20 minutes
- **Tier-Based Draft System**: 4 tiers based on odds rankings (1-10, 11-20, 21-30, 31+)
- **Real-Time Leaderboard**: Live standings with detailed player scores
- **Cut Penalty System**: Automatic penalty calculation for players who miss the cut
- **Admin Dashboard**: Full control over draft, cut line, and manual overrides
- **Mobile Responsive**: Works perfectly on all devices
- **100% Free**: Runs entirely on Firebase and GitHub Pages free tiers

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Firebase Firestore (NoSQL database)
- **Functions**: Firebase Cloud Functions (automated score updates)
- **Hosting**: GitHub Pages
- **API**: ESPN Golf API for live scores

## Quick Start

### For Participants

1. Visit the website
2. Click "Make Your Picks"
3. Enter your name
4. Select one player from each tier (4 total)
5. Submit your picks
6. Watch the leaderboard during the tournament!

### For Administrators

1. Click "Admin" tab
2. Login with password: `pga2026admin`
3. Manage draft status, cut line, and view all picks
4. Override scores manually if needed

## How Scoring Works

- **Your Score** = Sum of all 4 players' total strokes (Rounds 1-4)
- **Lowest score wins!**
- **Cut Penalty**: If a player misses the cut, their R3 and R4 scores = (worst score that round) + 10 strokes

## Project Structure

```
pga-championship-betting/
├── public/                 # Frontend files (GitHub Pages)
│   ├── index.html         # Main HTML
│   ├── styles.css         # Styling
│   ├── app.js             # Frontend logic
│   └── config.js          # Firebase configuration
├── functions/             # Firebase Cloud Functions
│   ├── index.js           # Score update logic
│   └── package.json       # Dependencies
├── docs/                  # Documentation
│   └── SETUP.md          # Complete setup guide
├── firebase.json          # Firebase configuration
├── firestore.rules        # Database security rules
└── firestore.indexes.json # Database indexes
```

## Setup Instructions

See [docs/SETUP.md](docs/SETUP.md) for complete step-by-step setup instructions including:

1. Firebase project creation
2. Firestore database setup
3. Cloud Functions deployment
4. GitHub Pages hosting
5. Player data initialization
6. Testing procedures

## Tournament Schedule

- **Thursday, May 14**: Round 1
- **Friday, May 15**: Round 2
- **Saturday, May 16**: Round 3 (after cut)
- **Sunday, May 17**: Round 4 (final round)

## Key Features Explained

### Automated Score Updates

A Firebase Cloud Function runs every 20 minutes during tournament days:
- Fetches latest scores from ESPN API
- Updates player scores in Firestore
- Applies cut penalties automatically
- Leaderboard updates in real-time

### Draft System

- **Open Draft**: Multiple participants can pick the same players
- **Tier Requirements**: Must select exactly one player per tier
- **Lock Mechanism**: Picks are locked once submitted
- **Admin Control**: Admin can open/close draft window

### Admin Dashboard

Full administrative control:
- Toggle draft open/closed
- Set and update cut line score
- View all participant picks
- Manually override any player's score
- View complete player list with scores

### Cut Penalty Logic

When a player misses the cut:
1. System identifies worst score for R3 and R4
2. Adds 10-stroke penalty to worst score
3. Assigns penalized scores to cut players
4. Displays "CUT" indicator on leaderboard

## Database Schema

### Collections

**players**
```javascript
{
  name: "Scottie Scheffler",
  tier: 1,
  oddsRank: 1,
  espnId: "3448",
  round1: 68,
  round2: 70,
  round3: 69,
  round4: 67,
  isCut: false
}
```

**participants**
```javascript
{
  name: "John Doe",
  picks: {
    tier1: "playerId1",
    tier2: "playerId2",
    tier3: "playerId3",
    tier4: "playerId4"
  },
  picksNames: {
    tier1: "Scottie Scheffler",
    tier2: "Rory McIlroy",
    tier3: "Brooks Koepka",
    tier4: "Tony Finau"
  },
  timestamp: "2026-05-13T12:00:00Z"
}
```

**settings**
```javascript
// Document: draft
{
  isOpen: true
}

// Document: cutLine
{
  score: 5
}
```

## API Integration

### ESPN Golf API

Endpoint: `https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard?event=401811947`

The Cloud Function parses:
- Player names and IDs
- Round-by-round scores (linescores array)
- Cut status
- Current standings

## Security

### Current Implementation
- Simple password-based admin authentication
- Public read access to all data
- Open participant registration

### Production Recommendations
- Implement Firebase Authentication
- Add rate limiting
- Use environment variables for secrets
- Add CAPTCHA for submissions
- Implement user authentication

## Cost Analysis

### Firebase Free Tier Limits
- Firestore: 1GB storage, 50K reads/day, 20K writes/day
- Cloud Functions: 2M invocations/month
- Hosting: 10GB storage, 360MB/day bandwidth

### Expected Usage
- Firestore Reads: ~500/day
- Firestore Writes: ~100/day
- Function Invocations: ~1,500/tournament
- Total Cost: **$0.00** ✅

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Scores Not Updating
- Check Cloud Function logs: `firebase functions:log`
- Manually trigger: Call `manualUpdateScores` endpoint
- Verify ESPN API accessibility

### Can't Submit Picks
- Verify draft is open in Admin Dashboard
- Check browser console for errors
- Verify Firebase config in `config.js`

### Admin Login Issues
- Verify password matches `config.js`
- Check browser console for errors

## Development

### Local Testing

```bash
# Install dependencies
cd functions
npm install

# Start Firebase emulators
firebase emulators:start

# Test functions locally
firebase functions:shell
```

### Deploy Updates

```bash
# Deploy functions
firebase deploy --only functions

# Deploy Firestore rules
firebase deploy --only firestore

# Update website (push to GitHub)
git add .
git commit -m "Update"
git push
```

## Contributing

This is a personal project for a betting pool. Feel free to fork and customize for your own tournaments!

## License

MIT License - Feel free to use and modify for your own betting pools.

## Acknowledgments

- ESPN for providing the Golf API
- Firebase for free hosting and database
- GitHub for free static site hosting
- PGA Championship for the tournament data

## Contact

For questions or issues, please check the [SETUP.md](docs/SETUP.md) documentation.

---

**Built with ❤️ for golf fans and betting enthusiasts**

**Tournament starts in less than 24 hours - Good luck! 🏌️⛳🏆**