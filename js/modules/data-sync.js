import { getFirestore, doc, setDoc, getDoc, collection, getDocs, updateDoc, deleteDoc, serverTimestamp, query, where, orderBy, onSnapshot } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

class DataSync {
    constructor(auth, db) {
        this.auth = auth;
        this.db = db;
        this.syncListeners = new Map();
        this.isOnline = navigator.onLine;
        this.syncQueue = [];
        
        // Configurar listeners de conectividad
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processSyncQueue();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    // Sincronizar colección personal en tiempo real
    async syncUserCollection(callback) {
        const user = this.auth.currentUser;
        if (!user) return;

        try {
            const collectionRef = doc(this.db, 'userCollections', user.uid);
            
            // Listener en tiempo real
            const unsubscribe = onSnapshot(collectionRef, (doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    console.log('🔄 Colección sincronizada desde Firestore');
                    callback(data.cards || []);
                } else {
                    console.log('📭 No hay colección en Firestore');
                    callback([]);
                }
            }, (error) => {
                console.error('❌ Error en sincronización de colección:', error);
            });

            // Guardar listener para poder desconectarlo
            this.syncListeners.set('collection', unsubscribe);
            
        } catch (error) {
            console.error('❌ Error al configurar sincronización de colección:', error);
        }
    }

    // Sincronizar intercambios en tiempo real
    async syncUserTrades(callback) {
        const user = this.auth.currentUser;
        if (!user) return;

        try {
            const tradesRef = collection(this.db, 'trades');
            const q = query(tradesRef, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
            
            // Listener en tiempo real
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const trades = [];
                querySnapshot.forEach((doc) => {
                    trades.push({ id: doc.id, ...doc.data() });
                });
                
                console.log('🔄 Intercambios sincronizados desde Firestore');
                callback(trades);
            }, (error) => {
                console.error('❌ Error en sincronización de intercambios:', error);
            });

            // Guardar listener para poder desconectarlo
            this.syncListeners.set('trades', unsubscribe);
            
        } catch (error) {
            console.error('❌ Error al configurar sincronización de intercambios:', error);
        }
    }

    // Sincronizar valoraciones en tiempo real
    async syncUserRatings(callback) {
        const user = this.auth.currentUser;
        if (!user) return;

        try {
            const ratingsRef = collection(this.db, 'ratings');
            const q = query(ratingsRef, where('raterUserId', '==', user.uid));
            
            // Listener en tiempo real
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const ratings = [];
                querySnapshot.forEach((doc) => {
                    ratings.push({ id: doc.id, ...doc.data() });
                });
                
                console.log('🔄 Valoraciones sincronizadas desde Firestore');
                callback(ratings);
            }, (error) => {
                console.error('❌ Error en sincronización de valoraciones:', error);
            });

            // Guardar listener para poder desconectarlo
            this.syncListeners.set('ratings', unsubscribe);
            
        } catch (error) {
            console.error('❌ Error al configurar sincronización de valoraciones:', error);
        }
    }

    // Guardar datos con sincronización automática
    async saveCollection(cards) {
        if (!this.isOnline) {
            // Agregar a cola de sincronización
            this.syncQueue.push({
                type: 'collection',
                data: cards,
                timestamp: Date.now()
            });
            return false;
        }

        try {
            const user = this.auth.currentUser;
            if (!user) return false;

            const collectionRef = doc(this.db, 'userCollections', user.uid);
            const collectionData = {
                userId: user.uid,
                userEmail: user.email,
                cards: cards,
                totalCards: cards.length,
                lastUpdated: serverTimestamp()
            };

            await setDoc(collectionRef, collectionData);
            console.log('✅ Colección guardada en Firestore');
            return true;
        } catch (error) {
            console.error('❌ Error al guardar colección:', error);
            return false;
        }
    }

    async saveTrade(trade) {
        if (!this.isOnline) {
            // Agregar a cola de sincronización
            this.syncQueue.push({
                type: 'trade',
                data: trade,
                timestamp: Date.now()
            });
            return false;
        }

        try {
            const user = this.auth.currentUser;
            if (!user) return false;

            const tradeRef = doc(this.db, 'trades', trade.id);
            const tradeData = {
                ...trade,
                userId: user.uid,
                userEmail: user.email,
                lastUpdated: serverTimestamp()
            };

            await setDoc(tradeRef, tradeData);
            console.log('✅ Intercambio guardado en Firestore');
            return true;
        } catch (error) {
            console.error('❌ Error al guardar intercambio:', error);
            return false;
        }
    }

    async saveRating(rating) {
        if (!this.isOnline) {
            // Agregar a cola de sincronización
            this.syncQueue.push({
                type: 'rating',
                data: rating,
                timestamp: Date.now()
            });
            return false;
        }

        try {
            const user = this.auth.currentUser;
            if (!user) return false;

            const ratingRef = doc(this.db, 'ratings', `${rating.ratedUserId}_${user.uid}_${rating.tradeId}`);
            const ratingData = {
                ...rating,
                raterUserId: user.uid,
                raterEmail: user.email,
                lastUpdated: serverTimestamp()
            };

            await setDoc(ratingRef, ratingData);
            console.log('✅ Valoración guardada en Firestore');
            return true;
        } catch (error) {
            console.error('❌ Error al guardar valoración:', error);
            return false;
        }
    }

    // Procesar cola de sincronización cuando se reconecte
    async processSyncQueue() {
        if (!this.isOnline || this.syncQueue.length === 0) return;

        console.log(`🔄 Procesando ${this.syncQueue.length} elementos en cola de sincronización...`);

        const queue = [...this.syncQueue];
        this.syncQueue = [];

        for (const item of queue) {
            try {
                switch (item.type) {
                    case 'collection':
                        await this.saveCollection(item.data);
                        break;
                    case 'trade':
                        await this.saveTrade(item.data);
                        break;
                    case 'rating':
                        await this.saveRating(item.data);
                        break;
                }
            } catch (error) {
                console.error(`❌ Error al procesar ${item.type}:`, error);
                // Reagregar a la cola si falla
                this.syncQueue.push(item);
            }
        }

        console.log('✅ Cola de sincronización procesada');
    }

    // Desconectar todos los listeners
    disconnectAll() {
        this.syncListeners.forEach((unsubscribe, key) => {
            unsubscribe();
            console.log(`🔌 Listener de ${key} desconectado`);
        });
        this.syncListeners.clear();
    }

    // Obtener estado de sincronización
    getSyncStatus() {
        return {
            isOnline: this.isOnline,
            queueLength: this.syncQueue.length,
            activeListeners: this.syncListeners.size
        };
    }
}

export default DataSync;