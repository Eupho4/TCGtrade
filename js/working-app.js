// TCGtrade - Aplicación Funcional Completa
// Todo en un solo archivo para evitar problemas de módulos

console.log('🚀 Iniciando aplicación funcional...');

// Variables globales
let currentUser = null;
let auth = null;
let db = null;

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
    
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
        type === 'error' ? 'bg-red-500 text-white' :
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'warning' ? 'bg-yellow-500 text-black' :
        'bg-blue-500 text-white'
    }`;
    
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
                ✕
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Función para mostrar secciones iniciales
function showInitialSections() {
    console.log('🏠 Mostrando secciones iniciales...');
    
    // Mostrar secciones principales
    const mainSections = ['heroSection', 'howItWorksSection', 'featuresSection', 'ctaSection'];
    mainSections.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = 'block';
            el.style.visibility = 'visible';
            el.style.opacity = '1';
            el.classList.remove('hidden');
            console.log(`✅ ${id} mostrada`);
        }
    });
    
    // Ocultar otras secciones
    const hiddenSections = ['searchResultsSection', 'myCardsSection', 'profileSection', 'interchangesSection', 'helpSection', 'inboxSection'];
    hiddenSections.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = 'none';
            el.classList.add('hidden');
        }
    });
}

// Función para mostrar sección específica
function showSection(sectionId) {
    console.log(`📄 Mostrando sección: ${sectionId}`);
    
    // Ocultar todas las secciones
    const allSections = ['heroSection', 'howItWorksSection', 'featuresSection', 'ctaSection', 'searchResultsSection', 'myCardsSection', 'profileSection', 'interchangesSection', 'helpSection', 'inboxSection'];
    allSections.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = 'none';
            el.classList.add('hidden');
        }
    });
    
    // Mostrar la sección solicitada
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.style.visibility = 'visible';
        targetSection.style.opacity = '1';
        targetSection.classList.remove('hidden');
        console.log(`✅ ${sectionId} mostrada`);
    }
}

// Función para inicializar sidebar
function initSidebar() {
    console.log('🍔 Inicializando sidebar...');
    
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (!hamburgerBtn || !sidebar || !sidebarOverlay) {
        console.error('❌ Elementos del sidebar no encontrados');
        return;
    }
    
    function openSidebar() {
        sidebar.classList.add('open');
        sidebarOverlay.classList.add('show');
        hamburgerBtn.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('✅ Sidebar abierto');
    }
    
    function closeSidebar() {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('show');
        hamburgerBtn.classList.remove('active');
        document.body.style.overflow = '';
        console.log('✅ Sidebar cerrado');
    }
    
    // Event listeners
    hamburgerBtn.addEventListener('click', () => {
        if (sidebar.classList.contains('open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });
    
    sidebarOverlay.addEventListener('click', closeSidebar);
    
    // Configurar links del sidebar
    const sidebarLinks = {
        'sidebarHomeLink': () => { closeSidebar(); showInitialSections(); },
        'sidebarMyCardsLink': () => { closeSidebar(); showSection('myCardsSection'); },
        'sidebarInterchangesLink': () => { closeSidebar(); showSection('interchangesSection'); },
        'sidebarProfileLink': () => { closeSidebar(); showSection('profileSection'); },
        'sidebarInboxLink': () => { closeSidebar(); showSection('inboxSection'); },
        'sidebarHelpLink': () => { closeSidebar(); showSection('helpSection'); }
    };
    
    Object.keys(sidebarLinks).forEach(linkId => {
        const link = document.getElementById(linkId);
        if (link) {
            link.addEventListener('click', sidebarLinks[linkId]);
        }
    });
    
    // Hacer funciones globales
    window.openSidebar = openSidebar;
    window.closeSidebar = closeSidebar;
    
    console.log('✅ Sidebar inicializado');
}

// Función para inicializar navegación
function initNavigation() {
    console.log('🧭 Inicializando navegación...');
    
    // Links de navegación principal
    const navLinks = {
        'loginLink': () => showNotification('Funcionalidad de login en desarrollo', 'info'),
        'registerLink': () => showNotification('Funcionalidad de registro en desarrollo', 'info'),
        'profileLink': () => showSection('profileSection'),
        'logoutLink': () => showNotification('Funcionalidad de logout en desarrollo', 'info'),
        'myCardsLink': () => showSection('myCardsSection'),
        'interchangesLink': () => showSection('interchangesSection'),
        'helpLink': () => showSection('helpSection')
    };
    
    Object.keys(navLinks).forEach(linkId => {
        const link = document.getElementById(linkId);
        if (link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navLinks[linkId]();
            });
        }
    });
    
    console.log('✅ Navegación inicializada');
}

// Función para inicializar búsqueda
function initSearch() {
    console.log('🔍 Inicializando búsqueda...');
    
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchInput && searchBtn) {
        function performSearch() {
            const query = searchInput.value.trim();
            if (query) {
                showNotification(`Buscando: ${query}`, 'info');
                showSection('searchResultsSection');
            }
        }
        
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    console.log('✅ Búsqueda inicializada');
}

// Función principal de inicialización
function initApp() {
    console.log('🚀 Inicializando aplicación completa...');
    
    // Mostrar secciones iniciales
    showInitialSections();
    
    // Inicializar componentes
    initSidebar();
    initNavigation();
    initSearch();
    
    // Hacer funciones globales
    window.showInitialSections = showInitialSections;
    window.showSection = showSection;
    window.showNotification = showNotification;
    
    console.log('✅ Aplicación inicializada correctamente');
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// También ejecutar después de un delay para asegurar
setTimeout(initApp, 100);

console.log('✅ Aplicación funcional cargada');