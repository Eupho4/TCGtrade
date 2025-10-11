// Fix para el modal de login que aparece en todas las secciones
console.log('🔧 Aplicando fix del modal...');

// Función para ocultar el modal
function hideModal() {
    const authModal = document.getElementById('authModal');
    if (authModal && authModal.classList.contains('show')) {
        authModal.classList.remove('show');
        console.log('🔒 Modal ocultado');
    }
}

// Función para mostrar sección y ocultar modal
function showSection(sectionId) {
    console.log(`📱 Mostrando sección: ${sectionId}`);
    
    // Ocultar modal si está abierto
    hideModal();
    
    // Ocultar todas las secciones
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar la sección solicitada
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        console.log(`✅ Sección ${sectionId} mostrada`);
    } else {
        console.error(`❌ Sección ${sectionId} no encontrada`);
    }
}

// Interceptar las funciones de secciones originales
function interceptSectionFunctions() {
    console.log('🔧 Interceptando funciones de secciones...');
    
    // Lista de funciones a interceptar
    const sectionFunctions = [
        'showHomeSection',
        'showMyCardsSection', 
        'showInterchangesSection',
        'showCollectionSection',
        'showInboxSection',
        'showChatSection',
        'showHelpSection',
        'showProfileSection'
    ];
    
    sectionFunctions.forEach(funcName => {
        const originalFunc = window[funcName];
        if (originalFunc && typeof originalFunc === 'function') {
            window[funcName] = function(...args) {
                console.log(`📱 Ejecutando ${funcName}...`);
                hideModal(); // Ocultar modal antes de mostrar la sección
                return originalFunc.apply(this, args);
            };
            console.log(`✅ ${funcName} interceptada`);
        } else {
            console.warn(`⚠️ Función ${funcName} no encontrada`);
        }
    });
}

// Función para ir al inicio
function goToHome() {
    console.log('🏠 Yendo al inicio...');
    showSection('homeSection');
}

// Función para mostrar secciones específicas
function showHomeSection() {
    showSection('homeSection');
}

function showMyCardsSection() {
    showSection('myCardsSection');
}

function showInterchangesSection() {
    showSection('interchangesSection');
}

function showCollectionSection() {
    showSection('collectionSection');
}

function showInboxSection() {
    showSection('inboxSection');
}

function showChatSection() {
    showSection('chatSection');
}

function showHelpSection() {
    showSection('helpSection');
}

function showProfileSection() {
    showSection('profileSection');
}

// Función para alternar sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    if (sidebar && mainContent) {
        sidebar.classList.toggle('open');
        mainContent.classList.toggle('sidebar-open');
        console.log('📱 Sidebar toggled');
    }
}

// Función para logout
function logout() {
    console.log('🚪 Cerrando sesión...');
    // Aquí iría la lógica de logout
    showNotification('Sesión cerrada', 'info');
}

// Función para búsqueda desde inicio
function searchFromHome() {
    const input = document.getElementById('homeSearchInput');
    if (input && input.value.trim()) {
        console.log('🔍 Buscando:', input.value);
        // Aquí iría la lógica de búsqueda
        showNotification('Búsqueda realizada', 'success');
    }
}

// Función para alternar pestañas del perfil
function showProfileTab(tabName) {
    console.log(`👤 Mostrando pestaña: ${tabName}`);
    
    // Ocultar todas las pestañas
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Ocultar todos los botones activos
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Mostrar la pestaña seleccionada
    const targetTab = document.getElementById(tabName + 'Tab');
    const targetButton = document.querySelector(`[onclick="showProfileTab('${tabName}')"]`);
    
    if (targetTab) {
        targetTab.classList.add('active');
    }
    if (targetButton) {
        targetButton.classList.add('active');
    }
}

// Función para alternar modo de autenticación
function toggleAuthMode(mode) {
    console.log(`🔐 Cambiando modo de auth: ${mode}`);
    
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotForm = document.getElementById('forgotPasswordForm');
    const modalTitle = document.getElementById('modalTitle');
    
    // Ocultar todos los formularios
    [loginForm, registerForm, forgotForm].forEach(form => {
        if (form) form.classList.add('hidden');
    });
    
    // Mostrar el formulario correspondiente
    switch(mode) {
        case 'login':
            if (loginForm) loginForm.classList.remove('hidden');
            if (modalTitle) modalTitle.textContent = 'Iniciar Sesión';
            break;
        case 'register':
            if (registerForm) registerForm.classList.remove('hidden');
            if (modalTitle) modalTitle.textContent = 'Registrarse';
            break;
        case 'forgot':
            if (forgotForm) forgotForm.classList.remove('hidden');
            if (modalTitle) modalTitle.textContent = 'Recuperar Contraseña';
            break;
    }
}

// Función para mostrar modal de autenticación
function showAuthModal(mode = 'login') {
    console.log(`🔐 Mostrando modal de auth: ${mode}`);
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.classList.add('show');
        toggleAuthMode(mode);
    }
}

// Función para ocultar modal de autenticación
function hideAuthModal() {
    console.log('🔒 Ocultando modal de auth');
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.classList.remove('show');
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 DOM cargado, aplicando fixes...');
        
        // Interceptar funciones después de un pequeño delay
        setTimeout(() => {
            interceptSectionFunctions();
            
            // Configurar botón hamburguesa
            const hamburgerBtn = document.getElementById('hamburgerBtn');
            if (hamburgerBtn) {
                hamburgerBtn.addEventListener('click', toggleSidebar);
            }
            
            // Configurar botones de perfil
            const profileBtn = document.getElementById('profileBtn');
            if (profileBtn) {
                profileBtn.addEventListener('click', () => showProfileSection());
            }
            
            // Configurar botones de navegación
            const inboxBtn = document.getElementById('inboxBtn');
            const chatBtn = document.getElementById('chatBtn');
            
            if (inboxBtn) inboxBtn.addEventListener('click', () => showInboxSection());
            if (chatBtn) chatBtn.addEventListener('click', () => showChatSection());
            
            console.log('✅ Fixes aplicados correctamente');
        }, 100);
    });
} else {
    interceptSectionFunctions();
}

console.log('✅ Modal fix cargado');