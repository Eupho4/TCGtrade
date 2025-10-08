/**
 * TCGtrade App - Versión Simplificada (Sin módulos ES6)
 * 
 * Esta es una versión simplificada que funciona sin módulos ES6
 * para asegurar compatibilidad total.
 */

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCkgz6_Zpu0VOW6GgJxOxd9QlVccsBXnog",
    authDomain: "tcgtrade-7ba27.firebaseapp.com",
    projectId: "tcgtrade-7ba27",
    storageBucket: "tcgtrade-7ba27.firebasestorage.app",
    messagingSenderId: "207150886257",
    appId: "1:207150886257:web:26edebbeb7df7a1d935ad0",
};

// Inicializar Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// Variables globales
let currentUser = null;
let allSets = [];
let userCardsCache = [];

// Referencias a elementos del DOM
let searchInput, searchResultsSection, heroSection, howItWorksSection, cardsContainer, loadingSpinner, noResultsMessage, errorMessage;
let authModal, loginForm, registerForm, loginEmailInput, loginPasswordInput, loginBtn, loginError;
let registerEmailInput, registerPasswordInput, confirmPasswordInput, registerBtn, registerError;
let closeAuthModalBtn, toggleToRegister, toggleToLogin;
let loginNavLink, registerNavLink, profileNavLink, logoutNavLink;
let myCardsNavLink, myCardsLink, myCardsSection, myCardsContainer, noMyCardsMessage, myCardsErrorMessage;

// Función principal de inicialización
function initializeApp() {
    console.log('🚀 Inicializando TCGtrade App...');
    
    // Obtener referencias del DOM
    getDOMElements();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Cargar datos iniciales
    loadInitialData();
    
    // Mostrar sección inicial
    showInitialSections();
    
    console.log('✅ TCGtrade App inicializada correctamente');
}

// Obtener referencias a elementos del DOM
function getDOMElements() {
    searchInput = document.getElementById('searchInput');
    searchResultsSection = document.getElementById('searchResultsSection');
    heroSection = document.getElementById('heroSection');
    howItWorksSection = document.getElementById('howItWorksSection');
    cardsContainer = document.getElementById('cardsContainer');
    loadingSpinner = document.getElementById('loadingSpinner');
    noResultsMessage = document.getElementById('noResultsMessage');
    errorMessage = document.getElementById('errorMessage');
    
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
    
    loginNavLink = document.getElementById('loginNavLink');
    registerNavLink = document.getElementById('registerNavLink');
    profileNavLink = document.getElementById('profileNavLink');
    logoutNavLink = document.getElementById('logoutNavLink');
    myCardsNavLink = document.getElementById('myCardsNavLink');
    myCardsLink = document.getElementById('myCardsLink');
    
    myCardsSection = document.getElementById('myCardsSection');
    myCardsContainer = document.getElementById('myCardsContainer');
    noMyCardsMessage = document.getElementById('noMyCardsMessage');
    myCardsErrorMessage = document.getElementById('myCardsErrorMessage');
}

// Configurar event listeners
function setupEventListeners() {
    // Búsqueda de cartas
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            handleSearch(e.target.value);
        });
    }

    // Navegación
    if (myCardsLink) {
        myCardsLink.addEventListener('click', showMyCards);
    }
    
    if (loginNavLink) {
        loginNavLink.addEventListener('click', () => showAuthModal('login'));
    }
    
    if (registerNavLink) {
        registerNavLink.addEventListener('click', () => showAuthModal('register'));
    }
    
    if (logoutNavLink) {
        logoutNavLink.addEventListener('click', logout);
    }

    // Autenticación
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleLogin();
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleRegister();
        });
    }

    if (closeAuthModalBtn) {
        closeAuthModalBtn.addEventListener('click', hideAuthModal);
    }

    if (toggleToRegister) {
        toggleToRegister.addEventListener('click', () => showAuthModal('register'));
    }

    if (toggleToLogin) {
        toggleToLogin.addEventListener('click', () => showAuthModal('login'));
    }

    // Botón principal
    const mainButton = document.getElementById('mainButton');
    if (mainButton) {
        mainButton.addEventListener('click', () => {
            if (searchInput) searchInput.focus();
        });
    }
}

// Cargar datos iniciales
async function loadInitialData() {
    try {
        // Cargar sets de Pokémon
        const setsResult = await fetch('/api/pokemontcg/sets');
        if (setsResult.ok) {
            const data = await setsResult.json();
            allSets = data.data || [];
            console.log(`✅ ${allSets.length} sets cargados`);
        }

        // Cargar colección del usuario si está autenticado
        if (currentUser) {
            await loadUserCards();
        }
    } catch (error) {
        console.error('❌ Error al cargar datos iniciales:', error);
    }
}

