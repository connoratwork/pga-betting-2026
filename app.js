// Global state
let currentSection = 'home';
let isAdmin = false;
let selectedPlayers = {
    tier1: null,
    tier2: null,
    tier3: null,
    tier4: null
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    loadPlayers();
    loadDraftStatus();
    loadLeaderboard();
    setupEventListeners();
    
    // Auto-refresh leaderboard every 2 minutes
    setInterval(loadLeaderboard, 120000);
});

// Navigation
function initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const btnId = e.target.id;
            if (btnId === 'homeBtn') showSection('home');
            else if (btnId === 'draftBtn') showSection('draft');
            else if (btnId === 'leaderboardBtn') showSection('leaderboard');
            else if (btnId === 'adminBtn') showSection('admin');
        });
    });
}

function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    // Show selected section
    document.getElementById(`${section}Section`).classList.add('active');
    document.getElementById(`${section}Btn`).classList.add('active');
    
    currentSection = section;
    
    // Reload data for specific sections
    if (section === 'leaderboard') loadLeaderboard();
    if (section === 'draft') loadDraftStatus();
}

// Event Listeners
function setupEventListeners() {
    document.getElementById('startDraftBtn').addEventListener('click', () => showSection('draft'));
    document.getElementById('submitPicksBtn').addEventListener('click', submitPicks);
    document.getElementById('adminLoginBtn').addEventListener('click', adminLogin);
    document.getElementById('adminLogoutBtn').addEventListener('click', adminLogout);
    document.getElementById('toggleDraftBtn').addEventListener('click', toggleDraft);
    document.getElementById('updateCutLineBtn').addEventListener('click', updateCutLine);
    document.getElementById('viewPlayersBtn').addEventListener('click', viewPlayers);
    document.getElementById('overrideScoreBtn').addEventListener('click', overrideScore);
}

// Load Players from Firestore
async function loadPlayers() {
    try {
        const playersSnapshot = await db.collection('players').orderBy('tier').orderBy('rank').get();
        
        const tier1Container = document.getElementById('tier1Players');
        const tier2Container = document.getElementById('tier2Players');
        const tier3Container = document.getElementById('tier3Players');
        const tier4Container = document.getElementById('tier4Players');
        
        tier1Container.innerHTML = '';
        tier2Container.innerHTML = '';
        tier3Container.innerHTML = '';
        tier4Container.innerHTML = '';
        
        playersSnapshot.forEach(doc => {
            const player = doc.data();
            const playerCard = createPlayerCard(player, doc.id);
            
            if (player.tier === 1) tier1Container.appendChild(playerCard);
            else if (player.tier === 2) tier2Container.appendChild(playerCard);
            else if (player.tier === 3) tier3Container.appendChild(playerCard);
            else if (player.tier === 4) tier4Container.appendChild(playerCard);
        });
    } catch (error) {
        console.error('Error loading players:', error);
    }
}

function createPlayerCard(player, playerId) {
    const card = document.createElement('div');
    card.className = 'player-card';
    card.dataset.playerId = playerId;
    card.dataset.tier = player.tier;
    
    card.innerHTML = `
        <div class="player-name">${player.name}</div>
        <div class="player-odds">Odds: ${player.odds}</div>
    `;
    
    card.addEventListener('click', () => selectPlayer(player.tier, playerId, player.name, card));
    
    return card;
}

function selectPlayer(tier, playerId, playerName, cardElement) {
    // Deselect previous selection in this tier
    const tierKey = `tier${tier}`;
    const previousCard = document.querySelector(`.player-card[data-tier="${tier}"].selected`);
    if (previousCard) previousCard.classList.remove('selected');
    
    // Select new player
    selectedPlayers[tierKey] = { id: playerId, name: playerName };
    cardElement.classList.add('selected');
    
    // Update summary
    document.getElementById(`selected${tier}`).textContent = playerName;
    
    // Check if all tiers selected
    checkAllTiersSelected();
}

function checkAllTiersSelected() {
    const allSelected = selectedPlayers.tier1 && selectedPlayers.tier2 && 
                       selectedPlayers.tier3 && selectedPlayers.tier4;
    document.getElementById('submitPicksBtn').disabled = !allSelected;
}

