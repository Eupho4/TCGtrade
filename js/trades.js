// TCGtrade - Funciones de Intercambios
// JavaScript extraído del HTML para mejor organización

// Función para cargar intercambios del usuario
async function loadUserTrades() {
    if (!currentUser) return;

    try {
        console.log('🤝 Cargando intercambios del usuario...');

        // Cargar intercambios guardados del usuario ACTUAL (usando su UID)
        const userTradesKey = `userTrades_${currentUser.uid}`;
        const savedTrades = JSON.parse(localStorage.getItem(userTradesKey) || '[]');
        
        // Usar solo los intercambios guardados reales, sin datos de ejemplo
        let allTrades = [...savedTrades];

        // Convertir fechas de string a Date si es necesario
        allTrades = allTrades.map(trade => ({
            ...trade,
            createdAt: typeof trade.createdAt === 'string' ? new Date(trade.createdAt) : trade.createdAt
        }));

        displayTrades(allTrades, 'myTradesContainer');

    } catch (error) {
        console.error('❌ Error al cargar intercambios:', error);
    }
}

// Función para cargar intercambios disponibles
async function loadAvailableTrades() {
    if (!currentUser) return;

    try {
        console.log('🎯 Cargando intercambios disponibles...');

        // Cargar TODOS los intercambios de localStorage
        let allAvailableTrades = [];
        
        // Obtener todas las claves de localStorage que sean de intercambios
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            
            // Si la clave es de intercambios y NO es del usuario actual
            if (key.startsWith('userTrades_') && key !== `userTrades_${currentUser.uid}`) {
                const trades = JSON.parse(localStorage.getItem(key) || '[]');
                
                // Añadir todos los intercambios de otros usuarios
                trades.forEach(trade => {
                    // Asegurarse de que no se puedan editar intercambios de otros
                    allAvailableTrades.push({
                        ...trade,
                        type: 'available', // Marcar como disponible, no creado
                        userId: key.replace('userTrades_', '') // Extraer el userId de la clave
                    });
                });
            }
        }

        // No mostrar datos de ejemplo, solo intercambios reales

        // Convertir fechas si es necesario
        allAvailableTrades = allAvailableTrades.map(trade => ({
            ...trade,
            createdAt: typeof trade.createdAt === 'string' ? new Date(trade.createdAt) : trade.createdAt
        }));

        displayTrades(allAvailableTrades, 'availableTradesContainer');

    } catch (error) {
        console.error('❌ Error al cargar intercambios disponibles:', error);
    }
}

