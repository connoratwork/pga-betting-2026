const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

admin.initializeApp();
const db = admin.firestore();

// ESPN API Configuration
const ESPN_API_URL = 'https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard?event=401811947';

/**
 * Scheduled function to update scores from ESPN API
 * Runs every 20 minutes during tournament days (Thursday-Sunday)
 */
exports.updateScores = functions.pubsub
    .schedule('*/20 * * * *') // Every 20 minutes
    .timeZone('America/New_York')
    .onRun(async (context) => {
        console.log('Starting score update...');
        
        try {
            // Check if it's tournament time (May 14-17, 2026)
            const now = new Date();
            const tournamentStart = new Date('2026-05-14T00:00:00-04:00');
            const tournamentEnd = new Date('2026-05-17T23:59:59-04:00');
            
            if (now < tournamentStart || now > tournamentEnd) {
                console.log('Not tournament time, skipping update');
                return null;
            }
            
            // Fetch data from ESPN API
            const response = await fetch(ESPN_API_URL);
            if (!response.ok) {
                throw new Error(`ESPN API returned ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.events || !data.events[0] || !data.events[0].competitions) {
                console.log('No competition data available');
                return null;
            }
            
            const competition = data.events[0].competitions[0];
            const competitors = competition.competitors || [];
            
            console.log(`Processing ${competitors.length} players...`);
            
            // Get cut line from settings
            const cutLineDoc = await db.collection('settings').doc('cutLine').get();
            const cutLineScore = cutLineDoc.exists ? cutLineDoc.data().score : null;
            
            // Calculate worst scores for each round (for cut penalty)
            const worstScores = await calculateWorstScores(competitors);
            
            // Update each player's scores
            const batch = db.batch();
            let updateCount = 0;
            
            for (const competitor of competitors) {
                const athlete = competitor.athlete;
                if (!athlete) continue;
                
                const playerId = athlete.id;
                const playerName = athlete.displayName;
                
                // Get player document from Firestore
                const playerQuery = await db.collection('players')
                    .where('espnId', '==', playerId)
                    .limit(1)
                    .get();
                
                if (playerQuery.empty) {
                    console.log(`Player not found in database: ${playerName}`);
                    continue;
                }
                
                const playerDoc = playerQuery.docs[0];
                const playerData = playerDoc.data();
                
                // Parse linescores
                const linescores = competitor.linescores || [];
                const scores = {
                    round1: null,
                    round2: null,
                    round3: null,
                    round4: null
                };
                
                linescores.forEach((line, index) => {
                    if (index < 4 && line.value) {
                        scores[`round${index + 1}`] = parseInt(line.value);
                    }
                });
                
                // Check if player made the cut
                const status = competitor.status?.type?.name || '';
                const isCut = status.toLowerCase().includes('cut') || 
                             (competitor.status?.displayValue || '').toLowerCase().includes('cut');
                
                // Apply cut penalty if player missed cut
                if (isCut && cutLineScore !== null) {
                    if (scores.round3 === null && worstScores.round3 !== null) {
                        scores.round3 = worstScores.round3 + 10;
                    }
                    if (scores.round4 === null && worstScores.round4 !== null) {
                        scores.round4 = worstScores.round4 + 10;
                    }
                }
                
                // Prepare update data
                const updateData = {
                    round1: scores.round1,
                    round2: scores.round2,
                    round3: scores.round3,
                    round4: scores.round4,
                    isCut: isCut,
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
                };
                
                // Add to batch
                batch.update(playerDoc.ref, updateData);
                updateCount++;
                
                console.log(`Updated ${playerName}: R1=${scores.round1}, R2=${scores.round2}, R3=${scores.round3}, R4=${scores.round4}, Cut=${isCut}`);
            }
            
            // Commit batch update
            if (updateCount > 0) {
                await batch.commit();
                console.log(`Successfully updated ${updateCount} players`);
            } else {
                console.log('No players to update');
            }
            
            return null;
        } catch (error) {
            console.error('Error updating scores:', error);
            throw error;
        }
    });

/**
 * Calculate worst scores for each round (for cut penalty calculation)
 */
async function calculateWorstScores(competitors) {
    const worstScores = {
        round1: null,
        round2: null,
        round3: null,
        round4: null
    };
    
    competitors.forEach(competitor => {
        const linescores = competitor.linescores || [];
        
        linescores.forEach((line, index) => {
            if (index < 4 && line.value) {
                const score = parseInt(line.value);
                const roundKey = `round${index + 1}`;
                
                if (worstScores[roundKey] === null || score > worstScores[roundKey]) {
                    worstScores[roundKey] = score;
                }
            }
        });
    });
    
    return worstScores;
}

/**
 * HTTP function to manually trigger score update (for testing)
 */
exports.manualUpdateScores = functions.https.onRequest(async (req, res) => {
    try {
        // Call the scheduled function logic
        await exports.updateScores.run();
        res.status(200).send('Score update completed successfully');
    } catch (error) {
        console.error('Error in manual update:', error);
        res.status(500).send('Error updating scores: ' + error.message);
    }
});

/**
 * HTTP function to initialize player data from a provided list
 * This should be called once to populate the database
 */
exports.initializePlayers = functions.https.onRequest(async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method not allowed');
        return;
    }
    
    try {
        const players = req.body.players;
        
        if (!Array.isArray(players)) {
            res.status(400).send('Invalid request: players array required');
            return;
        }
        
        const batch = db.batch();
        
        players.forEach(player => {
            const docRef = db.collection('players').doc();
            batch.set(docRef, {
                name: player.name,
                tier: player.tier,
                oddsRank: player.oddsRank,
                espnId: player.espnId || null,
                round1: null,
                round2: null,
                round3: null,
                round4: null,
                isCut: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        });
        
        await batch.commit();
        
        res.status(200).send(`Successfully initialized ${players.length} players`);
    } catch (error) {
        console.error('Error initializing players:', error);
        res.status(500).send('Error initializing players: ' + error.message);
    }
});

/**
 * Firestore trigger to recalculate leaderboard when player scores change
 */
exports.onPlayerScoreUpdate = functions.firestore
    .document('players/{playerId}')
    .onUpdate(async (change, context) => {
        console.log(`Player ${context.params.playerId} score updated`);
        // Leaderboard is calculated on-demand in the frontend
        // This trigger can be used for additional processing if needed
        return null;
    });

// Made with Bob