// Submit Picks
async function submitPicks() {
    const participantName = document.getElementById('participantName').value.trim();
    
    if (!participantName) {
        alert('Please enter your name');
        return;
    }
    
    if (!selectedPlayers.tier1 || !selectedPlayers.tier2 || !selectedPlayers.tier3 || !selectedPlayers.tier4) {
        alert('Please select one player from each tier');
        return;
    }
    
    try {
        // Check if draft is still open
        const settingsDoc = await db.collection('settings').doc('draft').get();
        if (!settingsDoc.exists || !settingsDoc.data().isOpen) {
            alert('Draft is closed');
            return;
        }
        
        // Submit picks
        await db.collection('participants').add({
            name: participantName,
            picks: {
                tier1: selectedPlayers.tier1.id,
                tier2: selectedPlayers.tier2.id,
                tier3: selectedPlayers.tier3.id,
                tier4: selectedPlayers.tier4.id
            },
            picksNames: {
                tier1: selectedPlayers.tier1.name,
                tier2: selectedPlayers.tier2.name,
                tier3: selectedPlayers.tier3.name,
                tier4: selectedPlayers.tier4.name
            },
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        alert('Picks submitted successfully!');
        
        // Reset form
        document.getElementById('participantName').value = '';
        selectedPlayers = { tier1: null, tier2: null, tier3: null, tier4: null };
        document.querySelectorAll('.player-card.selected').forEach(card => card.classList.remove('selected'));
        document.getElementById('selected1').textContent = 'None';
        document.getElementById('selected2').textContent = 'None';
        document.getElementById('selected3').textContent = 'None';
        document.getElementById('selected4').textContent = 'None';
        document.getElementById('submitPicksBtn').disabled = true;
        
        showSection('leaderboard');
    } catch (error) {
        console.error('Error submitting picks:', error);
        alert('Error submitting picks. Please try again.');
    }
}

// Load Draft Status
async function loadDraftStatus() {
    try {
        const settingsDoc = await db.collection('settings').doc('draft').get();
        const isOpen = settingsDoc.exists ? settingsDoc.data().isOpen : true;
        
        if (isOpen) {
            document.getElementById('draftOpen').style.display = 'block';
            document.getElementById('draftClosed').style.display = 'none';
        } else {
            document.getElementById('draftOpen').style.display = 'none';
            document.getElementById('draftClosed').style.display = 'block';
        }
        
        // Update admin dashboard
        if (document.getElementById('draftStatus')) {
            document.getElementById('draftStatus').textContent = isOpen ? 'Open' : 'Closed';
        }
    } catch (error) {
        console.error('Error loading draft status:', error);
    }
}

// Load Leaderboard
async function loadLeaderboard() {
    try {
        const participantsSnapshot = await db.collection('participants').get();
        const playersSnapshot = await db.collection('players').get();
        
        // Create player lookup
        const playersMap = {};
        playersSnapshot.forEach(doc => {
            playersMap[doc.id] = doc.data();
        });
        
        // Calculate scores for each participant
        const leaderboardData = [];
        
        for (const doc of participantsSnapshot.docs) {
            const participant = doc.data();
            let totalScore = 0;
            const playerScores = [];
            
            // Calculate score for each pick
            for (let tier = 1; tier <= 4; tier++) {
                const playerId = participant.picks[`tier${tier}`];
                const player = playersMap[playerId];
                
                if (player) {
                    const playerTotal = (player.round1 || 0) + (player.round2 || 0) + 
                                      (player.round3 || 0) + (player.round4 || 0);
                    totalScore += playerTotal;
                    
                    playerScores.push({
                        name: participant.picksNames[`tier${tier}`],
                        r1: player.round1 || '-',
                        r2: player.round2 || '-',
                        r3: player.round3 || '-',
                        r4: player.round4 || '-',
                        total: playerTotal || '-',
                        isCut: player.isCut || false
                    });
                }
            }
            
            leaderboardData.push({
                name: participant.name,
                totalScore: totalScore,
                playerScores: playerScores
            });
        }
        
        // Sort by total score
        leaderboardData.sort((a, b) => a.totalScore - b.totalScore);
        
        // Display leaderboard
        displayLeaderboard(leaderboardData);
        
        // Update last updated time
        document.getElementById('lastUpdated').textContent = 
            `Last updated: ${new Date().toLocaleString()}`;
    } catch (error) {
        console.error('Error loading leaderboard:', error);
    }
}

function displayLeaderboard(data) {
    const container = document.getElementById('leaderboardTable');
    
    if (data.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 20px;">No participants yet</p>';
        return;
    }
    
    let html = '<table><thead><tr>';
    html += '<th>Rank</th><th>Participant</th><th>Total Score</th><th>Players</th>';
    html += '</tr></thead><tbody>';
    
    data.forEach((participant, index) => {
        const isLeader = index === 0;
        html += `<tr class="${isLeader ? 'leader' : ''}">`;
        html += `<td>${index + 1}</td>`;
        html += `<td>${participant.name}</td>`;
        html += `<td><strong>${participant.totalScore || 0}</strong></td>`;
        html += '<td><div style="font-size: 0.9em;">';
        
        participant.playerScores.forEach(player => {
            const cutBadge = player.isCut ? '<span class="player-status cut">CUT</span>' : '';
            html += `<div style="margin: 5px 0;">
                <strong>${player.name}</strong> ${cutBadge}<br>
                R1: ${player.r1} | R2: ${player.r2} | R3: ${player.r3} | R4: ${player.r4} | 
                Total: <strong>${player.total}</strong>
            </div>`;
        });
        
        html += '</div></td></tr>';
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// Admin Functions
function adminLogin() {
    const password = document.getElementById('adminPassword').value;
    
    if (password === ADMIN_PASSWORD) {
        isAdmin = true;
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        loadAdminData();
    } else {
        alert('Incorrect password');
    }
}

function adminLogout() {
    isAdmin = false;
    document.getElementById('adminLogin').style.display = 'block';
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('adminPassword').value = '';
}

async function loadAdminData() {
    await loadDraftStatus();
    await loadCutLine();
    await loadAllPicks();
    await loadPlayersForOverride();
}

async function toggleDraft() {
    try {
        const settingsDoc = await db.collection('settings').doc('draft').get();
        const currentStatus = settingsDoc.exists ? settingsDoc.data().isOpen : true;
        
        await db.collection('settings').doc('draft').set({
            isOpen: !currentStatus
        });
        
        alert(`Draft is now ${!currentStatus ? 'open' : 'closed'}`);
        await loadDraftStatus();
    } catch (error) {
        console.error('Error toggling draft:', error);
        alert('Error updating draft status');
    }
}

async function loadCutLine() {
    try {
        const settingsDoc = await db.collection('settings').doc('cutLine').get();
        if (settingsDoc.exists) {
            document.getElementById('currentCutLine').textContent = settingsDoc.data().score;
        }
    } catch (error) {
        console.error('Error loading cut line:', error);
    }
}

async function updateCutLine() {
    const cutLineScore = parseInt(document.getElementById('cutLineScore').value);
    
    if (isNaN(cutLineScore)) {
        alert('Please enter a valid score');
        return;
    }
    
    try {
        await db.collection('settings').doc('cutLine').set({
            score: cutLineScore
        });
        
        alert('Cut line updated successfully');
        await loadCutLine();
    } catch (error) {
        console.error('Error updating cut line:', error);
        alert('Error updating cut line');
    }
}

async function loadAllPicks() {
    try {
        const participantsSnapshot = await db.collection('participants').get();
        const container = document.getElementById('allPicks');
        
        if (participantsSnapshot.empty) {
            container.innerHTML = '<p>No picks submitted yet</p>';
            return;
        }
        
        let html = '';
        participantsSnapshot.forEach(doc => {
            const participant = doc.data();
            html += `<div class="pick-card">
                <h4>${participant.name}</h4>
                <ul>
                    <li>Tier 1: ${participant.picksNames.tier1}</li>
                    <li>Tier 2: ${participant.picksNames.tier2}</li>
                    <li>Tier 3: ${participant.picksNames.tier3}</li>
                    <li>Tier 4: ${participant.picksNames.tier4}</li>
                </ul>
            </div>`;
        });
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading picks:', error);
    }
}

async function loadPlayersForOverride() {
    try {
        const playersSnapshot = await db.collection('players').orderBy('name').get();
        const select = document.getElementById('overridePlayer');
        
        select.innerHTML = '<option value="">Select Player</option>';
        
        playersSnapshot.forEach(doc => {
            const player = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = player.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading players:', error);
    }
}

async function overrideScore() {
    const playerId = document.getElementById('overridePlayer').value;
    const round = document.getElementById('overrideRound').value;
    const score = parseInt(document.getElementById('overrideScore').value);
    
    if (!playerId || !round || isNaN(score)) {
        alert('Please fill in all fields');
        return;
    }
    
    try {
        const updateData = {};
        updateData[`round${round}`] = score;
        
        await db.collection('players').doc(playerId).update(updateData);
        
        alert('Score updated successfully');
        await loadLeaderboard();
    } catch (error) {
        console.error('Error overriding score:', error);
        alert('Error updating score');
    }
}

async function viewPlayers() {
    const container = document.getElementById('playerManagement');
    
    if (container.style.display === 'none') {
        try {
            const playersSnapshot = await db.collection('players').orderBy('tier').orderBy('oddsRank').get();
            
            let html = '<table style="width: 100%; margin-top: 15px;"><thead><tr>';
            html += '<th>Name</th><th>Tier</th><th>Odds Rank</th><th>R1</th><th>R2</th><th>R3</th><th>R4</th><th>Cut</th>';
            html += '</tr></thead><tbody>';
            
            playersSnapshot.forEach(doc => {
                const player = doc.data();
                html += `<tr>
                    <td>${player.name}</td>
                    <td>${player.tier}</td>
                    <td>${player.oddsRank}</td>
                    <td>${player.round1 || '-'}</td>
                    <td>${player.round2 || '-'}</td>
                    <td>${player.round3 || '-'}</td>
                    <td>${player.round4 || '-'}</td>
                    <td>${player.isCut ? 'Yes' : 'No'}</td>
                </tr>`;
            });
            
            html += '</tbody></table>';
            container.innerHTML = html;
            container.style.display = 'block';
        } catch (error) {
            console.error('Error loading players:', error);
        }
    } else {
        container.style.display = 'none';
    }
}

// Made with Bob
