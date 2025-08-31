/**
 * Main Application Module
 * Coordinates all modules and initializes the application
 */

import { initAuth, showAuthModal, loginUser, registerUser, logoutUser, resetPassword } from './modules/auth.js';
import { initializeElements, showNotification, applyDarkMode, toggleDarkMode } from './modules/utils.js';
import { searchCards, debouncedSearch, renderCardsInGrid, renderCardsInList } from './modules/search.js';
import { loadMyCollection, addCardDirectly } from './modules/cards.js';
import { STORAGE_KEYS } from './modules/constants.js';

// Global state
let currentUser = null;
let currentView = 'grid';

/**
 * Initialize application
 */
async function initApp() {
    console.log('🚀 Initializing TCGtrade application...');
    
    // Initialize DOM elements
    const elements = initializeElements();
    
    // Apply dark mode preference
    applyDarkMode();
    
    // Initialize authentication
    initAuth((user) => {
        currentUser = user;
        if (user) {
            console.log('✅ User authenticated:', user.email);
            updateUIForAuthenticatedUser(user);
        } else {
            console.log('❌ User not authenticated');
            updateUIForUnauthenticatedUser();
        }
    });
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup navigation
    setupNavigation();
    
    // Load initial content
    loadInitialContent();
    
    console.log('✅ Application initialized successfully');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', () => {
            toggleDarkMode();
        });
    }
    
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length >= 2) {
                debouncedSearch(query);
            }
        });
        
        // Search on Enter
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
    
    // View toggle buttons
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    
    if (gridViewBtn) {
        gridViewBtn.addEventListener('click', () => {
            currentView = 'grid';
            updateViewButtons();
            reRenderSearchResults();
        });
    }
    
    if (listViewBtn) {
        listViewBtn.addEventListener('click', () => {
            currentView = 'list';
            updateViewButtons();
            reRenderSearchResults();
        });
    }
    
    // Authentication forms
    setupAuthForms();
    
    // Modal close buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.auth-modal-overlay');
            if (modal) modal.classList.remove('show');
        });
    });
}

/**
 * Setup authentication forms
 */
function setupAuthForms() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;
            
            try {
                await loginUser(email, password);
                loginForm.reset();
            } catch (error) {
                // Error handled in auth module
            }
        });
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = registerForm.querySelector('input[name="username"]').value;
            const email = registerForm.querySelector('input[type="email"]').value;
            const password = registerForm.querySelector('input[type="password"]').value;
            const confirmPassword = registerForm.querySelector('input[name="confirmPassword"]').value;
            
            if (password !== confirmPassword) {
                showNotification('Las contraseñas no coinciden', 'error');
                return;
            }
            
            try {
                await registerUser(email, password, username);
                registerForm.reset();
            } catch (error) {
                // Error handled in auth module
            }
        });
    }
    
    // Forgot password form
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = forgotPasswordForm.querySelector('input[type="email"]').value;
            
            try {
                await resetPassword(email);
                forgotPasswordForm.reset();
                showNotification('⚠️ IMPORTANTE: Revisa tu carpeta de SPAM/correo no deseado', 'warning', 8000);
            } catch (error) {
                // Error handled in auth module
            }
        });
    }
}

/**
 * Setup navigation
 */
function setupNavigation() {
    // Navigation links
    document.querySelectorAll('[data-nav]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.dataset.nav;
            navigateTo(target);
        });
    });
    
    // Auth navigation
    const loginNavLink = document.getElementById('loginNavLink');
    const registerNavLink = document.getElementById('registerNavLink');
    const logoutNavLink = document.getElementById('logoutNavLink');
    
    if (loginNavLink) {
        loginNavLink.addEventListener('click', (e) => {
            e.preventDefault();
            showAuthModal('login');
        });
    }
    
    if (registerNavLink) {
        registerNavLink.addEventListener('click', (e) => {
            e.preventDefault();
            showAuthModal('register');
        });
    }
    
    if (logoutNavLink) {
        logoutNavLink.addEventListener('click', async (e) => {
            e.preventDefault();
            await logoutUser();
        });
    }
}

