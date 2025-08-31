/**
 * Router Module
 * Handles client-side routing for the SPA
 */

export class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.contentContainer = null;
        this.beforeRouteChange = null;
        this.afterRouteChange = null;
    }

    /**
     * Initialize the router
     */
    init(contentContainerId = 'app-content') {
        this.contentContainer = document.getElementById(contentContainerId);
        
        if (!this.contentContainer) {
            console.error(`Container with id "${contentContainerId}" not found`);
            return;
        }

        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            this.handleRoute(window.location.pathname, false);
        });

        // Handle clicks on links with data-route attribute
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-route]');
            if (link) {
                e.preventDefault();
                const path = link.getAttribute('href') || link.dataset.route;
                this.navigate(path);
            }
        });

        // Load initial route
        this.handleRoute(window.location.pathname);
    }

    /**
     * Register a route
     */
    register(path, component) {
        this.routes[path] = component;
        return this;
    }

    /**
     * Register multiple routes
     */
    registerRoutes(routes) {
        Object.entries(routes).forEach(([path, component]) => {
            this.register(path, component);
        });
        return this;
    }

    /**
     * Navigate to a route
     */
    navigate(path, pushState = true) {
        // Clean path
        path = this.cleanPath(path);
        
        // Check if route exists
        if (!this.routes[path] && !this.routes['*']) {
            console.error(`Route "${path}" not found`);
            path = '/404';
        }

        this.handleRoute(path, pushState);
    }

    /**
     * Handle route change
     */
    async handleRoute(path, pushState = true) {
        // Clean path
        path = this.cleanPath(path);

        // Get route component
        let component = this.routes[path];
        
        // If route not found, try wildcard route
        if (!component && this.routes['*']) {
            component = this.routes['*'];
        }
        
        // If still no component, use 404
        if (!component) {
            component = this.routes['/404'] || {
                render: async () => '<h1>404 - Page Not Found</h1>',
                afterRender: async () => {}
            };
        }

        // Call before route change hook
        if (this.beforeRouteChange) {
            const canProceed = await this.beforeRouteChange(this.currentRoute, path);
            if (!canProceed) return;
        }

        // Show loading state
        this.showLoading();

        try {
            // Render component
            const html = await component.render();
            this.contentContainer.innerHTML = html;

            // Call component's afterRender if exists
            if (component.afterRender) {
                await component.afterRender();
            }

            // Update browser history
            if (pushState) {
                history.pushState({ path }, '', path);
            }

            // Update current route
            this.currentRoute = path;

            // Update active navigation
            this.updateActiveNavigation(path);

            // Call after route change hook
            if (this.afterRouteChange) {
                await this.afterRouteChange(path);
            }

            // Scroll to top
            window.scrollTo(0, 0);

        } catch (error) {
            console.error('Error loading route:', error);
            this.contentContainer.innerHTML = `
                <div class="error-page">
                    <h1>Error loading page</h1>
                    <p>Please try again later.</p>
                </div>
            `;
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Clean path
     */
    cleanPath(path) {
        // Remove hash and query parameters for now
        path = path.split('#')[0].split('?')[0];
        
        // Ensure path starts with /
        if (!path.startsWith('/')) {
            path = '/' + path;
        }
        
        // Remove trailing slash except for root
        if (path.length > 1 && path.endsWith('/')) {
            path = path.slice(0, -1);
        }
        
        return path;
    }

    /**
     * Get current route
     */
    getCurrentRoute() {
        return this.currentRoute;
    }

    /**
     * Get route parameters
     */
    getParams(path) {
        // Simple parameter extraction
        // Example: /user/:id matches /user/123 -> { id: '123' }
        const params = {};
        const currentParts = path.split('/');
        
        for (const [routePath, component] of Object.entries(this.routes)) {
            const routeParts = routePath.split('/');
            
            if (routeParts.length === currentParts.length) {
                let match = true;
                const tempParams = {};
                
                for (let i = 0; i < routeParts.length; i++) {
                    if (routeParts[i].startsWith(':')) {
                        // Parameter
                        tempParams[routeParts[i].slice(1)] = currentParts[i];
                    } else if (routeParts[i] !== currentParts[i]) {
                        // No match
                        match = false;
                        break;
                    }
                }
                
                if (match) {
                    return tempParams;
                }
            }
        }
        
        return params;
    }

    /**
     * Update active navigation
     */
    updateActiveNavigation(path) {
        // Remove active class from all navigation links
        document.querySelectorAll('[data-route]').forEach(link => {
            link.classList.remove('active', 'text-orange-500', 'border-orange-500');
            
            const linkPath = this.cleanPath(link.getAttribute('href') || link.dataset.route);
            
            // Add active class to current route
            if (linkPath === path || (path !== '/' && linkPath.startsWith(path))) {
                link.classList.add('active', 'text-orange-500', 'border-orange-500');
            }
        });
    }

    /**
     * Show loading state
     */
    showLoading() {
        const loader = document.getElementById('route-loader');
        if (loader) {
            loader.classList.remove('hidden');
        } else {
            // Create loader if doesn't exist
            const loaderHtml = `
                <div id="route-loader" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div class="bg-white dark:bg-gray-800 rounded-lg p-6">
                        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', loaderHtml);
        }
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        const loader = document.getElementById('route-loader');
        if (loader) {
            loader.classList.add('hidden');
        }
    }

    /**
     * Set before route change hook
     */
    setBeforeRouteChange(callback) {
        this.beforeRouteChange = callback;
        return this;
    }

    /**
     * Set after route change hook
     */
    setAfterRouteChange(callback) {
        this.afterRouteChange = callback;
        return this;
    }

    /**
     * Check if user can access route
     */
    canAccess(path, requiresAuth = false) {
        if (requiresAuth) {
            // Check if user is authenticated
            const user = localStorage.getItem('currentUser');
            return !!user;
        }
        return true;
    }

    /**
     * Redirect to route
     */
    redirect(path) {
        this.navigate(path);
    }

    /**
     * Go back
     */
    back() {
        history.back();
    }

    /**
     * Go forward
     */
    forward() {
        history.forward();
    }
}

// Create and export singleton instance
const router = new Router();
export default router;