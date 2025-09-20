// TCGtrade - Funciones de Notificaciones y Buzón
// JavaScript extraído del HTML para mejor organización

// Función para actualizar el contador de notificaciones
function updateNotificationBadge() {
    if (!currentUser) {
        const badge = document.getElementById('notificationBadge');
        if (badge) badge.classList.add('hidden');
        return;
    }
    
    const notificationsKey = `notifications_${currentUser.uid}`;
    const notifications = JSON.parse(localStorage.getItem(notificationsKey) || '[]');
    const unreadCount = notifications.filter(n => !n.read).length;
    
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}

// Función para cargar el Buzón
function loadInbox() {
    if (!currentUser) {
        const container = document.getElementById('notificationsList');
        if (container) {
            container.innerHTML = `
                <div class="text-center text-gray-500 dark:text-gray-400 py-8">
                    <p>Debes iniciar sesión para ver tu buzón</p>
                </div>
            `;
        }
        return;
    }
    
    // Cargar notificaciones
    loadNotifications();
    
    // Cargar propuestas recibidas
    loadReceivedProposals();
    
    // Cargar propuestas enviadas
    loadSentProposals();
}

// Función para cargar notificaciones
function loadNotifications() {
    if (!currentUser) return;
    
    const notificationsKey = `notifications_${currentUser.uid}`;
    const notifications = JSON.parse(localStorage.getItem(notificationsKey) || '[]');
    
    const container = document.getElementById('notificationsList');
    if (!container) return;
    
    if (notifications.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 dark:text-gray-400 py-8">
                <span class="text-4xl">📭</span>
                <p class="mt-2">No tienes notificaciones</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = notifications.map(notif => `
        <div class="notification-item bg-gray-50 dark:bg-gray-700 rounded-lg p-4 ${!notif.read ? 'border-l-4 border-purple-500' : ''}">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        ${notif.title}
                        ${!notif.read ? '<span class="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">Nuevo</span>' : ''}
                    </h4>
                    <p class="text-gray-600 dark:text-gray-300 mt-1">${notif.message}</p>
                    <div class="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>De: ${notif.from}</span>
                        <span>${formatRelativeTime(notif.timestamp)}</span>
                    </div>
                </div>
                <div class="flex gap-2">
                    ${notif.tradeId ? `
                        <button onclick="viewTradeDetails('${notif.tradeId}')"
                                class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm">
                            Ver Intercambio
                        </button>
                    ` : ''}
                    ${!notif.read ? `
                        <button onclick="markNotificationAsRead('${notif.id}')"
                                class="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm">
                            Marcar como leído
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// Función para cargar propuestas recibidas
function loadReceivedProposals() {
    if (!currentUser) return;
    
    const container = document.getElementById('receivedProposalsList');
    if (!container) return;
    
    const receivedProposals = [];
    
    // Buscar propuestas en todos los intercambios del usuario
    const userTrades = JSON.parse(localStorage.getItem(`userTrades_${currentUser.uid}`) || '[]');
    
    userTrades.forEach(trade => {
        const proposalsKey = `proposals_${trade.id}`;
        const proposals = JSON.parse(localStorage.getItem(proposalsKey) || '[]');
        proposals.forEach(proposal => {
            receivedProposals.push({
                ...proposal,
                tradeName: trade.title,
                tradeId: trade.id
            });
        });
    });
    
    if (receivedProposals.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 dark:text-gray-400 py-8">
                <span class="text-4xl">📭</span>
                <p class="mt-2">No has recibido propuestas</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = receivedProposals.map(proposal => `
        <div class="proposal-item bg-white dark:bg-gray-700 rounded-lg shadow p-4">
            <div class="flex items-start justify-between mb-3">
                <div>
                    <h4 class="font-semibold text-gray-900 dark:text-white">
                        Propuesta para: ${proposal.tradeName}
                    </h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        De: ${proposal.fromUserName} • ${formatRelativeTime(proposal.createdAt)}
                    </p>
                </div>
                <span class="px-2 py-1 text-xs rounded-full ${
                    proposal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    proposal.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                }">
                    ${proposal.status === 'pending' ? 'Pendiente' :
                      proposal.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
                </span>
            </div>
            
            <div class="grid md:grid-cols-2 gap-4 mb-3">
                <div>
                    <h5 class="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Te ofrece:</h5>
                    <ul class="space-y-1">
                        ${proposal.offeredCards.map(card => `
                            <li class="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                ${card.image ? `<img src="${card.image}" class="w-8 h-10 object-contain rounded">` : '🎴'}
                                ${card.name} (${card.condition || 'NM'})
                            </li>
                        `).join('')}
                    </ul>
                </div>
                <div>
                    <h5 class="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Busca:</h5>
                    <ul class="space-y-1">
                        ${proposal.wantedCards.map(card => `
                            <li class="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                ${card.image ? `<img src="${card.image}" class="w-8 h-10 object-contain rounded">` : '🎴'}
                                ${card.name} (${card.condition || 'NM'})
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
            
            ${proposal.message ? `
                <div class="bg-gray-50 dark:bg-gray-800 rounded p-3 mb-3">
                    <p class="text-sm text-gray-600 dark:text-gray-300">"${proposal.message}"</p>
                </div>
            ` : ''}
            
            <div class="flex gap-2">
                <button onclick="viewProposalDetails('${proposal.id}', '${proposal.tradeId}')"
                        class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm">
                    Ver Detalles
                </button>
                ${proposal.status === 'pending' ? `
                    <button onclick="acceptProposal('${proposal.id}', '${proposal.tradeId}')"
                            class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm">
                        Aceptar
                    </button>
                    <button onclick="rejectProposal('${proposal.id}', '${proposal.tradeId}')"
                            class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm">
                        Rechazar
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Función para cargar propuestas enviadas
function loadSentProposals() {
    if (!currentUser) return;
    
    const container = document.getElementById('sentProposalsList');
    if (!container) return;
    
    const sentProposals = [];
    
    // Buscar todas las propuestas enviadas por el usuario
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
        if (key.startsWith('proposals_')) {
            const proposals = JSON.parse(localStorage.getItem(key) || '[]');
            proposals.forEach(proposal => {
                if (proposal.fromUserId === currentUser.uid) {
                    sentProposals.push({
                        ...proposal,
                        tradeId: key.replace('proposals_', '')
                    });
                }
            });
        }
    });
    
    if (sentProposals.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 dark:text-gray-400 py-8">
                <span class="text-4xl">📤</span>
                <p class="mt-2">No has enviado propuestas</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = sentProposals.map(proposal => `
        <div class="proposal-item bg-white dark:bg-gray-700 rounded-lg shadow p-4">
            <div class="flex items-start justify-between mb-3">
                <div>
                    <h4 class="font-semibold text-gray-900 dark:text-white">
                        Propuesta enviada
                    </h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        ${formatRelativeTime(proposal.createdAt)}
                    </p>
                </div>
                <span class="px-2 py-1 text-xs rounded-full ${
                    proposal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    proposal.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                }">
                    ${proposal.status === 'pending' ? 'Pendiente' :
                      proposal.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
                </span>
            </div>
            
            <div class="grid md:grid-cols-2 gap-4 mb-3">
                <div>
                    <h5 class="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Ofreces:</h5>
                    <ul class="space-y-1">
                        ${proposal.offeredCards.map(card => `
                            <li class="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                ${card.image ? `<img src="${card.image}" class="w-8 h-10 object-contain rounded">` : '🎴'}
                                ${card.name} (${card.condition || 'NM'})
                            </li>
                        `).join('')}
                    </ul>
                </div>
                <div>
                    <h5 class="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Buscas:</h5>
                    <ul class="space-y-1">
                        ${proposal.wantedCards.map(card => `
                            <li class="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                ${card.image ? `<img src="${card.image}" class="w-8 h-10 object-contain rounded">` : '🎴'}
                                ${card.name} (${card.condition || 'NM'})
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
            
            ${proposal.message ? `
                <div class="bg-gray-50 dark:bg-gray-800 rounded p-3 mb-3">
                    <p class="text-sm text-gray-600 dark:text-gray-300">"${proposal.message}"</p>
                </div>
            ` : ''}
            
            <div class="flex gap-2">
                <button onclick="viewProposalDetails('${proposal.id}', '${proposal.tradeId}')"
                        class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm">
                    Ver Detalles
                </button>
                ${proposal.status === 'pending' ? `
                    <button onclick="cancelProposal('${proposal.id}', '${proposal.tradeId}')"
                            class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm">
                        Cancelar
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Función para formatear tiempo relativo
function formatRelativeTime(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Hace un momento';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        return `Hace ${days} día${days > 1 ? 's' : ''}`;
    } else {
        return time.toLocaleDateString('es-ES');
    }
}

// Función para marcar notificación como leída
function markNotificationAsRead(notificationId) {
    if (!currentUser) return;
    
    const notificationsKey = `notifications_${currentUser.uid}`;
    const notifications = JSON.parse(localStorage.getItem(notificationsKey) || '[]');
    
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        localStorage.setItem(notificationsKey, JSON.stringify(notifications));
        loadNotifications();
        updateNotificationBadge();
    }
}

// Función para ver detalles de propuesta
function viewProposalDetails(proposalId, tradeId) {
    // Implementar modal de detalles de propuesta
    console.log('Ver detalles de propuesta:', proposalId, tradeId);
}

// Función para aceptar propuesta
function acceptProposal(proposalId, tradeId) {
    if (!currentUser) return;
    
    const proposalsKey = `proposals_${tradeId}`;
    const proposals = JSON.parse(localStorage.getItem(proposalsKey) || '[]');
    
    const proposal = proposals.find(p => p.id === proposalId);
    if (proposal) {
        proposal.status = 'accepted';
        localStorage.setItem(proposalsKey, JSON.stringify(proposals));
        
        // Crear notificación para el que envió la propuesta
        const notification = {
            id: `notif_${Date.now()}`,
            type: 'proposal_accepted',
            title: '✅ Propuesta aceptada',
            message: `Tu propuesta para el intercambio ha sido aceptada`,
            tradeId: tradeId,
            proposalId: proposalId,
            from: currentUser.email.split('@')[0],
            timestamp: new Date().toISOString(),
            read: false
        };
        
        const notificationsKey = `notifications_${proposal.fromUserId}`;
        const notifications = JSON.parse(localStorage.getItem(notificationsKey) || '[]');
        notifications.unshift(notification);
        localStorage.setItem(notificationsKey, JSON.stringify(notifications));
        
        loadReceivedProposals();
        if (typeof showNotification === 'function') {
            showNotification('Propuesta aceptada', 'success');
        }
    }
}

// Función para rechazar propuesta
function rejectProposal(proposalId, tradeId) {
    if (!currentUser) return;
    
    const proposalsKey = `proposals_${tradeId}`;
    const proposals = JSON.parse(localStorage.getItem(proposalsKey) || '[]');
    
    const proposal = proposals.find(p => p.id === proposalId);
    if (proposal) {
        proposal.status = 'rejected';
        localStorage.setItem(proposalsKey, JSON.stringify(proposals));
        
        // Crear notificación para el que envió la propuesta
        const notification = {
            id: `notif_${Date.now()}`,
            type: 'proposal_rejected',
            title: '❌ Propuesta rechazada',
            message: `Tu propuesta para el intercambio ha sido rechazada`,
            tradeId: tradeId,
            proposalId: proposalId,
            from: currentUser.email.split('@')[0],
            timestamp: new Date().toISOString(),
            read: false
        };
        
        const notificationsKey = `notifications_${proposal.fromUserId}`;
        const notifications = JSON.parse(localStorage.getItem(notificationsKey) || '[]');
        notifications.unshift(notification);
        localStorage.setItem(notificationsKey, JSON.stringify(notifications));
        
        loadReceivedProposals();
        if (typeof showNotification === 'function') {
            showNotification('Propuesta rechazada', 'info');
        }
    }
}

// Función para cancelar propuesta
function cancelProposal(proposalId, tradeId) {
    if (!currentUser) return;
    
    const proposalsKey = `proposals_${tradeId}`;
    const proposals = JSON.parse(localStorage.getItem(proposalsKey) || '[]');
    
    const proposal = proposals.find(p => p.id === proposalId);
    if (proposal) {
        proposal.status = 'cancelled';
        localStorage.setItem(proposalsKey, JSON.stringify(proposals));
        
        loadSentProposals();
        if (typeof showNotification === 'function') {
            showNotification('Propuesta cancelada', 'info');
        }
    }
}

// Exportar funciones para uso global
window.updateNotificationBadge = updateNotificationBadge;
window.loadInbox = loadInbox;
window.loadNotifications = loadNotifications;
window.loadReceivedProposals = loadReceivedProposals;
window.loadSentProposals = loadSentProposals;
window.formatRelativeTime = formatRelativeTime;
window.markNotificationAsRead = markNotificationAsRead;
window.viewProposalDetails = viewProposalDetails;
window.acceptProposal = acceptProposal;
window.rejectProposal = rejectProposal;
window.cancelProposal = cancelProposal;

console.log('🚀 Módulo de notificaciones cargado');