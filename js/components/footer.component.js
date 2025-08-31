/**
 * Footer Component
 * Shared footer
 */

export class FooterComponent {
    static render() {
        const currentYear = new Date().getFullYear();
        
        return `
            <footer class="footer-bg text-white py-8 mt-12">
                <div class="container mx-auto px-4">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <!-- About -->
                        <div>
                            <h4 class="font-bold text-lg mb-4">Sobre TCGtrade</h4>
                            <p class="text-sm text-gray-300">
                                La plataforma líder para intercambiar cartas Pokémon TCG 
                                de forma segura y sencilla.
                            </p>
                        </div>
                        
                        <!-- Quick Links -->
                        <div>
                            <h4 class="font-bold text-lg mb-4">Enlaces Rápidos</h4>
                            <ul class="space-y-2 text-sm">
                                <li>
                                    <a href="/search" data-route class="hover:text-orange-400 transition-colors">
                                        Buscar Cartas
                                    </a>
                                </li>
                                <li>
                                    <a href="/trades" data-route class="hover:text-orange-400 transition-colors">
                                        Intercambios
                                    </a>
                                </li>
                                <li>
                                    <a href="/help" data-route class="hover:text-orange-400 transition-colors">
                                        Centro de Ayuda
                                    </a>
                                </li>
                            </ul>
                        </div>
                        
                        <!-- Community -->
                        <div>
                            <h4 class="font-bold text-lg mb-4">Comunidad</h4>
                            <ul class="space-y-2 text-sm">
                                <li>
                                    <a href="#" class="hover:text-orange-400 transition-colors">
                                        Discord
                                    </a>
                                </li>
                                <li>
                                    <a href="#" class="hover:text-orange-400 transition-colors">
                                        Twitter
                                    </a>
                                </li>
                                <li>
                                    <a href="#" class="hover:text-orange-400 transition-colors">
                                        Reddit
                                    </a>
                                </li>
                            </ul>
                        </div>
                        
                        <!-- Legal -->
                        <div>
                            <h4 class="font-bold text-lg mb-4">Legal</h4>
                            <ul class="space-y-2 text-sm">
                                <li>
                                    <a href="/terms" data-route class="hover:text-orange-400 transition-colors">
                                        Términos de Uso
                                    </a>
                                </li>
                                <li>
                                    <a href="/privacy" data-route class="hover:text-orange-400 transition-colors">
                                        Privacidad
                                    </a>
                                </li>
                                <li>
                                    <a href="/cookies" data-route class="hover:text-orange-400 transition-colors">
                                        Cookies
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    
                    <!-- Bottom Bar -->
                    <div class="border-t border-gray-600 pt-4 text-center">
                        <p class="text-sm text-gray-300">
                            © ${currentYear} TCGtrade. Todos los derechos reservados.
                        </p>
                        <p class="text-xs text-gray-400 mt-2">
                            Pokémon y todos los personajes respectivos son marcas registradas de Nintendo, 
                            Creatures Inc. y GAME FREAK inc.
                        </p>
                    </div>
                </div>
            </footer>
        `;
    }
    
    static afterRender() {
        // Footer doesn't need special initialization
        console.log('Footer rendered');
    }
}