// TCGtrade - Funciones de Propuestas de Intercambio
// JavaScript extraído del HTML para mejor organización

// Función para pre-cargar las cartas en la propuesta
function preloadProposalCards(originalTrade) {
    const offeredContainer = document.getElementById('proposalOfferedCardsContainer');
    const wantedContainer = document.getElementById('proposalWantedCardsContainer');
    
    console.log('📋 Pre-cargando cartas para propuesta:', originalTrade);
    
    // Pre-cargar las cartas que el otro busca (para que las ofrezcas)
    originalTrade.wantedCards.forEach((card, index) => {
        console.log('📤 Pre-cargando carta ofrecida:', card);
        const cardHtml = createProposalCardInput('offered', index, card, true);
        offeredContainer.insertAdjacentHTML('beforeend', cardHtml);
    });
    
    // Pre-cargar las cartas que el otro ofrece (para que las selecciones)
    originalTrade.offeredCards.forEach((card, index) => {
        console.log('📥 Pre-cargando carta buscada:', card);
        const cardHtml = createProposalCardInput('wanted', index, card, true);
        wantedContainer.insertAdjacentHTML('beforeend', cardHtml);
    });
}

// Función para crear un input de carta en la propuesta
function createProposalCardInput(type, index, cardData = {}, isPreloaded = false) {
    const uniqueId = `proposal_${type}_${Date.now()}_${index}`;
    
    // Asegurar que la condición tenga un valor por defecto
    if (!cardData.condition) {
        cardData.condition = 'NM';
    }
    
    console.log(`🎴 createProposalCardInput llamado:`, {
        type,
        index,
        cardData,
        isPreloaded,
        hasImage: !!cardData.image,
        imageUrl: cardData.image ? cardData.image.substring(0, 100) : 'NO IMAGE'
    });
    
    return `
        <div class="proposal-card bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600" data-unique-id="${uniqueId}">
            <div class="flex items-center gap-3">
                ${cardData.image ? `
                    <img src="${cardData.image}" 
                         alt="${cardData.name || 'Carta'}" 
                         class="w-16 h-20 object-contain rounded proposal-card-image"
                         loading="lazy"
                         onerror="console.error('Error loading image:', this.src); this.style.display='none'; this.nextElementSibling.style.display='flex';"
                         onload="console.log('Image loaded:', this.src);">
                    <div class="w-16 h-20 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center proposal-card-image" style="display:none;">
                        <span class="text-2xl">🎴</span>
                    </div>
                ` : `
                    <div class="w-16 h-20 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center proposal-card-image">
                        <span class="text-2xl">🎴</span>
                    </div>
                `}
                
                <div class="flex-1 space-y-2">
                    <div class="relative">
                        <input type="text" 
                               name="${uniqueId}_name"
                               value="${cardData.name || ''}"
                               placeholder="Buscar carta..."
                               class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                               onkeypress="handleProposalCardInputKeypress(event, '${type}', ${index})"
                               onblur="handleProposalCardInputBlur(this, '${type}', ${index})"
                               ${isPreloaded ? 'readonly' : ''}>
                        <div class="absolute right-2 top-2">
                            <button type="button" 
                                    onclick="clearProposalCardSelection('${type}', ${index})"
                                    class="text-gray-400 hover:text-red-500 transition-colors">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    <div class="flex gap-2">
                        <select name="${uniqueId}_condition" 
                                class="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-green-400">
                            <option value="M" ${cardData.condition === 'M' ? 'selected' : ''}>Mint</option>
                            <option value="NM" ${cardData.condition === 'NM' ? 'selected' : ''}>Near Mint</option>
                            <option value="EX" ${cardData.condition === 'EX' ? 'selected' : ''}>Excellent</option>
                            <option value="GD" ${cardData.condition === 'GD' ? 'selected' : ''}>Good</option>
                            <option value="LP" ${cardData.condition === 'LP' ? 'selected' : ''}>Light Played</option>
                            <option value="PL" ${cardData.condition === 'PL' ? 'selected' : ''}>Played</option>
                            <option value="PO" ${cardData.condition === 'PO' ? 'selected' : ''}>Poor</option>
                        </select>
                        
                        <select name="${uniqueId}_language" 
                                class="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-green-400">
                            <option value="Español" ${cardData.language === 'Español' ? 'selected' : ''}>Español</option>
                            <option value="Inglés" ${cardData.language === 'Inglés' ? 'selected' : ''}>Inglés</option>
                            <option value="Japonés" ${cardData.language === 'Japonés' ? 'selected' : ''}>Japonés</option>
                            <option value="Francés" ${cardData.language === 'Francés' ? 'selected' : ''}>Francés</option>
                            <option value="Alemán" ${cardData.language === 'Alemán' ? 'selected' : ''}>Alemán</option>
                            <option value="Italiano" ${cardData.language === 'Italiano' ? 'selected' : ''}>Italiano</option>
                        </select>
                    </div>
                </div>
                
                <button type="button" 
                        onclick="removeProposalCard('${type}', '${uniqueId}')"
                        class="text-red-500 hover:text-red-700 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
}

// Función para manejar Enter en el input de carta de propuesta
function handleProposalCardInputKeypress(event, type, cardIndex) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const input = event.target;
        const searchTerm = input.value.trim();
        
        if (searchTerm.length >= 2) {
            searchCardForProposal(input, type, cardIndex);
        }
    }
}

// Función para manejar cuando el input de propuesta pierde el foco
function handleProposalCardInputBlur(input, type, cardIndex) {
    const searchTerm = input.value.trim();
    
    if (searchTerm.length >= 2) {
        // Pequeño delay para permitir que se complete la búsqueda
        setTimeout(() => {
            searchCardForProposal(input, type, cardIndex);
        }, 100);
    }
}

// Función de búsqueda de cartas para propuestas
async function searchCardForProposal(input, type, cardIndex) {
    const searchTerm = input.value.trim();
    
    if (searchTerm.length < 2) return;
    
    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}&limit=5`);
        const data = await response.json();
        
        if (data.cards && data.cards.length > 0) {
            showProposalCardSuggestions(input, data.cards, type, cardIndex);
        }
    } catch (error) {
        console.error('Error buscando cartas para propuesta:', error);
    }
}

