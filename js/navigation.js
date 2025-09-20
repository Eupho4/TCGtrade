// TCGtrade - Funciones de Navegación
// JavaScript extraído del HTML para mejor organización

// Funciones de navegación entre secciones
function showInitialSections() {
    // Mostrar las nuevas secciones de la página de inicio
    const howItWorksSection = document.getElementById('howItWorksSection');
    const featuresSection = document.getElementById('featuresSection');
    const ctaSection = document.getElementById('ctaSection');
    
    if (howItWorksSection) howItWorksSection.classList.remove('hidden');
    if (featuresSection) featuresSection.classList.remove('hidden');
    if (ctaSection) ctaSection.classList.remove('hidden');

    // Ocultar otras secciones
    if (searchResultsSection) searchResultsSection.classList.add('hidden');
    if (myCardsSection) myCardsSection.classList.add('hidden');
    if (profileSection) profileSection.classList.add('hidden');
    if (interchangesSection) interchangesSection.classList.add('hidden');
    if (helpSection) helpSection.classList.add('hidden');
    
    // Ocultar también el buzón
    const inboxSection = document.getElementById('inboxSection');
    if (inboxSection) inboxSection.classList.add('hidden');
}

function showSearchResults() {
    // Ocultar secciones iniciales
    hideHomeSections();
    
    // Ocultar otras secciones
    if (myCardsSection) myCardsSection.classList.add('hidden');
    if (profileSection) profileSection.classList.add('hidden');
    if (interchangesSection) interchangesSection.classList.add('hidden');
    if (helpSection) helpSection.classList.add('hidden');
    
    // Ocultar también el buzón
    const inboxSection = document.getElementById('inboxSection');
    if (inboxSection) inboxSection.classList.add('hidden');

    // Mostrar resultados de búsqueda
    if (searchResultsSection) searchResultsSection.classList.remove('hidden');
}

function showInboxSection() {
    // Ocultar otras secciones
    hideHomeSections();
    if (searchResultsSection) searchResultsSection.classList.add('hidden');
    if (myCardsSection) myCardsSection.classList.add('hidden');
    if (profileSection) profileSection.classList.add('hidden');
    if (helpSection) helpSection.classList.add('hidden');
    if (interchangesSection) interchangesSection.classList.add('hidden');
    
    // Mostrar sección del buzón
    const inboxSection = document.getElementById('inboxSection');
    if (inboxSection) {
        inboxSection.classList.remove('hidden');
        
        // Cargar datos del buzón
        if (typeof loadInbox === 'function') {
            loadInbox();
        }
    }
}

function showMyCardsSection() {
    // Ocultar otras secciones
    hideHomeSections();
    if (searchResultsSection) searchResultsSection.classList.add('hidden');
    if (profileSection) profileSection.classList.add('hidden');
    if (interchangesSection) interchangesSection.classList.add('hidden');
    if (helpSection) helpSection.classList.add('hidden');
    
    // Ocultar también el buzón
    const inboxSection = document.getElementById('inboxSection');
    if (inboxSection) inboxSection.classList.add('hidden');

    // Mostrar sección de mis cartas
    if (myCardsSection) myCardsSection.classList.remove('hidden');

    // Cargar colección si hay usuario autenticado
    if (currentUser) {
        if (typeof loadMyCollection === 'function') {
            loadMyCollection(currentUser.uid);
        }
        if (typeof fetchSetsAndPopulateFilter === 'function') {
            fetchSetsAndPopulateFilter(); // Cargar sets para filtros
        }
    } else {
        if (noMyCardsMessage) {
            noMyCardsMessage.textContent = 'Debes iniciar sesión para ver tu colección.';
            noMyCardsMessage.classList.remove('hidden');
        }
    }
}

function showInterchangesSection() {
    // Ocultar otras secciones
    hideHomeSections();
    if (searchResultsSection) searchResultsSection.classList.add('hidden');
    if (myCardsSection) myCardsSection.classList.add('hidden');
    if (profileSection) profileSection.classList.add('hidden');
    if (helpSection) helpSection.classList.add('hidden');
    
    // Ocultar también el buzón
    const inboxSection = document.getElementById('inboxSection');
    if (inboxSection) inboxSection.classList.add('hidden');

    // Mostrar sección de intercambios
    if (interchangesSection) interchangesSection.classList.remove('hidden');

    // Cargar intercambios si hay usuario autenticado
    if (currentUser) {
        if (typeof loadAvailableTrades === 'function') {
            loadAvailableTrades();
        }
    } else {
        // Mostrar mensaje de login si no está autenticado
        const interchangesContainer = document.getElementById('interchangesContainer');
        if (interchangesContainer) {
            interchangesContainer.innerHTML = `
                <div class="text-center text-gray-500 dark:text-gray-400 py-8">
                    <p>Debes iniciar sesión para ver intercambios disponibles</p>
                    <button class="btn-primary mt-4 px-4 py-2 rounded-lg text-sm font-semibold" onclick="showAuthModal('login')">
                        Iniciar Sesión
                    </button>
                </div>
            `;
        }
    }
}

