// TCGtrade - Script de Emergencia para Mostrar Secciones
// Se ejecuta inmediatamente para asegurar que las secciones sean visibles

console.log('🚨 Script de emergencia ejecutándose...');

// Función de emergencia para mostrar secciones iniciales
function emergencyShowSections() {
    console.log('🚨 Mostrando secciones de emergencia...');
    
    // Mostrar secciones principales
    const heroSection = document.getElementById('heroSection');
    const howItWorksSection = document.getElementById('howItWorksSection');
    const featuresSection = document.getElementById('featuresSection');
    const ctaSection = document.getElementById('ctaSection');
    
    if (heroSection) {
        heroSection.classList.remove('hidden');
        heroSection.style.display = 'block';
        console.log('✅ heroSection mostrada');
    } else {
        console.error('❌ heroSection no encontrada');
    }
    
    if (howItWorksSection) {
        howItWorksSection.classList.remove('hidden');
        howItWorksSection.style.display = 'block';
        console.log('✅ howItWorksSection mostrada');
    } else {
        console.error('❌ howItWorksSection no encontrada');
    }
    
    if (featuresSection) {
        featuresSection.classList.remove('hidden');
        featuresSection.style.display = 'block';
        console.log('✅ featuresSection mostrada');
    } else {
        console.error('❌ featuresSection no encontrada');
    }
    
    if (ctaSection) {
        ctaSection.classList.remove('hidden');
        ctaSection.style.display = 'block';
        console.log('✅ ctaSection mostrada');
    } else {
        console.error('❌ ctaSection no encontrada');
    }
    
    // Ocultar otras secciones
    const searchResultsSection = document.getElementById('searchResultsSection');
    const myCardsSection = document.getElementById('myCardsSection');
    const profileSection = document.getElementById('profileSection');
    const interchangesSection = document.getElementById('interchangesSection');
    const helpSection = document.getElementById('helpSection');
    const inboxSection = document.getElementById('inboxSection');
    
    [searchResultsSection, myCardsSection, profileSection, interchangesSection, helpSection, inboxSection].forEach(section => {
        if (section) {
            section.classList.add('hidden');
            section.style.display = 'none';
        }
    });
    
    console.log('✅ Secciones de emergencia configuradas');
}

// Función de emergencia para el sidebar
function emergencyInitSidebar() {
    console.log('🚨 Inicializando sidebar de emergencia...');
    
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    
    if (!sidebar || !sidebarOverlay || !hamburgerBtn) {
        console.error('❌ Elementos del sidebar no encontrados');
        return;
    }
    
    // Función para abrir sidebar
    function openSidebar() {
        sidebar.classList.add('open');
        sidebarOverlay.classList.add('show');
        hamburgerBtn.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('✅ Sidebar abierto');
    }
    
    // Función para cerrar sidebar
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
    
    // Hacer funciones globales
    window.openSidebar = openSidebar;
    window.closeSidebar = closeSidebar;
    
    console.log('✅ Sidebar de emergencia inicializado');
}

// Ejecutar inmediatamente
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        emergencyShowSections();
        emergencyInitSidebar();
    });
} else {
    // DOM ya está listo
    emergencyShowSections();
    emergencyInitSidebar();
}

// También ejecutar después de un pequeño delay para asegurar
setTimeout(() => {
    emergencyShowSections();
    emergencyInitSidebar();
}, 100);

console.log('🚨 Script de emergencia cargado');