// Función para mostrar sugerencias de cartas en propuestas
function showProposalCardSuggestions(input, cards, type, cardIndex) {
    // Remover sugerencias anteriores
    const existingSuggestions = input.parentNode.querySelector('.proposal-card-suggestions');
    if (existingSuggestions) {
        existingSuggestions.remove();
    }
    
    const suggestions = document.createElement('div');
    suggestions.className = 'proposal-card-suggestions absolute top-full left-0 right-0 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto';
    
    cards.forEach(card => {
        const suggestion = document.createElement('div');
        suggestion.className = 'p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0';
        suggestion.innerHTML = `
            <div class="flex items-center gap-2">
                <img src="${card.image}" alt="${card.name}" class="w-8 h-11 object-contain">
                <div class="flex-1">
                    <div class="font-medium text-gray-900 dark:text-white">${card.name}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">${card.set}</div>
                </div>
            </div>
        `;
        
        suggestion.onclick = () => {
            selectCardForProposal(type, cardIndex, card.id, card.name, card.image, card.set, card.number);
            suggestions.remove();
        };
        
        suggestions.appendChild(suggestion);
    });
    
    input.parentNode.appendChild(suggestions);
    
    // Cerrar sugerencias al hacer clic fuera
    setTimeout(() => {
        document.addEventListener('click', function closeSuggestions(e) {
            if (!input.parentNode.contains(e.target)) {
                suggestions.remove();
                document.removeEventListener('click', closeSuggestions);
            }
        });
    }, 100);
}

// Función para seleccionar una carta del autocompletado de propuesta
function selectCardForProposal(type, cardIndex, cardId, cardName, cardImage, setName, cardNumber) {
    console.log('📋 selectCardForProposal llamada con:', { type, cardIndex, cardId, cardName, cardImage, setName, cardNumber });
    
    // Obtener el contenedor correcto
    const containerId = type === 'offered' ? 'proposalOfferedCardsContainer' : 'proposalWantedCardsContainer';
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error('❌ No se encontró el contenedor:', containerId);
        return;
    }
    
    // Buscar el elemento de carta específico
    const cardElement = container.querySelector(`[data-unique-id*="proposal_${type}_"]`);
    
    if (!cardElement) {
        console.error('❌ No se encontró el elemento de carta');
        return;
    }
    
    // Actualizar los campos
    const nameInput = cardElement.querySelector(`input[name*="_name"]`);
    if (nameInput) {
        nameInput.value = cardName;
        nameInput.readOnly = true;
    }
    
    // Actualizar la imagen
    const imageElement = cardElement.querySelector('.proposal-card-image');
    if (imageElement && cardImage) {
        imageElement.src = cardImage;
        imageElement.style.display = 'block';
        imageElement.nextElementSibling.style.display = 'none';
    }
    
    // Guardar datos adicionales como atributos
    cardElement.dataset.cardId = cardId;
    cardElement.dataset.cardName = cardName;
    cardElement.dataset.cardImage = cardImage;
    cardElement.dataset.setName = setName;
    cardElement.dataset.cardNumber = cardNumber;
    
    console.log('✅ Carta seleccionada para propuesta:', cardName);
}