// Función para mostrar intercambios en un contenedor
function displayTrades(trades, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (trades.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 dark:text-gray-400 py-8">
                <p>No hay intercambios disponibles</p>
            </div>
        `;
        return;
    }

    let tradesHTML = '';
    trades.forEach(trade => {
        // Escapar valores para usar en onclick
        // Función para escapar caracteres especiales
        const escapeForOnclick = (str) => {
            return String(str || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
        };
        
        const escapedTitle = escapeForOnclick(trade.title);
        const escapedUserId = escapeForOnclick(trade.userId);
        
        tradesHTML += `
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-400 transition-colors">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h4 class="font-semibold text-gray-800 dark:text-white">${trade.title}</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-300">${trade.description}</p>
                    </div>
                    <span class="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400">${formatDate(trade.createdAt)}</span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">📤 Ofrezco:</h5>
                        <div class="space-y-2">
                            ${trade.offeredCards.map(card => `
                                <div class="flex items-center justify-between bg-white dark:bg-gray-600 px-3 py-2 rounded border border-gray-200 dark:border-gray-500">
                                    <div class="flex items-center gap-2 flex-1">
                                        ${card.image ? `<img src="${card.image}" alt="${card.name}" class="w-8 h-11 object-contain rounded">` : ''}
                                        <span class="text-sm text-gray-700 dark:text-gray-200">${card.name || card}</span>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <span class="text-xs px-2 py-1 rounded-full text-white font-medium" 
                                              style="background-color: ${CARD_CONDITIONS[card.condition || 'NM'].color}">
                                            ${CARD_CONDITIONS[card.condition || 'NM'].icon} ${card.condition || 'NM'}
                                        </span>
                                        <span class="text-xs text-gray-500 dark:text-gray-400">${card.language || 'Español'}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div>
                        <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">📥 Busco:</h5>
                        <div class="space-y-2">
                            ${trade.wantedCards.map(card => `
                                <div class="flex items-center justify-between bg-white dark:bg-gray-600 px-3 py-2 rounded border border-gray-200 dark:border-gray-500">
                                    <div class="flex items-center gap-2 flex-1">
                                        ${card.image ? `<img src="${card.image}" alt="${card.name}" class="w-8 h-11 object-contain rounded">` : ''}
                                        <span class="text-sm text-gray-700 dark:text-gray-200">${card.name || card}</span>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <span class="text-xs px-2 py-1 rounded-full text-white font-medium" 
                                              style="background-color: ${CARD_CONDITIONS[card.condition || 'NM'].color}">
                                            ${CARD_CONDITIONS[card.condition || 'NM'].icon} ${card.condition || 'NM'}
                                        </span>
                                        <span class="text-xs text-gray-500 dark:text-gray-400">${card.language || 'Español'}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="flex justify-between items-center">
                    <span class="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400">Por: ${trade.user}</span>
                    <div class="flex space-x-2">
                        <!-- Botón de chat solo visible si no es tu propio intercambio -->
                        ${trade.userId !== currentUser?.uid ? `
                            <button class="btn-secondary px-3 py-1 rounded text-xs" data-trade-id="${trade.id}" data-user-id="${escapedUserId}" data-trade-title="${escapedTitle}" onclick="console.log('Chat clicked', window.openTradeChat); if(window.openTradeChat) { window.openTradeChat('${trade.id}', '${escapedUserId}', '${escapedTitle}'); } else { console.error('openTradeChat no está definido'); }">
                                💭 Chat
                            </button>
                        ` : `
                            <span class="text-xs text-gray-400 dark:text-gray-500 italic">
                                (Tu intercambio)
                            </span>
                        `}
                        
                        ${trade.userId === currentUser?.uid ? `
                            <button class="btn-secondary px-3 py-1 rounded text-xs" onclick="editTrade('${trade.id}')">
                                ✏️ Editar
                            </button>
                            <button class="btn-secondary px-3 py-1 rounded text-xs" onclick="deleteTrade('${trade.id}')">
                                🗑️ Eliminar
                            </button>
                        ` : `
                            <button class="btn-primary px-3 py-1 rounded text-xs" onclick="proposeTrade('${trade.id}')">
                                💬 Proponer
                            </button>
                            <button class="btn-secondary px-3 py-1 rounded text-xs" onclick="viewTradeDetails('${trade.id}')">
                                👁️ Ver
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = tradesHTML;
}

// Función para formatear fechas
function formatDate(date) {
    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Función para encontrar un intercambio por ID
function findTradeById(tradeId) {
    // Primero buscar en los intercambios del usuario actual
    if (currentUser) {
        const userTradesKey = `userTrades_${currentUser.uid}`;
        const userTrades = JSON.parse(localStorage.getItem(userTradesKey) || '[]');
        const userTrade = userTrades.find(trade => trade.id === tradeId);
        if (userTrade) return userTrade;
    }
    
    // Si no se encuentra, buscar en todos los intercambios disponibles
    // Esto incluye intercambios de otros usuarios
    const allKeys = Object.keys(localStorage);
    for (const key of allKeys) {
        if (key.startsWith('userTrades_')) {
            const trades = JSON.parse(localStorage.getItem(key) || '[]');
            const trade = trades.find(t => t.id === tradeId);
            if (trade) return trade;
        }
    }
    
    return null;
}

// Función para editar intercambio (abre modal con datos pre-cargados)
function editTrade(tradeId) {
    console.log('🔍 === INICIANDO EDICIÓN ===');
    console.log('✏️ Editando intercambio ID:', tradeId);
    
    // Verificar localStorage
    const userTradesKey = `userTrades_${currentUser.uid}`;
    const savedTrades = JSON.parse(localStorage.getItem(userTradesKey) || '[]');
    console.log('📦 Intercambios en localStorage:', savedTrades.length);
    console.log('📦 Todos los intercambios:', savedTrades);
    
    const trade = findTradeById(tradeId);
    console.log('🔍 Intercambio encontrado:', trade);
    
    if (!trade) {
        console.error('❌ No se encontró el intercambio para editar. ID buscado:', tradeId);
        if (typeof showNotification === 'function') {
            showNotification('No se encontró el intercambio para editar', 'error', 4000);
        }
        return;
    }
    
    console.log('📋 Datos completos del intercambio a editar:');
    console.log('- ID:', trade.id);
    console.log('- Título:', trade.title);
    console.log('- Descripción:', trade.description);
    console.log('- Cartas ofrecidas:', trade.offeredCards);
    console.log('- Cartas buscadas:', trade.wantedCards);
    
    // Abrir modal de crear intercambio con datos pre-cargados
    console.log('🚀 Abriendo modal con datos...');
    if (typeof showCreateTradeModal === 'function') {
        showCreateTradeModal(trade);
    }
}

// Función para eliminar intercambio directamente
async function deleteTrade(tradeId) {
    console.log('🗑️ Eliminando intercambio:', tradeId);
    
    const trade = findTradeById(tradeId);
    if (!trade) {
        if (typeof showNotification === 'function') {
            showNotification('No se encontró el intercambio para eliminar', 'error', 4000);
        }
        return;
    }
    
    // Usar modal personalizado en lugar de confirm()
    let confirmed = false;
    if (typeof showConfirmDeleteModal === 'function') {
        confirmed = await showConfirmDeleteModal(trade.title);
    } else {
        confirmed = confirm(`¿Estás seguro de que quieres eliminar el intercambio "${trade.title}"?`);
    }
    
    if (confirmed) {
        // Eliminar del localStorage
        const userTradesKey = `userTrades_${currentUser.uid}`;
        let savedTrades = JSON.parse(localStorage.getItem(userTradesKey) || '[]');
        savedTrades = savedTrades.filter(t => t.id !== tradeId);
        localStorage.setItem(userTradesKey, JSON.stringify(savedTrades));
        
        console.log('✅ Intercambio eliminado exitosamente');
        
        // Mostrar mensaje de éxito con estilo personalizado
        if (typeof showSuccessMessage === 'function') {
            showSuccessMessage('¡Intercambio eliminado exitosamente! 🗑️');
        } else if (typeof showNotification === 'function') {
            showNotification('¡Intercambio eliminado exitosamente! 🗑️', 'success');
        }
        
        // Recargar la lista de intercambios
        loadUserTrades();
    }
}

// Función para abrir chat de intercambio (disponible globalmente)
window.openTradeChat = async function(tradeId, otherUserId, tradeTitle) {
    console.log('🔍 openTradeChat llamado con:', { tradeId, otherUserId, tradeTitle });
    
    if (!currentUser) {
        if (typeof showNotification === 'function') {
            showNotification('Debes iniciar sesión para usar el chat', 'warning');
        }
        if (typeof showAuthModal === 'function') {
            showAuthModal('login');
        }
        return;
    }

    // Verificar que no estés intentando chatear contigo mismo
    if (otherUserId === currentUser.uid) {
        if (typeof showNotification === 'function') {
            showNotification('No puedes abrir un chat contigo mismo', 'warning');
        }
        return;
    }

    // Si el chat no está inicializado, intentar inicializarlo
    if (!window.chatManager || !window.chatUI) {
        console.log('⏳ Chat no inicializado, intentando inicializar...');
        
        // Verificar si las clases están disponibles
        if (typeof ChatManager === 'undefined' || typeof ChatUI === 'undefined') {
            console.error('❌ Clases de chat no disponibles');
            if (typeof showNotification === 'function') {
                showNotification('Error: El sistema de chat no se cargó correctamente', 'error');
            }
            return;
        }
        
        // Intentar inicializar
        try {
            window.chatManager = new ChatManager(auth, db);
            window.chatUI = new ChatUI(window.chatManager);
            console.log('✅ Chat inicializado exitosamente');
        } catch (error) {
            console.error('❌ Error al inicializar chat:', error);
            if (typeof showNotification === 'function') {
                showNotification('Error al inicializar el chat. Por favor, recarga la página.', 'error');
            }
            return;
        }
    }

    try {
        // Normalizar el chatId - si ya tiene el prefijo trade_, no duplicarlo
        let chatId = tradeId;
        if (!tradeId.startsWith('trade_')) {
            chatId = `trade_${tradeId}`;
        }
        
        // Obtener información del intercambio
        const trade = findTradeById(tradeId);
        let displayName = 'Chat del Intercambio';
        
        if (trade) {
            // Usar un nombre más descriptivo para el chat
            displayName = `Chat: ${trade.title || 'Intercambio'}`;
            
            // Si no se proporciona título, usar el título del intercambio
            if (!tradeTitle) {
                tradeTitle = trade.title;
            }
        }
        
        console.log('📨 Abriendo chat compartido:', { chatId, tradeId, displayName });
        console.log('👤 Usuario actual:', currentUser.uid);
        
        // Inicializar o unirse al chat del intercambio
        // Extraer el ID real del intercambio (sin el prefijo trade_)
        const realTradeId = tradeId.replace(/^trade_/, '');
        await window.chatManager.initializeTradeChat(chatId, realTradeId, tradeTitle || displayName, otherUserId);
        
        // Abrir ventana de chat
        await window.chatUI.openChat(chatId);
        
        // Automáticamente escuchar mensajes para este chat
        if (!window.chatManager.chatListeners.has(chatId)) {
            console.log('🔊 Iniciando escucha de mensajes para:', chatId);
        }
        
        console.log('✅ Chat abierto exitosamente');
        console.log('💡 Tip: Ejecuta chatDebugger.runFullDiagnostic("' + tradeId + '") en la consola para diagnóstico');
        
    } catch (error) {
        console.error('❌ Error al abrir chat:', error);
        if (typeof showNotification === 'function') {
            showNotification('Error al abrir el chat: ' + error.message, 'error');
        }
    }
};

function proposeTrade(tradeId) {
    console.log('💬 Proponiendo intercambio:', tradeId);
    
    // Buscar el intercambio original
    const originalTrade = findTradeById(tradeId);
    if (!originalTrade) {
        if (typeof showNotification === 'function') {
            showNotification('No se encontró el intercambio', 'error');
        }
        return;
    }
    
    // Verificar que el usuario esté logueado
    if (!currentUser) {
        if (typeof showNotification === 'function') {
            showNotification('Debes iniciar sesión para proponer un intercambio', 'warning');
        }
        return;
    }
    
    // Verificar que no sea el propio intercambio del usuario
    if (originalTrade.userId === currentUser.uid) {
        if (typeof showNotification === 'function') {
            showNotification('No puedes proponer en tu propio intercambio', 'warning');
        }
        return;
    }
    
    // Crear modal de contrapropuesta
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.id = 'proposalModal';
    
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div class="p-6 border-b dark:border-gray-700">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">Proponer Intercambio</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Contrapropuesta para: ${originalTrade.title}</p>
            </div>
            
            <div class="p-6 overflow-y-auto">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Título de tu propuesta
                        </label>
                        <input type="text" id="proposalTitle" 
                               class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                               placeholder="Ej: Intercambio de cartas raras"
                               value="Contrapropuesta: ${originalTrade.title}">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Mensaje (opcional)
                        </label>
                        <textarea id="proposalMessage" rows="3"
                                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                                  placeholder="Explica tu propuesta..."></textarea>
                    </div>
                </div>
            </div>
            
            <div class="p-6 border-t dark:border-gray-700 flex justify-end space-x-3">
                <button onclick="this.closest('.fixed').remove()" 
                        class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                    Cancelar
                </button>
                <button onclick="submitProposal('${tradeId}')" 
                        class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg">
                    Enviar Propuesta
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Exportar funciones para uso global
window.loadUserTrades = loadUserTrades;
window.loadAvailableTrades = loadAvailableTrades;
window.displayTrades = displayTrades;
window.formatDate = formatDate;
window.findTradeById = findTradeById;
window.editTrade = editTrade;
window.deleteTrade = deleteTrade;
window.openTradeChat = window.openTradeChat;
window.proposeTrade = proposeTrade;

console.log('🚀 Módulo de intercambios cargado');