const API_BASE_URL = 'http://localhost:3000';
const challengesContainer = document.getElementById('challengesContainer');
const loadingSpinner = document.getElementById('loadingSpinner');
const playerTitle = document.getElementById('playerTitle');

let selectedPlayer = null;

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
async function initPage() {
    // Recupera i dati del giocatore dal localStorage
    const playerData = localStorage.getItem('selectedPlayer');
    if (!playerData) {
        window.location.href = 'index.html';
        return;
    }
    
    selectedPlayer = JSON.parse(playerData);
    playerTitle.textContent += selectedPlayer.name;
    
    await loadChallenges();
}

async function loadChallenges() {
    try {
        loadingSpinner.style.display = 'block';
        challengesContainer.innerHTML = '';
        
        // Carica tutte le sfide disponibili
        const response = await fetch(`${API_BASE_URL}/sfide`);
        if (!response.ok) throw new Error('Errore nel caricamento delle sfide');
        
        const challenges = await response.json();
        loadingSpinner.style.display = 'none';
        displayChallenges(challenges);
    } catch (error) {
        console.error('Errore:', error);
        loadingSpinner.style.display = 'none';
        challengesContainer.innerHTML = `
            <div class="text-center text-red-500">
                <p>Si è verificato un errore nel caricamento delle sfide.</p>
                <p>${error.message}</p>
            </div>
        `;
    }
}

function displayChallenges(challenges) {
    challengesContainer.innerHTML = challenges.map(challenge => `
        <div class="challenge-card bg-white rounded-lg shadow-sm overflow-hidden p-4 
                    ${challenge.punti > 0 ? 'positive' : 'negative'}">
            <div class="flex justify-between items-center">
                <div>
                    <h3 class="font-semibold text-lg">${challenge.descrizione}</h3>
                    <p class="mt-2 font-bold ${challenge.punti > 0 ? 'text-green-600' : 'text-red-600'}">
                        Punti: ${challenge.punti > 0 ? '+' : ''}${challenge.punti}
                    </p>
                </div>
                <button onclick="completeChallenge('${challenge._id}', ${challenge.punti}, '${escapeHtml(challenge.descrizione)}')" 
                        class="complete-btn px-4 py-2 rounded-md 
                               ${challenge.punti > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    Completa
                </button>
            </div>
        </div>
    `).join('');
}

async function completeChallenge(challengeId, points, challengeName) {
    if (!selectedPlayer || !confirm(`Confermi di voler assegnare ${points} punti a ${selectedPlayer.name}?`)) {
        return;
    }
    try {
        const updateResponse = await fetch(`${API_BASE_URL}/players/${selectedPlayer.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                punti: points,
                motivo: `Sfida completata: ${challengeName}`
            })
        });
        
        if (!updateResponse.ok) throw new Error('Errore nell\'aggiornamento dei punti');
        
        const updatedPlayer = await updateResponse.json();
        alert(`${selectedPlayer.name} ora ha ${updatedPlayer.punti} punti!`);
        await loadChallenges();
    } catch (error) {
        console.error('Errore:', error);
        alert(`Si è verificato un errore: ${error.message}`);
    }
}

// Aggiorna la chiamata nella mappa delle sfide
// Da:
// onclick="completeChallenge('${challenge._id}', ${challenge.punti})"
// A:
onclick="completeChallenge('${challenge._id}', ${challenge.punti}, '${escapeHtml(challenge.descrizione)}')"

// Espone le funzioni alla finestra globale
window.completeChallenge = completeChallenge;

document.addEventListener('DOMContentLoaded', initPage);