// Función para limpiar la selección de una carta de propuesta
function clearProposalCardSelection(type, cardIndex) {
    const containerId = type === 'offered' ? 'proposalOfferedCardsContainer' : 'proposalWantedCardsContainer';
    const container = document.getElementById(containerId);
    
    if (!container) return;
    
    const cardElement = container.querySelector(`[data-unique-id*="proposal_${type}_"]`);
    if (!cardElement) return;
    
    // Limpiar campos
    const nameInput = cardElement.querySelector(`input[name*="_name"]`);
    if (nameInput) {
        nameInput.value = '';
        nameInput.readOnly = false;
    }
    
    // Limpiar imagen
    const imageElement = cardElement.querySelector('.proposal-card-image');
    if (imageElement) {
        imageElement.src = '';
        imageElement.style.display = 'none';
        imageElement.nextElementSibling.style.display = 'flex';
    }
    
    // Limpiar datos
    delete cardElement.dataset.cardId;
    delete cardElement.dataset.cardName;
    delete cardElement.dataset.cardImage;
    delete cardElement.dataset.setName;
    delete cardElement.dataset.cardNumber;
    
    // Remover sugerencias
    const suggestions = cardElement.querySelector('.proposal-card-suggestions');
    if (suggestions) {
        suggestions.remove();
    }
}

// Función para añadir una nueva carta a la propuesta
function addCardToProposal(type) {
    const containerId = type === 'offered' ? 'proposalOfferedCardsContainer' : 'proposalWantedCardsContainer';
    const container = document.getElementById(containerId);
    
    if (!container) return;
    
    const cardHtml = createProposalCardInput(type, container.children.length);
    container.insertAdjacentHTML('beforeend', cardHtml);
}

// Función para eliminar una carta de la propuesta
function removeProposalCard(type, uniqueId) {
    const cardElement = document.querySelector(`[data-unique-id="${uniqueId}"]`);
    if (cardElement) {
        cardElement.remove();
    }
}

// Función para añadir cartas desde "Mis Cartas" a la propuesta
async function addFromMyCardsToProposal(type) {
    if (!currentUser) {
        if (typeof showNotification === 'function') {
            showNotification('Debes iniciar sesión para acceder a tus cartas', 'warning');
        }
        return;
    }
    
    // Crear modal para seleccionar cartas
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.id = 'myCardsProposalModal';
    
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div class="p-6 border-b dark:border-gray-700">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">Seleccionar de Mis Cartas</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Elige las cartas que quieres ${type === 'offered' ? 'ofrecer' : 'buscar'}</p>
            </div>
            
            <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div class="mb-4">
                    <input type="text" id="myCardsProposalSearch" 
                           placeholder="Buscar en mis cartas..."
                           class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                           oninput="filterMyCardsProposalModal(this.value)">
                </div>
                
                <div id="myCardsProposalContainer" class="space-y-2">
                    <!-- Las cartas se cargarán aquí -->
                </div>
                
                <div id="noMyCardsProposalMessage" class="text-center text-gray-500 dark:text-gray-400 py-8 hidden">
                    <p>No tienes cartas guardadas</p>
                </div>
            </div>
            
            <div class="p-6 border-t dark:border-gray-700 flex justify-end space-x-3">
                <button onclick="document.getElementById('myCardsProposalModal').remove()" 
                        class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                    Cancelar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Cargar las cartas del usuario
    await loadMyCardsForProposal(type);
}

// Función para cargar las cartas del usuario para la propuesta
async function loadMyCardsForProposal(type) {
    if (!currentUser) return;
    
    try {
        const userCardsRef = collection(db, 'users', currentUser.uid, 'cards');
        const snapshot = await getDocs(userCardsRef);
        
        const container = document.getElementById('myCardsProposalContainer');
        const noResultsMsg = document.getElementById('noMyCardsProposalMessage');
        
        if (snapshot.empty) {
            container.innerHTML = '';
            noResultsMsg.classList.remove('hidden');
            return;
        }
        
        noResultsMsg.classList.add('hidden');
        
        let cardsHTML = '';
        snapshot.forEach(doc => {
            const card = doc.data();
            cardsHTML += `
                <div class="my-card-proposal-row flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600" 
                     data-card-name="${card.name || ''}" 
                     data-card-set="${card.set || ''}">
                    <div class="flex items-center gap-3">
                        ${card.image ? `<img src="${card.image}" alt="${card.name}" class="w-12 h-16 object-contain rounded">` : ''}
                        <div>
                            <div class="font-medium text-gray-900 dark:text-white">${card.name || 'Sin nombre'}</div>
                            <div class="text-sm text-gray-600 dark:text-gray-400">${card.set || 'Sin set'}</div>
                        </div>
                    </div>
                    <button onclick="selectFromMyCardsForProposal('${type}', '${doc.id}', '${card.name || ''}', '${card.image || ''}', '${card.set || ''}', '${card.number || ''}', '${card.language || 'Español'}', '${card.condition || 'NM'}')"
                            class="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm">
                        Seleccionar
                    </button>
                </div>
            `;
        });
        
        container.innerHTML = cardsHTML;
        
    } catch (error) {
        console.error('Error cargando cartas para propuesta:', error);
        if (typeof showNotification === 'function') {
            showNotification('Error al cargar tus cartas', 'error');
        }
    }
}

