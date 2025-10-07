/**
 * Servicio de Firebase para manejo de autenticación y base de datos - Optimizado
 */

import { firebaseConfig, appId, API_CONFIG } from '../constants/config.js';
import { showError, showSuccess, showLoading } from '../utils/notifications.js';

class FirebaseService {
    constructor() {
        this.auth = null;
        this.db = null;
        this.currentUser = null;
        this.initialized = false;
        this.userDataCache = new Map();
        this.cardsCache = new Map();
        this.retryAttempts = 0;
        this.maxRetries = API_CONFIG.RETRY_ATTEMPTS;
    }

    /**
     * Inicializa Firebase con optimizaciones
     */
    async initialize() {
        if (this.initialized) return;

        try {
            // Inicializar Firebase solo si no está ya inicializado
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            
            this.auth = firebase.auth();
            this.db = firebase.firestore();
            this.initialized = true;
            
            // Configurar listener de autenticación
            this.setupAuthListener();
            
            // Configurar persistencia de cache
            this.setupCachePersistence();
            
            console.log('✅ Firebase inicializado correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar Firebase:', error);
            await this.handleError(error, 'Error al conectar con la base de datos');
        }
    }

    /**
     * Configura el listener de cambios de autenticación
     */
    setupAuthListener() {
        if (!this.auth) return;

        this.auth.onAuthStateChanged(async (user) => {
            this.currentUser = user;
            if (user) {
                console.log('✅ Usuario autenticado:', user.email);
                // Precargar datos del usuario
                await this.preloadUserData(user.uid);
            } else {
                console.log('ℹ️ Usuario no autenticado');
                this.clearUserCache();
            }
        });
    }

    /**
     * Configura persistencia de cache
     */
    setupCachePersistence() {
        // Limpiar cache expirado cada 5 minutos
        setInterval(() => {
            this.cleanExpiredCache();
        }, 5 * 60 * 1000);
    }

    /**
     * Precarga datos del usuario para mejor performance
     */
    async preloadUserData(userId) {
        try {
            const [userData, userCards] = await Promise.all([
                this.loadUserData(userId),
                this.getUserCards()
            ]);
            
            console.log('✅ Datos del usuario precargados');
        } catch (error) {
            console.error('❌ Error al precargar datos:', error);
        }
    }

