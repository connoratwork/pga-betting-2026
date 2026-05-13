#!/usr/bin/env node

/**
 * Simple Player Loader - Uses realistic player data with proper odds
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Realistic PGA Championship field with proper odds
function getRealisticPlayers() {
  const players = [
    // Tier 1 - Top favorites (1-10)
    { name: 'Scottie Scheffler', odds: '+450' },
    { name: 'Rory McIlroy', odds: '+800' },
    { name: 'Jon Rahm', odds: '+900' },
    { name: 'Viktor Hovland', odds: '+1200' },
    { name: 'Brooks Koepka', odds: '+1400' },
    { name: 'Xander Schauffele', odds: '+1600' },
    { name: 'Patrick Cantlay', odds: '+1800' },
    { name: 'Collin Morikawa', odds: '+2000' },
    { name: 'Wyndham Clark', odds: '+2200' },
    { name: 'Max Homa', odds: '+2500' },
    
    // Tier 2 - Strong contenders (11-20)
    { name: 'Tommy Fleetwood', odds: '+2800' },
    { name: 'Justin Thomas', odds: '+3000' },
    { name: 'Jordan Spieth', odds: '+3300' },
    { name: 'Rickie Fowler', odds: '+3500' },
    { name: 'Tony Finau', odds: '+4000' },
    { name: 'Hideki Matsuyama', odds: '+4500' },
    { name: 'Cameron Young', odds: '+5000' },
    { name: 'Sam Burns', odds: '+5500' },
    { name: 'Russell Henley', odds: '+6000' },
    { name: 'Sahith Theegala', odds: '+6500' },
    
    // Tier 3 - Solid players (21-30)
    { name: 'Keegan Bradley', odds: '+7000' },
    { name: 'Jason Day', odds: '+7500' },
    { name: 'Min Woo Lee', odds: '+8000' },
    { name: 'Corey Conners', odds: '+8500' },
    { name: 'Tom Kim', odds: '+9000' },
    { name: 'Sepp Straka', odds: '+9500' },
    { name: 'Adam Scott', odds: '+10000' },
    { name: 'Shane Lowry', odds: '+10500' },
    { name: 'Matt Fitzpatrick', odds: '+11000' },
    { name: 'Tyrrell Hatton', odds: '+11500' },
    
    // Tier 4 - Long shots (31+) - Adding many more realistic players
    { name: 'Justin Rose', odds: '+12000' },
    { name: 'Gary Woodland', odds: '+12500' },
    { name: 'Webb Simpson', odds: '+13000' },
    { name: 'Billy Horschel', odds: '+13500' },
    { name: 'Si Woo Kim', odds: '+14000' },
    { name: 'Sungjae Im', odds: '+14500' },
    { name: 'Cameron Smith', odds: '+15000' },
    { name: 'Byeong Hun An', odds: '+15500' },
    { name: 'Lucas Glover', odds: '+16000' },
    { name: 'Brian Harman', odds: '+16500' },
    { name: 'Will Zalatoris', odds: '+17000' },
    { name: 'Joaquin Niemann', odds: '+17500' },
    { name: 'Denny McCarthy', odds: '+18000' },
    { name: 'Taylor Moore', odds: '+18500' },
    { name: 'Eric Cole', odds: '+19000' },
    { name: 'Nick Taylor', odds: '+19500' },
    { name: 'Aaron Rai', odds: '+20000' },
    { name: 'Akshay Bhatia', odds: '+20500' },
    { name: 'Chris Kirk', odds: '+21000' },
    { name: 'Davis Thompson', odds: '+21500' },
    { name: 'J.T. Poston', odds: '+22000' },
    { name: 'Mackenzie Hughes', odds: '+22500' },
    { name: 'Taylor Pendrith', odds: '+23000' },
    { name: 'Alex Noren', odds: '+23500' },
    { name: 'Stephan Jaeger', odds: '+24000' },
    { name: 'Kurt Kitayama', odds: '+24500' },
    { name: 'Emiliano Grillo', odds: '+25000' },
    { name: 'Adam Hadwin', odds: '+25500' },
    { name: 'Harris English', odds: '+26000' },
    { name: 'Cam Davis', odds: '+26500' },
    { name: 'Andrew Putnam', odds: '+27000' },
    { name: 'Ben Griffin', odds: '+27500' },
    { name: 'Adam Svensson', odds: '+28000' },
    { name: 'Nick Dunlap', odds: '+28500' },
    { name: 'Matt Kuchar', odds: '+29000' },
    { name: 'Charley Hoffman', odds: '+29500' },
    { name: 'Kevin Kisner', odds: '+30000' },
    { name: 'Zach Johnson', odds: '+30500' },
    { name: 'Stewart Cink', odds: '+31000' },
    { name: 'Phil Mickelson', odds: '+31500' },
    { name: 'Bubba Watson', odds: '+32000' },
    { name: 'Sergio Garcia', odds: '+32500' },
    { name: 'Louis Oosthuizen', odds: '+33000' },
    { name: 'Henrik Stenson', odds: '+33500' },
    { name: 'Martin Kaymer', odds: '+34000' },
    { name: 'Graeme McDowell', odds: '+34500' },
    { name: 'Y.E. Yang', odds: '+35000' },
    { name: 'Padraig Harrington', odds: '+35500' },
    { name: 'Rich Beem', odds: '+36000' },
    { name: 'Shaun Micheel', odds: '+36500' },
    { name: 'David Toms', odds: '+37000' }
  ];
  
  return players.map((player, index) => {
    const rank = index + 1;
    return {
      id: `player-${rank}`,
      name: player.name,
      odds: player.odds,
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

function getTier(rank) {
  if (rank <= 10) return 1;
  if (rank <= 20) return 2;
  if (rank <= 30) return 3;
  return 4;
}

async function loadPlayersToFirestore(players) {
  console.log(`Loading ${players.length} players into Firestore...`);
  
  const batch = db.batch();
  
  for (const player of players) {
    const playerRef = db.collection('players').doc(player.id);
    batch.set(player, player);
  }
  
  await batch.commit();
  console.log('✅ Players loaded successfully!');
}

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

async function main() {
  try {
    console.log('🏌️ PGA Championship Player Loader (Simple)\n');
    
    const players = getRealisticPlayers();
    
    console.log(`Generated ${players.length} players with realistic odds\n`);
    
    // Display player summary
    console.log('Player Distribution:');
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
