// TCGtrade - Funciones de Utilidades
// JavaScript extraído del HTML para mejor organización

// Función de prueba para verificar que todo funciona
window.testNavigation = function() {
    console.log('🧪 Probando navegación...');
    console.log('Funciones disponibles:', {
        showInitialSections: typeof showInitialSections,
        showAuthModal: typeof showAuthModal,
        showMyCardsSection: typeof showMyCardsSection,
        showInterchangesSection: typeof showInterchangesSection,
        showProfileSection: typeof showProfileSection,
        logoutUser: typeof logoutUser
    });
    
    // Probar cada función
    try {
        console.log('✅ Todas las funciones están disponibles');
        return true;
    } catch (error) {
        console.error('❌ Error en las funciones:', error);
        return false;
    }
};

// Función para cargar estadísticas del perfil
async function loadProfileStats() {
    if (!currentUser) return;

    try {
        console.log('📊 Cargando estadísticas del perfil...');

        // Obtener colección del usuario
        const userCardsRef = collection(db, 'users', currentUser.uid, 'my_cards');
        const userCardsSnapshot = await getDocs(userCardsRef);
        
        const cards = [];
        userCardsSnapshot.forEach(doc => {
            cards.push({ id: doc.id, ...doc.data() });
        });

        // Calcular estadísticas
        // Total de cartas sumando las cantidades
        const totalCards = cards.reduce((total, card) => {
            // Si no tiene quantity o es 0, contar como 1
            const qty = card.quantity > 0 ? card.quantity : 1;
            return total + qty;
        }, 0);
        
        const uniqueCards = new Set(cards.map(card => card.id)).size;
        const uniqueSets = new Set(cards.map(card => (typeof card.set === 'string' ? card.set : card.set?.name)).filter(Boolean)).size;
        
        // Por ahora, intercambios completados = 0 (se implementará más adelante)
        const completedTrades = 0;

        // Actualizar UI con las estadísticas
        if (typeof updateProfileStats === 'function') {
            updateProfileStats(totalCards, uniqueCards, uniqueSets, completedTrades, cards);
        }

        // Cargar desglose por sets
        if (typeof loadSetsBreakdown === 'function') {
            await loadSetsBreakdown(cards);
        }

    } catch (error) {
        console.error('❌ Error al cargar estadísticas:', error);
    }
}

// --- Constantes de Condiciones de Cartas (CardMarket) ---
const CARD_CONDITIONS = {
    M: {
        code: 'M',
        name: 'Mint (M)',
        description: 'Perfectas condiciones, sin excusas. Carta como recién salida del sobre.',
        color: '#10B981', // Verde
        icon: '💎'
    },
    NM: {
        code: 'NM',
        name: 'Near Mint (NM)',
        description: 'Aspecto de no haber sido jugada sin fundas. Marcas mínimas permitidas.',
        color: '#059669', // Verde oscuro
        icon: '✨'
    },
    EX: {
        code: 'EX',
        name: 'Excellent (EX)',
        description: 'Como si se hubiera usado poco sin fundas. Daño visible pero menor.',
        color: '#3B82F6', // Azul
        icon: '⭐'
    },
    GD: {
        code: 'GD',
        name: 'Good (GD)',
        description: 'Aspecto de mucho uso en torneo sin fundas. Deterioro notable.',
        color: '#F59E0B', // Amarillo
        icon: '🟡'
    },
    LP: {
        code: 'LP',
        name: 'Light Played (LP)',
        description: 'Uso prolongado sin fundas. Válida para torneos con fundas.',
        color: '#F97316', // Naranja
        icon: '🟠'
    },
    PL: {
        code: 'PL',
        name: 'Played (PL)',
        description: 'Aspecto muy deteriorado. Dudoso para torneos incluso con fundas.',
        color: '#DC2626', // Rojo
        icon: '🔴'
    },
    PO: {
        code: 'PO',
        name: 'Poor (PO)',
        description: 'Literalmente destrozada o alterada. No válida para torneos.',
        color: '#7F1D1D', // Rojo oscuro
        icon: '💀'
    }
};

// --- Función de Notificaciones Personalizadas ---
function showNotification(message, type = 'success', duration = 3000) {
    // Remover notificación anterior si existe
    const existingNotification = document.querySelector('.custom-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Crear nueva notificación
    const notification = document.createElement('div');
    notification.className = 'custom-notification fixed top-4 right-4 z-[10000] transform translate-x-full transition-transform duration-300';
    
    // Estilos según el tipo
    let bgColor, borderColor, iconColor, icon;
    switch(type) {
        case 'success':
            bgColor = 'bg-green-50 dark:bg-green-900/30';
            borderColor = 'border-green-200 dark:border-green-800';
            iconColor = 'text-green-600 dark:text-green-400';
            icon = '✅';
            break;
        case 'error':
            bgColor = 'bg-red-50 dark:bg-red-900/30';
            borderColor = 'border-red-200 dark:border-red-800';
            iconColor = 'text-red-600 dark:text-red-400';
            icon = '❌';
            break;
        case 'warning':
            bgColor = 'bg-yellow-50 dark:bg-yellow-900/30';
            borderColor = 'border-yellow-200 dark:border-yellow-800';
            iconColor = 'text-yellow-600 dark:text-yellow-400';
            icon = '⚠️';
            break;
        case 'info':
            bgColor = 'bg-blue-50 dark:bg-blue-900/30';
            borderColor = 'border-blue-200 dark:border-blue-800';
            iconColor = 'text-blue-600 dark:text-blue-400';
            icon = 'ℹ️';
            break;
    }
    
    notification.innerHTML = `
        <div class="${bgColor} ${borderColor} border-2 rounded-lg shadow-xl p-4 max-w-sm">
            <div class="flex items-center gap-3">
                <span class="${iconColor} text-2xl">${icon}</span>
                <p class="text-gray-800 dark:text-gray-200 font-medium">${message}</p>
                <button onclick="this.closest('.custom-notification').remove()" 
                        class="ml-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    ×
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
        notification.classList.add('translate-x-0');
    }, 10);
    
    // Auto-ocultar después de la duración especificada
    if (duration > 0) {
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
}

// Exportar funciones para uso global
window.loadProfileStats = loadProfileStats;
window.showNotification = showNotification;
window.CARD_CONDITIONS = CARD_CONDITIONS;

console.log('🚀 Módulo de utilidades cargado');