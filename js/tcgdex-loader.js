// Loader script para integración de TCGdex
// Este script se encarga de hacer disponible el módulo TCGdex globalmente

// Hacer el módulo disponible globalmente
window.tcgdexIntegration = {
    searchCardsCombined: async function(query) {
        try {
            const response = await fetch(`/api/search/combined?q=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error in combined search:', error);
            throw error;
        }
    },
    
    searchTCGdexCards: async function(query) {
        try {
            const response = await fetch(`/api/tcgdex/cards?q=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error searching TCGdex cards:', error);
            throw error;
        }
    },
    
    getTCGdexSets: async function() {
        try {
            const response = await fetch('/api/tcgdex/sets');
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching TCGdex sets:', error);
            throw error;
        }
    },
    
    getTCGdexCard: async function(cardId) {
        try {
            const response = await fetch(`/api/tcgdex/card/${cardId}`);
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching TCGdex card:', error);
            throw error;
        }
    }
};

console.log('✅ TCGdex integration loaded successfully');