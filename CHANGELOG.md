# Changelog - PGA Championship Betting Website

## Latest Updates (May 13, 2026)

### Fixed Issues

#### 1. Player Card Display Fix
**Issue**: Player cards showed "Odds Rank: undefined" instead of actual odds
**Fix**: Updated `app.js` line 102 to use `player.odds` instead of `player.oddsRank`
**Change**: Label now displays "Odds: +1100" instead of "Odds Rank: undefined"

**File Modified**: `app.js`
```javascript
// Before
<div class="player-odds">Odds Rank: ${player.oddsRank}</div>

// After
<div class="player-odds">Odds: ${player.odds}</div>
```

#### 2. Complete Player Field Loading
**Issue**: Only 40 sample players were loaded (10 per tier)
**Fix**: Enhanced player loader to fetch ALL competing players from ESPN API

**Files Modified**: 
- `scripts/load-players.js` - Complete rewrite of data fetching logic
- `scripts/README.md` - Updated documentation
- `scripts/PLAYER-LOADER-GUIDE.md` - New comprehensive guide

**New Features**:
- Fetches complete field from ESPN Golf API (150-160+ players)
- Optionally fetches betting odds from PGA Championship website
- Automatically assigns all players to appropriate tiers
- Tier 4 now contains all players ranked 31 and beyond (not just 10)

### How the New Player Loader Works

1. **Primary Data Source**: ESPN Golf API
   - URL: `https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard?event=401811947`
   - Provides complete list of all competitors
   - Includes current positions and scores

2. **Secondary Data Source**: PGA Championship Odds
   - URL: `https://www.pgachampionship.com/odds`
   - Provides betting odds for players
   - Falls back to calculated odds if unavailable

3. **Tier Distribution**:
   - Tier 1: Top 10 players (ranks 1-10)
   - Tier 2: Next 10 players (ranks 11-20)
   - Tier 3: Next 10 players (ranks 21-30)
   - Tier 4: All remaining players (ranks 31+)

### Expected Player Count

Typical PGA Championship field: **156 players**
- Tier 1: 10 players
- Tier 2: 10 players
- Tier 3: 10 players
- Tier 4: 126 players

### Running the Updated Loader

```bash
cd pga-championship-betting/scripts
node load-players.js
```

This will:
1. Clear existing player data
2. Fetch all competing players from ESPN
3. Fetch odds from PGA Championship website
4. Load complete field into Firestore
5. Open the draft for participants

### Benefits of These Changes

1. **Complete Field**: Participants can now choose from ALL competing players, not just top 40
2. **Accurate Odds**: Displays actual betting odds (e.g., "+1100") instead of undefined
3. **Better Tier 4**: Tier 4 now represents true long-shot picks with 100+ players to choose from
4. **Automatic Updates**: ESPN API integration ensures player list is always current
5. **Fallback Safety**: If ESPN API fails, still loads sample data to keep site functional

### Files Changed

1. `app.js` - Fixed player card odds display
2. `scripts/load-players.js` - Complete rewrite for ESPN API integration
3. `scripts/README.md` - Updated documentation
4. `scripts/PLAYER-LOADER-GUIDE.md` - New comprehensive guide (created)
5. `CHANGELOG.md` - This file (created)

### Next Steps

1. Re-run the player loader to populate database with complete field:
   ```bash
   cd scripts
   node load-players.js
   ```

2. Verify on the website that:
   - All tiers show correct number of players
   - Player cards display "Odds: +XXXX" correctly
   - Tier 4 has 100+ players available

3. Test the draft system with the expanded player pool

### Technical Notes

- The ESPN API event ID for 2026 PGA Championship is: `401811947`
- Player ranking is determined by current score/position in the API
- If a player's odds aren't found on the odds page, calculated odds are used: `+{1000 + (rank * 50)}`
- The loader uses Firebase batch writes for efficient database updates
- Maximum batch size is 500 operations, so large fields are handled properly

### Compatibility

- All existing features remain functional
- Participant picks are preserved (stored in separate collection)
- Admin dashboard continues to work with expanded player pool
- Cloud Functions for score updates work with any number of players
- Leaderboard calculations handle all player counts

---

## Previous Updates

### Initial Release (May 13, 2026)
- Complete betting website built and deployed
- Firebase Firestore backend configured
- GitHub Pages hosting set up
- Cloud Functions for automated score updates
- Admin dashboard with authentication
- Participant draft system
- Live leaderboard with automatic calculations