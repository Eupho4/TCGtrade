/**
 * Servicio de Firebase para manejo de autenticación y base de datos
 */

import { firebaseConfig, appId } from '../constants/config.js';
import { showError, showSuccess } from '../utils/notifications.js';

class FirebaseService {
    constructor() {
        this.auth = null;
        this.db = null;
        this.currentUser = null;
        this.initialized = false;
    }

    /**
     * Inicializa Firebase
     */
    initialize() {
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
            
            console.log('✅ Firebase inicializado correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar Firebase:', error);
            showError('Error al conectar con la base de datos');
        }
    }

    /**
     * Configura el listener de cambios de autenticación
     */
    setupAuthListener() {
        if (!this.auth) return;

        this.auth.onAuthStateChanged((user) => {
            this.currentUser = user;
            if (user) {
                console.log('✅ Usuario autenticado:', user.email);
                this.loadUserData(user.uid);
            } else {
                console.log('ℹ️ Usuario no autenticado');
            }
        });
    }

    /**
     * Registra un nuevo usuario
     */
    async registerUser(email, password, userData) {
        try {
            if (!this.auth) throw new Error('Firebase no inicializado');

            // Crear usuario en Firebase Auth
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Guardar datos adicionales en Firestore
            await this.saveUserData(user.uid, {
                ...userData,
                email: user.email,
                createdAt: new Date(),
                updatedAt: new Date()
            });

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
     * Inicia sesión de usuario
     */
    async loginUser(email, password) {
        try {
            if (!this.auth) throw new Error('Firebase no inicializado');

            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
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
            showSuccess('Sesión cerrada correctamente');
            return { success: true };
        } catch (error) {
            console.error('❌ Error al cerrar sesión:', error);
            showError('Error al cerrar sesión');
            return { success: false, error: error.message };
        }
    }

    /**
     * Cambia la contraseña del usuario
     */
    async changePassword(currentPassword, newPassword) {
        try {
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
        } catch (error) {
            console.error('❌ Error al cambiar contraseña:', error);
            const errorMessage = this.getAuthErrorMessage(error.code);
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }

    /**
     * Cambia el email del usuario
     */
    async changeEmail(newEmail) {
        try {
            if (!this.auth || !this.currentUser) throw new Error('Usuario no autenticado');

            await this.currentUser.updateEmail(newEmail);
            
            // Actualizar email en Firestore
            await this.updateUserData({ email: newEmail });
            
            showSuccess('Email cambiado correctamente');
            return { success: true };
        } catch (error) {
            console.error('❌ Error al cambiar email:', error);
            const errorMessage = this.getAuthErrorMessage(error.code);
            showError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }

    /**
     * Guarda datos del usuario en Firestore
     */
    async saveUserData(userId, userData) {
        try {
            if (!this.db) throw new Error('Firestore no inicializado');

            await this.db.collection('users').doc(userId).set(userData);
            console.log('✅ Datos de usuario guardados');
            return { success: true };
        } catch (error) {
            console.error('❌ Error al guardar datos de usuario:', error);
            showError('Error al guardar datos del usuario');
            return { success: false, error: error.message };
        }
    }

    /**
     * Actualiza datos del usuario en Firestore
     */
    async updateUserData(updateData) {
        try {
            if (!this.db || !this.currentUser) throw new Error('Usuario no autenticado');

            updateData.updatedAt = new Date();
            await this.db.collection('users').doc(this.currentUser.uid).update(updateData);
            console.log('✅ Datos de usuario actualizados');
            return { success: true };
        } catch (error) {
            console.error('❌ Error al actualizar datos de usuario:', error);
            showError('Error al actualizar datos del usuario');
            return { success: false, error: error.message };
        }
    }

    /**
     * Carga datos del usuario desde Firestore
     */
    async loadUserData(userId) {
        try {
            if (!this.db) throw new Error('Firestore no inicializado');

            const doc = await this.db.collection('users').doc(userId).get();
            if (doc.exists) {
                const userData = doc.data();
                console.log('✅ Datos de usuario cargados:', userData);
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
     * Añade una carta a la colección del usuario
     */
    async addCardToCollection(cardData) {
        try {
            if (!this.db || !this.currentUser) throw new Error('Usuario no autenticado');

            const cardRef = this.db.collection(`users/${this.currentUser.uid}/my_cards`).doc(cardData.id);
            await cardRef.set({
                ...cardData,
                addedAt: new Date()
            });
            
            console.log('✅ Carta añadida a la colección');
            return { success: true };
        } catch (error) {
            console.error('❌ Error al añadir carta:', error);
            showError('Error al añadir carta a la colección');
            return { success: false, error: error.message };
        }
    }

    /**
     * Elimina una carta de la colección del usuario
     */
    async removeCardFromCollection(cardId) {
        try {
            if (!this.db || !this.currentUser) throw new Error('Usuario no autenticado');

            await this.db.collection(`users/${this.currentUser.uid}/my_cards`).doc(cardId).delete();
            
            console.log('✅ Carta eliminada de la colección');
            return { success: true };
        } catch (error) {
            console.error('❌ Error al eliminar carta:', error);
            showError('Error al eliminar carta de la colección');
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtiene la colección de cartas del usuario
     */
    async getUserCards() {
        try {
            if (!this.db || !this.currentUser) throw new Error('Usuario no autenticado');

            const snapshot = await this.db.collection(`users/${this.currentUser.uid}/my_cards`).get();
            const cards = [];
            
            snapshot.forEach(doc => {
                cards.push({ id: doc.id, ...doc.data() });
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
}

// Crear instancia singleton
const firebaseService = new FirebaseService();

export default firebaseService;