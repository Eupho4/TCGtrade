/**
 * Main SPA Application
 * Coordinates routing and page components
 */

import router from './router/router.js';
import { initAuth, getCurrentUser, showAuthModal, logoutUser } from './modules/auth.js';
import { applyDarkMode, toggleDarkMode, showNotification } from './modules/utils.js';

// Import page components
import HomePage from './pages/home.page.js';
import SearchPage from './pages/search.page.js';
// Import more pages as they're created...

// Import shared components
import { HeaderComponent } from './components/header.component.js';
import { FooterComponent } from './components/footer.component.js';

/**
 * Initialize the SPA
 */
async function initApp() {
    
    // Apply dark mode preference
    applyDarkMode();
    
    // Render header and footer
    renderSharedComponents();
    
    // Register routes
    registerRoutes();
    
    // Initialize authentication
    initAuth((user) => {
        // Re-render header to update user menu
        renderHeader();
    });
    
    // Setup global event listeners
    setupGlobalEventListeners();
    
    // Initialize router
    router.init('app-content');
    
    // Set up route guards
    setupRouteGuards();
    
}

/**
 * Register all routes
 */
function registerRoutes() {
    router.registerRoutes({
        '/': HomePage,
        '/home': HomePage,
        '/search': SearchPage,
        '/collection': {
            render: async () => {
                const user = getCurrentUser();
                if (!user) {
                    return `
                        <div class="text-center py-12">
                            <div class="text-6xl mb-4">🔒</div>
                            <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                                Acceso Restringido
                            </h2>
                            <p class="text-gray-600 dark:text-gray-400 mb-6">
                                Debes iniciar sesión para ver tu colección
                            </p>
                            <button onclick="showAuthModal('login')" class="btn-primary px-6 py-3 rounded-lg font-semibold">
                                Iniciar Sesión
                            </button>
                        </div>
                    `;
                }
                // Import and render collection page
                const { default: CollectionPage } = await import('./pages/collection.page.js');
                return await CollectionPage.render();
            },
            afterRender: async () => {
                const user = getCurrentUser();
                if (user) {
                    const { default: CollectionPage } = await import('./pages/collection.page.js');
                    await CollectionPage.afterRender();
                }
            }
        },
        '/trades': {
            render: async () => {
                const user = getCurrentUser();
                if (!user) {
                    return `
                        <div class="text-center py-12">
                            <div class="text-6xl mb-4">🔒</div>
                            <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                                Acceso Restringido
                            </h2>
                            <p class="text-gray-600 dark:text-gray-400 mb-6">
                                Debes iniciar sesión para ver los intercambios
                            </p>
                            <button onclick="showAuthModal('login')" class="btn-primary px-6 py-3 rounded-lg font-semibold">
                                Iniciar Sesión
                            </button>
                        </div>
                    `;
                }
                // Import and render trades page
                const { default: TradesPage } = await import('./pages/trades.page.js');
                return await TradesPage.render();
            },
            afterRender: async () => {
                const user = getCurrentUser();
                if (user) {
                    const { default: TradesPage } = await import('./pages/trades.page.js');
                    await TradesPage.afterRender();
                }
            }
        },
        '/profile': {
            render: async () => {
                const user = getCurrentUser();
                if (!user) {
                    router.redirect('/');
                    return '<div>Redirecting...</div>';
                }
                const { default: ProfilePage } = await import('./pages/profile.page.js');
                return await ProfilePage.render();
            },
            afterRender: async () => {
                const user = getCurrentUser();
                if (user) {
                    const { default: ProfilePage } = await import('./pages/profile.page.js');
                    await ProfilePage.afterRender();
                }
            }
        },
        '/help': {
            render: async () => {
                const { default: HelpPage } = await import('./pages/help.page.js');
                return await HelpPage.render();
            },
            afterRender: async () => {
                const { default: HelpPage } = await import('./pages/help.page.js');
                await HelpPage.afterRender();
            }
        },
        '/404': {
            render: async () => `
                <div class="text-center py-12">
                    <div class="text-8xl mb-4">404</div>
                    <h1 class="text-4xl font-bold text-gray-800 dark:text-white mb-4">
                        Página No Encontrada
                    </h1>
                    <p class="text-gray-600 dark:text-gray-400 mb-8">
                        La página que buscas no existe o ha sido movida
                    </p>
                    <a href="/" data-route class="btn-primary px-6 py-3 rounded-lg font-semibold inline-block">
                        Volver al Inicio
                    </a>
                </div>
            `,
            afterRender: async () => {}
        }
    });
}

/**
 * Render shared components (header and footer)
 */
function renderSharedComponents() {
    renderHeader();
    renderFooter();
}

/**
 * Render header
 */
function renderHeader() {
    const headerContainer = document.getElementById('app-header');
    if (headerContainer) {
        headerContainer.innerHTML = HeaderComponent.render();
        HeaderComponent.afterRender();
    }
}

/**
 * Render footer
 */
function renderFooter() {
    const footerContainer = document.getElementById('app-footer');
    if (footerContainer) {
        footerContainer.innerHTML = FooterComponent.render();
        FooterComponent.afterRender();
    }
}

/**
 * Setup global event listeners
 */
function setupGlobalEventListeners() {
    // Dark mode toggle
    document.addEventListener('change', (e) => {
        if (e.target && e.target.id === 'darkModeToggle') {
            toggleDarkMode();
        }
    });
    
    // Apply dark mode on load
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.checked = localStorage.getItem('darkMode') === 'true';
    }
}

/**
 * Setup route guards
 */
function setupRouteGuards() {
    // Before route change
    router.setBeforeRouteChange(async (from, to) => {
        
        // Check authentication for protected routes
        const protectedRoutes = ['/profile', '/collection', '/trades'];
        if (protectedRoutes.includes(to)) {
            const user = getCurrentUser();
            if (!user) {
                showNotification('Debes iniciar sesión para acceder a esta página', 'warning');
                showAuthModal('login');
                return false; // Prevent navigation
            }
        }
        
        return true; // Allow navigation
    });
    
    // After route change
    router.setAfterRouteChange(async (to) => {
        
        // Update page title
        const titles = {
            '/': 'Inicio - TCGtrade',
            '/search': 'Buscar Cartas - TCGtrade',
            '/collection': 'Mi Colección - TCGtrade',
            '/trades': 'Intercambios - TCGtrade',
            '/profile': 'Mi Perfil - TCGtrade',
            '/help': 'Ayuda - TCGtrade'
        };
        
        document.title = titles[to] || 'TCGtrade';
    });
}

/**
 * Make functions available globally
 */
window.router = router;
window.showAuthModal = showAuthModal;
window.logoutUser = logoutUser;
window.showNotification = showNotification;

/**
 * Initialize when DOM is ready
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

export default { initApp };