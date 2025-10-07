/**
 * Utilidades para manipulación del DOM
 */

/**
 * Muestra/oculta el spinner de carga
 */
export function showLoadingSpinner() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) loadingSpinner.style.display = 'block';
}

export function hideLoadingSpinner() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) loadingSpinner.style.display = 'none';
}

/**
 * Muestra secciones específicas y oculta las demás
 */
export function showInitialSections() {
    const sections = {
        hero: document.getElementById('heroSection'),
        howItWorks: document.getElementById('howItWorksSection'),
        searchResults: document.getElementById('searchResultsSection'),
        myCards: document.getElementById('myCardsSection'),
        profile: document.getElementById('profileSection'),
        interchanges: document.getElementById('interchangesSection'),
        help: document.getElementById('helpSection')
    };

    // Mostrar secciones iniciales
    if (sections.hero) sections.hero.classList.remove('hidden');
    if (sections.howItWorks) sections.howItWorks.classList.remove('hidden');

    // Ocultar otras secciones
    Object.values(sections).forEach(section => {
        if (section && (section.id === 'heroSection' || section.id === 'howItWorksSection')) return;
        if (section) section.classList.add('hidden');
    });
}

export function showSearchResults() {
    const sections = {
        hero: document.getElementById('heroSection'),
        howItWorks: document.getElementById('howItWorksSection'),
        searchResults: document.getElementById('searchResultsSection'),
        myCards: document.getElementById('myCardsSection'),
        profile: document.getElementById('profileSection'),
        interchanges: document.getElementById('interchangesSection'),
        help: document.getElementById('helpSection')
    };

    // Ocultar todas las secciones
    Object.values(sections).forEach(section => {
        if (section) section.classList.add('hidden');
    });

    // Mostrar resultados de búsqueda
    if (sections.searchResults) sections.searchResults.classList.remove('hidden');
}

export function showMyCardsSection() {
    const sections = {
        hero: document.getElementById('heroSection'),
        howItWorks: document.getElementById('howItWorksSection'),
        searchResults: document.getElementById('searchResultsSection'),
        myCards: document.getElementById('myCardsSection'),
        profile: document.getElementById('profileSection'),
        interchanges: document.getElementById('interchangesSection'),
        help: document.getElementById('helpSection')
    };

    // Ocultar otras secciones
    Object.values(sections).forEach(section => {
        if (section && section.id !== 'myCardsSection') {
            section.classList.add('hidden');
        }
    });

    // Mostrar sección de mis cartas
    if (sections.myCards) sections.myCards.classList.remove('hidden');
}

export function showProfileSection() {
    const sections = {
        hero: document.getElementById('heroSection'),
        howItWorks: document.getElementById('howItWorksSection'),
        searchResults: document.getElementById('searchResultsSection'),
        myCards: document.getElementById('myCardsSection'),
        profile: document.getElementById('profileSection'),
        interchanges: document.getElementById('interchangesSection'),
        help: document.getElementById('helpSection')
    };

    // Ocultar otras secciones
    Object.values(sections).forEach(section => {
        if (section && section.id !== 'profileSection') {
            section.classList.add('hidden');
        }
    });

    // Mostrar sección de perfil
    if (sections.profile) sections.profile.classList.remove('hidden');
}

export function showInterchangesSection() {
    const sections = {
        hero: document.getElementById('heroSection'),
        howItWorks: document.getElementById('howItWorksSection'),
        searchResults: document.getElementById('searchResultsSection'),
        myCards: document.getElementById('myCardsSection'),
        profile: document.getElementById('profileSection'),
        interchanges: document.getElementById('interchangesSection'),
        help: document.getElementById('helpSection')
    };

    // Ocultar otras secciones
    Object.values(sections).forEach(section => {
        if (section && section.id !== 'interchangesSection') {
            section.classList.add('hidden');
        }
    });

    // Mostrar sección de intercambios
    if (sections.interchanges) sections.interchanges.classList.remove('hidden');
}

export function showHelpSection() {
    const sections = {
        hero: document.getElementById('heroSection'),
        howItWorks: document.getElementById('howItWorksSection'),
        searchResults: document.getElementById('searchResultsSection'),
        myCards: document.getElementById('myCardsSection'),
        profile: document.getElementById('profileSection'),
        interchanges: document.getElementById('interchangesSection'),
        help: document.getElementById('helpSection')
    };

    // Ocultar otras secciones
    Object.values(sections).forEach(section => {
        if (section && section.id !== 'helpSection') {
            section.classList.add('hidden');
        }
    });

    // Mostrar sección de ayuda
    if (sections.help) sections.help.classList.remove('hidden');
}

