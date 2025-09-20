// TCGtrade - Script de Inicialización
// Se ejecuta después de que todos los módulos estén cargados

console.log('🚀 Iniciando aplicación TCGtrade...');

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM cargado, inicializando aplicación...');
    
    // Verificar que las funciones necesarias estén disponibles
    const requiredFunctions = [
        'showInitialSections',
        'showAuthModal',
        'openSidebar',
        'closeSidebar'
    ];
    
    const missingFunctions = requiredFunctions.filter(func => typeof window[func] !== 'function');
    
    if (missingFunctions.length > 0) {
        console.error('❌ Funciones faltantes:', missingFunctions);
    } else {
        console.log('✅ Todas las funciones requeridas están disponibles');
    }
    
    // Mostrar secciones iniciales
    if (typeof window.showInitialSections === 'function') {
        console.log('🏠 Mostrando secciones iniciales...');
        window.showInitialSections();
    } else {
        console.error('❌ showInitialSections no está disponible');
    }
    
    // Verificar elementos del DOM
    const heroSection = document.getElementById('heroSection');
    const howItWorksSection = document.getElementById('howItWorksSection');
    const featuresSection = document.getElementById('featuresSection');
    const ctaSection = document.getElementById('ctaSection');
    
    console.log('🔍 Verificando elementos del DOM:');
    console.log('- heroSection:', heroSection ? '✅' : '❌');
    console.log('- howItWorksSection:', howItWorksSection ? '✅' : '❌');
    console.log('- featuresSection:', featuresSection ? '✅' : '❌');
    console.log('- ctaSection:', ctaSection ? '✅' : '❌');
    
    // Verificar sidebar
    const sidebar = document.getElementById('sidebar');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    
    console.log('🔍 Verificando sidebar:');
    console.log('- sidebar:', sidebar ? '✅' : '❌');
    console.log('- hamburgerBtn:', hamburgerBtn ? '✅' : '❌');
    
    // Verificar navegación
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const profileLink = document.getElementById('profileLink');
    
    console.log('🔍 Verificando navegación:');
    console.log('- loginLink:', loginLink ? '✅' : '❌');
    console.log('- registerLink:', registerLink ? '✅' : '❌');
    console.log('- profileLink:', profileLink ? '✅' : '❌');
    
    // Configurar event listeners básicos si no están configurados
    if (hamburgerBtn && !hamburgerBtn.hasAttribute('data-listener-added')) {
        hamburgerBtn.addEventListener('click', () => {
            console.log('🍔 Click en hamburguesa');
            if (typeof window.openSidebar === 'function') {
                window.openSidebar();
            } else {
                console.error('❌ openSidebar no está disponible');
            }
        });
        hamburgerBtn.setAttribute('data-listener-added', 'true');
    }
    
    // Configurar links de navegación
    if (loginLink && !loginLink.hasAttribute('data-listener-added')) {
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🔐 Click en login');
            if (typeof window.showAuthModal === 'function') {
                window.showAuthModal('login');
            } else {
                console.error('❌ showAuthModal no está disponible');
            }
        });
        loginLink.setAttribute('data-listener-added', 'true');
    }
    
    if (registerLink && !registerLink.hasAttribute('data-listener-added')) {
        registerLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('📝 Click en registro');
            if (typeof window.showAuthModal === 'function') {
                window.showAuthModal('register');
            } else {
                console.error('❌ showAuthModal no está disponible');
            }
        });
        registerLink.setAttribute('data-listener-added', 'true');
    }
    
    console.log('✅ Inicialización completada');
});

console.log('🚀 Script de inicialización cargado');