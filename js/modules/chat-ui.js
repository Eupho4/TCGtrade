// Componente de UI para el Chat en Tiempo Real
// Maneja la interfaz visual del sistema de chat

class ChatUI {
    constructor(chatManager) {
        this.chatManager = chatManager;
        this.currentChatId = null;
        this.currentOtherUserId = null;
        this.isMinimized = false;
        this.activeChats = new Map(); // Almacenar chats activos
    }

    // Crear ventana de chat flotante
    createChatWindow(chatId, otherUserName = 'Usuario', tradeTitle = '') {
        // Si ya existe una ventana para este chat, solo enfocarla
        if (document.getElementById(`chat-window-${chatId}`)) {
            this.focusChatWindow(chatId);
            return;
        }

        const chatWindow = document.createElement('div');
        chatWindow.id = `chat-window-${chatId}`;
        chatWindow.className = 'fixed bottom-4 right-4 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col z-50 chat-window';
        
        chatWindow.innerHTML = `
            <!-- Header del chat -->
            <div class="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-t-lg flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <div class="relative">
                        <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <span class="text-lg">👤</span>
                        </div>
                        <div id="online-indicator-${chatId}" class="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                        <h3 class="font-semibold">${otherUserName}</h3>
                        <p class="text-xs opacity-90">${tradeTitle || 'Chat de intercambio'}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <button onclick="window.chatUI.minimizeChat('${chatId}')" class="hover:bg-white/20 p-1 rounded">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                    <button onclick="window.chatUI.closeChat('${chatId}')" class="hover:bg-white/20 p-1 rounded">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Indicador de escribiendo -->
            <div id="typing-indicator-${chatId}" class="hidden bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                <span class="flex items-center">
                    <span class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                    <span class="ml-2">${otherUserName} está escribiendo...</span>
                </span>
            </div>

            <!-- Área de mensajes -->
            <div id="messages-container-${chatId}" class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
                <div class="text-center text-gray-500 dark:text-gray-400 text-sm py-8">
                    <p>Inicio de la conversación</p>
                </div>
            </div>

            <!-- Área de entrada -->
            <div class="border-t border-gray-200 dark:border-gray-700 p-4">
                <div class="flex items-end space-x-2">
                    <div class="flex-1">
                        <textarea 
                            id="message-input-${chatId}"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 dark:bg-gray-700 dark:text-white"
                            placeholder="Escribe un mensaje..."
                            rows="2"
                            maxlength="500"></textarea>
                        <div class="flex items-center justify-between mt-2">
                            <div class="flex space-x-2">
                                <button class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" title="Adjuntar imagen">
                                    📷
                                </button>
                                <button class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" title="Enviar carta">
                                    🎴
                                </button>
                                <button class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" title="Emoji">
                                    😊
                                </button>
                            </div>
                            <span id="char-count-${chatId}" class="text-xs text-gray-500">0/500</span>
                        </div>
                    </div>
                    <button 
                        id="send-btn-${chatId}"
                        onclick="window.chatUI.sendMessage('${chatId}')"
                        class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        Enviar
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(chatWindow);
        
        // Configurar eventos
        this.setupChatEvents(chatId);
        
        // Guardar referencia del chat activo
        this.activeChats.set(chatId, {
            window: chatWindow,
            otherUserName: otherUserName,
            tradeTitle: tradeTitle
        });

        // Animar entrada
        setTimeout(() => {
            chatWindow.style.animation = 'slideInUp 0.3s ease-out';
        }, 10);

        return chatWindow;
    }

    // Configurar eventos del chat
    setupChatEvents(chatId) {
        const messageInput = document.getElementById(`message-input-${chatId}`);
        const charCount = document.getElementById(`char-count-${chatId}`);
        const sendBtn = document.getElementById(`send-btn-${chatId}`);

        if (messageInput) {
            // Contador de caracteres
            messageInput.addEventListener('input', (e) => {
                const length = e.target.value.length;
                charCount.textContent = `${length}/500`;
                
                // Indicar que está escribiendo
                if (length > 0) {
                    this.chatManager.setTypingStatus(chatId, true);
                } else {
                    this.chatManager.setTypingStatus(chatId, false);
                }
            });

            // Enviar con Enter (sin Shift)
            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage(chatId);
                }
            });

            // Auto-resize del textarea
            messageInput.addEventListener('input', (e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            });
        }
    }

    // Enviar mensaje
    async sendMessage(chatId) {
        const messageInput = document.getElementById(`message-input-${chatId}`);
        const sendBtn = document.getElementById(`send-btn-${chatId}`);
        
        if (!messageInput || !messageInput.value.trim()) return;

        const message = messageInput.value.trim();
        
        // Deshabilitar mientras se envía
        messageInput.disabled = true;
        sendBtn.disabled = true;

        try {
            await this.chatManager.sendMessage(chatId, message);
            messageInput.value = '';
            messageInput.style.height = 'auto';
            document.getElementById(`char-count-${chatId}`).textContent = '0/500';
            
            // Dejar de mostrar "escribiendo"
            this.chatManager.setTypingStatus(chatId, false);
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            this.showNotification('Error al enviar el mensaje', 'error');
        } finally {
            messageInput.disabled = false;
            sendBtn.disabled = false;
            messageInput.focus();
        }
    }

    // Mostrar mensajes en el chat
    displayMessages(chatId, messages) {
        const container = document.getElementById(`messages-container-${chatId}`);
        if (!container) return;

        const currentUser = this.chatManager.auth.currentUser;
        if (!currentUser) return;

        // Limpiar y reconstruir mensajes
        container.innerHTML = messages.length === 0 ? 
            '<div class="text-center text-gray-500 dark:text-gray-400 text-sm py-8"><p>Inicio de la conversación</p></div>' : '';

        messages.forEach(msg => {
            const isOwnMessage = msg.senderId === currentUser.uid;
            const messageEl = this.createMessageElement(msg, isOwnMessage);
            container.appendChild(messageEl);
        });

        // Scroll al final
        container.scrollTop = container.scrollHeight;
    }

    // Crear elemento de mensaje
    createMessageElement(msg, isOwnMessage) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3`;
        
        const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        }) : '';

        let messageContent = msg.message;
        
        // Manejar diferentes tipos de mensaje
        if (msg.type === 'card_offer') {
            try {
                const cardData = JSON.parse(msg.message);
                messageContent = `
                    <div class="bg-white dark:bg-gray-700 rounded-lg p-2 border border-gray-200 dark:border-gray-600">
                        <p class="text-sm font-semibold mb-2">${cardData.text}</p>
                        <img src="${cardData.cardImage}" alt="${cardData.cardName}" class="w-24 h-32 object-cover rounded">
                        <p class="text-xs mt-1">${cardData.cardSet}</p>
                    </div>
                `;
            } catch (e) {
                // Si no es JSON válido, mostrar como texto normal
            }
        }

        messageDiv.innerHTML = `
            <div class="max-w-[70%]">
                <div class="${isOwnMessage ? 
                    'bg-orange-500 text-white' : 
                    'bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600'
                } rounded-lg px-4 py-2 shadow-sm">
                    ${msg.type === 'card_offer' ? messageContent : `<p class="break-words">${this.escapeHtml(messageContent)}</p>`}
                    <div class="flex items-center justify-between mt-1">
                        <span class="text-xs ${isOwnMessage ? 'text-orange-100' : 'text-gray-500 dark:text-gray-400'}">
                            ${time}
                        </span>
                        ${isOwnMessage && msg.read ? 
                            '<span class="text-xs text-orange-100">✓✓</span>' : 
                            isOwnMessage ? '<span class="text-xs text-orange-200">✓</span>' : ''
                        }
                    </div>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 ${isOwnMessage ? 'text-right' : ''}">
                    ${msg.senderName || 'Usuario'}
                </p>
            </div>
        `;

        return messageDiv;
    }

    // Mostrar indicador de escribiendo
    showTypingIndicator(chatId, show) {
        const indicator = document.getElementById(`typing-indicator-${chatId}`);
        if (indicator) {
            if (show) {
                indicator.classList.remove('hidden');
            } else {
                indicator.classList.add('hidden');
            }
        }
    }

    // Actualizar indicador de estado online
    updateOnlineStatus(chatId, isOnline) {
        const indicator = document.getElementById(`online-indicator-${chatId}`);
        if (indicator) {
            indicator.className = `absolute bottom-0 right-0 w-3 h-3 ${
                isOnline ? 'bg-green-500' : 'bg-gray-400'
            } rounded-full border-2 border-white`;
        }
    }

    // Minimizar chat
    minimizeChat(chatId) {
        const chatData = this.activeChats.get(chatId);
        if (!chatData) return;

        const chatWindow = chatData.window;
        
        if (this.isMinimized) {
            // Restaurar
            chatWindow.style.height = '600px';
            chatWindow.querySelector(`#messages-container-${chatId}`).style.display = 'block';
            chatWindow.querySelector('.border-t').style.display = 'block';
            this.isMinimized = false;
        } else {
            // Minimizar
            chatWindow.style.height = '60px';
            chatWindow.querySelector(`#messages-container-${chatId}`).style.display = 'none';
            chatWindow.querySelector('.border-t').style.display = 'none';
            this.isMinimized = true;
        }
    }

    // Cerrar chat
    closeChat(chatId) {
        const chatWindow = document.getElementById(`chat-window-${chatId}`);
        if (chatWindow) {
            // Animar salida
            chatWindow.style.animation = 'slideOutDown 0.3s ease-out';
            setTimeout(() => {
                chatWindow.remove();
                this.activeChats.delete(chatId);
                
                // Desconectar listeners
                this.chatManager.disconnectChat(chatId);
            }, 300);
        }
    }

    // Enfocar ventana de chat
    focusChatWindow(chatId) {
        const chatWindow = document.getElementById(`chat-window-${chatId}`);
        if (chatWindow) {
            // Traer al frente
            document.querySelectorAll('.chat-window').forEach(w => {
                w.style.zIndex = '50';
            });
            chatWindow.style.zIndex = '51';
            
            // Enfocar input
            const input = document.getElementById(`message-input-${chatId}`);
            if (input) input.focus();
        }
    }

    // Mostrar lista de chats
    async showChatList() {
        const chats = await this.chatManager.getUserChats();
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
        
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
                <div class="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
                    <h2 class="text-2xl font-bold flex items-center">
                        <span class="mr-3">💬</span> Mis Conversaciones
                    </h2>
                </div>
                
                <div class="overflow-y-auto max-h-[60vh] p-4">
                    ${chats.length === 0 ? 
                        '<p class="text-center text-gray-500 dark:text-gray-400 py-8">No tienes conversaciones activas</p>' :
                        chats.map(chat => this.createChatListItem(chat)).join('')
                    }
                </div>
                
                <div class="border-t border-gray-200 dark:border-gray-700 p-4">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            class="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold">
                        Cerrar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // Crear elemento de lista de chat
    createChatListItem(chat) {
        const otherUser = Object.values(chat.participants || {}).find(p => p.uid !== this.chatManager.auth.currentUser?.uid);
        const lastMessageTime = chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleString('es-ES') : '';
        
        return `
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                 onclick="window.chatUI.openChatFromList('${chat.id}', '${otherUser?.displayName || 'Usuario'}', '${chat.tradeId || ''}')">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                            <span class="text-xl">👤</span>
                        </div>
                        <div>
                            <h4 class="font-semibold text-gray-800 dark:text-white">
                                ${otherUser?.displayName || 'Usuario'}
                            </h4>
                            <p class="text-sm text-gray-600 dark:text-gray-400">
                                ${chat.lastMessage ? this.truncateText(chat.lastMessage, 50) : 'Sin mensajes'}
                            </p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-xs text-gray-500 dark:text-gray-400">${lastMessageTime}</p>
                        ${chat.unreadCount > 0 ? 
                            `<span class="inline-block mt-1 px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
                                ${chat.unreadCount}
                            </span>` : ''
                        }
                    </div>
                </div>
            </div>
        `;
    }

    // Abrir chat desde la lista
    openChatFromList(chatId, otherUserName, tradeId) {
        // Cerrar modal de lista
        const modal = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
        if (modal) modal.remove();
        
        // Abrir ventana de chat
        this.openChat(chatId, otherUserName, tradeId);
    }

    // Abrir chat
    async openChat(chatId, otherUserName = 'Usuario', tradeTitle = '') {
        // Crear ventana si no existe
        if (!document.getElementById(`chat-window-${chatId}`)) {
            this.createChatWindow(chatId, otherUserName, tradeTitle);
        }
        
        // Cargar mensajes
        this.chatManager.listenToMessages(chatId, (messages) => {
            this.displayMessages(chatId, messages);
        });
        
        // Marcar mensajes como leídos
        await this.chatManager.markMessagesAsRead(chatId);
        
        // Escuchar indicador de escribiendo
        // Aquí necesitarías obtener el ID del otro usuario
        // Por ahora lo dejamos como placeholder
        
        this.currentChatId = chatId;
    }

    // Utilidades
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    showNotification(message, type = 'info') {
        // Usar el sistema de notificaciones existente si está disponible
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type, 3000);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }
}