/**
 * Obtiene referencias a elementos del DOM
 */
export function getDOMElements() {
    return {
        // Elementos de búsqueda
        searchInput: document.getElementById('searchInput'),
        searchResultsSection: document.getElementById('searchResultsSection'),
        cardsContainer: document.getElementById('cardsContainer'),
        loadingSpinner: document.getElementById('loadingSpinner'),
        noResultsMessage: document.getElementById('noResultsMessage'),
        errorMessage: document.getElementById('errorMessage'),
        
        // Elementos de autenticación
        authModal: document.getElementById('authModal'),
        loginForm: document.getElementById('loginForm'),
        registerForm: document.getElementById('registerForm'),
        loginEmailInput: document.getElementById('loginEmail'),
        loginPasswordInput: document.getElementById('loginPassword'),
        loginBtn: document.getElementById('loginBtn'),
        loginError: document.getElementById('loginError'),
        registerEmailInput: document.getElementById('registerEmail'),
        registerPasswordInput: document.getElementById('registerPassword'),
        confirmPasswordInput: document.getElementById('confirmPassword'),
        registerBtn: document.getElementById('registerBtn'),
        registerError: document.getElementById('registerError'),
        closeAuthModalBtn: document.getElementById('closeAuthModal'),
        toggleToRegister: document.getElementById('toggleToRegister'),
        toggleToLogin: document.getElementById('toggleToLogin'),
        
        // Elementos de navegación
        loginNavLink: document.getElementById('loginNavLink'),
        registerNavLink: document.getElementById('registerNavLink'),
        profileNavLink: document.getElementById('profileNavLink'),
        logoutNavLink: document.getElementById('logoutNavLink'),
        myCardsNavLink: document.getElementById('myCardsNavLink'),
        myCardsLink: document.getElementById('myCardsLink'),
        
        // Elementos de secciones
        heroSection: document.getElementById('heroSection'),
        howItWorksSection: document.getElementById('howItWorksSection'),
        myCardsSection: document.getElementById('myCardsSection'),
        myCardsContainer: document.getElementById('myCardsContainer'),
        noMyCardsMessage: document.getElementById('noMyCardsMessage'),
        myCardsErrorMessage: document.getElementById('myCardsErrorMessage'),
        profileSection: document.getElementById('profileSection'),
        interchangesSection: document.getElementById('interchangesSection'),
        helpSection: document.getElementById('helpSection'),
        
        // Elementos de filtros
        seriesFilter: document.getElementById('seriesFilter'),
        setFilter: document.getElementById('setFilter'),
        languageFilter: document.getElementById('languageFilter'),
        applyFiltersBtn: document.getElementById('applyFiltersBtn'),
        showAllSetCardsToggle: document.getElementById('showAllSetCardsToggle'),
        
        // Elementos de perfil
        profileSidebarLinks: document.querySelectorAll('.profile-sidebar-link'),
        profileGeneralInfo: document.getElementById('profileGeneralInfo'),
        profileMyCardsTabContent: document.getElementById('profileMyCardsTabContent'),
        profileTradeHistory: document.getElementById('profileTradeHistory'),
        profileSettings: document.getElementById('profileSettings'),
        profileEmailDisplay: document.getElementById('profileEmailDisplay'),
        profileUidDisplay: document.getElementById('profileUidDisplay'),
        profileMemberSince: document.getElementById('profileMemberSince'),
        profileLoginRequiredMessage: document.getElementById('profileLoginRequiredMessage'),
        profileGeneralInfoContent: document.getElementById('profileGeneralInfoContent'),
        profileNameInput: document.getElementById('profileName'),
        profileLastNameInput: document.getElementById('profileLastName'),
        profileAddressInput: document.getElementById('profileAddress'),
        profilePhoneInput: document.getElementById('profilePhone'),
        profileSaveMessage: document.getElementById('profileSaveMessage'),
        saveProfileBtn: document.getElementById('saveProfileBtn'),
        
        // Elementos de configuración
        settingsNewEmailInput: document.getElementById('settingsNewEmail'),
        emailChangeMessage: document.getElementById('emailChangeMessage'),
        saveEmailBtn: document.getElementById('saveEmailBtn'),
        settingsCurrentPasswordInput: document.getElementById('settingsCurrentPassword'),
        settingsNewPasswordInput: document.getElementById('settingsNewPassword'),
        settingsConfirmNewPasswordInput: document.getElementById('settingsConfirmNewPassword'),
        passwordChangeMessage: document.getElementById('passwordChangeMessage'),
        savePasswordBtn: document.getElementById('savePasswordBtn'),
        
        // Otros elementos
        darkModeToggle: document.getElementById('darkModeToggle')
    };
}