#!/usr/bin/env node

/**
 * PGA Championship Player Loader
 * Fetches ALL players from ESPN API and loads into Firebase
 */

const https = require('https');
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Fetch player data from ESPN API
function fetchESPNData() {
  return new Promise((resolve, reject) => {
    const url = 'https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard?event=401811947';
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (error) {
          reject(new Error('Failed to parse ESPN API response'));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Fetch odds data from PGA Championship website
function fetchOddsPage() {
  return new Promise((resolve, reject) => {
    const url = 'https://www.pgachampionship.com/odds';
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Parse odds from HTML (simplified - may need adjustment based on actual HTML)
function parseOddsFromHTML(html) {
  const oddsMap = {};
  
  // Look for player names and odds patterns
  const playerPattern = /<div[^>]*class="[^"]*player[^"]*"[^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>[\s\S]*?<span[^>]*>([+\-]?\d+)<\/span>/gi;
  
  let match;
  while ((match = playerPattern.exec(html)) !== null) {
    const name = match[1].trim();
    const odds = match[2].trim();
    oddsMap[name] = odds;
  }
  
  return oddsMap;
}

// Parse all players from ESPN API
function parsePlayersFromESPN(espnData, oddsMap = {}) {
  const players = [];
  
  if (!espnData.events || !espnData.events[0] || !espnData.events[0].competitions ||
      !espnData.events[0].competitions[0] || !espnData.events[0].competitions[0].competitors) {
    throw new Error('Invalid ESPN API response structure');
  }
  
  const competitors = espnData.events[0].competitions[0].competitors;
  
  // Sort by current position/score to determine ranking
  const sortedCompetitors = competitors.sort((a, b) => {
    const aScore = parseInt(a.score) || 999;
    const bScore = parseInt(b.score) || 999;
    return aScore - bScore;
  });
  
  sortedCompetitors.forEach((competitor, index) => {
    const athlete = competitor.athlete;
    const name = athlete.displayName;
    const rank = index + 1;
    
    // Try to find odds for this player, default to calculated odds
    const odds = oddsMap[name] || `+${1000 + (rank * 50)}`;
    
    players.push({
      id: `player-${rank}`,
      name: name,
      odds: odds,
      rank: rank,
      tier: getTier(rank),
      round1: 0,
      round2: 0,
      round3: 0,
      round4: 0,
      total: 0,
      isCut: false,
      position: competitor.position || 'T1'
    });
  });
  
  return players;
}

// Determine tier based on rank
function getTier(rank) {
  if (rank <= 10) return 1;
  if (rank <= 20) return 2;
  if (rank <= 30) return 3;
  return 4;
}

// Sample players if scraping fails
function getSamplePlayers() {
  const sampleNames = [
    // Tier 1 (1-10)
    'Scottie Scheffler', 'Rory McIlroy', 'Jon Rahm', 'Viktor Hovland', 
    'Brooks Koepka', 'Xander Schauffele', 'Patrick Cantlay', 'Collin Morikawa',
    'Wyndham Clark', 'Max Homa',
    // Tier 2 (11-20)
    'Tommy Fleetwood', 'Justin Thomas', 'Jordan Spieth', 'Rickie Fowler',
    'Tony Finau', 'Hideki Matsuyama', 'Cameron Young', 'Sam Burns',
    'Russell Henley', 'Sahith Theegala',
    // Tier 3 (21-30)
    'Keegan Bradley', 'Jason Day', 'Min Woo Lee', 'Corey Conners',
    'Tom Kim', 'Sepp Straka', 'Adam Scott', 'Shane Lowry',
    'Matt Fitzpatrick', 'Tyrrell Hatton',
    // Tier 4 (31+)
    'Justin Rose', 'Gary Woodland', 'Webb Simpson', 'Billy Horschel',
    'Si Woo Kim', 'Sungjae Im', 'Cameron Smith', 'Byeong Hun An',
    'Lucas Glover', 'Brian Harman'
  ];
  
  return sampleNames.map((name, index) => {
    const rank = index + 1;
    return {
      id: `player-${rank}`,
      name: name,
      odds: `+${1000 + (rank * 100)}`,
      rank: rank,
      tier: getTier(rank),
      round1: 0,
      round2: 0,
      round3: 0,
      round4: 0,
      total: 0,
      isCut: false,
      position: 'T1'
    };
  });
}

// Load players into Firestore
async function loadPlayersToFirestore(players) {
  console.log(`Loading ${players.length} players into Firestore...`);
  
  const batch = db.batch();
  
  for (const player of players) {
    const playerRef = db.collection('players').doc(player.id);
    batch.set(playerRef, player);
  }
  
  await batch.commit();
  console.log('✅ Players loaded successfully!');
}

// Initialize settings
async function initializeSettings() {
  console.log('Initializing settings...');
  
  const settingsRef = db.collection('settings').doc('draft');
  await settingsRef.set({
    isOpen: true,
    cutLine: 0,
    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
  });
  
  console.log('✅ Settings initialized!');
}

// Main execution
async function main() {
  try {
    console.log('🏌️ PGA Championship Player Loader\n');
    
    let players = [];
    let oddsMap = {};
    
    // Try to fetch odds data first
    try {
      console.log('Fetching odds data from pgachampionship.com/odds...');
      const html = await fetchOddsPage();
      oddsMap = parseOddsFromHTML(html);
      console.log(`✅ Found odds for ${Object.keys(oddsMap).length} players`);
    } catch (error) {
      console.log('⚠️  Could not fetch odds data, will use calculated odds');
      console.log(`   Error: ${error.message}`);
    }
    
    // Fetch all players from ESPN API
    try {
      console.log('Fetching ALL players from ESPN API...');
      const espnData = await fetchESPNData();
      players = parsePlayersFromESPN(espnData, oddsMap);
      
      if (players.length === 0) {
        throw new Error('No players found in ESPN API');
      }
      
      console.log(`✅ Found ${players.length} total players from ESPN API`);
    } catch (error) {
      console.log('⚠️  Could not fetch from ESPN API, using sample data');
      console.log(`   Error: ${error.message}`);
      players = getSamplePlayers();
      console.log(`✅ Generated ${players.length} sample players`);
    }
    
    // Display player summary
    console.log('\nPlayer Distribution:');
    console.log(`  Tier 1 (Rank 1-10):  ${players.filter(p => p.tier === 1).length} players`);
    console.log(`  Tier 2 (Rank 11-20): ${players.filter(p => p.tier === 2).length} players`);
    console.log(`  Tier 3 (Rank 21-30): ${players.filter(p => p.tier === 3).length} players`);
    console.log(`  Tier 4 (Rank 31+):   ${players.filter(p => p.tier === 4).length} players`);
    console.log(`  Total Players:       ${players.length}\n`);
    
    // Load to Firestore
    await loadPlayersToFirestore(players);
    await initializeSettings();
    
    console.log('\n🎉 Setup complete!');
    console.log('   Visit: https://connoratwork.github.io/pga-betting-2026/');
    console.log('   The draft is now open for participants!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();

// Made with Bob