// Función para filtrar cartas en el modal de propuesta
function filterMyCardsProposalModal(searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    const cardRows = document.querySelectorAll('.my-card-proposal-row');
    const noResultsMsg = document.getElementById('noMyCardsProposalMessage');
    let visibleCount = 0;
    
    cardRows.forEach(row => {
        const cardName = row.dataset.cardName || '';
        const matchesSearch = !searchLower || cardName.includes(searchLower);
        
        if (matchesSearch) {
            row.style.display = 'flex';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    if (noResultsMsg) {
        noResultsMsg.classList.toggle('hidden', visibleCount > 0);
    }
}

// Función para seleccionar una carta del modal de propuesta
function selectFromMyCardsForProposal(type, cardId, cardName, cardImage, setName, cardNumber, language = 'Español', condition = 'NM') {
    console.log('📋 selectFromMyCardsForProposal llamada con:', { type, cardId, cardName, cardImage, setName, cardNumber, language, condition });
    
    // Obtener el contenedor correcto
    const containerId = type === 'offered' ? 'proposalOfferedCardsContainer' : 'proposalWantedCardsContainer';
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error('❌ No se encontró el contenedor:', containerId);
        return;
    }
    
    // Buscar la primera fila vacía o crear una nueva
    let targetCardIndex = -1;
    let cardElement = null;
    
    const existingCards = container.querySelectorAll('.proposal-card');
    for (let i = 0; i < existingCards.length; i++) {
        const nameInput = existingCards[i].querySelector(`input[name*="_name"]`);
        if (nameInput && !nameInput.value && !nameInput.readOnly) {
            targetCardIndex = i;
            cardElement = existingCards[i];
            break;
        }
    }
    
    // Si no hay filas vacías, añadir una nueva
    if (targetCardIndex === -1) {
        addCardToProposal(type);
        const newCards = container.querySelectorAll('.proposal-card');
        targetCardIndex = newCards.length - 1;
        cardElement = newCards[targetCardIndex];
    }
    
    if (!cardElement) {
        console.error('❌ No se encontró el elemento de carta');
        return;
    }
    
    // Rellenar los datos de la carta seleccionada
    selectCardForProposal(type, targetCardIndex, cardId, cardName, cardImage, setName, cardNumber);
    
    // Establecer el idioma de la carta
    const languageSelect = cardElement.querySelector(`select[name*="_language"]`);
    if (languageSelect) {
        languageSelect.value = language;
    }
    
    // Establecer la condición de la carta
    const conditionSelect = cardElement.querySelector(`select[name*="_condition"]`);
    if (conditionSelect) {
        conditionSelect.value = condition;
    }
    
    // Cerrar el modal
    const modal = document.getElementById('myCardsProposalModal');
    if (modal) {
        modal.remove();
    }
    
    console.log('✅ Carta seleccionada para propuesta desde "Mis Cartas"');
}

// Exportar funciones para uso global
window.preloadProposalCards = preloadProposalCards;
window.createProposalCardInput = createProposalCardInput;
window.handleProposalCardInputKeypress = handleProposalCardInputKeypress;
window.handleProposalCardInputBlur = handleProposalCardInputBlur;
window.searchCardForProposal = searchCardForProposal;
window.showProposalCardSuggestions = showProposalCardSuggestions;
window.selectCardForProposal = selectCardForProposal;
window.clearProposalCardSelection = clearProposalCardSelection;
window.addCardToProposal = addCardToProposal;
window.removeProposalCard = removeProposalCard;
window.addFromMyCardsToProposal = addFromMyCardsToProposal;
window.loadMyCardsForProposal = loadMyCardsForProposal;
window.filterMyCardsProposalModal = filterMyCardsProposalModal;
window.selectFromMyCardsForProposal = selectFromMyCardsForProposal;

console.log('🚀 Módulo de propuestas cargado');