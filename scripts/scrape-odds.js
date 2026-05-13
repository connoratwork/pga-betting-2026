#!/usr/bin/env node

/**
 * Scrape PGA Championship Odds using Puppeteer
 * Extracts player names and "To Win" odds from pgachampionship.com/odds
 */

const puppeteer = require('puppeteer');
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

function getTier(rank) {
  if (rank <= 10) return 1;
  if (rank <= 20) return 2;
  if (rank <= 30) return 3;
  return 4;
}

async function scrapeOdds() {
  console.log('🏌️ Scraping PGA Championship Odds...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.goto('https://www.pgachampionship.com/odds', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for the odds table to load
    await page.waitForSelector('[data-testid="odds-table"]', { timeout: 10000 });
    
    // Extract player data
    const players = await page.evaluate(() => {
      const rows = document.querySelectorAll('[data-testid="odds-table"] tbody tr');
      const playerData = [];
      
      rows.forEach(row => {
        try {
          // Get player name
          const nameElement = row.querySelector('[data-testid="player-name"]');
          if (!nameElement) return;
          
          const name = nameElement.textContent.trim();
          
          // Get "To Win" odds (first column after player name)
          const oddsElements = row.querySelectorAll('td');
          let toWinOdds = null;
          
          // The "To Win" column is typically the second td element
          if (oddsElements.length >= 2) {
            toWinOdds = oddsElements[1].textContent.trim();
          }
          
          if (name && toWinOdds && toWinOdds !== 'EVEN') {
            playerData.push({
              name: name,
              odds: toWinOdds
            });
          }
        } catch (error) {
          console.error('Error parsing row:', error);
        }
      });
      
      return playerData;
    });
    
    await browser.close();
    
    if (players.length === 0) {
      throw new Error('No players found - page structure may have changed');
    }
    
    console.log(`✅ Found ${players.length} players with odds\n`);
    
    // Convert to full player objects with tiers
    const fullPlayers = players.map((player, index) => {
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
    
    return fullPlayers;
    
  } catch (error) {
    await browser.close();
    throw error;
  }
}

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
    const players = await scrapeOdds();
    
    // Display player summary
    console.log('Player Distribution:');
    console.log(`  Tier 1 (Rank 1-10):  ${players.filter(p => p.tier === 1).length} players`);
    console.log(`  Tier 2 (Rank 11-20): ${players.filter(p => p.tier === 2).length} players`);
    console.log(`  Tier 3 (Rank 21-30): ${players.filter(p => p.tier === 3).length} players`);
    console.log(`  Tier 4 (Rank 31+):   ${players.filter(p => p.tier === 4).length} players`);
    console.log(`  Total Players:       ${players.length}\n`);
    
    // Show first 10 players as sample
    console.log('Sample (Top 10):');
    players.slice(0, 10).forEach(p => {
      console.log(`  ${p.rank}. ${p.name} - ${p.odds}`);
    });
    console.log('');
    
    // Load to Firestore
    await loadPlayersToFirestore(players);
    await initializeSettings();
    
    console.log('\n🎉 Setup complete!');
    console.log('   Visit: https://connoratwork.github.io/pga-betting-2026/');
    console.log('   The draft is now open for participants!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  - Make sure you have puppeteer installed: npm install puppeteer');
    console.error('  - Check your internet connection');
    console.error('  - The website structure may have changed\n');
    process.exit(1);
  }
}

main();

// Made with Bob