function showHelpSection(tabToShow = null) {
    // Ocultar otras secciones
    hideHomeSections();
    if (searchResultsSection) searchResultsSection.classList.add('hidden');
    if (myCardsSection) myCardsSection.classList.add('hidden');
    if (profileSection) profileSection.classList.add('hidden');
    if (interchangesSection) interchangesSection.classList.add('hidden');
    
    // Ocultar también el buzón
    const inboxSection = document.getElementById('inboxSection');
    if (inboxSection) inboxSection.classList.add('hidden');

    // Mostrar sección de ayuda
    if (helpSection) helpSection.classList.remove('hidden');

    // Inicializar FAQ
    if (typeof initializeFAQ === 'function') {
        initializeFAQ();
    }
    
    // Si se especificó una pestaña, cambiar a ella
    if (tabToShow) {
        // Pequeño delay para asegurar que el DOM esté listo
        setTimeout(() => {
            if (typeof switchHelpTab === 'function') {
                switchHelpTab(tabToShow);
            }
        }, 50);
    }
}

function showProfileSection() {
    // Ocultar otras secciones
    hideHomeSections();
    if (searchResultsSection) searchResultsSection.classList.add('hidden');
    if (myCardsSection) myCardsSection.classList.add('hidden');
    if (interchangesSection) interchangesSection.classList.add('hidden');
    if (helpSection) helpSection.classList.add('hidden');
    
    // Ocultar también el buzón
    const inboxSection = document.getElementById('inboxSection');
    if (inboxSection) inboxSection.classList.add('hidden');

    // Mostrar sección de perfil
    if (profileSection) {
        profileSection.classList.remove('hidden');
        // Cargar datos del usuario y estadísticas
        if (typeof loadProfileData === 'function') {
            loadProfileData();
        }
    } else {
        // Si no existe la sección de perfil, mostrar mensaje
        if (typeof showNotification === 'function') {
            showNotification('Sección de perfil en desarrollo. Por ahora puedes usar "Mis Cartas" para gestionar tu colección.', 'info', 5000);
        }
        showMyCardsSection();
    }
}

// Función para cambiar entre tabs del perfil
function switchProfileTab(tabName) {
    // Ocultar todos los contenidos de tabs
    const tabContents = document.querySelectorAll('.profile-tab-content');
    tabContents.forEach(content => content.classList.add('hidden'));

    // Remover clase active de todos los tabs
    const tabs = document.querySelectorAll('.profile-tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
        tab.classList.remove('border-orange-500', 'text-orange-600');
        tab.classList.add('border-transparent', 'text-gray-500');
    });

    // Mostrar el contenido del tab seleccionado
    let targetContent;
    let targetTab;

    switch(tabName) {
        case 'personal':
            targetContent = document.getElementById('profilePersonalContent');
            targetTab = document.getElementById('profilePersonalTab');
            break;
        case 'dashboard':
            targetContent = document.getElementById('profileDashboardContent');
            targetTab = document.getElementById('profileDashboardTab');
            break;
        case 'collection':
            targetContent = document.getElementById('profileCollectionContent');
            targetTab = document.getElementById('profileCollectionTab');
            break;
        case 'trades':
            targetContent = document.getElementById('profileTradesContent');
            targetTab = document.getElementById('profileTradesTab');
            break;
        case 'settings':
            targetContent = document.getElementById('profileSettingsContent');
            targetTab = document.getElementById('profileSettingsTab');
            break;
        case 'ratings':
            targetContent = document.getElementById('profileRatingsContent');
            targetTab = document.getElementById('profileRatingsTab');
            // Cargar valoraciones al abrir la pestaña
            if (typeof loadRatingsTab === 'function') {
                loadRatingsTab();
            }
            break;
    }

    if (targetContent) {
        targetContent.classList.remove('hidden');
    }

    if (targetTab) {
        targetTab.classList.add('active', 'border-orange-500', 'text-orange-600');
        targetTab.classList.remove('border-transparent', 'text-gray-500');
    }

    // Cargar estadísticas al abrir el Dashboard
    if (tabName === 'dashboard' && typeof loadProfileStats === 'function' && currentUser) {
        try {
            loadProfileStats();
        } catch (e) {
            console.error('Error al cargar estadísticas al abrir Dashboard:', e);
        }
    }

    // Cargar colección al abrir la pestaña Mi Colección
    if (tabName === 'collection' && typeof loadUserCollection === 'function') {
        loadUserCollection();
    }
}

// Exportar funciones para uso global
window.showInitialSections = showInitialSections;
window.showSearchResults = showSearchResults;
window.showInboxSection = showInboxSection;
window.showMyCardsSection = showMyCardsSection;
window.showInterchangesSection = showInterchangesSection;
window.showHelpSection = showHelpSection;
window.showProfileSection = showProfileSection;
window.switchProfileTab = switchProfileTab;

console.log('🚀 Módulo de navegación cargado');