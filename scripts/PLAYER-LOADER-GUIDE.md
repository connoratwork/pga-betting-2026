# Player Loader Guide

## Overview

The player loader script fetches ALL players competing in the 2026 PGA Championship and loads them into Firebase Firestore. It uses two data sources:

1. **ESPN Golf API** - Primary source for complete player list
2. **PGA Championship Odds Page** - Secondary source for betting odds

## How It Works

### Data Flow

1. **Fetch Odds** (Optional)
   - Attempts to scrape betting odds from https://www.pgachampionship.com/odds
   - Creates a mapping of player names to odds (e.g., "+1100")
   - If this fails, calculated odds will be used instead

2. **Fetch All Players** (Primary)
   - Fetches complete field from ESPN API: `https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard?event=401811947`
   - Parses all competitors from the API response
   - Sorts players by current score/position to determine ranking
   - Assigns each player to a tier based on their rank

3. **Tier Assignment**
   - **Tier 1**: Players ranked 1-10 (top favorites)
   - **Tier 2**: Players ranked 11-20
   - **Tier 3**: Players ranked 21-30
   - **Tier 4**: Players ranked 31+ (all remaining players)

4. **Load to Firestore**
   - Batch writes all players to the `players` collection
   - Each player document includes: name, odds, rank, tier, round scores, total, cut status

## Running the Script

### Prerequisites

1. Firebase service account key file at `scripts/service-account-key.json`
2. Node.js installed
3. Dependencies installed: `cd scripts && npm install`

### Execute

```bash
cd pga-championship-betting/scripts
node load-players.js
```

### Expected Output

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

## Player Data Structure

Each player document in Firestore contains:

```javascript
{
  id: "player-1",              // Unique identifier
  name: "Scottie Scheffler",   // Full name
  odds: "+1100",               // Betting odds
  rank: 1,                     // Overall ranking (1-156+)
  tier: 1,                     // Tier assignment (1-4)
  round1: 0,                   // Round 1 score
  round2: 0,                   // Round 2 score
  round3: 0,                   // Round 3 score
  round4: 0,                   // Round 4 score
  total: 0,                    // Total strokes
  isCut: false,                // Cut status
  position: "T1"               // Current position
}
```

## Fallback Behavior

If the ESPN API is unavailable or returns no data, the script falls back to loading 40 sample players (10 per tier) with well-known PGA Tour names.

## Re-running the Script

You can re-run the script at any time to:
- Refresh the player list
- Update odds rankings
- Add newly qualified players

**Note**: Re-running will overwrite existing player data. Participant picks and scores will be preserved as they're in separate collections.

## Troubleshooting

### "No players found in ESPN API"

- The tournament may not have started yet
- The event ID (401811947) may be incorrect
- ESPN API may be temporarily unavailable
- Script will fall back to sample data

### "Could not fetch odds data"

- The PGA Championship odds page structure may have changed
- Network connectivity issues
- Script will use calculated odds instead (e.g., "+1100", "+1150", etc.)

### "Permission denied" errors

- Verify your service account key is valid
- Check that the Firebase project ID matches
- Ensure Firestore is enabled in your Firebase project

## Manual Player Management

After loading, you can manually manage players through the admin dashboard:
1. Visit the site and go to Admin section
2. Enter admin password
3. Use "Edit Player Tiers" to adjust tier assignments
4. Use "Manual Score Override" to correct any score issues

## Integration with Score Updates

Once players are loaded, the Firebase Cloud Function (`updateScores`) will automatically:
- Fetch live scores from ESPN API every 20 minutes
- Update round scores for all players
- Apply cut penalties automatically
- Recalculate participant totals

The player loader only needs to run once before the tournament starts (or when you want to refresh the player list).