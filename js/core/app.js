/**
 * Aplicación principal TCGtrade - Optimizada
 */

import { getDOMElements, showInitialSections, showSearchResults, showMyCardsSection, showProfileSection, showInterchangesSection, showHelpSection, debounce, throttle } from '../utils/dom-utils.js';
import { validateEmail, validatePassword, validateUsername, validateProfileData, validateSearchQuery } from '../utils/validation.js';
import { showSuccess, showError, showWarning, showInfo } from '../utils/notifications.js';
import { UI_CONFIG, PERFORMANCE_CONFIG } from '../constants/config.js';
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
        this.isInitialized = false;
        this.performanceMetrics = {
            startTime: Date.now(),
            renderCount: 0,
            searchCount: 0
        };
    }

    /**
     * Inicializa la aplicación con optimizaciones
     */
    async initialize() {
        try {
            console.log('🚀 Inicializando TCGtrade App Optimizada...');
            
            // Inicializar Firebase
            await firebaseService.initialize();
            
            // Obtener referencias del DOM
            this.elements = getDOMElements();
            
            // Inicializar módulos de UI
            cardDisplay.initialize(this.elements);
            
            // Configurar event listeners optimizados
            this.setupEventListeners();
            
            // Cargar datos iniciales en paralelo
            await this.loadInitialData();
            
            // Mostrar sección inicial
            showInitialSections();
            
            this.isInitialized = true;
            this.performanceMetrics.initializationTime = Date.now() - this.performanceMetrics.startTime;
            
            console.log(`✅ TCGtrade App inicializada en ${this.performanceMetrics.initializationTime}ms`);
        } catch (error) {
            console.error('❌ Error al inicializar la aplicación:', error);
            showError('Error al inicializar la aplicación');
        }
    }

    /**
     * Configura todos los event listeners con optimizaciones
     */
    setupEventListeners() {
        // Búsqueda de cartas con debounce optimizado
        if (this.elements.searchInput) {
            const debouncedSearch = debounce((query) => {
                this.handleSearch(query);
            }, UI_CONFIG.SEARCH_DEBOUNCE_DELAY);
            
            this.elements.searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });
        }

        // Navegación con throttle para mejor performance
        this.setupNavigationListeners();
        
        // Autenticación
        this.setupAuthListeners();
        
        // Perfil
        this.setupProfileListeners();
        
        // Filtros
        this.setupFilterListeners();
        
        // Scroll optimizado
        this.setupScrollListeners();
    }

    /**
     * Configura listeners de navegación optimizados
     */
    setupNavigationListeners() {
        // Enlaces de navegación con throttle
        const navLinks = {
            'myCardsLink': throttle(() => this.showMyCards(), 300),
            'profileLink': throttle(() => this.showProfile(), 300),
            'interchangesLink': throttle(() => this.showInterchanges(), 300),
            'helpLink': throttle(() => this.showHelp(), 300),
            'loginNavLink': throttle(() => this.showAuthModal('login'), 300),
            'registerNavLink': throttle(() => this.showAuthModal('register'), 300),
            'logoutNavLink': throttle(() => this.logout(), 300)
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
     * Configura listeners de scroll optimizados
     */
    setupScrollListeners() {
        let scrollTimeout;
        
        window.addEventListener('scroll', () => {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            
            scrollTimeout = setTimeout(() => {
                this.handleScroll();
            }, 100);
        });
    }

    /**
     * Maneja el scroll para lazy loading y otras optimizaciones
     */
    handleScroll() {
        // Implementar lazy loading si es necesario
        if (PERFORMANCE_CONFIG.ENABLE_LAZY_LOADING) {
            this.handleLazyLoading();
        }
    }

    /**
     * Maneja el lazy loading de elementos
     */
    handleLazyLoading() {
        // Implementar lazy loading de imágenes y otros elementos
        const lazyElements = document.querySelectorAll('[data-lazy]');
        lazyElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            if (rect.top < window.innerHeight + UI_CONFIG.LAZY_LOAD_THRESHOLD) {
                this.loadLazyElement(element);
            }
        });
    }

    /**
     * Carga un elemento lazy
     */
    loadLazyElement(element) {
        const src = element.dataset.src;
        if (src) {
            element.src = src;
            element.removeAttribute('data-lazy');
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
        // Guardar perfil con debounce
        if (this.elements.saveProfileBtn) {
            const debouncedSave = debounce(() => {
                this.saveProfile();
            }, 500);
            
            this.elements.saveProfileBtn.addEventListener('click', debouncedSave);
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
     * Carga datos iniciales con optimizaciones
     */
    async loadInitialData() {
        try {
            // Cargar datos en paralelo para mejor performance
            const [setsResult, userCardsResult] = await Promise.allSettled([
                this.loadSets(),
                this.loadUserCardsIfAuthenticated()
            ]);

            // Procesar resultados
            if (setsResult.status === 'fulfilled' && setsResult.value.success) {
                this.allSets = setsResult.value.sets;
                this.populateSetFilter();
            }

            if (userCardsResult.status === 'fulfilled') {
                this.userCardsCache = userCardsResult.value || [];
            }

            // Prefetch de datos adicionales si es necesario
            if (PERFORMANCE_CONFIG.ENABLE_PREFETCH) {
                this.prefetchAdditionalData();
            }
        } catch (error) {
            console.error('❌ Error al cargar datos iniciales:', error);
        }
    }

    /**
     * Carga sets de Pokémon
     */
    async loadSets() {
        return await pokemonAPIService.getAllSets();
    }

    /**
     * Carga cartas del usuario si está autenticado
     */
    async loadUserCardsIfAuthenticated() {
        if (firebaseService.isAuthenticated()) {
            const result = await firebaseService.getUserCards();
            return result.success ? result.cards : [];
        }
        return [];
    }

    /**
     * Prefetch de datos adicionales
     */
    async prefetchAdditionalData() {
        // Prefetch en background
        setTimeout(async () => {
            try {
                await pokemonAPIService.prefetchData();
            } catch (error) {
                console.log('ℹ️ Prefetch falló (no crítico):', error);
            }
        }, 2000);
    }

    /**
     * Maneja la búsqueda de cartas con optimizaciones
     */
    async handleSearch(query) {
        // Validar query
        const validation = validateSearchQuery(query);
        if (!validation.valid) {
            if (query.length > 0) {
                showError(validation.message);
            }
            cardDisplay.clear();
            return;
        }

        try {
            this.performanceMetrics.searchCount++;
            cardDisplay.showLoading();
            
            const result = await pokemonAPIService.searchCardsDebounced(validation.query);
            
            if (result.success) {
                this.performanceMetrics.renderCount++;
                await cardDisplay.renderCards(result.cards);
            } else {
                cardDisplay.showError(result.error);
            }
        } catch (error) {
            console.error('❌ Error en búsqueda:', error);
            cardDisplay.showError('Error al buscar cartas');
        }
    }

    /**
     * Maneja el login con optimizaciones
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
     * Maneja el registro con optimizaciones
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
        this.elements.authModal.style.opacity = '0';
        
        requestAnimationFrame(() => {
            this.elements.authModal.style.transition = 'opacity 0.3s ease';
            this.elements.authModal.style.opacity = '1';
        });
        
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
            this.elements.authModal.style.transition = 'opacity 0.3s ease';
            this.elements.authModal.style.opacity = '0';
            setTimeout(() => {
                this.elements.authModal.style.display = 'none';
            }, 300);
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
            this.elements.loginError.style.opacity = '0';
            requestAnimationFrame(() => {
                this.elements.loginError.style.transition = 'opacity 0.3s ease';
                this.elements.loginError.style.opacity = '1';
            });
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
            this.elements.registerError.style.opacity = '0';
            requestAnimationFrame(() => {
                this.elements.registerError.style.transition = 'opacity 0.3s ease';
                this.elements.registerError.style.opacity = '1';
            });
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
                await cardDisplay.renderCards(result.cards);
            } else {
                cardDisplay.showError(result.error);
            }
        } catch (error) {
            console.error('❌ Error al aplicar filtros:', error);
            cardDisplay.showError('Error al aplicar filtros');
        }
    }

    /**
     * Obtiene métricas de performance
     */
    getPerformanceMetrics() {
        return {
            ...this.performanceMetrics,
            currentTime: Date.now(),
            uptime: Date.now() - this.performanceMetrics.startTime,
            isInitialized: this.isInitialized
        };
    }

    /**
     * Destruye la aplicación y limpia recursos
     */
    destroy() {
        cardDisplay.destroy();
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
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