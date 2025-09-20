// TCGtrade - Script para Forzar Visibilidad de Secciones
// Se ejecuta al final para asegurar que las secciones sean visibles

console.log('🔧 Script de forzar visibilidad ejecutándose...');

// Función para forzar visibilidad
function forceShowSections() {
    console.log('🔧 Forzando visibilidad de secciones...');
    
    // Secciones principales que deben ser visibles
    const mainSections = [
        'heroSection',
        'howItWorksSection', 
        'featuresSection',
        'ctaSection'
    ];
    
    mainSections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            // Forzar estilos inline
            section.style.display = 'block !important';
            section.style.visibility = 'visible !important';
            section.style.opacity = '1 !important';
            section.style.height = 'auto !important';
            section.style.overflow = 'visible !important';
            
            // Remover clases que puedan ocultar
            section.classList.remove('hidden');
            section.classList.remove('invisible');
            section.classList.remove('opacity-0');
            section.classList.remove('h-0');
            section.classList.remove('overflow-hidden');
            
            // Añadir clases que aseguren visibilidad
            section.classList.add('block');
            section.classList.add('visible');
            section.classList.add('opacity-100');
            
            console.log(`✅ ${sectionId} forzada a ser visible`);
        } else {
            console.error(`❌ ${sectionId} no encontrada`);
        }
    });
    
    // Verificar si las secciones son realmente visibles
    setTimeout(() => {
        mainSections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const rect = section.getBoundingClientRect();
                const isVisible = rect.width > 0 && rect.height > 0;
                console.log(`${sectionId}: ${isVisible ? '✅ Visible' : '❌ Oculto'} (${rect.width}x${rect.height})`);
            }
        });
    }, 100);
}

// Función para forzar sidebar
function forceInitSidebar() {
    console.log('🔧 Forzando inicialización del sidebar...');
    
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (!hamburgerBtn || !sidebar || !sidebarOverlay) {
        console.error('❌ Elementos del sidebar no encontrados');
        return;
    }
    
    // Remover todos los event listeners existentes
    const newHamburgerBtn = hamburgerBtn.cloneNode(true);
    hamburgerBtn.parentNode.replaceChild(newHamburgerBtn, hamburgerBtn);
    
    // Función para abrir
    function openSidebar() {
        sidebar.style.display = 'block';
        sidebar.classList.add('open');
        sidebarOverlay.classList.add('show');
        newHamburgerBtn.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('✅ Sidebar forzado a abrir');
    }
    
    // Función para cerrar
    function closeSidebar() {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('show');
        newHamburgerBtn.classList.remove('active');
        document.body.style.overflow = '';
        console.log('✅ Sidebar forzado a cerrar');
    }
    
    // Event listener
    newHamburgerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
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
    
    console.log('✅ Sidebar forzado a funcionar');
}

// Ejecutar múltiples veces para asegurar
forceShowSections();
forceInitSidebar();

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        forceShowSections();
        forceInitSidebar();
    });
}

// Ejecutar después de delays para asegurar
setTimeout(() => {
    forceShowSections();
    forceInitSidebar();
}, 100);

setTimeout(() => {
    forceShowSections();
    forceInitSidebar();
}, 500);

setTimeout(() => {
    forceShowSections();
    forceInitSidebar();
}, 1000);

console.log('✅ Script de forzar visibilidad cargado');