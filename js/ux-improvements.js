/**
 * Mejoras de UX/UI para TCGtrade
 */

// Variables globales para filtros
let currentFilter = 'all';
let filtersContainer = null;

// Inicializar mejoras de UX
function initializeUXImprovements() {
    console.log('🎨 Inicializando mejoras de UX...');
    
    // Obtener contenedor de filtros
    filtersContainer = document.getElementById('filtersContainer');
    
    // Configurar filtros visuales
    setupVisualFilters();
    
    // Añadir micro-interacciones a botones
    addMicroInteractions();
    
    // Configurar animaciones de entrada
    setupEntryAnimations();
    
    console.log('✅ Mejoras de UX inicializadas');
}

// Configurar filtros visuales
function setupVisualFilters() {
    if (!filtersContainer) return;
    
    // Mostrar filtros cuando se hace búsqueda
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            if (e.target.value.length > 0) {
                showFilters();
            } else {
                hideFilters();
            }
        });
    }
}

// Mostrar filtros
function showFilters() {
    if (filtersContainer) {
        filtersContainer.style.display = 'block';
        filtersContainer.classList.add('fade-in');
    }
}

// Ocultar filtros
function hideFilters() {
    if (filtersContainer) {
        filtersContainer.style.display = 'none';
    }
}

// Toggle de filtros
function toggleFilter(element) {
    // Remover active de todos los filtros
    const allFilters = document.querySelectorAll('.filter-chip');
    allFilters.forEach(filter => filter.classList.remove('active'));
    
    // Añadir active al filtro seleccionado
    element.classList.add('active');
    
    // Actualizar filtro actual
    currentFilter = element.dataset.filter;
    
    // Aplicar filtro
    applyFilter();
}

// Aplicar filtro
function applyFilter() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const query = searchInput.value.trim();
    if (query.length < 2) return;
    
    // Ejecutar búsqueda con filtro
    handleSearchWithFilter(query, currentFilter);
}

// Búsqueda con filtro
async function handleSearchWithFilter(query, filter) {
    try {
        showLoadingSpinner();
        
        let searchQuery = query;
        if (filter !== 'all') {
            searchQuery += ` type:${filter}`;
        }
        
        const response = await fetch(`/api/pokemontcg/cards?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        
        hideLoadingSpinner();
        
        if (data.data && data.data.length > 0) {
            renderCardsWithFilter(data.data, filter);
        } else {
            showNoResults();
        }
    } catch (error) {
        console.error('❌ Error en búsqueda con filtro:', error);
        hideLoadingSpinner();
        showError('Error al buscar cartas');
    }
}

// Renderizar cartas con filtro
function renderCardsWithFilter(cards, filter) {
    const cardsContainer = document.getElementById('cardsContainer');
    if (!cardsContainer) return;
    
    cardsContainer.innerHTML = '';
    
    // Filtrar cartas por tipo si no es 'all'
    let filteredCards = cards;
    if (filter !== 'all') {
        filteredCards = cards.filter(card => 
            card.types && card.types.some(type => 
                type.toLowerCase().includes(filter.toLowerCase())
            )
        );
    }
    
    filteredCards.forEach((card, index) => {
        const cardElement = createCardElementWithAnimation(card, index);
        cardsContainer.appendChild(cardElement);
    });
    
    console.log(`✅ ${filteredCards.length} cartas renderizadas con filtro ${filter}`);
}

// Crear elemento de carta con animación
function createCardElementWithAnimation(card, index) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card card-hover';
    cardDiv.style.cssText = `
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        transition: all 0.3s ease;
        cursor: pointer;
        margin-bottom: 20px;
        opacity: 0;
        transform: translateY(20px);
    `;

    // Añadir animación escalonada
    setTimeout(() => {
        cardDiv.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        cardDiv.style.opacity = '1';
        cardDiv.style.transform = 'translateY(0)';
    }, index * 100);

    // Imagen de la carta
    const imageContainer = document.createElement('div');
    imageContainer.style.cssText = `
        position: relative;
        width: 100%;
        height: 200px;
        background: #f8f9fa;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    `;

    const cardImage = document.createElement('img');
    cardImage.src = card.imageUrl || card.imageUrlHiRes || '/images/card-placeholder.svg';
    cardImage.alt = card.name;
    cardImage.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    `;

    // Efecto hover en imagen
    cardImage.addEventListener('mouseenter', () => {
        cardImage.style.transform = 'scale(1.05)';
    });

    cardImage.addEventListener('mouseleave', () => {
        cardImage.style.transform = 'scale(1)';
    });

    imageContainer.appendChild(cardImage);

    // Información de la carta
    const cardInfo = document.createElement('div');
    cardInfo.style.cssText = `
        padding: 16px;
    `;

    const cardName = document.createElement('h3');
    cardName.textContent = card.name;
    cardName.style.cssText = `
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
    `;

    const cardDetails = document.createElement('div');
    cardDetails.style.cssText = `
        font-size: 14px;
        color: #6b7280;
        margin-bottom: 12px;
    `;

    const details = [];
    if (card.set) details.push(`Set: ${card.set}`);
    if (card.number) details.push(`#${card.number}`);
    if (card.rarity) details.push(card.rarity);
    if (card.hp) details.push(`HP: ${card.hp}`);

    cardDetails.textContent = details.join(' • ');

    cardInfo.appendChild(cardName);
    cardInfo.appendChild(cardDetails);

    cardDiv.appendChild(imageContainer);
    cardDiv.appendChild(cardInfo);

    return cardDiv;
}

// Añadir micro-interacciones a botones
function addMicroInteractions() {
    // Añadir clase btn-hover a todos los botones
    const buttons = document.querySelectorAll('button, .btn, .modern-search-btn');
    buttons.forEach(button => {
        button.classList.add('btn-hover');
    });
    
    // Añadir efectos de click
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

// Configurar animaciones de entrada
function setupEntryAnimations() {
    // Añadir animaciones a elementos existentes
    const heroSection = document.getElementById('heroSection');
    if (heroSection) {
        heroSection.classList.add('fade-in');
    }
    
    const howItWorksSection = document.getElementById('howItWorksSection');
    if (howItWorksSection) {
        howItWorksSection.classList.add('slide-in-up');
    }
}

// Mejorar función de búsqueda existente
function enhanceSearchFunction() {
    const originalHandleSearch = window.handleSearch;
    if (originalHandleSearch) {
        window.handleSearch = function(query) {
            // Mostrar filtros si hay búsqueda
            if (query.length > 0) {
                showFilters();
            } else {
                hideFilters();
            }
            
            // Llamar función original
            return originalHandleSearch(query);
        };
    }
}

// Mejorar función de renderizado existente
function enhanceRenderFunction() {
    const originalRenderCards = window.renderCards;
    if (originalRenderCards) {
        window.renderCards = function(cards) {
            // Llamar función original
            const result = originalRenderCards(cards);
            
            // Añadir animaciones
            const cardElements = document.querySelectorAll('.card');
            cardElements.forEach((card, index) => {
                card.classList.add('card-hover');
                card.style.animationDelay = `${index * 0.1}s`;
                card.classList.add('bounce-in');
            });
            
            return result;
        };
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUXImprovements);
} else {
    initializeUXImprovements();
}

// Hacer funciones globales
window.toggleFilter = toggleFilter;
window.initializeUXImprovements = initializeUXImprovements;