// Hacer disponible globalmente
window.ChatUI = ChatUI;

// Estilos CSS para el chat
const chatStyles = `
<style>
@keyframes slideInUp {
    from {
        transform: translateY(100%);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes slideOutDown {
    from {
        transform: translateY(0);
        opacity: 1;
    }
    to {
        transform: translateY(100%);
        opacity: 0;
    }
}

.typing-dots {
    display: inline-flex;
    align-items: center;
}

.typing-dots span {
    height: 8px;
    width: 8px;
    background-color: #999;
    border-radius: 50%;
    display: inline-block;
    margin: 0 2px;
    animation: typing 1.4s infinite;
}

.typing-dots span:nth-child(2) {
    animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes typing {
    0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.5;
    }
    30% {
        transform: translateY(-10px);
        opacity: 1;
    }
}

.chat-window {
    transition: height 0.3s ease;
}

/* Scrollbar personalizado para el área de mensajes */
.chat-window [id^="messages-container-"] {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e0 #f7fafc;
}

.chat-window [id^="messages-container-"]::-webkit-scrollbar {
    width: 6px;
}

.chat-window [id^="messages-container-"]::-webkit-scrollbar-track {
    background: #f7fafc;
    border-radius: 3px;
}

.chat-window [id^="messages-container-"]::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 3px;
}

.chat-window [id^="messages-container-"]::-webkit-scrollbar-thumb:hover {
    background: #a0aec0;
}

/* Modo oscuro */
.dark .chat-window [id^="messages-container-"] {
    scrollbar-color: #4a5568 #1a202c;
}

.dark .chat-window [id^="messages-container-"]::-webkit-scrollbar-track {
    background: #1a202c;
}

.dark .chat-window [id^="messages-container-"]::-webkit-scrollbar-thumb {
    background: #4a5568;
}

.dark .chat-window [id^="messages-container-"]::-webkit-scrollbar-thumb:hover {
    background: #718096;
}
</style>
`;

// Inyectar estilos cuando se carga el módulo
if (!document.getElementById('chat-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'chat-styles';
    styleElement.innerHTML = chatStyles;
    document.head.appendChild(styleElement.firstElementChild);
}

export default ChatUI;