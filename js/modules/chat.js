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
    get,
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
        
        // Verificar si el chat ya existe
        const chatMetaRef = ref(this.realtimeDb, `chats/${chatId}/metadata`);
        
        try {
            // Intentar obtener metadata existente
            const snapshot = await get(chatMetaRef);
            
            if (snapshot.exists()) {
                // Si existe, solo actualizar el participante actual
                const updates = {
                    [`participants/${currentUser.uid}/uid`]: currentUser.uid,
                    [`participants/${currentUser.uid}/email`]: currentUser.email,
                    [`participants/${currentUser.uid}/displayName`]: currentUser.displayName || currentUser.email.split('@')[0],
                    [`participants/${currentUser.uid}/lastSeen`]: serverTimestamp(),
                    [`participants/${currentUser.uid}/online`]: true
                };
                
                await update(chatMetaRef, updates);
                console.log('📝 Chat existente actualizado, participante añadido:', currentUser.uid);
            } else {
                // Si no existe, crear nuevo
                // IMPORTANTE: Registrar ambos usuarios como participantes para que ambos puedan ver el chat
                const metadata = {
                    tradeId: tradeId,
                    participants: {
                        [currentUser.uid]: {
                            uid: currentUser.uid,
                            email: currentUser.email,
                            displayName: currentUser.displayName || currentUser.email.split('@')[0],
                            lastSeen: serverTimestamp(),
                            online: true
                        }
                    },
                    createdAt: serverTimestamp(),
                    lastMessage: null,
                    lastMessageTime: null,
                    // Marcar como chat de intercambio público para que cualquiera pueda unirse
                    isTradeChat: true
                };
                
                await set(chatMetaRef, metadata);
                console.log('✨ Nuevo chat de intercambio creado:', chatId);
            }
        } catch (error) {
            console.error('Error al inicializar chat:', error);
            // Si hay error, intentar crear de todos modos
            const metadata = {
                tradeId: tradeId,
                participants: {
                    [currentUser.uid]: {
                        uid: currentUser.uid,
                        email: currentUser.email,
                        displayName: currentUser.displayName || currentUser.email.split('@')[0],
                        lastSeen: serverTimestamp(),
                        online: true
                    }
                },
                createdAt: serverTimestamp(),
                lastMessage: null,
                lastMessageTime: null
            };
            
            await set(chatMetaRef, metadata);
        }
        
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

        // Primero, asegurarse de que el usuario está registrado como participante
        const chatMetaRef = ref(this.realtimeDb, `chats/${chatId}/metadata`);
        const metaSnapshot = await get(chatMetaRef);
        
        if (metaSnapshot.exists()) {
            const metadata = metaSnapshot.val();
            // Si el usuario no está en los participantes, añadirlo
            if (!metadata.participants?.[currentUser.uid]) {
                const updates = {
                    [`participants/${currentUser.uid}`]: {
                        uid: currentUser.uid,
                        email: currentUser.email,
                        displayName: currentUser.displayName || currentUser.email.split('@')[0],
                        lastSeen: serverTimestamp(),
                        online: true
                    }
                };
                await update(chatMetaRef, updates);
                console.log('👤 Usuario añadido como participante al enviar mensaje');
            }
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
    async listenToMessages(chatId, callback, limit = 50) {
        // Primero, asegurarse de que el usuario está registrado como participante
        const currentUser = this.auth.currentUser;
        if (currentUser) {
            const chatMetaRef = ref(this.realtimeDb, `chats/${chatId}/metadata`);
            const metaSnapshot = await get(chatMetaRef);
            
            if (metaSnapshot.exists()) {
                const metadata = metaSnapshot.val();
                // Si el usuario no está en los participantes, añadirlo
                if (!metadata.participants?.[currentUser.uid]) {
                    const updates = {
                        [`participants/${currentUser.uid}`]: {
                            uid: currentUser.uid,
                            email: currentUser.email,
                            displayName: currentUser.displayName || currentUser.email.split('@')[0],
                            lastSeen: serverTimestamp(),
                            online: true
                        }
                    };
                    await update(chatMetaRef, updates);
                    console.log('👤 Usuario añadido como participante al abrir chat');
                }
            }
        }
        
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
        if (!currentUser) {
            console.log('⚠️ No hay usuario autenticado para obtener chats');
            return [];
        }

        try {
            const chatsRef = ref(this.realtimeDb, 'chats');
            const snapshot = await get(chatsRef);
            
            const chats = [];
            
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const chatData = childSnapshot.val();
                    const chatId = childSnapshot.key;
                    
                    // Incluir el chat si:
                    // 1. El usuario es participante registrado
                    // 2. Es un chat de intercambio (isTradeChat) y el usuario ha enviado mensajes
                    const isParticipant = chatData?.metadata?.participants?.[currentUser.uid];
                    const isTradeChat = chatData?.metadata?.isTradeChat;
                    
                    // Verificar si el usuario ha enviado mensajes en este chat
                    let hasUserMessages = false;
                    if (chatData?.messages) {
                        hasUserMessages = Object.values(chatData.messages).some(
                            msg => msg.senderId === currentUser.uid
                        );
                    }
                    
                    if (isParticipant || (isTradeChat && hasUserMessages)) {
                        // Si el usuario no está registrado como participante pero ha enviado mensajes,
                        // añadirlo automáticamente
                        if (!isParticipant && hasUserMessages) {
                            const updates = {
                                [`participants/${currentUser.uid}`]: {
                                    uid: currentUser.uid,
                                    email: currentUser.email,
                                    displayName: currentUser.displayName || currentUser.email.split('@')[0],
                                    lastSeen: serverTimestamp(),
                                    online: false
                                }
                            };
                            
                            // Actualizar de forma asíncrona sin esperar
                            const chatMetaRef = ref(this.realtimeDb, `chats/${chatId}/metadata`);
                            update(chatMetaRef, updates).catch(console.error);
                        }
                        
                        // Obtener el otro participante
                        const participants = Object.values(chatData.metadata.participants || {});
                        const otherParticipant = participants.find(p => p.uid !== currentUser.uid);
                        
                        chats.push({
                            id: chatId,
                            ...chatData.metadata,
                            otherUser: otherParticipant || { displayName: 'Chat de Intercambio' },
                            unreadCount: this.unreadCounts.get(chatId) || 0
                        });
                    }
                });
                
                // Ordenar por último mensaje
                chats.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
            }
            
            console.log(`📋 ${chats.length} chats encontrados para el usuario`);
            return chats;
            
        } catch (error) {
            console.error('❌ Error al obtener chats:', error);
            return [];
        }
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
        if (!chatId) {
            console.warn('disconnectChat llamado sin chatId');
            return;
        }
        
        const listener = this.chatListeners.get(chatId);
        if (listener) {
            try {
                off(listener);
                this.chatListeners.delete(chatId);
            } catch (error) {
                console.warn('Error al desconectar listener:', error);
            }
        }

        // Marcar como offline
        const currentUser = this.auth.currentUser;
        if (currentUser) {
            const userStatusRef = ref(this.realtimeDb, `chats/${chatId}/metadata/participants/${currentUser.uid}/online`);
            set(userStatusRef, false);
        }
    }

    // Eliminar chat completamente
    async deleteChat(chatId) {
        try {
            console.log('🗑️ Eliminando chat de Firebase:', chatId);
            console.log('📊 Estado actual:', {
                auth: this.auth?.currentUser?.uid,
                realtimeDb: !!this.realtimeDb,
                chatId: chatId
            });
            
            // Desconectar listeners primero
            console.log('🔌 Desconectando listeners...');
            this.disconnectChat(chatId);
            
            // Eliminar el chat de Firebase
            console.log('🔥 Construyendo referencia para eliminar...');
            const chatRef = ref(this.realtimeDb, `chats/${chatId}`);
            console.log('🔥 Ejecutando eliminación...');
            await set(chatRef, null);
            
            // Limpiar contadores locales
            this.unreadCounts.delete(chatId);
            
            console.log('✅ Chat eliminado de Firebase exitosamente');
            return true;
        } catch (error) {
            console.error('❌ Error detallado al eliminar chat:', {
                error: error.message,
                code: error.code,
                chatId: chatId
            });
            throw error;
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