// Manejar búsqueda de cartas
async function handleSearch(query) {
    if (!query || query.trim().length < 2) {
        if (cardsContainer) cardsContainer.innerHTML = '';
        return;
    }

    try {
        showLoadingSpinner();
        
        const response = await fetch(`/api/pokemontcg/cards?q=${encodeURIComponent(query.trim())}`);
        const data = await response.json();
        
        hideLoadingSpinner();
        
        if (data.data && data.data.length > 0) {
            renderCards(data.data);
        } else {
            showNoResults();
        }
    } catch (error) {
        console.error('❌ Error en búsqueda:', error);
        hideLoadingSpinner();
        showError('Error al buscar cartas');
    }
}

// Renderizar cartas
function renderCards(cards) {
    if (!cardsContainer) return;
    
    cardsContainer.innerHTML = '';
    
    cards.forEach(card => {
        const cardElement = createCardElement(card);
        cardsContainer.appendChild(cardElement);
    });
    
    console.log(`✅ ${cards.length} cartas renderizadas`);
}

// Crear elemento de carta
function createCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.style.cssText = `
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        cursor: pointer;
        margin-bottom: 20px;
    `;

    // Imagen de la carta
    const imageContainer = document.createElement('div');
    imageContainer.style.cssText = `
        position: relative;
        width: 100%;
        height: 200px;
        background: #f8f9fa;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    `;

    const cardImage = document.createElement('img');
    cardImage.src = card.imageUrl || card.imageUrlHiRes || '/images/card-placeholder.svg';
    cardImage.alt = card.name;
    cardImage.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
    `;

    imageContainer.appendChild(cardImage);

    // Información de la carta
    const cardInfo = document.createElement('div');
    cardInfo.style.cssText = `
        padding: 16px;
    `;

    const cardName = document.createElement('h3');
    cardName.textContent = card.name;
    cardName.style.cssText = `
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
    `;

    const cardDetails = document.createElement('div');
    cardDetails.style.cssText = `
        font-size: 14px;
        color: #6b7280;
        margin-bottom: 12px;
    `;

    const details = [];
    if (card.set) details.push(`Set: ${card.set}`);
    if (card.number) details.push(`#${card.number}`);
    if (card.rarity) details.push(card.rarity);
    if (card.hp) details.push(`HP: ${card.hp}`);

    cardDetails.textContent = details.join(' • ');

    cardInfo.appendChild(cardName);
    cardInfo.appendChild(cardDetails);

    cardDiv.appendChild(imageContainer);
    cardDiv.appendChild(cardInfo);

    return cardDiv;
}

// Mostrar secciones
function showInitialSections() {
    if (heroSection) heroSection.classList.remove('hidden');
    if (howItWorksSection) howItWorksSection.classList.remove('hidden');
    
    if (searchResultsSection) searchResultsSection.classList.add('hidden');
    if (myCardsSection) myCardsSection.classList.add('hidden');
}

function showMyCards() {
    if (!currentUser) {
        alert('Debes iniciar sesión para ver tu colección');
        return;
    }

    if (heroSection) heroSection.classList.add('hidden');
    if (howItWorksSection) howItWorksSection.classList.add('hidden');
    if (searchResultsSection) searchResultsSection.classList.add('hidden');
    
    if (myCardsSection) myCardsSection.classList.remove('hidden');
    
    loadUserCards();
}

// Mostrar modal de autenticación
function showAuthModal(type) {
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
    if (authModal) {
        authModal.style.display = 'none';
    }
    clearAuthForms();
}

function clearAuthForms() {
    if (loginForm) loginForm.reset();
    if (registerForm) registerForm.reset();
    hideLoginError();
    hideRegisterError();
}

// Manejar login
async function handleLogin() {
    const email = loginEmailInput?.value;
    const password = loginPasswordInput?.value;

    if (!email || !password) {
        showLoginError('Todos los campos son requeridos');
        return;
    }

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        currentUser = userCredential.user;
        
        hideAuthModal();
        updateAuthUI();
        await loadUserCards();
        
        console.log('✅ Usuario logueado:', currentUser.email);
    } catch (error) {
        console.error('❌ Error al iniciar sesión:', error);
        showLoginError('Error al iniciar sesión');
    }
}

