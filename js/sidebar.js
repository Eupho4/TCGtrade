// TCGtrade - Funciones de Sidebar
// JavaScript extraído del HTML para mejor organización

// Variables globales para el sidebar
let sidebar = null;
let sidebarOverlay = null;
let hamburgerBtn = null;

// Función para inicializar el sidebar
function initSidebar() {
    sidebar = document.getElementById('sidebar');
    sidebarOverlay = document.getElementById('sidebarOverlay');
    hamburgerBtn = document.getElementById('hamburgerBtn');
    
    if (!sidebar || !sidebarOverlay || !hamburgerBtn) {
        console.warn('⚠️ Elementos del sidebar no encontrados');
        return;
    }
    
    // Click en hamburguesa
    hamburgerBtn.addEventListener('click', () => {
        if (sidebar.classList.contains('open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });
    
    // Click en overlay para cerrar
    sidebarOverlay.addEventListener('click', closeSidebar);
    
    // Click en enlaces del sidebar para cerrar en móvil
    const sidebarLinks = sidebar.querySelectorAll('a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        });
    });
    
    // Cerrar sidebar al redimensionar a desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeSidebar();
        }
    });
    
    console.log('✅ Sidebar inicializado correctamente');
}

// Función para abrir sidebar
function openSidebar() {
    if (!sidebar || !sidebarOverlay || !hamburgerBtn) return;
    
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('show');
    hamburgerBtn.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevenir scroll del body
}

// Función para cerrar sidebar
function closeSidebar() {
    if (!sidebar || !sidebarOverlay || !hamburgerBtn) return;
    
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('show');
    hamburgerBtn.classList.remove('active');
    document.body.style.overflow = ''; // Restaurar scroll
}

// Función para toggle del sidebar
function toggleSidebar() {
    if (!sidebar) return;
    
    if (sidebar.classList.contains('open')) {
        closeSidebar();
    } else {
        openSidebar();
    }
}

// Exportar funciones para uso global
window.initSidebar = initSidebar;
window.openSidebar = openSidebar;
window.closeSidebar = closeSidebar;
window.toggleSidebar = toggleSidebar;

console.log('🚀 Módulo de sidebar cargado');