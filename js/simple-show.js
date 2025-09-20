// TCGtrade - Script Simple para Mostrar Secciones
// Script muy básico que solo muestra las secciones principales

console.log('🚀 Script simple ejecutándose...');

// Función simple para mostrar secciones
function simpleShowSections() {
    console.log('📄 Mostrando secciones principales...');
    
    // Lista de secciones principales
    const mainSections = [
        'heroSection',
        'howItWorksSection', 
        'featuresSection',
        'ctaSection'
    ];
    
    // Mostrar cada sección
    mainSections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'block';
            section.style.visibility = 'visible';
            section.style.opacity = '1';
            section.classList.remove('hidden');
            console.log(`✅ ${sectionId} mostrada`);
        } else {
            console.error(`❌ ${sectionId} no encontrada`);
        }
    });
    
    // Ocultar secciones que no deberían estar visibles
    const hiddenSections = [
        'searchResultsSection',
        'myCardsSection',
        'profileSection',
        'interchangesSection',
        'helpSection',
        'inboxSection'
    ];
    
    hiddenSections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'none';
            section.classList.add('hidden');
        }
    });
    
    console.log('✅ Secciones configuradas');
}

// Función simple para el sidebar
function simpleInitSidebar() {
    console.log('🍔 Inicializando sidebar simple...');
    
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (!hamburgerBtn || !sidebar || !sidebarOverlay) {
        console.error('❌ Elementos del sidebar no encontrados');
        return;
    }
    
    // Función para abrir
    function openSidebar() {
        sidebar.classList.add('open');
        sidebarOverlay.classList.add('show');
        hamburgerBtn.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('✅ Sidebar abierto');
    }
    
    // Función para cerrar
    function closeSidebar() {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('show');
        hamburgerBtn.classList.remove('active');
        document.body.style.overflow = '';
        console.log('✅ Sidebar cerrado');
    }
    
    // Event listener simple
    hamburgerBtn.addEventListener('click', () => {
        if (sidebar.classList.contains('open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });
    
    // Cerrar al hacer click en overlay
    sidebarOverlay.addEventListener('click', closeSidebar);
    
    // Hacer funciones globales
    window.openSidebar = openSidebar;
    window.closeSidebar = closeSidebar;
    
    console.log('✅ Sidebar simple inicializado');
}

// Ejecutar inmediatamente
simpleShowSections();
simpleInitSidebar();

// También ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        simpleShowSections();
        simpleInitSidebar();
    });
}

// Y ejecutar después de un delay para asegurar
setTimeout(() => {
    simpleShowSections();
    simpleInitSidebar();
}, 500);

console.log('✅ Script simple cargado');