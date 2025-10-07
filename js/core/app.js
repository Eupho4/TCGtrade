/**
 * Aplicación principal TCGtrade - Refactorizada
 */

import { getDOMElements, showInitialSections, showSearchResults, showMyCardsSection, showProfileSection, showInterchangesSection, showHelpSection } from '../utils/dom-utils.js';
import { validateEmail, validatePassword, validateUsername, validateProfileData } from '../utils/validation.js';
import { showSuccess, showError, showWarning, showInfo } from '../utils/notifications.js';
import firebaseService from '../services/firebase-service.js';
import pokemonAPIService from '../services/pokemon-api-service.js';
import cardDisplay from '../ui/card-display.js';

class TCGtradeApp {
    constructor() {
        this.elements = null;
        this.currentUser = null;
        this.userCardsCache = [];
        this.allSets = [];
        this.searchTimeout = null;
    }

    /**
     * Inicializa la aplicación
     */
    async initialize() {
        try {
            console.log('🚀 Inicializando TCGtrade App...');
            
            // Inicializar Firebase
            firebaseService.initialize();
            
            // Obtener referencias del DOM
            this.elements = getDOMElements();
            
            // Inicializar módulos de UI
            cardDisplay.initialize(this.elements);
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Cargar datos iniciales
            await this.loadInitialData();
            
            // Mostrar sección inicial
            showInitialSections();
            
            console.log('✅ TCGtrade App inicializada correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar la aplicación:', error);
            showError('Error al inicializar la aplicación');
        }
    }

    /**
     * Configura todos los event listeners
     */
    setupEventListeners() {
        // Búsqueda de cartas
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Navegación
        this.setupNavigationListeners();
        
        // Autenticación
        this.setupAuthListeners();
        
        // Perfil
        this.setupProfileListeners();
        
        // Filtros
        this.setupFilterListeners();
    }

    /**
     * Configura listeners de navegación
     */
    setupNavigationListeners() {
        // Enlaces de navegación
        const navLinks = {
            'myCardsLink': () => this.showMyCards(),
            'profileLink': () => this.showProfile(),
            'interchangesLink': () => this.showInterchanges(),
            'helpLink': () => this.showHelp(),
            'loginNavLink': () => this.showAuthModal('login'),
            'registerNavLink': () => this.showAuthModal('register'),
            'logoutNavLink': () => this.logout()
        };

        Object.entries(navLinks).forEach(([id, handler]) => {
            const element = this.elements[id];
            if (element) {
                element.addEventListener('click', handler);
            }
        });

        // Botón principal
        const mainButton = document.getElementById('mainButton');
        if (mainButton) {
            mainButton.addEventListener('click', () => {
                this.elements.searchInput?.focus();
            });
        }
    }

