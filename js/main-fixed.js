// TCGtrade - Main Application Script
// Wrapped to ensure proper initialization

(function() {
    'use strict';
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        // DOM is already ready
        initializeApp();
    }
    
    function initializeApp() {
        console.log('🚀 Inicializando TCGtrade...');
        
        // Check if Firebase is loaded
        if (typeof firebase === 'undefined') {
            console.error('❌ Firebase no está cargado. Reintentando en 1 segundo...');
            setTimeout(initializeApp, 1000);
            return;
        }
        
        console.log('✅ Firebase SDK detectado');
        
        // Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyCkgz6_Zpu0VOW6GgJxOxd9QlVccsBXnog",
            authDomain: "tcgtrade-7ba27.firebaseapp.com",
            projectId: "tcgtrade-7ba27",
            storageBucket: "tcgtrade-7ba27.firebasestorage.app",
            messagingSenderId: "207150886257",
            appId: "1:207150886257:web:26edebbeb7df7a1d935ad0",
        };
        
        // Initialize Firebase
        try {
            firebase.initializeApp(firebaseConfig);
            window.auth = firebase.auth();
            window.db = firebase.firestore();
            console.log('✅ Firebase inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando Firebase:', error);
            return;
        }
        
        // Global variables
        window.currentUser = null;
        
        // Essential functions that need to be available immediately
        
        // Quick search function
        window.quickSearch = async function() {
            console.log('🔍 Quick search llamado');
            const searchInput = document.getElementById('searchInput');
            if (!searchInput) {
                console.error('❌ No se encontró el input de búsqueda');
                return;
            }
            
            const query = searchInput.value.trim();
            if (!query) {
                alert('Por favor ingresa un término de búsqueda');
                return;
            }
            
            console.log('🔍 Buscando:', query);
            // Aquí iría la lógica de búsqueda real
            alert('Buscando: ' + query + '\n(Función en desarrollo)');
        };
        
        // Show create trade modal
        window.showCreateTradeModal = function() {
            console.log('📝 Mostrar modal de crear intercambio');
            if (!window.currentUser) {
                alert('Debes iniciar sesión para crear un intercambio');
                showAuthModal('login');
                return;
            }
            alert('Modal de crear intercambio\n(Función en desarrollo)');
        };
        
        // Show auth modal
        window.showAuthModal = function(type) {
            console.log('🔐 Mostrar modal de autenticación:', type);
            // Por ahora, solo mostrar un alert
            if (type === 'login') {
                const email = prompt('Email:');
                const password = prompt('Password:');
                if (email && password) {
                    loginUser(email, password);
                }
            }
        };
        
        // Login function
        window.loginUser = async function(email, password) {
            try {
                console.log('🔐 Iniciando sesión...');
                const userCredential = await window.auth.signInWithEmailAndPassword(email, password);
                window.currentUser = userCredential.user;
                console.log('✅ Sesión iniciada:', userCredential.user.email);
                alert('¡Bienvenido ' + userCredential.user.email + '!');
                updateUIForUser(userCredential.user);
            } catch (error) {
                console.error('❌ Error al iniciar sesión:', error);
                alert('Error al iniciar sesión: ' + error.message);
            }
        };
        
        // Logout function
        window.logoutUser = async function() {
            try {
                await window.auth.signOut();
                window.currentUser = null;
                console.log('✅ Sesión cerrada');
                alert('Sesión cerrada correctamente');
                updateUIForUser(null);
            } catch (error) {
                console.error('❌ Error al cerrar sesión:', error);
            }
        };
        
        // Update UI based on user state
        function updateUIForUser(user) {
            const loginLink = document.getElementById('loginNavLink');
            const logoutLink = document.getElementById('logoutNavLink');
            const profileLink = document.getElementById('profileNavLink');
            
            if (user) {
                // User is logged in
                if (loginLink) loginLink.style.display = 'none';
                if (logoutLink) logoutLink.style.display = 'block';
                if (profileLink) profileLink.style.display = 'block';
            } else {
                // User is logged out
                if (loginLink) loginLink.style.display = 'block';
                if (logoutLink) logoutLink.style.display = 'none';
                if (profileLink) profileLink.style.display = 'none';
            }
        }
        
        // Setup auth state listener
        window.auth.onAuthStateChanged(function(user) {
            window.currentUser = user;
            if (user) {
                console.log('👤 Usuario autenticado:', user.email);
            } else {
                console.log('👤 No hay usuario autenticado');
            }
            updateUIForUser(user);
        });
        
        // Setup event listeners for navigation
        document.addEventListener('click', function(e) {
            // Handle navigation clicks
            if (e.target.id === 'loginLink') {
                e.preventDefault();
                showAuthModal('login');
            } else if (e.target.id === 'logoutLink') {
                e.preventDefault();
                logoutUser();
            }
        });
        
        console.log('✅ TCGtrade inicializado completamente');
        console.log('📋 Funciones disponibles: quickSearch(), showCreateTradeModal(), loginUser(), logoutUser()');
    }
})();