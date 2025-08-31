/**
 * Home Page Component
 */

export default {
    render: async () => {
        return `
            <!-- Hero Section -->
            <section class="hero-section mb-8">
                <h1 class="text-5xl font-bold mb-4">
                    <span class="icon text-6xl">🎴</span> TCGtrade - Tu Plataforma de Intercambio Pokémon TCG
                </h1>
                <p class="text-xl mb-6">
                    Conecta con coleccionistas, intercambia cartas y completa tu colección de manera segura y sencilla.
                </p>
                <div class="flex gap-4 justify-center">
                    <button class="btn-primary px-8 py-3 rounded-lg text-lg font-semibold" 
                            onclick="router.navigate('/search')">
                        <span class="icon">🔍</span> Explorar Cartas
                    </button>
                    <button class="btn-secondary px-8 py-3 rounded-lg text-lg font-semibold"
                            onclick="router.navigate('/trades')">
                        <span class="icon">🤝</span> Ver Intercambios
                    </button>
                </div>
            </section>

            <!-- How It Works Section -->
            <section id="howItWorks" class="container mx-auto px-4 py-12">
                <h2 class="text-3xl font-bold text-center mb-10 text-gray-800 dark:text-white">
                    <span class="icon">📖</span> ¿Cómo Funciona?
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <!-- Step 1 -->
                    <div class="card-bg rounded-lg p-6 text-center">
                        <div class="text-5xl mb-4">🔍</div>
                        <h3 class="text-xl font-semibold mb-3 text-gray-800 dark:text-white">1. Busca Cartas</h3>
                        <p class="text-gray-600 dark:text-gray-300">
                            Explora nuestra extensa base de datos de cartas Pokémon TCG. 
                            Filtra por nombre, set, rareza y más.
                        </p>
                    </div>
                    
                    <!-- Step 2 -->
                    <div class="card-bg rounded-lg p-6 text-center">
                        <div class="text-5xl mb-4">📚</div>
                        <h3 class="text-xl font-semibold mb-3 text-gray-800 dark:text-white">2. Gestiona tu Colección</h3>
                        <p class="text-gray-600 dark:text-gray-300">
                            Añade cartas a tu colección personal. 
                            Marca las que tienes y las que buscas.
                        </p>
                    </div>
                    
                    <!-- Step 3 -->
                    <div class="card-bg rounded-lg p-6 text-center">
                        <div class="text-5xl mb-4">🤝</div>
                        <h3 class="text-xl font-semibold mb-3 text-gray-800 dark:text-white">3. Intercambia</h3>
                        <p class="text-gray-600 dark:text-gray-300">
                            Crea ofertas de intercambio y conecta con otros coleccionistas 
                            para completar tu colección.
                        </p>
                    </div>
                </div>
            </section>

            <!-- Features Section -->
            <section class="container mx-auto px-4 py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h2 class="text-3xl font-bold text-center mb-10 text-gray-800 dark:text-white">
                    <span class="icon">✨</span> Características Principales
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="text-center">
                        <div class="text-4xl mb-3">🔒</div>
                        <h4 class="font-semibold text-gray-800 dark:text-white">Seguro</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            Sistema de valoración y reputación de usuarios
                        </p>
                    </div>
                    <div class="text-center">
                        <div class="text-4xl mb-3">🌍</div>
                        <h4 class="font-semibold text-gray-800 dark:text-white">Global</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            Conecta con coleccionistas de todo el mundo
                        </p>
                    </div>
                    <div class="text-center">
                        <div class="text-4xl mb-3">📱</div>
                        <h4 class="font-semibold text-gray-800 dark:text-white">Responsive</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            Accede desde cualquier dispositivo
                        </p>
                    </div>
                    <div class="text-center">
                        <div class="text-4xl mb-3">🎯</div>
                        <h4 class="font-semibold text-gray-800 dark:text-white">Fácil de Usar</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            Interfaz intuitiva y amigable
                        </p>
                    </div>
                </div>
            </section>

            <!-- CTA Section -->
            <section class="container mx-auto px-4 py-12 text-center">
                <h2 class="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
                    ¿Listo para empezar?
                </h2>
                <p class="text-lg text-gray-600 dark:text-gray-400 mb-8">
                    Únete a miles de coleccionistas y completa tu colección hoy mismo
                </p>
                <button class="btn-primary px-10 py-4 rounded-lg text-xl font-semibold"
                        onclick="showAuthModal('register')">
                    <span class="icon">🚀</span> Crear Cuenta Gratis
                </button>
            </section>
        `;
    },

    afterRender: async () => {
        console.log('Home page loaded');
        
        // Add any home-specific event listeners or initialization here
        
        // Animate hero section on load
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            heroSection.style.opacity = '0';
            heroSection.style.transform = 'translateY(20px)';
            setTimeout(() => {
                heroSection.style.transition = 'all 0.6s ease';
                heroSection.style.opacity = '1';
                heroSection.style.transform = 'translateY(0)';
            }, 100);
        }

        // Animate cards on scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.card-bg').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'all 0.6s ease';
            observer.observe(card);
        });
    }
};