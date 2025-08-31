/**
 * Header Component
 * Shared navigation header
 */

import { getCurrentUser } from '../modules/auth.js';

export class HeaderComponent {
    static render() {
        const currentUser = getCurrentUser();
        
        return `
            <header class="header-bg text-white shadow-lg sticky top-0 z-40">
                <nav class="container mx-auto px-4 py-4">
                    <div class="flex justify-between items-center">
                        <!-- Logo -->
                        <a href="/" data-route class="flex items-center space-x-2 text-2xl font-bold">
                            <span class="text-3xl">🎴</span>
                            <span>TCGtrade</span>
                        </a>
                        
                        <!-- Desktop Navigation -->
                        <div class="hidden md:flex items-center space-x-6">
                            <a href="/" data-route class="nav-link px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors">
                                <span class="icon">🏠</span> Inicio
                            </a>
                            <a href="/search" data-route class="nav-link px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors">
                                <span class="icon">🔍</span> Buscar
                            </a>
                            <a href="/collection" data-route class="nav-link px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors">
                                <span class="icon">📚</span> Mis Cartas
                            </a>
                            <a href="/trades" data-route class="nav-link px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors">
                                <span class="icon">🤝</span> Intercambios
                            </a>
                            <a href="/help" data-route class="nav-link px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors">
                                <span class="icon">❓</span> Ayuda
                            </a>
                            
                            <!-- User Menu -->
                            ${currentUser ? `
                                <div class="relative group">
                                    <button class="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors">
                                        <span class="icon">👤</span>
                                        <span>${currentUser.username || currentUser.email?.split('@')[0]}</span>
                                        <span class="text-xs">▼</span>
                                    </button>
                                    <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                        <a href="/profile" data-route class="block px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg">
                                            <span class="icon">⚙️</span> Mi Perfil
                                        </a>
                                        <button onclick="logoutUser()" class="w-full text-left px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg">
                                            <span class="icon">🚪</span> Cerrar Sesión
                                        </button>
                                    </div>
                                </div>
                            ` : `
                                <button onclick="showAuthModal('login')" class="btn-primary px-4 py-2 rounded-lg font-semibold">
                                    Iniciar Sesión
                                </button>
                            `}
                            
                            <!-- Dark Mode Toggle -->
                            <div class="flex items-center">
                                <label class="toggle-switch">
                                    <input type="checkbox" id="darkModeToggle">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <!-- Mobile Menu Button -->
                        <button id="mobileMenuBtn" class="md:hidden text-white">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Mobile Navigation -->
                    <div id="mobileMenu" class="hidden md:hidden mt-4 pb-4">
                        <a href="/" data-route class="block px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors">
                            <span class="icon">🏠</span> Inicio
                        </a>
                        <a href="/search" data-route class="block px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors">
                            <span class="icon">🔍</span> Buscar
                        </a>
                        <a href="/collection" data-route class="block px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors">
                            <span class="icon">📚</span> Mis Cartas
                        </a>
                        <a href="/trades" data-route class="block px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors">
                            <span class="icon">🤝</span> Intercambios
                        </a>
                        <a href="/help" data-route class="block px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors">
                            <span class="icon">❓</span> Ayuda
                        </a>
                        
                        ${currentUser ? `
                            <a href="/profile" data-route class="block px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors">
                                <span class="icon">👤</span> Mi Perfil
                            </a>
                            <button onclick="logoutUser()" class="block w-full text-left px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors">
                                <span class="icon">🚪</span> Cerrar Sesión
                            </button>
                        ` : `
                            <button onclick="showAuthModal('login')" class="block w-full text-left px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors">
                                <span class="icon">🔑</span> Iniciar Sesión
                            </button>
                        `}
                    </div>
                </nav>
            </header>
        `;
    }
    
    static afterRender() {
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        
        mobileMenuBtn?.addEventListener('click', () => {
            mobileMenu?.classList.toggle('hidden');
        });
        
        // Close mobile menu when clicking a link
        document.querySelectorAll('#mobileMenu [data-route]').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu?.classList.add('hidden');
            });
        });
    }
}