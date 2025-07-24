// Configurazione
const API_BASE_URL = 'http://localhost:3000'; // Puoi cambiare questa variabile dopo il deployment
let selectedPlayerId = null;

// Elementi del DOM
const playersContainer = document.getElementById('playersContainer');
const loadingSpinner = document.getElementById('loadingSpinner');

// Funzione per caricare i giocatori
async function loadPlayers() {
    try {
        // Mostra lo spinner di caricamento
        loadingSpinner.style.display = 'block';
        playersContainer.innerHTML = '';
        
        // Fetch dei dati dal backend
        const response = await fetch(`${API_BASE_URL}/players`);
        
        if (!response.ok) {
            throw new Error('Errore nel caricamento dei giocatori');
        }
        
        const players = await response.json();
        
        // Nascondi lo spinner
        loadingSpinner.style.display = 'none';
        
        // Mostra i giocatori
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

// Funzione per visualizzare i giocatori
function displayPlayers(players) {
    playersContainer.innerHTML = players.map(player => `
        <div class="player-card bg-white rounded-lg shadow-md overflow-hidden cursor-pointer" 
             data-id="${player._id}" 
             onclick="selectPlayer('${player._id}')">
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
    
    // Se c'è un giocatore selezionato, evidenzialo
    if (selectedPlayerId) {
        const selectedCard = document.querySelector(`.player-card[data-id="${selectedPlayerId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
    }
}

// Funzione per selezionare un giocatore
function selectPlayer(playerId) {
    // Rimuovi la selezione precedente
    const previouslySelected = document.querySelector('.player-card.selected');
    if (previouslySelected) {
        previouslySelected.classList.remove('selected');
    }
    
    // Imposta il nuovo giocatore selezionato
    selectedPlayerId = playerId;
    
    // Aggiungi la classe selected alla card cliccata
    const selectedCard = document.querySelector(`.player-card[data-id="${playerId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
    
    // Puoi fare qualcosa con l'ID del giocatore selezionato
    console.log(`Giocatore selezionato: ${playerId}`);
    // In futuro potrai usare questo ID per altre operazioni
}

// Carica i giocatori quando la pagina è pronta
document.addEventListener('DOMContentLoaded', loadPlayers);