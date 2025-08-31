// TCGtrade - Complete Application Script
// This version includes all functionality with proper initialization

(function() {
    'use strict';
    
    // Global variables - declared at top level
    let auth, db;
    let currentUser = null;
    let allSets = [];
    let userCardsCache = [];
    
    // DOM element references
    let searchInput, searchResultsSection, heroSection, howItWorksSection, cardsContainer, loadingSpinner, noResultsMessage, errorMessage;
    let authModal, loginForm, registerForm, loginEmailInput, loginPasswordInput, loginBtn, loginError;
    let registerEmailInput, registerPasswordInput, confirmPasswordInput, registerBtn, registerError;
    let closeAuthModalBtn, toggleToRegister, toggleToLogin;
    let loginNavLink, registerNavLink, profileNavLink, logoutNavLink;
    let myCardsNavLink, myCardsLink, myCardsSection, myCardsContainer, noMyCardsMessage, myCardsErrorMessage;
    let seriesFilter, setFilter, languageFilter, applyFiltersBtn, showAllSetCardsToggle;
    let profileLink, profileSection, profileSidebarLinks, profileGeneralInfo, profileMyCardsTabContent, profileTradeHistory, profileSettings;
    let profileEmailDisplay, profileUidDisplay, profileMemberSince, profileLoginRequiredMessage, profileGeneralInfoContent;
    let profileNameInput, profileLastNameInput, profileAddressInput, profilePhoneInput, profileSaveMessage, saveProfileBtn;
    let settingsNewEmailInput, emailChangeMessage, saveEmailBtn;
    let settingsCurrentPasswordInput, settingsNewPasswordInput, settingsConfirmNewPasswordInput, passwordChangeMessage, savePasswordBtn;
    let darkModeToggle, interchangesSection, helpSection;
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
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
            auth = firebase.auth();
            db = firebase.firestore();
            console.log('✅ Firebase inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando Firebase:', error);
            return;
        }
        
        // Initialize DOM elements
        initializeDOMElements();
        
        // Setup event listeners
        setupEventListeners();
        
        // Setup auth state listener
        auth.onAuthStateChanged(function(user) {
            currentUser = user;
            if (user) {
                console.log('👤 Usuario autenticado:', user.email);
                loadUserInfo();
                updateUIForAuthenticatedUser();
            } else {
                console.log('👤 No hay usuario autenticado');
                updateUIForUnauthenticatedUser();
            }
        });
        
        // Load dark mode preference
        loadDarkModePreference();
        
        // Expose all necessary functions globally
        exposeGlobalFunctions();
        
        console.log('✅ TCGtrade inicializado completamente');
    }
    
    function initializeDOMElements() {
        // Search elements
        searchInput = document.getElementById('searchInput');
        searchResultsSection = document.getElementById('searchResultsSection');
        heroSection = document.getElementById('heroSection');
        howItWorksSection = document.getElementById('howItWorksSection');
        cardsContainer = document.getElementById('cardsContainer');
        loadingSpinner = document.getElementById('loadingSpinner');
        noResultsMessage = document.getElementById('noResultsMessage');
        errorMessage = document.getElementById('errorMessage');
        
        // Auth elements
        authModal = document.getElementById('authModal');
        loginForm = document.getElementById('loginForm');
        registerForm = document.getElementById('registerForm');
        loginEmailInput = document.getElementById('loginEmail');
        loginPasswordInput = document.getElementById('loginPassword');
        loginBtn = document.getElementById('loginBtn');
        loginError = document.getElementById('loginError');
        registerEmailInput = document.getElementById('registerEmail');
        registerPasswordInput = document.getElementById('registerPassword');
        confirmPasswordInput = document.getElementById('confirmPassword');
        registerBtn = document.getElementById('registerBtn');
        registerError = document.getElementById('registerError');
        closeAuthModalBtn = document.getElementById('closeAuthModal');
        toggleToRegister = document.getElementById('toggleToRegister');
        toggleToLogin = document.getElementById('toggleToLogin');
        
        // Navigation elements
        loginNavLink = document.getElementById('loginNavLink');
        registerNavLink = document.getElementById('registerNavLink');
        profileNavLink = document.getElementById('profileNavLink');
        logoutNavLink = document.getElementById('logoutNavLink');
        myCardsNavLink = document.getElementById('myCardsNavLink');
        myCardsLink = document.getElementById('myCardsLink');
        
        // Other sections
        myCardsSection = document.getElementById('myCardsSection');
        profileSection = document.getElementById('profileSection');
        interchangesSection = document.getElementById('interchangesSection');
        helpSection = document.getElementById('helpSection');
        darkModeToggle = document.getElementById('darkModeToggle');
    }
    
    function setupEventListeners() {
        // Navigation links
        const homeLink = document.getElementById('homeLink');
        if (homeLink) {
            homeLink.addEventListener('click', (e) => {
                e.preventDefault();
                showInitialSections();
            });
        }
        
        const navHomeLink = document.getElementById('navHomeLink');
        if (navHomeLink) {
            navHomeLink.addEventListener('click', (e) => {
                e.preventDefault();
                showInitialSections();
            });
        }
        
        const loginLink = document.getElementById('loginLink');
        if (loginLink) {
            loginLink.addEventListener('click', (e) => {
                e.preventDefault();
                showAuthModal('login');
            });
        }
        
        const logoutLink = document.getElementById('logoutLink');
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                logoutUser();
            });
        }
        
        if (myCardsLink) {
            myCardsLink.addEventListener('click', (e) => {
                e.preventDefault();
                showMyCardsSection();
            });
        }
        
        const interchangesLink = document.getElementById('interchangesLink');
        if (interchangesLink) {
            interchangesLink.addEventListener('click', (e) => {
                e.preventDefault();
                showInterchangesSection();
            });
        }
        
        const profileLink = document.getElementById('profileLink');
        if (profileLink) {
            profileLink.addEventListener('click', (e) => {
                e.preventDefault();
                showProfileSection();
            });
        }
        
        const helpLink = document.getElementById('helpLink');
        if (helpLink) {
            helpLink.addEventListener('click', (e) => {
                e.preventDefault();
                showHelpSection();
            });
        }
        
        // Auth modal events
        if (loginBtn) {
            loginBtn.addEventListener('click', handleLogin);
        }
        
        if (registerBtn) {
            registerBtn.addEventListener('click', handleRegister);
        }
        
        if (toggleToRegister) {
            toggleToRegister.addEventListener('click', (e) => {
                e.preventDefault();
                showAuthModal('register');
            });
        }
        
        if (toggleToLogin) {
            toggleToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                showAuthModal('login');
            });
        }
        
        if (closeAuthModalBtn) {
            closeAuthModalBtn.addEventListener('click', hideAuthModal);
        }
        
        // Dark mode toggle
        if (darkModeToggle) {
            darkModeToggle.addEventListener('change', () => {
                toggleDarkMode();
            });
        }
        
        // Search input
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                if (query.length >= 2) {
                    debouncedSearch(query);
                }
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const query = e.target.value.trim();
                    if (query) {
                        performSearch(query);
                    }
                }
            });
        }
    }
    
    // Utility functions
    function showLoadingSpinner() {
        if (loadingSpinner) loadingSpinner.style.display = 'block';
    }
    
    function hideLoadingSpinner() {
        if (loadingSpinner) loadingSpinner.style.display = 'none';
    }
    
    function showInitialSections() {
        hideAllSections();
        if (heroSection) heroSection.style.display = 'block';
        if (howItWorksSection) howItWorksSection.style.display = 'block';
        window.scrollTo(0, 0);
    }
    
    function hideAllSections() {
        const sections = [
            searchResultsSection,
            heroSection,
            howItWorksSection,
            myCardsSection,
            profileSection,
            interchangesSection,
            helpSection
        ];
        
        sections.forEach(section => {
            if (section) section.style.display = 'none';
        });
    }
    
    function showMyCardsSection() {
        if (!currentUser) {
            showAuthModal('login');
            return;
        }
        hideAllSections();
        if (myCardsSection) {
            myCardsSection.style.display = 'block';
            loadMyCollection();
        }
    }
    
    function showInterchangesSection() {
        hideAllSections();
        if (interchangesSection) {
            interchangesSection.style.display = 'block';
            loadUserTrades();
            loadAvailableTrades();
        }
    }
    
    function showProfileSection() {
        if (!currentUser) {
            showAuthModal('login');
            return;
        }
        hideAllSections();
        if (profileSection) {
            profileSection.style.display = 'block';
            loadUserInfo();
        }
    }
    
    function showHelpSection() {
        hideAllSections();
        if (helpSection) {
            helpSection.style.display = 'block';
        }
    }
    
    // Auth functions
    function showAuthModal(type = 'login') {
        if (!authModal) return;
        
        authModal.style.display = 'flex';
        
        if (type === 'login') {
            if (loginForm) loginForm.style.display = 'block';
            if (registerForm) registerForm.style.display = 'none';
        } else {
            if (loginForm) loginForm.style.display = 'none';
            if (registerForm) registerForm.style.display = 'block';
        }
    }
    
    function hideAuthModal() {
        if (authModal) authModal.style.display = 'none';
    }
    
    async function handleLogin() {
        const email = loginEmailInput?.value;
        const password = loginPasswordInput?.value;
        
        if (!email || !password) {
            if (loginError) {
                loginError.textContent = 'Por favor completa todos los campos';
                loginError.classList.remove('hidden');
            }
            return;
        }
        
        try {
            showLoadingSpinner();
            await auth.signInWithEmailAndPassword(email, password);
            hideAuthModal();
            if (loginForm) loginForm.reset();
            console.log('✅ Sesión iniciada correctamente');
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            if (loginError) {
                loginError.textContent = getErrorMessage(error);
                loginError.classList.remove('hidden');
            }
        } finally {
            hideLoadingSpinner();
        }
    }
    
    async function handleRegister() {
        const username = document.getElementById('registerUsername')?.value;
        const email = registerEmailInput?.value;
        const password = registerPasswordInput?.value;
        const confirmPassword = confirmPasswordInput?.value;
        
        if (!username || !email || !password || !confirmPassword) {
            if (registerError) {
                registerError.textContent = 'Por favor completa todos los campos';
                registerError.classList.remove('hidden');
            }
            return;
        }
        
        if (password !== confirmPassword) {
            if (registerError) {
                registerError.textContent = 'Las contraseñas no coinciden';
                registerError.classList.remove('hidden');
            }
            return;
        }
        
        try {
            showLoadingSpinner();
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Save user profile to Firestore
            await db.collection('users').doc(user.uid).set({
                username: username,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                name: '',
                lastName: '',
                address: '',
                phone: ''
            });
            
            hideAuthModal();
            if (registerForm) registerForm.reset();
            console.log('✅ Cuenta creada correctamente');
        } catch (error) {
            console.error('Error al registrar:', error);
            if (registerError) {
                registerError.textContent = getErrorMessage(error);
                registerError.classList.remove('hidden');
            }
        } finally {
            hideLoadingSpinner();
        }
    }
    
    async function logoutUser() {
        try {
            await auth.signOut();
            showInitialSections();
            console.log('✅ Sesión cerrada');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    }
    
    async function loadUserInfo() {
        if (!currentUser) return;
        
        try {
            const userDoc = await db.collection('users').doc(currentUser.uid).get();
            const userData = userDoc.data();
            
            if (userData) {
                // Update profile display
                if (document.getElementById('profileUserName')) {
                    document.getElementById('profileUserName').textContent = userData.username || 'Usuario';
                }
                if (document.getElementById('profileEmail')) {
                    document.getElementById('profileEmail').textContent = currentUser.email;
                }
            }
        } catch (error) {
            console.error('Error loading user info:', error);
        }
    }
    
    function updateUIForAuthenticatedUser() {
        if (loginNavLink) loginNavLink.style.display = 'none';
        if (registerNavLink) registerNavLink.style.display = 'none';
        if (profileNavLink) profileNavLink.style.display = 'block';
        if (logoutNavLink) logoutNavLink.style.display = 'block';
        if (myCardsNavLink) myCardsNavLink.style.display = 'block';
    }
    
    function updateUIForUnauthenticatedUser() {
        if (loginNavLink) loginNavLink.style.display = 'block';
        if (registerNavLink) registerNavLink.style.display = 'none';
        if (profileNavLink) profileNavLink.style.display = 'none';
        if (logoutNavLink) logoutNavLink.style.display = 'none';
        if (myCardsNavLink) myCardsNavLink.style.display = 'none';
    }
    
    // Dark mode functions
    function loadDarkModePreference() {
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode !== null) {
            const isDark = savedDarkMode === 'true';
            applyDarkMode(isDark);
            if (darkModeToggle) {
                darkModeToggle.checked = isDark;
            }
        }
    }
    
    function toggleDarkMode() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('darkMode', isDark);
        console.log('🌙 Modo oscuro:', isDark);
    }
    
    function applyDarkMode(isDark) {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
    
    // Search functions
    let searchTimeout;
    function debouncedSearch(query) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 500);
    }
    
    async function performSearch(query) {
        console.log('🔍 Buscando:', query);
        showLoadingSpinner();
        
        try {
            // This would be replaced with actual API call
            const results = await fetchCards(query);
            displaySearchResults(results);
        } catch (error) {
            console.error('Error en búsqueda:', error);
            if (errorMessage) {
                errorMessage.textContent = 'Error al buscar cartas';
                errorMessage.style.display = 'block';
            }
        } finally {
            hideLoadingSpinner();
        }
    }
    
    async function fetchCards(query) {
        // Placeholder for actual API call
        console.log('Fetching cards for:', query);
        // Return empty array for now
        return [];
    }
    
    function displaySearchResults(results) {
        hideAllSections();
        if (searchResultsSection) {
            searchResultsSection.style.display = 'block';
        }
        
        if (!cardsContainer) return;
        
        if (results.length === 0) {
            if (noResultsMessage) {
                noResultsMessage.style.display = 'block';
            }
            cardsContainer.innerHTML = '';
            return;
        }
        
        if (noResultsMessage) {
            noResultsMessage.style.display = 'none';
        }
        
        // Display results
        cardsContainer.innerHTML = results.map(card => `
            <div class="card">
                <h3>${card.name}</h3>
            </div>
        `).join('');
    }
    
    // Trade functions
    function loadUserTrades() {
        console.log('Loading user trades...');
        // Implementation would go here
    }
    
    function loadAvailableTrades() {
        console.log('Loading available trades...');
        // Implementation would go here
    }
    
    // Collection functions
    async function loadMyCollection() {
        if (!currentUser) return;
        
        console.log('Loading user collection...');
        try {
            const collectionRef = db.collection('users').doc(currentUser.uid).collection('my_cards');
            const snapshot = await collectionRef.get();
            
            const cards = [];
            snapshot.forEach(doc => {
                cards.push({ id: doc.id, ...doc.data() });
            });
            
            displayMyCards(cards);
        } catch (error) {
            console.error('Error loading collection:', error);
        }
    }
    
    function displayMyCards(cards) {
        if (!myCardsContainer) return;
        
        if (cards.length === 0) {
            myCardsContainer.innerHTML = '<p>No tienes cartas en tu colección</p>';
            return;
        }
        
        myCardsContainer.innerHTML = cards.map(card => `
            <div class="card">
                <h3>${card.name}</h3>
                <p>${card.set || 'Set desconocido'}</p>
            </div>
        `).join('');
    }
    
    // Helper functions
    function getErrorMessage(error) {
        const errorMessages = {
            'auth/user-not-found': 'Usuario no encontrado',
            'auth/wrong-password': 'Contraseña incorrecta',
            'auth/email-already-in-use': 'El email ya está registrado',
            'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
            'auth/invalid-email': 'Email inválido'
        };
        
        return errorMessages[error.code] || 'Error: ' + error.message;
    }
    
    // Quick search function
    window.quickSearch = async function() {
        const query = searchInput?.value.trim();
        if (!query) {
            alert('Por favor ingresa un término de búsqueda');
            return;
        }
        
        console.log('🚀 Búsqueda rápida:', query);
        await performSearch(query);
    };
    
    // Show create trade modal
    window.showCreateTradeModal = function() {
        if (!currentUser) {
            showAuthModal('login');
            return;
        }
        
        console.log('📝 Mostrar modal de crear intercambio');
        // Implementation would go here
        alert('Modal de crear intercambio (en desarrollo)');
    };
    
    // Expose all functions globally
    function exposeGlobalFunctions() {
        // Auth functions
        window.showAuthModal = showAuthModal;
        window.hideAuthModal = hideAuthModal;
        window.loginUser = handleLogin;
        window.logoutUser = logoutUser;
        
        // Navigation functions
        window.showInitialSections = showInitialSections;
        window.showMyCardsSection = showMyCardsSection;
        window.showInterchangesSection = showInterchangesSection;
        window.showProfileSection = showProfileSection;
        window.showHelpSection = showHelpSection;
        
        // Dark mode
        window.toggleDarkMode = toggleDarkMode;
        
        // Search
        window.performSearch = performSearch;
        
        // Make auth and db accessible
        window.auth = auth;
        window.db = db;
        window.currentUser = currentUser;
        
        console.log('✅ Funciones globales expuestas');
    }
    
})();