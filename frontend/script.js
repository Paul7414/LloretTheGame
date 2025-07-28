const API_BASE_URL = 'https://api-lloretthegame.onrender.com';
const playersContainer = document.getElementById('playersContainer');
const loadingSpinner = document.getElementById('loadingSpinner');

async function loadPlayers() {
    try {
        loadingSpinner.style.display = 'block';
        playersContainer.innerHTML = '';
        
        const response = await fetch(`${API_BASE_URL}/players`);
        if (!response.ok) throw new Error('Errore nel caricamento dei giocatori');
        
        const players = await response.json();
        loadingSpinner.style.display = 'none';
        displayPlayers(players);
    } catch (error) {
        console.error('Errore:', error);
        loadingSpinner.style.display = 'none';
        playersContainer.innerHTML = `
            <div class="col-span-full text-center text-red-500">
                <p>Si è verificato un errore nel caricamento dei giocatori.</p>
                <p>${error.message}</p>
            </div>
        `;
    }
}

function displayPlayers(players) {
    playersContainer.innerHTML = players.map(player => `
        <div class="player-card bg-white rounded-lg shadow-md overflow-hidden cursor-pointer" 
             onclick="navigateToChallenges('${player._id}', '${player.nome}')">
            <div class="p-4">
                <div class="flex items-center mb-4">
                    <img src="${player.foto}" alt="${player.nome}" 
                         class="w-16 h-16 rounded-full object-cover mr-4">
                    <div>
                        <h2 class="text-xl font-semibold">${player.nome}</h2>
                        <p class="text-gray-600">${player.nickname}</p>
                    </div>
                </div>
                <div class="flex justify-between text-sm text-gray-500">
                    <span>Punti: <span class="font-bold">${player.punti}</span></span>
                    <span>Tipe: <span class="font-bold">${player.numeroTipe}</span></span>
                </div>
            </div>
        </div>
    `).join('');
}

function navigateToChallenges(playerId, playerName) {
    // Salva i dati del giocatore nel localStorage per la pagina sfide
    localStorage.setItem('selectedPlayer', JSON.stringify({
        id: playerId,
        name: playerName
    }));
    window.location.href = 'sfide.html';
}

document.addEventListener('DOMContentLoaded', loadPlayers);

// Espone la funzione alla finestra globale
window.navigateToChallenges = navigateToChallenges;