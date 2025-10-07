/**
 * Utilidades para manipulación del DOM - Optimizadas
 */

import { UI_CONFIG } from '../constants/config.js';

// Cache de elementos del DOM para mejor performance
const domCache = new Map();

/**
 * Obtiene un elemento del DOM con cache
 */
export function getElement(selector, useCache = true) {
    if (useCache && domCache.has(selector)) {
        return domCache.get(selector);
    }
    
    const element = document.querySelector(selector);
    if (element && useCache) {
        domCache.set(selector, element);
    }
    
    return element;
}

/**
 * Obtiene múltiples elementos del DOM
 */
export function getElements(selector) {
    return document.querySelectorAll(selector);
}

/**
 * Limpia el cache del DOM
 */
export function clearDOMCache() {
    domCache.clear();
}

/**
 * Muestra/oculta el spinner de carga con animación
 */
export function showLoadingSpinner(container = null) {
    const spinner = container ? 
        container.querySelector('.loading-spinner') : 
        getElement('#loadingSpinner');
    
    if (spinner) {
        spinner.style.display = 'block';
        spinner.style.opacity = '0';
        requestAnimationFrame(() => {
            spinner.style.transition = 'opacity 0.3s ease';
            spinner.style.opacity = '1';
        });
    }
}

export function hideLoadingSpinner(container = null) {
    const spinner = container ? 
        container.querySelector('.loading-spinner') : 
        getElement('#loadingSpinner');
    
    if (spinner) {
        spinner.style.transition = 'opacity 0.3s ease';
        spinner.style.opacity = '0';
        setTimeout(() => {
            spinner.style.display = 'none';
        }, 300);
    }
}

/**
 * Muestra secciones específicas y oculta las demás con animación
 */
export function showInitialSections() {
    const sections = {
        hero: getElement('#heroSection'),
        howItWorks: getElement('#howItWorksSection'),
        searchResults: getElement('#searchResultsSection'),
        myCards: getElement('#myCardsSection'),
        profile: getElement('#profileSection'),
        interchanges: getElement('#interchangesSection'),
        help: getElement('#helpSection')
    };

    // Mostrar secciones iniciales con animación
    if (sections.hero) {
        sections.hero.classList.remove('hidden');
        sections.hero.style.opacity = '0';
        requestAnimationFrame(() => {
            sections.hero.style.transition = 'opacity 0.5s ease';
            sections.hero.style.opacity = '1';
        });
    }
    
    if (sections.howItWorks) {
        sections.howItWorks.classList.remove('hidden');
        sections.howItWorks.style.opacity = '0';
        requestAnimationFrame(() => {
            sections.howItWorks.style.transition = 'opacity 0.5s ease';
            sections.howItWorks.style.opacity = '1';
        });
    }

    // Ocultar otras secciones
    Object.entries(sections).forEach(([key, section]) => {
        if (section && key !== 'heroSection' && key !== 'howItWorksSection') {
            section.classList.add('hidden');
        }
    });
}

export function showSearchResults() {
    const sections = {
        hero: getElement('#heroSection'),
        howItWorks: getElement('#howItWorksSection'),
        searchResults: getElement('#searchResultsSection'),
        myCards: getElement('#myCardsSection'),
        profile: getElement('#profileSection'),
        interchanges: getElement('#interchangesSection'),
        help: getElement('#helpSection')
    };

    // Ocultar todas las secciones
    Object.values(sections).forEach(section => {
        if (section) {
            section.classList.add('hidden');
        }
    });

    // Mostrar resultados de búsqueda con animación
    if (sections.searchResults) {
        sections.searchResults.classList.remove('hidden');
        sections.searchResults.style.opacity = '0';
        sections.searchResults.style.transform = 'translateY(20px)';
        requestAnimationFrame(() => {
            sections.searchResults.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            sections.searchResults.style.opacity = '1';
            sections.searchResults.style.transform = 'translateY(0)';
        });
    }
}