/**
 * Navigate to section
 */
function navigateTo(section) {
    // Hide all sections
    document.querySelectorAll('.main-section').forEach(sec => {
        sec.classList.add('hidden');
    });
    
    // Show target section
    const targetSection = document.getElementById(section);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        
        // Load section-specific content
        switch(section) {
            case 'myCardsSection':
                if (currentUser) {
                    loadMyCollection(currentUser.uid);
                }
                break;
            case 'profileSection':
                if (currentUser) {
                    loadProfileData();
                }
                break;
            case 'interchangesSection':
                if (currentUser) {
                    loadTradesData();
                }
                break;
        }
    }
}

/**
 * Perform search
 */
async function performSearch(query) {
    const results = await searchCards(query);
    displaySearchResults(results);
}

/**
 * Display search results
 */
function displaySearchResults(cards) {
    const container = document.getElementById('cardsContainer');
    if (!container) return;
    
    if (currentView === 'grid') {
        renderCardsInGrid(cards, container);
    } else {
        renderCardsInList(cards, container);
    }
    
    // Show search results section
    navigateTo('searchResults');
}

/**
 * Update view buttons
 */
function updateViewButtons() {
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    
    if (currentView === 'grid') {
        gridViewBtn?.classList.add('bg-orange-500', 'text-white');
        gridViewBtn?.classList.remove('bg-gray-200', 'text-gray-700');
        listViewBtn?.classList.remove('bg-orange-500', 'text-white');
        listViewBtn?.classList.add('bg-gray-200', 'text-gray-700');
    } else {
        listViewBtn?.classList.add('bg-orange-500', 'text-white');
        listViewBtn?.classList.remove('bg-gray-200', 'text-gray-700');
        gridViewBtn?.classList.remove('bg-orange-500', 'text-white');
        gridViewBtn?.classList.add('bg-gray-200', 'text-gray-700');
    }
}

/**
 * Re-render search results with current view
 */
function reRenderSearchResults() {
    // Implementation depends on stored search results
    // This would re-render the current results in the new view mode
}

/**
 * Update UI for authenticated user
 */
function updateUIForAuthenticatedUser(user) {
    // Update navigation
    document.getElementById('loginNavLink')?.classList.add('hidden');
    document.getElementById('registerNavLink')?.classList.add('hidden');
    document.getElementById('profileNavLink')?.classList.remove('hidden');
    document.getElementById('logoutNavLink')?.classList.remove('hidden');
    
    // Update user display
    const userDisplay = document.getElementById('userDisplay');
    if (userDisplay) {
        userDisplay.textContent = user.username || user.email;
    }
}

/**
 * Update UI for unauthenticated user
 */
function updateUIForUnauthenticatedUser() {
    // Update navigation
    document.getElementById('loginNavLink')?.classList.remove('hidden');
    document.getElementById('registerNavLink')?.classList.remove('hidden');
    document.getElementById('profileNavLink')?.classList.add('hidden');
    document.getElementById('logoutNavLink')?.classList.add('hidden');
    
    // Clear user display
    const userDisplay = document.getElementById('userDisplay');
    if (userDisplay) {
        userDisplay.textContent = '';
    }
}

/**
 * Load initial content
 */
function loadInitialContent() {
    // Show hero section by default
    navigateTo('heroSection');
}

/**
 * Load profile data (placeholder)
 */
async function loadProfileData() {
    // This would be implemented in profile module
    console.log('Loading profile data...');
}

/**
 * Load trades data (placeholder)
 */
async function loadTradesData() {
    // This would be implemented in trades module
    console.log('Loading trades data...');
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Export functions for global access
window.showAuthModal = showAuthModal;
window.addCardDirectly = addCardDirectly;
window.showNotification = showNotification;