# Player Loader Script

This script loads PGA Championship player data into your Firebase database.

## Setup Instructions

### Step 1: Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/project/pgachampionshipbackend/settings/serviceaccounts/adminsdk)
2. Click **"Generate new private key"**
3. Click **"Generate key"** in the confirmation dialog
4. A JSON file will download (e.g., `pgachampionshipbackend-firebase-adminsdk-xxxxx.json`)
5. Rename it to `service-account-key.json`
6. Move it to the `scripts/` directory:
   ```bash
   mv ~/Downloads/pgachampionshipbackend-*.json ~/Desktop/Bob\ Assets/pga-championship-betting/scripts/service-account-key.json
   ```

### Step 2: Install Dependencies

```bash
cd ~/Desktop/Bob\ Assets/pga-championship-betting/scripts
npm install
```

### Step 3: Run the Script

```bash
npm run load-players
```

## What It Does

1. **Fetches ALL players** from ESPN Golf API (complete tournament field)
2. **Attempts to fetch odds** from https://www.pgachampionship.com/odds (optional)
3. **Organizes players into 4 tiers** based on rankings:
   - Tier 1: Ranks 1-10 (top favorites)
   - Tier 2: Ranks 11-20
   - Tier 3: Ranks 21-30
   - Tier 4: Ranks 31+ (all remaining players)
4. **Loads all players** into your Firestore database
5. **Opens the draft** for participants

**Note**: This script now loads the COMPLETE field of players competing in the PGA Championship (typically 150-160 players), not just the top 40.

## Expected Output

```
🏌️ PGA Championship Player Loader

Fetching odds data from pgachampionship.com/odds...
✅ Found odds for 156 players
Fetching ALL players from ESPN API...
✅ Found 156 total players from ESPN API

Player Distribution:
  Tier 1 (Rank 1-10):  10 players
  Tier 2 (Rank 11-20): 10 players
  Tier 3 (Rank 21-30): 10 players
  Tier 4 (Rank 31+):   126 players
  Total Players:       156

Loading 156 players into Firestore...
✅ Players loaded successfully!
Initializing settings...
✅ Settings initialized!

🎉 Setup complete!
   Visit: https://connoratwork.github.io/pga-betting-2026/
   The draft is now open for participants!
```

## After Running

1. Visit your site: https://connoratwork.github.io/pga-betting-2026/
2. Click the **"Make Picks"** tab
3. You should see all players organized by tier
4. Participants can now make their selections!

## Troubleshooting

**Error: "Cannot find module 'firebase-admin'"**
- Run: `npm install` in the scripts directory

**Error: "Could not load the default credentials"**
- Make sure `service-account-key.json` is in the scripts directory
- Verify the file is valid JSON

**Error: "EACCES: permission denied"**
- Run: `chmod +x load-players.js`