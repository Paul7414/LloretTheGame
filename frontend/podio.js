const API_BASE_URL = 'http://localhost:3000';
const podium = document.getElementById('podium');
const playersList = document.getElementById('playersList');
const loadingSpinner = document.getElementById('loadingSpinner');

async function loadPlayersRanking() {
    try {
        loadingSpinner.style.display = 'block';
        
        const response = await fetch(`${API_BASE_URL}/players`);
        if (!response.ok) throw new Error('Errore nel caricamento dei giocatori');
        
        let players = await response.json();
        
        // Ordina i giocatori per punti (decrescente)
        players.sort((a, b) => b.punti - a.punti);
        
        loadingSpinner.style.display = 'none';
        displayPodium(players);
    } catch (error) {
        console.error('Errore:', error);
        loadingSpinner.style.display = 'none';
        podium.innerHTML = `<p class="text-red-500 text-center">${error.message}</p>`;
    }
}

function displayPodium(players) {
    // Podio per i primi 3
    const topPlayers = players.slice(0, 3);
    
    podium.innerHTML = `
        <div class="podium-grid">
            ${topPlayers.map((player, index) => `
                <div class="podium-place place-${index + 1}">
                    <div class="podium-rank">${index + 1}°</div>
                    <img src="${player.foto}" alt="${player.nome}" class="podium-avatar">
                    <div class="podium-info">
                        <h3 class="podium-name">${player.nome}</h3>
                        <p class="podium-nickname">${player.nickname}</p>
                        <p class="podium-points">${player.punti} punti</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    // Lista per gli altri giocatori
    const otherPlayers = players.slice(3);
    if (otherPlayers.length > 0) {
        playersList.innerHTML = otherPlayers.map((player, index) => `
            
            <div class="player-card bg-white rounded-lg shadow p-4 flex items-center">
                <span class="rank-number mr-3 text-gray-500 font-medium">${index + 4}°</span>
                <img src="${player.foto}" alt="${player.nome}" class="w-12 h-12 rounded-full object-cover mr-3">
                <div class="flex-1">
                    <h3 class="font-semibold">${player.nome}</h3>
                    <p class="text-sm text-gray-600">${player.nickname}</p>
                </div>
                <span class="points-badge bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                    ${player.punti} pts
                </span>
            </div>
        `).join('');
    } else {
        document.getElementById('otherPlayers').style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', loadPlayersRanking);