// Manejar registro
async function handleRegister() {
    const email = registerEmailInput?.value;
    const password = registerPasswordInput?.value;
    const confirmPassword = confirmPasswordInput?.value;
    const username = document.getElementById('registerUsername')?.value;

    if (!email || !password || !confirmPassword || !username) {
        showRegisterError('Todos los campos son requeridos');
        return;
    }

    if (password !== confirmPassword) {
        showRegisterError('Las contraseñas no coinciden');
        return;
    }

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        currentUser = userCredential.user;
        
        // Guardar datos adicionales
        await db.collection('users').doc(currentUser.uid).set({
            name: username,
            email: currentUser.email,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        
        hideAuthModal();
        updateAuthUI();
        await loadUserCards();
        
        console.log('✅ Usuario registrado:', currentUser.email);
    } catch (error) {
        console.error('❌ Error al registrar usuario:', error);
        showRegisterError('Error al registrar usuario');
    }
}

// Cerrar sesión
async function logout() {
    try {
        await auth.signOut();
        currentUser = null;
        userCardsCache = [];
        updateAuthUI();
        showInitialSections();
        console.log('✅ Usuario deslogueado');
    } catch (error) {
        console.error('❌ Error al cerrar sesión:', error);
    }
}

// Cargar cartas del usuario
async function loadUserCards() {
    if (!currentUser) return;

    try {
        const snapshot = await db.collection(`users/${currentUser.uid}/my_cards`).get();
        userCardsCache = [];
        
        snapshot.forEach(doc => {
            userCardsCache.push({ id: doc.id, ...doc.data() });
        });
        
        updateMyCardsDisplay();
        console.log(`✅ ${userCardsCache.length} cartas cargadas`);
    } catch (error) {
        console.error('❌ Error al cargar cartas:', error);
    }
}

// Actualizar visualización de cartas
function updateMyCardsDisplay() {
    if (!myCardsContainer) return;

    if (userCardsCache.length === 0) {
        if (noMyCardsMessage) {
            noMyCardsMessage.style.display = 'block';
        }
        if (myCardsContainer) {
            myCardsContainer.innerHTML = '';
        }
    } else {
        if (noMyCardsMessage) {
            noMyCardsMessage.style.display = 'none';
        }
        renderCards(userCardsCache);
    }
}

// Actualizar UI de autenticación
function updateAuthUI() {
    const isAuthenticated = currentUser !== null;
    
    if (loginNavLink) loginNavLink.style.display = isAuthenticated ? 'none' : 'block';
    if (registerNavLink) registerNavLink.style.display = isAuthenticated ? 'none' : 'block';
    if (profileNavLink) profileNavLink.style.display = isAuthenticated ? 'block' : 'none';
    if (logoutNavLink) logoutNavLink.style.display = isAuthenticated ? 'block' : 'none';
    if (myCardsNavLink) myCardsNavLink.style.display = isAuthenticated ? 'block' : 'none';
}

// Utilidades
function showLoadingSpinner() {
    if (loadingSpinner) loadingSpinner.style.display = 'block';
    if (noResultsMessage) noResultsMessage.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
}

function hideLoadingSpinner() {
    if (loadingSpinner) loadingSpinner.style.display = 'none';
}

function showNoResults() {
    hideLoadingSpinner();
    if (noResultsMessage) noResultsMessage.style.display = 'block';
    if (errorMessage) errorMessage.style.display = 'none';
}

function showError(message) {
    hideLoadingSpinner();
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
    if (noResultsMessage) noResultsMessage.style.display = 'none';
}

function showLoginError(message) {
    if (loginError) {
        loginError.textContent = message;
        loginError.style.display = 'block';
    }
}

function hideLoginError() {
    if (loginError) loginError.style.display = 'none';
}

function showRegisterError(message) {
    if (registerError) {
        registerError.textContent = message;
        registerError.style.display = 'block';
    }
}

function hideRegisterError() {
    if (registerError) registerError.style.display = 'none';
}

// Configurar listener de autenticación
auth.onAuthStateChanged((user) => {
    currentUser = user;
    if (user) {
        console.log('✅ Usuario autenticado:', user.email);
        updateAuthUI();
        loadUserCards();
    } else {
        console.log('ℹ️ Usuario no autenticado');
        updateAuthUI();
    }
});

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Función para ir a la página de inicio
function goToHome() {
    console.log('🏠 Navegando a la página de inicio');
    showInitialSections();
    
    // Limpiar búsqueda si existe
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Limpiar resultados de búsqueda
    if (cardsContainer) {
        cardsContainer.innerHTML = '';
    }
    
    // Ocultar mensajes
    hideLoadingSpinner();
    if (noResultsMessage) noResultsMessage.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
}

// Exportar para uso global
window.TCGtradeApp = {
    initializeApp,
    showMyCards,
    showAuthModal,
    hideAuthModal,
    handleSearch,
    renderCards,
    goToHome
};

// Hacer la función global para el onclick
window.goToHome = goToHome;