    /**
     * Configura listeners de autenticación
     */
    setupAuthListeners() {
        // Formulario de login
        if (this.elements.loginForm) {
            this.elements.loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Formulario de registro
        if (this.elements.registerForm) {
            this.elements.registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }

        // Botones del modal
        if (this.elements.closeAuthModalBtn) {
            this.elements.closeAuthModalBtn.addEventListener('click', () => {
                this.hideAuthModal();
            });
        }

        if (this.elements.toggleToRegister) {
            this.elements.toggleToRegister.addEventListener('click', () => {
                this.showAuthModal('register');
            });
        }

        if (this.elements.toggleToLogin) {
            this.elements.toggleToLogin.addEventListener('click', () => {
                this.showAuthModal('login');
            });
        }
    }

    /**
     * Configura listeners del perfil
     */
    setupProfileListeners() {
        // Guardar perfil
        if (this.elements.saveProfileBtn) {
            this.elements.saveProfileBtn.addEventListener('click', () => {
                this.saveProfile();
            });
        }

        // Cambiar email
        if (this.elements.saveEmailBtn) {
            this.elements.saveEmailBtn.addEventListener('click', () => {
                this.changeEmail();
            });
        }

        // Cambiar contraseña
        if (this.elements.savePasswordBtn) {
            this.elements.savePasswordBtn.addEventListener('click', () => {
                this.changePassword();
            });
        }

        // Pestañas del perfil
        if (this.elements.profileSidebarLinks) {
            this.elements.profileSidebarLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const tabName = link.getAttribute('data-tab');
                    this.switchProfileTab(tabName);
                });
            });
        }
    }

    /**
     * Configura listeners de filtros
     */
    setupFilterListeners() {
        if (this.elements.applyFiltersBtn) {
            this.elements.applyFiltersBtn.addEventListener('click', () => {
                this.applyFilters();
            });
        }
    }

    /**
     * Carga datos iniciales
     */
    async loadInitialData() {
        try {
            // Cargar sets de Pokémon
            const setsResult = await pokemonAPIService.getAllSets();
            if (setsResult.success) {
                this.allSets = setsResult.sets;
                this.populateSetFilter();
            }

            // Cargar colección del usuario si está autenticado
            if (firebaseService.isAuthenticated()) {
                await this.loadUserCards();
            }
        } catch (error) {
            console.error('❌ Error al cargar datos iniciales:', error);
        }
    }

    /**
     * Maneja la búsqueda de cartas
     */
    async handleSearch(query) {
        if (!query || query.trim().length < 2) {
            cardDisplay.clear();
            return;
        }

        try {
            cardDisplay.showLoading();
            
            const result = await pokemonAPIService.searchCardsDebounced(query.trim());
            
            if (result.success) {
                cardDisplay.renderCards(result.cards);
            } else {
                cardDisplay.showError(result.error);
            }
        } catch (error) {
            console.error('❌ Error en búsqueda:', error);
            cardDisplay.showError('Error al buscar cartas');
        }
    }

    /**
     * Maneja el login
     */
    async handleLogin() {
        const email = this.elements.loginEmailInput?.value;
        const password = this.elements.loginPasswordInput?.value;

        // Validar datos
        const emailValidation = validateEmail(email);
        if (!emailValidation.valid) {
            this.showLoginError(emailValidation.message);
            return;
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            this.showLoginError(passwordValidation.message);
            return;
        }

        // Intentar login
        const result = await firebaseService.loginUser(email, password);
        
        if (result.success) {
            this.hideAuthModal();
            this.updateAuthUI();
            await this.loadUserCards();
        } else {
            this.showLoginError(result.error);
        }
    }

    /**
     * Maneja el registro
     */
    async handleRegister() {
        const email = this.elements.registerEmailInput?.value;
        const password = this.elements.registerPasswordInput?.value;
        const confirmPassword = this.elements.confirmPasswordInput?.value;
        const username = document.getElementById('registerUsername')?.value;

        // Validar datos
        const emailValidation = validateEmail(email);
        if (!emailValidation.valid) {
            this.showRegisterError(emailValidation.message);
            return;
        }

        const passwordValidation = validatePassword(password, confirmPassword);
        if (!passwordValidation.valid) {
            this.showRegisterError(passwordValidation.message);
            return;
        }

        const usernameValidation = validateUsername(username);
        if (!usernameValidation.valid) {
            this.showRegisterError(usernameValidation.message);
            return;
        }

        // Intentar registro
        const userData = {
            name: username,
            lastName: '',
            address: '',
            birthDate: ''
        };

        const result = await firebaseService.registerUser(email, password, userData);
        
        if (result.success) {
            this.hideAuthModal();
            this.updateAuthUI();
            await this.loadUserCards();
        } else {
            this.showRegisterError(result.error);
        }
    }

    /**
     * Muestra el modal de autenticación
     */
    showAuthModal(type) {
        if (!this.elements.authModal) return;

        this.elements.authModal.style.display = 'flex';
        
        if (type === 'login') {
            this.elements.loginForm.style.display = 'block';
            this.elements.registerForm.style.display = 'none';
        } else {
            this.elements.loginForm.style.display = 'none';
            this.elements.registerForm.style.display = 'block';
        }
    }

    /**
     * Oculta el modal de autenticación
     */
    hideAuthModal() {
        if (this.elements.authModal) {
            this.elements.authModal.style.display = 'none';
        }
        this.clearAuthForms();
    }

    /**
     * Limpia los formularios de autenticación
     */
    clearAuthForms() {
        if (this.elements.loginForm) this.elements.loginForm.reset();
        if (this.elements.registerForm) this.elements.registerForm.reset();
        this.hideLoginError();
        this.hideRegisterError();
    }

    /**
     * Muestra error de login
     */
    showLoginError(message) {
        if (this.elements.loginError) {
            this.elements.loginError.textContent = message;
            this.elements.loginError.style.display = 'block';
        }
    }

    /**
     * Oculta error de login
     */
    hideLoginError() {
        if (this.elements.loginError) {
            this.elements.loginError.style.display = 'none';
        }
    }

    /**
     * Muestra error de registro
     */
    showRegisterError(message) {
        if (this.elements.registerError) {
            this.elements.registerError.textContent = message;
            this.elements.registerError.style.display = 'block';
        }
    }

    /**
     * Oculta error de registro
     */
    hideRegisterError() {
        if (this.elements.registerError) {
            this.elements.registerError.style.display = 'none';
        }
    }

    /**
     * Actualiza la UI de autenticación
     */
    updateAuthUI() {
        const isAuthenticated = firebaseService.isAuthenticated();
        
        // Mostrar/ocultar elementos según el estado de autenticación
        const authElements = {
            'loginNavLink': !isAuthenticated,
            'registerNavLink': !isAuthenticated,
            'profileNavLink': isAuthenticated,
            'logoutNavLink': isAuthenticated,
            'myCardsNavLink': isAuthenticated
        };

        Object.entries(authElements).forEach(([id, shouldShow]) => {
            const element = this.elements[id];
            if (element) {
                element.style.display = shouldShow ? 'block' : 'none';
            }
        });
    }

    /**
     * Cierra sesión
     */
    async logout() {
        await firebaseService.logoutUser();
        this.updateAuthUI();
        this.userCardsCache = [];
        showInitialSections();
    }

    /**
     * Carga las cartas del usuario
     */
    async loadUserCards() {
        if (!firebaseService.isAuthenticated()) return;

        try {
            const result = await firebaseService.getUserCards();
            if (result.success) {
                this.userCardsCache = result.cards;
                this.updateMyCardsDisplay();
            }
        } catch (error) {
            console.error('❌ Error al cargar cartas del usuario:', error);
        }
    }

    /**
     * Actualiza la visualización de "Mis Cartas"
     */
    updateMyCardsDisplay() {
        if (!this.elements.myCardsContainer) return;

        if (this.userCardsCache.length === 0) {
            if (this.elements.noMyCardsMessage) {
                this.elements.noMyCardsMessage.style.display = 'block';
            }
            if (this.elements.myCardsContainer) {
                this.elements.myCardsContainer.innerHTML = '';
            }
        } else {
            if (this.elements.noMyCardsMessage) {
                this.elements.noMyCardsMessage.style.display = 'none';
            }
            cardDisplay.renderCards(this.userCardsCache, { hideAddButton: true });
        }
    }

    /**
     * Muestra la sección "Mis Cartas"
     */
    showMyCards() {
        if (!firebaseService.isAuthenticated()) {
            showError('Debes iniciar sesión para ver tu colección');
            return;
        }

        showMyCardsSection();
        this.updateMyCardsDisplay();
    }

    /**
     * Muestra la sección de perfil
     */
    showProfile() {
        if (!firebaseService.isAuthenticated()) {
            showError('Debes iniciar sesión para acceder al perfil');
            return;
        }

        showProfileSection();
        this.loadProfileData();
    }

    /**
     * Muestra la sección de intercambios
     */
    showInterchanges() {
        showInterchangesSection();
    }

    /**
     * Muestra la sección de ayuda
     */
    showHelp() {
        showHelpSection();
    }

    /**
     * Carga datos del perfil
     */
    async loadProfileData() {
        if (!firebaseService.isAuthenticated()) return;

        try {
            const result = await firebaseService.loadUserData(firebaseService.getCurrentUser().uid);
            if (result.success && result.data) {
                this.populateProfileForm(result.data);
            }
        } catch (error) {
            console.error('❌ Error al cargar datos del perfil:', error);
        }
    }

    /**
     * Llena el formulario del perfil con datos
     */
    populateProfileForm(userData) {
        if (this.elements.profileNameInput) {
            this.elements.profileNameInput.value = userData.name || '';
        }
        if (this.elements.profileLastNameInput) {
            this.elements.profileLastNameInput.value = userData.lastName || '';
        }
        if (this.elements.profileAddressInput) {
            this.elements.profileAddressInput.value = userData.address || '';
        }
        if (this.elements.profilePhoneInput) {
            this.elements.profilePhoneInput.value = userData.phone || '';
        }
        if (this.elements.profileEmailDisplay) {
            this.elements.profileEmailDisplay.textContent = userData.email || '';
        }
    }

    /**
     * Guarda el perfil
     */
    async saveProfile() {
        if (!firebaseService.isAuthenticated()) return;

        const profileData = {
            name: this.elements.profileNameInput?.value || '',
            lastName: this.elements.profileLastNameInput?.value || '',
            address: this.elements.profileAddressInput?.value || '',
            phone: this.elements.profilePhoneInput?.value || ''
        };

        const validation = validateProfileData(profileData);
        if (!validation.valid) {
            showError('Por favor corrige los errores en el formulario');
            return;
        }

        const result = await firebaseService.updateUserData(profileData);
        if (result.success) {
            showSuccess('Perfil actualizado correctamente');
        }
    }

    /**
     * Cambia el email
     */
    async changeEmail() {
        const newEmail = this.elements.settingsNewEmailInput?.value;
        
        if (!newEmail) {
            showError('El nuevo email es requerido');
            return;
        }

        const validation = validateEmail(newEmail);
        if (!validation.valid) {
            showError(validation.message);
            return;
        }

        const result = await firebaseService.changeEmail(newEmail);
        if (result.success) {
            this.elements.settingsNewEmailInput.value = '';
        }
    }

    /**
     * Cambia la contraseña
     */
    async changePassword() {
        const currentPassword = this.elements.settingsCurrentPasswordInput?.value;
        const newPassword = this.elements.settingsNewPasswordInput?.value;
        const confirmPassword = this.elements.settingsConfirmNewPasswordInput?.value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            showError('Todos los campos son requeridos');
            return;
        }

        const validation = validatePassword(newPassword, confirmPassword);
        if (!validation.valid) {
            showError(validation.message);
            return;
        }

        const result = await firebaseService.changePassword(currentPassword, newPassword);
        if (result.success) {
            this.elements.settingsCurrentPasswordInput.value = '';
            this.elements.settingsNewPasswordInput.value = '';
            this.elements.settingsConfirmNewPasswordInput.value = '';
        }
    }

    /**
     * Cambia de pestaña en el perfil
     */
    switchProfileTab(tabName) {
        // Ocultar todas las pestañas
        const tabs = ['profileGeneralInfo', 'profileMyCardsTabContent', 'profileTradeHistory', 'profileSettings'];
        tabs.forEach(tabId => {
            const tab = document.getElementById(tabId);
            if (tab) tab.style.display = 'none';
        });

        // Mostrar pestaña seleccionada
        const selectedTab = document.getElementById(tabName);
        if (selectedTab) {
            selectedTab.style.display = 'block';
        }

        // Actualizar enlaces activos
        if (this.elements.profileSidebarLinks) {
            this.elements.profileSidebarLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-tab') === tabName) {
                    link.classList.add('active');
                }
            });
        }
    }

    /**
     * Pobla el filtro de sets
     */
    populateSetFilter() {
        if (!this.elements.setFilter || !this.allSets.length) return;

        this.elements.setFilter.innerHTML = '<option value="">Todos los sets</option>';
        this.allSets.forEach(set => {
            const option = document.createElement('option');
            option.value = set.id;
            option.textContent = set.name;
            this.elements.setFilter.appendChild(option);
        });
    }

    /**
     * Aplica filtros de búsqueda
     */
    async applyFilters() {
        const query = this.elements.searchInput?.value || '';
        const setFilter = this.elements.setFilter?.value || '';
        const seriesFilter = this.elements.seriesFilter?.value || '';
        const languageFilter = this.elements.languageFilter?.value || '';

        const filters = {};
        if (setFilter) filters.set = setFilter;
        if (seriesFilter) filters.series = seriesFilter;
        if (languageFilter) filters.language = languageFilter;

        try {
            cardDisplay.showLoading();
            const result = await pokemonAPIService.searchCards(query, filters);
            
            if (result.success) {
                cardDisplay.renderCards(result.cards);
            } else {
                cardDisplay.showError(result.error);
            }
        } catch (error) {
            console.error('❌ Error al aplicar filtros:', error);
            cardDisplay.showError('Error al aplicar filtros');
        }
    }
}

// Crear instancia global
const app = new TCGtradeApp();

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.initialize());
} else {
    app.initialize();
}

export default app;