export function showMyCardsSection() {
    const sections = {
        hero: getElement('#heroSection'),
        howItWorks: getElement('#howItWorksSection'),
        searchResults: getElement('#searchResultsSection'),
        myCards: getElement('#myCardsSection'),
        profile: getElement('#profileSection'),
        interchanges: getElement('#interchangesSection'),
        help: getElement('#helpSection')
    };

    // Ocultar otras secciones
    Object.values(sections).forEach(section => {
        if (section && section.id !== 'myCardsSection') {
            section.classList.add('hidden');
        }
    });

    // Mostrar sección de mis cartas con animación
    if (sections.myCards) {
        sections.myCards.classList.remove('hidden');
        sections.myCards.style.opacity = '0';
        sections.myCards.style.transform = 'translateY(20px)';
        requestAnimationFrame(() => {
            sections.myCards.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            sections.myCards.style.opacity = '1';
            sections.myCards.style.transform = 'translateY(0)';
        });
    }
}

export function showProfileSection() {
    const sections = {
        hero: getElement('#heroSection'),
        howItWorks: getElement('#howItWorksSection'),
        searchResults: getElement('#searchResultsSection'),
        myCards: getElement('#myCardsSection'),
        profile: getElement('#profileSection'),
        interchanges: getElement('#interchangesSection'),
        help: getElement('#helpSection')
    };

    // Ocultar otras secciones
    Object.values(sections).forEach(section => {
        if (section && section.id !== 'profileSection') {
            section.classList.add('hidden');
        }
    });

    // Mostrar sección de perfil con animación
    if (sections.profile) {
        sections.profile.classList.remove('hidden');
        sections.profile.style.opacity = '0';
        sections.profile.style.transform = 'translateY(20px)';
        requestAnimationFrame(() => {
            sections.profile.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            sections.profile.style.opacity = '1';
            sections.profile.style.transform = 'translateY(0)';
        });
    }
}

export function showInterchangesSection() {
    const sections = {
        hero: getElement('#heroSection'),
        howItWorks: getElement('#howItWorksSection'),
        searchResults: getElement('#searchResultsSection'),
        myCards: getElement('#myCardsSection'),
        profile: getElement('#profileSection'),
        interchanges: getElement('#interchangesSection'),
        help: getElement('#helpSection')
    };

    // Ocultar otras secciones
    Object.values(sections).forEach(section => {
        if (section && section.id !== 'interchangesSection') {
            section.classList.add('hidden');
        }
    });

    // Mostrar sección de intercambios con animación
    if (sections.interchanges) {
        sections.interchanges.classList.remove('hidden');
        sections.interchanges.style.opacity = '0';
        sections.interchanges.style.transform = 'translateY(20px)';
        requestAnimationFrame(() => {
            sections.interchanges.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            sections.interchanges.style.opacity = '1';
            sections.interchanges.style.transform = 'translateY(0)';
        });
    }
}

export function showHelpSection() {
    const sections = {
        hero: getElement('#heroSection'),
        howItWorks: getElement('#howItWorksSection'),
        searchResults: getElement('#searchResultsSection'),
        myCards: getElement('#myCardsSection'),
        profile: getElement('#profileSection'),
        interchanges: getElement('#interchangesSection'),
        help: getElement('#helpSection')
    };

    // Ocultar otras secciones
    Object.values(sections).forEach(section => {
        if (section && section.id !== 'helpSection') {
            section.classList.add('hidden');
        }
    });

    // Mostrar sección de ayuda con animación
    if (sections.help) {
        sections.help.classList.remove('hidden');
        sections.help.style.opacity = '0';
        sections.help.style.transform = 'translateY(20px)';
        requestAnimationFrame(() => {
            sections.help.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            sections.help.style.opacity = '1';
            sections.help.style.transform = 'translateY(0)';
        });
    }
}

/**
 * Obtiene referencias a elementos del DOM con cache
 */
