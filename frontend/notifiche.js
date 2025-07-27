const API_BASE_URL = 'http://localhost:3000';
const notificationsContainer = document.getElementById('notificationsContainer');
const loadingSpinner = document.getElementById('loadingSpinner');

async function loadNotifications() {
    try {
        loadingSpinner.style.display = 'block';
        notificationsContainer.innerHTML = '';
        
        const response = await fetch(`${API_BASE_URL}/notifiche`);
        if (!response.ok) throw new Error('Errore nel caricamento delle notifiche');
        
        let notifications = await response.json();
        
        // Ordina per data (più recente prima)
        notifications.sort((a, b) => new Date(b.data) - new Date(a.data));
        
        displayNotifications(notifications);
    } catch (error) {
        console.error('Errore:', error);
        notificationsContainer.innerHTML = `
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>${error.message}</p>
            </div>
        `;
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

function displayNotifications(notifications) {
    if (notifications.length === 0) {
        notificationsContainer.innerHTML = `
            <div class="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                Nessuna notifica presente
            </div>
        `;
        return;
    }

    notificationsContainer.innerHTML = notifications.map(notifica => `
        <div class="notification-card bg-white shadow rounded-lg overflow-hidden">
            <div class="p-4">
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        <div class="h-10 w-10 rounded-full bg-${notifica.punti > 0 ? 'green' : 'red'}-100 flex items-center justify-center">
                            <span class="text-${notifica.punti > 0 ? 'green' : 'red'}-600 font-bold">
                                ${notifica.punti > 0 ? '+' : ''}${notifica.punti}
                            </span>
                        </div>
                    </div>
                    <div class="ml-4 flex-1">
                        <div class="flex items-center justify-between">
                            <h3 class="font-medium text-gray-900">${notifica.giocatoreNome}</h3>
                            <span class="text-xs text-gray-500">
                                ${new Date(notifica.data).toLocaleDateString('it-IT', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>
                        <p class="mt-1 text-sm text-gray-600">${notifica.motivo}</p>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', loadNotifications);