    /**
     * Registra un nuevo usuario con optimizaciones
     */
    async registerUser(email, password, userData) {
        try {
            if (!this.auth) throw new Error('Firebase no inicializado');

            // Crear usuario en Firebase Auth
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Guardar datos adicionales en Firestore
            const userDocData = {
                ...userData,
                email: user.email,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await this.saveUserData(user.uid, userDocData);

            // Cachear datos del usuario
            this.userDataCache.set(user.uid, userDocData);

            showSuccess('Usuario registrado correctamente');
            return { success: true, user };
        } catch (error) {
            console.error('❌ Error al registrar usuario:', error);
            const errorMessage = this.getAuthErrorMessage(error.code);
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }

    /**
     * Inicia sesión de usuario con optimizaciones
     */
    async loginUser(email, password) {
        try {
            if (!this.auth) throw new Error('Firebase no inicializado');

            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            
            // Precargar datos del usuario
            await this.preloadUserData(userCredential.user.uid);
            
            showSuccess('Sesión iniciada correctamente');
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('❌ Error al iniciar sesión:', error);
            const errorMessage = this.getAuthErrorMessage(error.code);
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }

    /**
     * Cierra sesión del usuario
     */
    async logoutUser() {
        try {
            if (!this.auth) throw new Error('Firebase no inicializado');

            await this.auth.signOut();
            this.currentUser = null;
            this.clearUserCache();
            showSuccess('Sesión cerrada correctamente');
            return { success: true };
        } catch (error) {
            console.error('❌ Error al cerrar sesión:', error);
            showError('Error al cerrar sesión');
            return { success: false, error: error.message };
        }
    }

    /**
     * Cambia la contraseña del usuario con reintentos
     */
    async changePassword(currentPassword, newPassword) {
        return await this.retryOperation(async () => {
            if (!this.auth || !this.currentUser) throw new Error('Usuario no autenticado');

            // Reautenticar usuario
            const credential = firebase.auth.EmailAuthProvider.credential(
                this.currentUser.email,
                currentPassword
            );
            await this.currentUser.reauthenticateWithCredential(credential);

            // Cambiar contraseña
            await this.currentUser.updatePassword(newPassword);
            showSuccess('Contraseña cambiada correctamente');
            return { success: true };
        });
    }

    /**
     * Cambia el email del usuario con reintentos
     */
    async changeEmail(newEmail) {
        return await this.retryOperation(async () => {
            if (!this.auth || !this.currentUser) throw new Error('Usuario no autenticado');

            await this.currentUser.updateEmail(newEmail);
            
            // Actualizar email en Firestore
            await this.updateUserData({ email: newEmail });
            
            showSuccess('Email cambiado correctamente');
            return { success: true };
        });
    }

    /**
     * Guarda datos del usuario en Firestore con cache
     */
    async saveUserData(userId, userData) {
        try {
            if (!this.db) throw new Error('Firestore no inicializado');

            await this.db.collection('users').doc(userId).set(userData);
            
            // Actualizar cache
            this.userDataCache.set(userId, userData);
            
            console.log('✅ Datos de usuario guardados');
            return { success: true };
        } catch (error) {
            console.error('❌ Error al guardar datos de usuario:', error);
            showError('Error al guardar datos del usuario');
            return { success: false, error: error.message };
        }
    }

    /**
     * Actualiza datos del usuario en Firestore con cache
     */
    async updateUserData(updateData) {
        try {
            if (!this.db || !this.currentUser) throw new Error('Usuario no autenticado');

            updateData.updatedAt = new Date();
            await this.db.collection('users').doc(this.currentUser.uid).update(updateData);
            
            // Actualizar cache
            const cachedData = this.userDataCache.get(this.currentUser.uid) || {};
            this.userDataCache.set(this.currentUser.uid, { ...cachedData, ...updateData });
            
            console.log('✅ Datos de usuario actualizados');
            return { success: true };
        } catch (error) {
            console.error('❌ Error al actualizar datos de usuario:', error);
            showError('Error al actualizar datos del usuario');
            return { success: false, error: error.message };
        }
    }

    /**
     * Carga datos del usuario desde Firestore con cache
     */
    async loadUserData(userId) {
        try {
            // Verificar cache primero
            if (this.userDataCache.has(userId)) {
                const cachedData = this.userDataCache.get(userId);
                console.log('📦 Datos de usuario obtenidos del cache');
                return { success: true, data: cachedData };
            }

            if (!this.db) throw new Error('Firestore no inicializado');

            const doc = await this.db.collection('users').doc(userId).get();
            if (doc.exists) {
                const userData = doc.data();
                
                // Guardar en cache
                this.userDataCache.set(userId, userData);
                
                console.log('✅ Datos de usuario cargados desde Firestore');
                return { success: true, data: userData };
            } else {
                console.log('ℹ️ No se encontraron datos del usuario');
                return { success: true, data: null };
            }
        } catch (error) {
            console.error('❌ Error al cargar datos de usuario:', error);
            showError('Error al cargar datos del usuario');
            return { success: false, error: error.message };
        }
    }

    /**
     * Añade una carta a la colección del usuario con cache
     */
    async addCardToCollection(cardData) {
        try {
            if (!this.db || !this.currentUser) throw new Error('Usuario no autenticado');

            const cardRef = this.db.collection(`users/${this.currentUser.uid}/my_cards`).doc(cardData.id);
            const cardDocData = {
                ...cardData,
                addedAt: new Date()
            };
            
            await cardRef.set(cardDocData);
            
            // Actualizar cache
            this.cardsCache.set(cardData.id, cardDocData);
            
            console.log('✅ Carta añadida a la colección');
            return { success: true };
        } catch (error) {
            console.error('❌ Error al añadir carta:', error);
            showError('Error al añadir carta a la colección');
            return { success: false, error: error.message };
        }
    }

    /**
     * Elimina una carta de la colección del usuario con cache
     */
    async removeCardFromCollection(cardId) {
        try {
            if (!this.db || !this.currentUser) throw new Error('Usuario no autenticado');

            await this.db.collection(`users/${this.currentUser.uid}/my_cards`).doc(cardId).delete();
            
            // Actualizar cache
            this.cardsCache.delete(cardId);
            
            console.log('✅ Carta eliminada de la colección');
            return { success: true };
        } catch (error) {
            console.error('❌ Error al eliminar carta:', error);
            showError('Error al eliminar carta de la colección');
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtiene la colección de cartas del usuario con cache
     */
    async getUserCards() {
        try {
            if (!this.db || !this.currentUser) throw new Error('Usuario no autenticado');

            // Verificar cache primero
            if (this.cardsCache.size > 0) {
                const cards = Array.from(this.cardsCache.values());
                console.log(`📦 ${cards.length} cartas obtenidas del cache`);
                return { success: true, cards };
            }

            const snapshot = await this.db.collection(`users/${this.currentUser.uid}/my_cards`).get();
            const cards = [];
            
            snapshot.forEach(doc => {
                const cardData = { id: doc.id, ...doc.data() };
                cards.push(cardData);
                // Guardar en cache
                this.cardsCache.set(doc.id, cardData);
            });
            
            console.log(`✅ ${cards.length} cartas cargadas de la colección`);
            return { success: true, cards };
        } catch (error) {
            console.error('❌ Error al cargar cartas del usuario:', error);
            showError('Error al cargar tu colección de cartas');
            return { success: false, error: error.message };
        }
    }

    /**
     * Prueba la conexión con Firebase
     */
    async testConnection() {
        try {
            if (!this.db) throw new Error('Firestore no inicializado');

            // Intentar leer un documento de prueba
            await this.db.collection('test').limit(1).get();
            showSuccess('Conexión con Firebase exitosa');
            return { success: true };
        } catch (error) {
            console.error('❌ Error de conexión con Firebase:', error);
            showError('Error de conexión con Firebase');
            return { success: false, error: error.message };
        }
    }

    /**
     * Reintenta una operación en caso de error
     */
    async retryOperation(operation) {
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                console.error(`❌ Intento ${attempt} fallido:`, error);
                
                if (attempt === this.maxRetries) {
                    const errorMessage = this.getAuthErrorMessage(error.code);
                    showError(errorMessage);
                    return { success: false, error: errorMessage };
                }
                
                // Esperar antes del siguiente intento
                await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY * attempt));
            }
        }
    }

    /**
     * Maneja errores con logging mejorado
     */
    async handleError(error, userMessage) {
        console.error('❌ Error en Firebase Service:', error);
        showError(userMessage);
        this.retryAttempts++;
        
        if (this.retryAttempts >= this.maxRetries) {
            console.error('❌ Máximo número de reintentos alcanzado');
            this.retryAttempts = 0;
        }
    }

    /**
     * Limpia cache expirado
     */
    cleanExpiredCache() {
        const now = Date.now();
        const maxAge = API_CONFIG.CACHE_DURATION;
        
        // Limpiar cache de datos de usuario
        for (const [key, value] of this.userDataCache.entries()) {
            if (now - value.timestamp > maxAge) {
                this.userDataCache.delete(key);
            }
        }
        
        // Limpiar cache de cartas
        for (const [key, value] of this.cardsCache.entries()) {
            if (now - value.addedAt.getTime() > maxAge) {
                this.cardsCache.delete(key);
            }
        }
        
        console.log('🧹 Cache limpiado');
    }

    /**
     * Limpia cache del usuario
     */
    clearUserCache() {
        this.userDataCache.clear();
        this.cardsCache.clear();
        console.log('🗑️ Cache del usuario limpiado');
    }

    /**
     * Convierte códigos de error de Firebase a mensajes legibles
     */
    getAuthErrorMessage(errorCode) {
        const errorMessages = {
            'auth/email-already-in-use': 'Este email ya está registrado',
            'auth/invalid-email': 'El formato del email no es válido',
            'auth/operation-not-allowed': 'Operación no permitida',
            'auth/weak-password': 'La contraseña es muy débil',
            'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
            'auth/user-not-found': 'No existe una cuenta con este email',
            'auth/wrong-password': 'Contraseña incorrecta',
            'auth/invalid-credential': 'Credenciales inválidas',
            'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
            'auth/requires-recent-login': 'Necesitas iniciar sesión nuevamente'
        };
        
        return errorMessages[errorCode] || 'Error de autenticación';
    }

    /**
     * Obtiene el usuario actual
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Verifica si el usuario está autenticado
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }

    /**
     * Obtiene estadísticas del cache
     */
    getCacheStats() {
        return {
            userDataCacheSize: this.userDataCache.size,
            cardsCacheSize: this.cardsCache.size,
            retryAttempts: this.retryAttempts
        };
    }
}

// Crear instancia singleton
const firebaseService = new FirebaseService();

export default firebaseService;