export function getDOMElements() {
    return {
        // Elementos de búsqueda
        searchInput: getElement('#searchInput'),
        searchResultsSection: getElement('#searchResultsSection'),
        cardsContainer: getElement('#cardsContainer'),
        loadingSpinner: getElement('#loadingSpinner'),
        noResultsMessage: getElement('#noResultsMessage'),
        errorMessage: getElement('#errorMessage'),
        
        // Elementos de autenticación
        authModal: getElement('#authModal'),
        loginForm: getElement('#loginForm'),
        registerForm: getElement('#registerForm'),
        loginEmailInput: getElement('#loginEmail'),
        loginPasswordInput: getElement('#loginPassword'),
        loginBtn: getElement('#loginBtn'),
        loginError: getElement('#loginError'),
        registerEmailInput: getElement('#registerEmail'),
        registerPasswordInput: getElement('#registerPassword'),
        confirmPasswordInput: getElement('#confirmPassword'),
        registerBtn: getElement('#registerBtn'),
        registerError: getElement('#registerError'),
        closeAuthModalBtn: getElement('#closeAuthModal'),
        toggleToRegister: getElement('#toggleToRegister'),
        toggleToLogin: getElement('#toggleToLogin'),
        
        // Elementos de navegación
        loginNavLink: getElement('#loginNavLink'),
        registerNavLink: getElement('#registerNavLink'),
        profileNavLink: getElement('#profileNavLink'),
        logoutNavLink: getElement('#logoutNavLink'),
        myCardsNavLink: getElement('#myCardsNavLink'),
        myCardsLink: getElement('#myCardsLink'),
        
        // Elementos de secciones
        heroSection: getElement('#heroSection'),
        howItWorksSection: getElement('#howItWorksSection'),
        myCardsSection: getElement('#myCardsSection'),
        myCardsContainer: getElement('#myCardsContainer'),
        noMyCardsMessage: getElement('#noMyCardsMessage'),
        myCardsErrorMessage: getElement('#myCardsErrorMessage'),
        profileSection: getElement('#profileSection'),
        interchangesSection: getElement('#interchangesSection'),
        helpSection: getElement('#helpSection'),
        
        // Elementos de filtros
        seriesFilter: getElement('#seriesFilter'),
        setFilter: getElement('#setFilter'),
        languageFilter: getElement('#languageFilter'),
        applyFiltersBtn: getElement('#applyFiltersBtn'),
        showAllSetCardsToggle: getElement('#showAllSetCardsToggle'),
        
        // Elementos de perfil
        profileSidebarLinks: getElements('.profile-sidebar-link'),
        profileGeneralInfo: getElement('#profileGeneralInfo'),
        profileMyCardsTabContent: getElement('#profileMyCardsTabContent'),
        profileTradeHistory: getElement('#profileTradeHistory'),
        profileSettings: getElement('#profileSettings'),
        profileEmailDisplay: getElement('#profileEmailDisplay'),
        profileUidDisplay: getElement('#profileUidDisplay'),
        profileMemberSince: getElement('#profileMemberSince'),
        profileLoginRequiredMessage: getElement('#profileLoginRequiredMessage'),
        profileGeneralInfoContent: getElement('#profileGeneralInfoContent'),
        profileNameInput: getElement('#profileName'),
        profileLastNameInput: getElement('#profileLastName'),
        profileAddressInput: getElement('#profileAddress'),
        profilePhoneInput: getElement('#profilePhone'),
        profileSaveMessage: getElement('#profileSaveMessage'),
        saveProfileBtn: getElement('#saveProfileBtn'),
        
        // Elementos de configuración
        settingsNewEmailInput: getElement('#settingsNewEmail'),
        emailChangeMessage: getElement('#emailChangeMessage'),
        saveEmailBtn: getElement('#saveEmailBtn'),
        settingsCurrentPasswordInput: getElement('#settingsCurrentPassword'),
        settingsNewPasswordInput: getElement('#settingsNewPassword'),
        settingsConfirmNewPasswordInput: getElement('#settingsConfirmNewPassword'),
        passwordChangeMessage: getElement('#passwordChangeMessage'),
        savePasswordBtn: getElement('#savePasswordBtn'),
        
        // Otros elementos
        darkModeToggle: getElement('#darkModeToggle')
    };
}

/**
 * Debounce function para optimizar búsquedas
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function para optimizar eventos
 */
export function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Intersection Observer para lazy loading
 */
export function createIntersectionObserver(callback, options = {}) {
    const defaultOptions = {
        root: null,
        rootMargin: '50px',
        threshold: 0.1,
        ...options
    };
    
    return new IntersectionObserver(callback, defaultOptions);
}

/**
 * Scroll suave a un elemento
 */
export function smoothScrollTo(element, offset = 0) {
    if (!element) return;
    
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}