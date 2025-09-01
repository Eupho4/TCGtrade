// Módulo de Chat en Tiempo Real para TCGtrade
// Utiliza Firebase Realtime Database para mensajería instantánea

import { 
    getDatabase, 
    ref, 
    push, 
    onValue, 
    serverTimestamp, 
    query, 
    orderByChild, 
    limitToLast,
    off,
    set,
    onDisconnect,
    update
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';

class ChatManager {
    constructor(auth, db) {
        this.auth = auth;
        this.db = db;
        this.realtimeDb = getDatabase();
        this.activeChats = new Map();
        this.chatListeners = new Map();
        this.unreadCounts = new Map();
        this.currentChatId = null;
        this.typingTimeouts = new Map();
    }

    // Generar ID único para el chat entre dos usuarios
    generateChatId(userId1, userId2) {
        const sortedIds = [userId1, userId2].sort();
        return `chat_${sortedIds[0]}_${sortedIds[1]}`;
    }

    // Generar ID para chat de intercambio específico
    generateTradeChatId(tradeId) {
        // El ID del chat es único por intercambio, así ambos usuarios acceden al mismo chat
        return `trade_${tradeId}`;
    }

    // Inicializar chat para un intercambio
    async initializeTradeChat(tradeId, otherUserId, otherUserName = 'Usuario') {
        const currentUser = this.auth.currentUser;
        if (!currentUser) {
            throw new Error('Usuario no autenticado');
        }

        const chatId = this.generateTradeChatId(tradeId);
        
        // Crear o actualizar metadatos del chat
        const chatMetaRef = ref(this.realtimeDb, `chats/${chatId}/metadata`);
        const metadata = {
            tradeId: tradeId,
            participants: {
                [currentUser.uid]: {
                    uid: currentUser.uid,
                    email: currentUser.email,
                    displayName: currentUser.displayName || currentUser.email.split('@')[0],
                    lastSeen: serverTimestamp(),
                    online: true
                },
                [otherUserId]: {
                    uid: otherUserId,
                    displayName: otherUserName,
                    lastSeen: null,
                    online: false
                }
            },
            createdAt: serverTimestamp(),
            lastMessage: null,
            lastMessageTime: null
        };

        await set(chatMetaRef, metadata);
        
        // Configurar estado de presencia
        this.setupPresence(chatId, currentUser.uid);
        
        return chatId;
    }

    // Configurar estado de presencia (online/offline)
    setupPresence(chatId, userId) {
        const userStatusRef = ref(this.realtimeDb, `chats/${chatId}/metadata/participants/${userId}/online`);
        const userLastSeenRef = ref(this.realtimeDb, `chats/${chatId}/metadata/participants/${userId}/lastSeen`);
        
        // Marcar como online
        set(userStatusRef, true);
        set(userLastSeenRef, serverTimestamp());
        
        // Configurar para marcar como offline cuando se desconecte
        onDisconnect(userStatusRef).set(false);
        onDisconnect(userLastSeenRef).set(serverTimestamp());
    }

    // Enviar mensaje
    async sendMessage(chatId, message, messageType = 'text') {
        const currentUser = this.auth.currentUser;
        if (!currentUser) {
            throw new Error('Usuario no autenticado');
        }

        const messagesRef = ref(this.realtimeDb, `chats/${chatId}/messages`);
        const newMessage = {
            senderId: currentUser.uid,
            senderEmail: currentUser.email,
            senderName: currentUser.displayName || currentUser.email.split('@')[0],
            message: message,
            type: messageType, // 'text', 'image', 'card_offer', 'system'
            timestamp: serverTimestamp(),
            delivered: false, // Entregado
            read: false, // Leído
            readBy: {} // Quién ha leído el mensaje
        };

        // Enviar mensaje
        const messageRef = await push(messagesRef, newMessage);
        
        // Marcar como entregado inmediatamente
        setTimeout(() => {
            update(ref(this.realtimeDb, `chats/${chatId}/messages/${messageRef.key}`), {
                delivered: true
            });
        }, 100);
        
        // Actualizar último mensaje en metadata
        const chatMetaRef = ref(this.realtimeDb, `chats/${chatId}/metadata`);
        await update(chatMetaRef, {
            lastMessage: message,
            lastMessageTime: serverTimestamp(),
            lastMessageSender: currentUser.uid,
            [`unreadCount_${this.getOtherUserId(chatId)}`]: serverTimestamp() // Incrementar contador para el otro usuario
        });

        // Notificar al otro usuario
        this.notifyOtherUser(chatId, message);

        return messageRef.key;
    }
    
    // Obtener el ID del otro usuario en el chat
    getOtherUserId(chatId) {
        // Extraer del chatId que tiene formato: trade_TRADEID
        // Por ahora retornamos un placeholder, esto se mejorará
        return 'otherUser';
    }
    
    // Notificar al otro usuario sobre nuevo mensaje
    async notifyOtherUser(chatId, message) {
        // Aquí se implementará la notificación push/sonido
        console.log('📬 Notificando nuevo mensaje en chat:', chatId);
    }

    // Enviar notificación de carta ofrecida
    async sendCardOffer(chatId, cardData) {
        const message = {
            text: `Ofrezco: ${cardData.name}`,
            cardId: cardData.id,
            cardName: cardData.name,
            cardImage: cardData.imageUrl,
            cardSet: cardData.set
        };
        
        return await this.sendMessage(chatId, JSON.stringify(message), 'card_offer');
    }

    // Marcar mensajes como leídos
    async markMessagesAsRead(chatId) {
        const currentUser = this.auth.currentUser;
        if (!currentUser) return;

        const messagesRef = ref(this.realtimeDb, `chats/${chatId}/messages`);
        const messagesQuery = query(messagesRef, orderByChild('timestamp'));
        
        onValue(messagesQuery, (snapshot) => {
            const updates = {};
            snapshot.forEach((childSnapshot) => {
                const message = childSnapshot.val();
                const messageKey = childSnapshot.key;
                
                // Marcar como leído si no es mi mensaje y no está leído
                if (message.senderId !== currentUser.uid) {
                    if (!message.read) {
                        updates[`${messageKey}/read`] = true;
                        updates[`${messageKey}/readBy/${currentUser.uid}`] = serverTimestamp();
                        updates[`${messageKey}/readTime`] = serverTimestamp();
                    }
                }
            });
            
            // Aplicar todas las actualizaciones de una vez
            if (Object.keys(updates).length > 0) {
                const messagesRef = ref(this.realtimeDb, `chats/${chatId}/messages`);
                update(messagesRef, updates);
            }
        }, { onlyOnce: true });

        // Resetear contador de no leídos
        this.resetUnreadCount(chatId);
        
        // Actualizar metadata del chat
        const chatMetaRef = ref(this.realtimeDb, `chats/${chatId}/metadata`);
        update(chatMetaRef, {
            [`lastRead_${currentUser.uid}`]: serverTimestamp()
        });
    }

    // Escuchar mensajes nuevos
    listenToMessages(chatId, callback, limit = 50) {
        const messagesRef = ref(this.realtimeDb, `chats/${chatId}/messages`);
        const messagesQuery = query(messagesRef, orderByChild('timestamp'), limitToLast(limit));
        
        const listener = onValue(messagesQuery, (snapshot) => {
            const messages = [];
            snapshot.forEach((childSnapshot) => {
                messages.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            
            // Ordenar por timestamp
            messages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
            
            callback(messages);
        });

        // Guardar listener para poder desconectarlo después
        this.chatListeners.set(chatId, listener);
        
        return listener;
    }

    // Escuchar estado de escritura
    listenToTyping(chatId, userId, callback) {
        const typingRef = ref(this.realtimeDb, `chats/${chatId}/typing/${userId}`);
        
        const listener = onValue(typingRef, (snapshot) => {
            const isTyping = snapshot.val() || false;
            callback(isTyping);
        });

        return listener;
    }

    // Indicar que está escribiendo
    setTypingStatus(chatId, isTyping) {
        const currentUser = this.auth.currentUser;
        if (!currentUser) return;

        const typingRef = ref(this.realtimeDb, `chats/${chatId}/typing/${currentUser.uid}`);
        set(typingRef, isTyping);

        // Auto-resetear después de 3 segundos
        if (isTyping) {
            // Cancelar timeout anterior si existe
            if (this.typingTimeouts.has(chatId)) {
                clearTimeout(this.typingTimeouts.get(chatId));
            }

            // Crear nuevo timeout
            const timeout = setTimeout(() => {
                set(typingRef, false);
                this.typingTimeouts.delete(chatId);
            }, 3000);

            this.typingTimeouts.set(chatId, timeout);
        }
    }

    // Obtener lista de chats del usuario
    async getUserChats() {
        const currentUser = this.auth.currentUser;
        if (!currentUser) return [];

        const chatsRef = ref(this.realtimeDb, 'chats');
        const chats = [];

        return new Promise((resolve) => {
            onValue(chatsRef, (snapshot) => {
                snapshot.forEach((childSnapshot) => {
                    const chatData = childSnapshot.val();
                    const chatId = childSnapshot.key;
                    
                    // Verificar si el usuario es participante
                    if (chatData.metadata?.participants?.[currentUser.uid]) {
                        chats.push({
                            id: chatId,
                            ...chatData.metadata,
                            unreadCount: this.unreadCounts.get(chatId) || 0
                        });
                    }
                });
                
                // Ordenar por último mensaje
                chats.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
                
                resolve(chats);
            }, { onlyOnce: true });
        });
    }

    // Incrementar contador de mensajes no leídos
    incrementUnreadCount(chatId, senderId) {
        const currentUser = this.auth.currentUser;
        if (!currentUser || senderId === currentUser.uid) return;

        const currentCount = this.unreadCounts.get(chatId) || 0;
        this.unreadCounts.set(chatId, currentCount + 1);
        
        // Disparar evento personalizado para actualizar UI
        window.dispatchEvent(new CustomEvent('unreadCountUpdated', {
            detail: { chatId, count: currentCount + 1 }
        }));
    }

    // Resetear contador de no leídos
    resetUnreadCount(chatId) {
        this.unreadCounts.set(chatId, 0);
        
        window.dispatchEvent(new CustomEvent('unreadCountUpdated', {
            detail: { chatId, count: 0 }
        }));
    }

    // Obtener contador total de mensajes no leídos
    getTotalUnreadCount() {
        let total = 0;
        this.unreadCounts.forEach(count => total += count);
        return total;
    }

    // Desconectar listener de un chat
    disconnectChat(chatId) {
        const listener = this.chatListeners.get(chatId);
        if (listener) {
            off(listener);
            this.chatListeners.delete(chatId);
        }

        // Marcar como offline
        const currentUser = this.auth.currentUser;
        if (currentUser) {
            const userStatusRef = ref(this.realtimeDb, `chats/${chatId}/metadata/participants/${currentUser.uid}/online`);
            set(userStatusRef, false);
        }
    }

    // Desconectar todos los listeners
    disconnectAll() {
        this.chatListeners.forEach((listener, chatId) => {
            this.disconnectChat(chatId);
        });
        
        // Limpiar timeouts de typing
        this.typingTimeouts.forEach(timeout => clearTimeout(timeout));
        this.typingTimeouts.clear();
    }

    // Eliminar un chat (solo para admin o participantes)
    async deleteChat(chatId) {
        const currentUser = this.auth.currentUser;
        if (!currentUser) return;

        // Verificar que el usuario es participante
        const chatRef = ref(this.realtimeDb, `chats/${chatId}`);
        
        // En producción, deberías verificar permisos antes de eliminar
        await set(chatRef, null);
        
        // Limpiar listeners y contadores
        this.disconnectChat(chatId);
        this.unreadCounts.delete(chatId);
    }

    // Buscar mensajes en un chat
    async searchMessages(chatId, searchTerm) {
        const messagesRef = ref(this.realtimeDb, `chats/${chatId}/messages`);
        
        return new Promise((resolve) => {
            onValue(messagesRef, (snapshot) => {
                const messages = [];
                snapshot.forEach((childSnapshot) => {
                    const message = childSnapshot.val();
                    if (message.message && message.message.toLowerCase().includes(searchTerm.toLowerCase())) {
                        messages.push({
                            id: childSnapshot.key,
                            ...message
                        });
                    }
                });
                resolve(messages);
            }, { onlyOnce: true });
        });
    }
}

// Exportar para uso en otros módulos
window.ChatManager = ChatManager;

export default ChatManager;