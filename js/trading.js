// TCGtrade - Funciones de Intercambios
// JavaScript extraído del HTML para mejor organización

// Función de búsqueda de cartas para intercambios con debounce
let searchTimeout;
window.searchCardForTrade = async function(input, type, cardIndex) {
    const query = input.value.trim();
    const resultsContainer = input.parentElement.nextElementSibling;
    
    // Limpiar timeout anterior
    clearTimeout(searchTimeout);
    
    if (query.length < 2) {
        resultsContainer.classList.add('hidden');
        resultsContainer.innerHTML = '';
        return;
    }
    
    // Mostrar loading
    resultsContainer.innerHTML = `
        <div class="p-3 text-center text-gray-500 dark:text-gray-400">
            <div class="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
            <span class="ml-2">Buscando...</span>
        </div>
    `;
    resultsContainer.classList.remove('hidden');
    
    // Debounce de 300ms
    searchTimeout = setTimeout(async () => {
        try {
            // Usar el proxy en lugar de la API directa
            const encodedQuery = encodeURIComponent(query);
            const response = await fetch(`https://tcgtrade-production.up.railway.app/api/pokemontcg/cards?q=${encodedQuery}&pageSize=10`, {
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
                // Función para escapar caracteres especiales en onclick
                const escapeForOnclick = (str) => {
                    return String(str || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
                };
                
                resultsContainer.innerHTML = data.data.map(card => `
                    <div class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2 border-b border-gray-200 dark:border-gray-600 last:border-0"
                         onclick="selectCardForTrade('${type}', ${cardIndex}, '${escapeForOnclick(card.id)}', '${escapeForOnclick(card.name)}', '${escapeForOnclick(card.images.small)}', '${escapeForOnclick(card.set?.name || '')}', '${escapeForOnclick(card.number || '')}')">
                        <img src="${card.images.small}" alt="${card.name}" class="w-10 h-14 object-contain">
                        <div class="flex-1">
                            <div class="font-medium text-sm text-gray-900 dark:text-white">${card.name}</div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">${card.set?.name || 'Set desconocido'} - ${card.number || 'N/A'}</div>
                        </div>
                    </div>
                `).join('');
            } else {
                resultsContainer.innerHTML = `
                    <div class="p-3 text-center text-gray-500 dark:text-gray-400">
                        No se encontraron cartas
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error buscando cartas:', error);
            resultsContainer.innerHTML = `
                <div class="p-3 text-center text-red-500">
                    Error al buscar cartas. Intenta de nuevo.
                </div>
            `;
            // Reintentar con timeout más largo
            setTimeout(() => {
                resultsContainer.classList.add('hidden');
            }, 3000);
        }
    }, 500); // Aumentar debounce a 500ms para evitar demasiadas peticiones
};

// Función para seleccionar una carta del autocompletado
window.selectCardForTrade = function(type, cardIndex, cardId, cardName, cardImage, setName, cardNumber, shouldLock = false) {
    console.log('🎯 selectCardForTrade llamado:', { type, cardIndex, cardName, shouldLock });
    console.log('📍 Llamado desde:', shouldLock ? 'MIS CARTAS' : 'BUSCADOR API');
    
    // Usar el ID correcto del contenedor
    const containerId = type === 'offered' ? 'offeredCardsContainer' : 'wantedCardsContainer';
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error('❌ selectCardForTrade: No se encontró el contenedor:', containerId);
        alert('Error: No se pudo encontrar el contenedor de cartas. Recarga la página.');
        return;
    }
    
    const cardElement = container.querySelectorAll('.trade-card')[cardIndex];
    
    if (cardElement) {
        console.log('✅ Elemento de carta encontrado en índice:', cardIndex);
        
        // Actualizar el input visible
        const nameInput = cardElement.querySelector(`input[name="${type}_name_${cardIndex}"]`);
        if (nameInput) {
            nameInput.value = cardName;
            
            // Solo bloquear si viene de "Mis Cartas" (shouldLock = true)
            if (shouldLock) {
                nameInput.readOnly = true;
                nameInput.classList.add('bg-gray-100', 'dark:bg-gray-700', 'cursor-not-allowed');
                nameInput.classList.remove('bg-white', 'dark:bg-gray-700');
                console.log('✅ Carta seleccionada desde Mis Cartas y BLOQUEADA:', cardName);
                
                // Bloquear también los selectores
                const conditionSelect = cardElement.querySelector('select[name*="_condition_"]');
                const languageSelect = cardElement.querySelector('select[name*="_language_"]');
                if (conditionSelect) {
                    conditionSelect.disabled = true;
                    conditionSelect.classList.add('bg-gray-100', 'dark:bg-gray-700', 'cursor-not-allowed');
                }
                if (languageSelect) {
                    languageSelect.disabled = true;
                    languageSelect.classList.add('bg-gray-100', 'dark:bg-gray-700', 'cursor-not-allowed');
                }
                
                // SOLO desde Mis Cartas: Añadir nueva fila vacía después de bloquear
                setTimeout(() => {
                    if (typeof addCardToTrade === 'function') {
                        addCardToTrade(type);
                    }
                }, 100);
            } else {
                // Desde el buscador API - NO bloquear y NO crear nueva línea
                console.log('✅ Carta seleccionada desde buscador (sin bloquear, sin nueva línea):', cardName);
                // NO hacer nada más, solo llenar los datos
            }
        } else {
            console.error('❌ No se encontró el input de nombre');
        }
        
        // Actualizar los campos ocultos
        const idInput = cardElement.querySelector(`input[name="${type}_id_${cardIndex}"]`);
        const imageInput = cardElement.querySelector(`input[name="${type}_image_${cardIndex}"]`);
        const setInput = cardElement.querySelector(`input[name="${type}_set_${cardIndex}"]`);
        const numberInput = cardElement.querySelector(`input[name="${type}_number_${cardIndex}"]`);
        
        if (idInput) idInput.value = cardId;
        if (imageInput) imageInput.value = cardImage;
        if (setInput) setInput.value = setName;
        if (numberInput) numberInput.value = cardNumber;
        
        // Ocultar resultados (solo si existe nameInput)
        if (nameInput && nameInput.parentElement && nameInput.parentElement.nextElementSibling) {
            const resultsContainer = nameInput.parentElement.nextElementSibling;
            resultsContainer.classList.add('hidden');
            resultsContainer.innerHTML = '';
        }
        
        // Solo mostrar miniatura si viene de "Mis Cartas" (cuando se bloquea)
        if (shouldLock) {
            showCardThumbnail(cardElement, cardImage, cardName);
        }
        
        // Actualizar título generado
        if (typeof updateGeneratedTitle === 'function') {
            updateGeneratedTitle();
        }
    }
};

// Función para mostrar miniatura de carta seleccionada
function showCardThumbnail(cardElement, imageUrl, cardName) {
    if (!imageUrl) {
        console.log('⚠️ No hay URL de imagen para mostrar miniatura');
        return;
    }
    
    // Buscar el input de nombre
    const nameInput = cardElement.querySelector('.card-name-input');
    if (!nameInput) return;
    
    // Buscar o crear contenedor de miniatura al lado del input
    let thumbnailContainer = cardElement.querySelector('.card-thumbnail-inline');
    
    if (!thumbnailContainer) {
        // Crear contenedor inline para el icono con hover
        thumbnailContainer = document.createElement('div');
        thumbnailContainer.className = 'card-thumbnail-inline absolute right-2 top-1/2 -translate-y-1/2 z-10';
        nameInput.parentElement.style.position = 'relative';
        nameInput.parentElement.appendChild(thumbnailContainer);
        
        // Ajustar padding del input para hacer espacio al icono
        nameInput.style.paddingRight = '2.5rem';
    }
    
    // Usar un ID único en lugar del índice para evitar problemas
    const uniqueId = `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    thumbnailContainer.setAttribute('data-card-id', uniqueId);
    
    thumbnailContainer.innerHTML = `
        <div class="relative group">
            <button type="button" 
                    class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    title="Ver carta">
                <span class="text-xl">🖼️</span>
            </button>
            <!-- Preview on hover - Tamaño grande y centrado -->
            <div class="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl p-2">
                    <img src="${imageUrl}" alt="${cardName}" class="w-32 h-44 object-contain">
                    <div class="text-xs text-center mt-1 text-gray-600 dark:text-gray-300 max-w-32 truncate">${cardName}</div>
                </div>
            </div>
        </div>
    `;
}

// Función para limpiar la selección de una carta
window.clearCardSelection = function(type, cardIndex) {
    const containerId = type === 'offered' ? 'offeredCardsContainer' : 'wantedCardsContainer';
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const cardElement = container.querySelectorAll('.trade-card')[cardIndex];
    if (!cardElement) return;
    
    // Limpiar el input de nombre y desbloquearlo
    const nameInput = cardElement.querySelector(`input[name="${type}_name_${cardIndex}"]`);
    if (nameInput) {
        nameInput.value = '';
        nameInput.readOnly = false;
        nameInput.classList.remove('bg-gray-100', 'dark:bg-gray-700', 'cursor-not-allowed');
        nameInput.focus();
    }
    
    // Limpiar campos ocultos
    const idInput = cardElement.querySelector(`input[name="${type}_id_${cardIndex}"]`);
    const imageInput = cardElement.querySelector(`input[name="${type}_image_${cardIndex}"]`);
    const setInput = cardElement.querySelector(`input[name="${type}_set_${cardIndex}"]`);
    const numberInput = cardElement.querySelector(`input[name="${type}_number_${cardIndex}"]`);
    
    if (idInput) idInput.value = '';
    if (imageInput) imageInput.value = '';
    if (setInput) setInput.value = '';
    if (numberInput) numberInput.value = '';
    
    // Quitar el icono de miniatura
    const thumbnailContainer = cardElement.querySelector('.card-thumbnail-inline');
    if (thumbnailContainer) {
        thumbnailContainer.remove();
        // Restaurar el padding del input
        const nameInput2 = cardElement.querySelector('.card-name-input');
        if (nameInput2) {
            nameInput2.style.paddingRight = '';
        }
    }
    
    // Actualizar título generado
    if (typeof updateGeneratedTitle === 'function') {
        updateGeneratedTitle();
    }
};

// Función para manejar Enter en el input de carta
window.handleCardInputKeypress = function(event, type, cardIndex) {
    if (event.key === 'Enter') {
        event.preventDefault();
        // Por ahora, Enter no hace nada automáticamente
        // El usuario debe hacer click en "Añadir carta"
        console.log('↩️ Enter presionado - usar botón "Añadir carta" para confirmar');
    }
};

// Función para manejar cuando el input pierde el foco
window.handleCardInputBlur = function(input, type, cardIndex) {
    // Por ahora, no hacer nada automáticamente al perder el foco
    // El usuario debe hacer click en "Añadir carta" para confirmar
    console.log('👁️ Input perdió el foco - usar botón "Añadir carta" para confirmar');
};

// Función para añadir cartas desde "Mis Cartas"
window.addFromMyCards = async function(type) {
    if (!currentUser) {
        if (typeof showNotification === 'function') {
            showNotification('Debes iniciar sesión para acceder a tu colección', 'warning', 4000);
        }
        return;
    }
    
    // Si no hay cache, cargar las cartas desde Firestore
    if (!userCardsCache || userCardsCache.length === 0) {
        try {
            const myCardsCollectionRef = collection(db, `users/${currentUser.uid}/my_cards`);
            const querySnapshot = await getDocs(myCardsCollectionRef);
            userCardsCache = [];
            
            querySnapshot.forEach(doc => {
                userCardsCache.push(doc.data());
            });
        } catch (error) {
            console.error('Error cargando cartas:', error);
            if (typeof showNotification === 'function') {
                showNotification('Error al cargar tu colección. Por favor, intenta de nuevo.', 'error', 5000);
            }
            return;
        }
    }
    
    if (userCardsCache.length === 0) {
        if (typeof showNotification === 'function') {
            showNotification('No tienes cartas guardadas en tu colección. Ve a "Mis Cartas" para añadir algunas.', 'info', 5000);
        }
        return;
    }
    
    // Crear modal para seleccionar cartas
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.onclick = function(e) {
        if (e.target === modal) modal.remove();
    };
    
    // Ordenar cartas por set y número
    const sortedCards = [...userCardsCache].sort((a, b) => {
        if (a.set !== b.set) return (a.set || '').localeCompare(b.set || '');
        return parseInt(a.number || 0) - parseInt(b.number || 0);
    });
    
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div class="p-4 border-b dark:border-gray-700">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                        Seleccionar de Mis Cartas (${userCardsCache.length} cartas)
                    </h3>
                    <button onclick="this.closest('.fixed').remove()" 
                            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl">
                        &times;
                    </button>
                </div>
                
                <!-- Barra de búsqueda -->
                <div class="flex gap-2">
                    <input type="text" 
                           id="myCardsSearchInput"
                           placeholder="Buscar en tu colección..."
                           class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                           oninput="filterMyCardsModal(this.value)">
                    
                    <select id="myCardsSetFilter" 
                            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                            onchange="filterMyCardsModal(document.getElementById('myCardsSearchInput').value)">
                        <option value="">Todos los sets</option>
                        ${[...new Set(sortedCards.map(c => c.set))].filter(Boolean).sort().map(set => 
                            `<option value="${set}">${set}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
            
            <div class="p-3 overflow-y-auto flex-1" id="myCardsListContainer">
                <div class="space-y-1" id="myCardsList">
                    ${sortedCards.map((card, index) => {
                        // Función para escapar caracteres especiales
                        const escapeForOnclick = (str) => {
                            return String(str || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
                        };
                        
                        const safeCardName = escapeForOnclick(card.name);
                        const safeImageUrl = escapeForOnclick(card.imageUrl);
                        const safeSet = escapeForOnclick(card.set);
                        const safeNumber = escapeForOnclick(card.number);
                        
                        return `
                        <div class="my-card-row flex items-center gap-2 p-2 bg-white dark:bg-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                             data-card-name="${card.name?.toLowerCase() || ''}"
                             data-card-set="${card.set?.toLowerCase() || ''}">
                            
                            <!-- Icono de imagen con hover -->
                            <div class="relative group">
                                <button type="button" 
                                        class="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                                        title="Ver carta">
                                    <span class="text-lg">🖼️</span>
                                </button>
                                
                                <!-- Vista previa al hover (solo imagen) -->
                                <div class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000] hidden group-hover:block pointer-events-none">
                                    <img src="${card.imageUrl}" 
                                         alt="${card.name}" 
                                         class="w-80 h-auto shadow-2xl rounded-lg">
                                </div>
                            </div>
                            
                            <!-- Información de la carta (más compacta) -->
                            <div class="flex-1 min-w-0">
                                <div class="font-medium text-sm text-gray-900 dark:text-white truncate">${card.name || 'Sin nombre'}</div>
                                <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    ${card.set || 'Set desconocido'} • #${card.number || 'N/A'} • ${card.language || 'Español'} ${card.condition ? `• ${CARD_CONDITIONS[card.condition]?.icon || ''} ${card.condition}` : ''}
                                </div>
                            </div>
                            
                            <!-- Botón de seleccionar -->
                            <button onclick="selectFromMyCards('${type}', '${card.id}', '${safeCardName}', '${safeImageUrl}', '${safeSet}', '${safeNumber}', '${card.language || 'Español'}', '${card.condition || 'NM'}'); this.closest('.fixed').remove();"
                                    class="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-medium">
                                + Añadir
                            </button>
                        </div>
                        `;
                    }).join('')}
                </div>
                
                <!-- Mensaje cuando no hay resultados -->
                <div id="noResultsMessage" class="hidden text-center py-8 text-gray-500 dark:text-gray-400">
                    No se encontraron cartas que coincidan con tu búsqueda
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
};

// Función para filtrar cartas en el modal
window.filterMyCardsModal = function(searchTerm) {
    const setFilter = document.getElementById('myCardsSetFilter');
    const selectedSet = setFilter ? setFilter.value.toLowerCase() : '';
    const searchLower = searchTerm.toLowerCase();
    
    const cardRows = document.querySelectorAll('.my-card-row');
    const noResultsMsg = document.getElementById('noResultsMessage');
    let visibleCount = 0;
    
    cardRows.forEach(row => {
        const cardName = row.dataset.cardName || '';
        const cardSet = row.dataset.cardSet || '';
        
        const matchesSearch = !searchLower || cardName.includes(searchLower);
        const matchesSet = !selectedSet || cardSet === selectedSet;
        
        if (matchesSearch && matchesSet) {
            row.style.display = 'flex';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Mostrar mensaje si no hay resultados
    if (noResultsMsg) {
        noResultsMsg.classList.toggle('hidden', visibleCount > 0);
    }
};

// Función para seleccionar carta desde "Mis Cartas"
window.selectFromMyCards = function(type, cardId, cardName, cardImage, setName, cardNumber, language = 'Español', condition = 'NM') {
    console.log('📋 selectFromMyCards llamada con:', { type, cardId, cardName, cardImage, setName, cardNumber, language, condition });
    
    // Obtener el contenedor correcto
    const containerId = type === 'offered' ? 'offeredCardsContainer' : 'wantedCardsContainer';
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error('❌ No se encontró el contenedor:', containerId);
        return;
    }
    
    const cards = container.querySelectorAll('.trade-card');
    
    // Buscar la primera fila vacía
    let targetCardIndex = -1;
    let cardElement = null;
    
    for (let i = 0; i < cards.length; i++) {
        const nameInput = cards[i].querySelector(`input[name="${type}_name_${i}"]`);
        if (nameInput && !nameInput.value && !nameInput.readOnly) {
            targetCardIndex = i;
            cardElement = cards[i];
            break;
        }
    }
    
    // Si no hay filas vacías, añadir una nueva
    if (targetCardIndex === -1) {
        if (typeof addCardToTrade === 'function') {
            addCardToTrade(type);
        }
        const newCards = container.querySelectorAll('.trade-card');
        targetCardIndex = newCards.length - 1;
        cardElement = newCards[targetCardIndex];
    }
    
    if (!cardElement) {
        console.error('❌ No se encontró el elemento de carta');
        return;
    }
    
    // Rellenar los datos de la carta seleccionada
    // Pasar shouldLock = true porque viene de "Mis Cartas"
    selectCardForTrade(type, targetCardIndex, cardId, cardName, cardImage, setName, cardNumber, true);
    
    // Establecer el idioma de la carta
    const languageSelect = cardElement.querySelector(`select[name="${type}_language_${targetCardIndex}"]`);
    if (languageSelect) {
        console.log('✅ Selector de idioma encontrado, estableciendo:', language);
        // Buscar la opción que coincida con el idioma
        const options = languageSelect.options;
        for (let i = 0; i < options.length; i++) {
            if (options[i].value === language) {
                languageSelect.selectedIndex = i;
                console.log('✅ Idioma establecido en índice:', i);
                break;
            }
        }
    } else {
        console.error('❌ No se encontró el selector de idioma');
    }
    
    // Establecer la condición de la carta
    const conditionSelect = cardElement.querySelector(`select[name="${type}_condition_${targetCardIndex}"]`);
    if (conditionSelect) {
        console.log('✅ Selector de condición encontrado, estableciendo:', condition);
        conditionSelect.value = condition;
    } else {
        console.error('❌ No se encontró el selector de condición');
    }
    
    // IMPORTANTE: Marcar que esta carta viene de "Mis Cartas"
    const fromMyCardsInput = cardElement.querySelector(`input[name="${type}_fromMyCards_${targetCardIndex}"]`);
    if (fromMyCardsInput) {
        fromMyCardsInput.value = 'true';
        console.log('✅ Carta marcada como proveniente de "Mis Cartas"');
    }
    
    // Verificar que el nombre se haya establecido correctamente
    const nameInput = cardElement.querySelector(`input[name="${type}_name_${targetCardIndex}"]`);
    if (nameInput) {
        console.log('✅ Nombre establecido:', nameInput.value);
    } else {
        console.error('❌ No se encontró el input de nombre');
    }
};

// Función para contar cuántas personas ofrecen una carta específica
function getCardOffersCount(cardName, cardSet) {
    let offersCount = 0;
    
    // Debug: log para ver qué carta estamos buscando
    console.log('🔍 Buscando ofertas para:', cardName, 'del set:', cardSet);
    
    // Buscar en todos los intercambios guardados en localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith('userTrades_')) {
            try {
                const trades = JSON.parse(localStorage.getItem(key) || '[]');
                console.log(`📦 Revisando ${trades.length} intercambios en ${key}`);
                
                // Contar las veces que esta carta aparece en las cartas ofrecidas
                trades.forEach(trade => {
                    if (trade.offeredCards && Array.isArray(trade.offeredCards)) {
                        trade.offeredCards.forEach(offeredCard => {
                            const offeredCardName = offeredCard.name || offeredCard;
                            const offeredCardSet = offeredCard.set || '';
                            
                            console.log(`  - Comparando "${cardName}" (${cardSet}) con "${offeredCardName}" (${offeredCardSet})`);
                            
                            // Comparación exacta de nombre Y set
                            const nameMatch = offeredCardName && offeredCardName.toLowerCase() === cardName.toLowerCase();
                            const setMatch = offeredCardSet && offeredCardSet.toLowerCase() === cardSet.toLowerCase();
                            
                            if (nameMatch && setMatch) {
                                console.log('  ✅ ¡Coincidencia exacta encontrada!');
                                offersCount++;
                            }
                        });
                    }
                });
            } catch (error) {
                console.error('Error al procesar intercambios:', error);
            }
        }
    }
    
    console.log(`📊 Total de ofertas encontradas para "${cardName}" del set "${cardSet}": ${offersCount}`);
    return offersCount;
}

// Función de debug para ver todos los intercambios
window.debugShowAllTrades = function() {
    console.log('🔍 === MOSTRANDO TODOS LOS INTERCAMBIOS ===');
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith('userTrades_')) {
            try {
                const trades = JSON.parse(localStorage.getItem(key) || '[]');
                console.log(`\n📦 Usuario: ${key}`);
                console.log(`Total de intercambios: ${trades.length}`);
                
                trades.forEach((trade, index) => {
                    console.log(`\n--- Intercambio ${index + 1} ---`);
                    console.log('ID:', trade.id);
                    console.log('Título:', trade.title);
                    console.log('Descripción:', trade.description);
                    console.log('Creado:', trade.createdAt);
                    
                    console.log('\n📤 Cartas Ofrecidas:');
                    if (trade.offeredCards && trade.offeredCards.length > 0) {
                        trade.offeredCards.forEach((card, i) => {
                            if (typeof card === 'object') {
                                console.log(`  ${i + 1}. ${card.name} - Set: ${card.set || 'N/A'} - Condición: ${card.condition || 'N/A'} - Idioma: ${card.language || 'N/A'}`);
                            } else {
                                console.log(`  ${i + 1}. ${card}`);
                            }
                        });
                    } else {
                        console.log('  (Sin cartas ofrecidas)');
                    }
                    
                    console.log('\n📥 Cartas Buscadas:');
                    if (trade.wantedCards && trade.wantedCards.length > 0) {
                        trade.wantedCards.forEach((card, i) => {
                            if (typeof card === 'object') {
                                console.log(`  ${i + 1}. ${card.name} - Set: ${card.set || 'N/A'} - Condición: ${card.condition || 'N/A'} - Idioma: ${card.language || 'N/A'}`);
                            } else {
                                console.log(`  ${i + 1}. ${card}`);
                            }
                        });
                    } else {
                        console.log('  (Sin cartas buscadas)');
                    }
                });
            } catch (error) {
                console.error('Error al procesar intercambios:', error);
            }
        }
    }
};

// Función para obtener todos los intercambios que ofrecen una carta específica
function getCardOfferDetails(cardName, cardSet) {
    const offers = [];
    
    // Buscar en todos los intercambios guardados en localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith('userTrades_')) {
            try {
                const trades = JSON.parse(localStorage.getItem(key) || '[]');
                
                trades.forEach(trade => {
                    if (trade.offeredCards && Array.isArray(trade.offeredCards)) {
                        const hasCard = trade.offeredCards.some(offeredCard => {
                            const offeredCardName = offeredCard.name || offeredCard;
                            const offeredCardSet = offeredCard.set || '';
                            
                            // Comparación exacta de nombre Y set
                            const nameMatch = offeredCardName && offeredCardName.toLowerCase() === cardName.toLowerCase();
                            const setMatch = offeredCardSet && offeredCardSet.toLowerCase() === cardSet.toLowerCase();
                            
                            return nameMatch && setMatch;
                        });
                        
                        if (hasCard) {
                            offers.push({
                                user: trade.user || 'Usuario desconocido',
                                userId: trade.userId || key.replace('userTrades_', ''),
                                title: trade.title,
                                offeredCards: trade.offeredCards,
                                wantedCards: trade.wantedCards,
                                createdAt: trade.createdAt
                            });
                        }
                    }
                });
            } catch (error) {
                console.error('Error al procesar intercambios:', error);
            }
        }
    }
    
    return offers;
}

// Función para mostrar el modal con las ofertas de una carta
window.showCardOffers = function(cardName, cardSet, cardImageUrl) {
    const offers = getCardOfferDetails(cardName, cardSet);
    
    if (offers.length === 0) {
        if (typeof showNotification === 'function') {
            showNotification('No hay ofertas disponibles para esta carta en este momento.', 'info', 4000);
        }
        return;
    }
    
    // Crear el modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.onclick = function(e) {
        if (e.target === modal) modal.remove();
    };
    
    let offersHTML = offers.map(offer => `
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-600">
            <div class="flex justify-between items-start mb-3">
                <div>
                    <h4 class="font-semibold text-gray-800 dark:text-white">${offer.title || 'Intercambio sin título'}</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Por: <span class="font-medium">${offer.user}</span></p>
                </div>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                    ${offer.createdAt ? new Date(offer.createdAt).toLocaleDateString('es-ES') : 'Fecha no disponible'}
                </span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">📤 Ofrece:</h5>
                    <div class="space-y-1">
                        ${offer.offeredCards.map(card => `
                            <div class="bg-white dark:bg-gray-600 px-2 py-1 rounded text-xs flex items-center gap-1">
                                ${card.image ? `<img src="${card.image}" alt="${card.name}" class="w-6 h-8 object-contain">` : ''}
                                <span class="text-gray-700 dark:text-gray-200">${card.name || card}</span>
                                ${card.condition ? `<span class="ml-2 text-gray-500 dark:text-gray-400">(${card.condition})</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div>
                    <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">📥 Busca:</h5>
                    <div class="space-y-1">
                        ${offer.wantedCards.map(card => `
                            <div class="bg-white dark:bg-gray-600 px-2 py-1 rounded text-xs flex items-center gap-1">
                                ${card.image ? `<img src="${card.image}" alt="${card.name}" class="w-6 h-8 object-contain">` : ''}
                                <span class="text-gray-700 dark:text-gray-200">${card.name || card}</span>
                                ${card.condition ? `<span class="ml-2 text-gray-500 dark:text-gray-400">(${card.condition})</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div class="mt-3 flex justify-end">
                <button class="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm"
                        onclick="alert('Función de contacto en desarrollo')">
                    💬 Contactar
                </button>
            </div>
        </div>
    `).join('');
    
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div class="p-6 border-b dark:border-gray-700">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <img src="${cardImageUrl}" alt="${cardName}" class="w-16 h-20 object-contain rounded">
                        <div>
                            <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                                Ofertas de ${cardName}
                            </h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400">
                                ${offers.length} ${offers.length === 1 ? 'persona ofrece' : 'personas ofrecen'} esta carta
                            </p>
                        </div>
                    </div>
                    <button onclick="this.closest('.fixed').remove()" 
                            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl">
                        &times;
                    </button>
                </div>
            </div>
            
            <div class="p-6 overflow-y-auto flex-1">
                ${offersHTML}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
};

// Función helper para obtener el nombre de usuario para mostrar en intercambios
async function getUserDisplayName(uid = null) {
    try {
        const userId = uid || currentUser?.uid;
        if (!userId) return 'Usuario';
        
        // Si es el usuario actual y no se proporciona uid
        if (!uid && currentUser) {
            // Primero intentar obtener de Firestore
            if (typeof db !== 'undefined' && db) {
                const userDoc = await getDoc(doc(db, 'users', userId));
                const userData = userDoc.data();
                
                if (userData) {
                    // PRIORIDAD 1: Username (nombre de usuario único)
                    if (userData.username) {
                        return userData.username;
                    }
                    // PRIORIDAD 2: Nombre completo si no hay username
                    if (userData.name && userData.lastName) {
                        return `${userData.name} ${userData.lastName}`;
                    }
                    // PRIORIDAD 3: Solo nombre
                    if (userData.name) {
                        return userData.name;
                    }
                    // PRIORIDAD 4: DisplayName guardado
                    if (userData.displayName) {
                        return userData.displayName;
                    }
                }
            }
            
            // Si no hay datos en Firestore, usar displayName de Auth
            if (currentUser.displayName) {
                return currentUser.displayName;
            }
            
            // Como último recurso, usar parte del email antes del @
            if (currentUser.email) {
                return currentUser.email.split('@')[0];
            }
        }
        
        return 'Usuario';
    } catch (error) {
        console.error('Error obteniendo nombre de usuario:', error);
        // Si hay error, intentar con el displayName o email del currentUser
        if (currentUser?.displayName) return currentUser.displayName;
        if (currentUser?.email) return currentUser.email.split('@')[0];
        return 'Usuario';
    }
}

// Exportar funciones para uso global
window.searchCardForTrade = window.searchCardForTrade;
window.selectCardForTrade = window.selectCardForTrade;
window.showCardThumbnail = showCardThumbnail;
window.clearCardSelection = window.clearCardSelection;
window.handleCardInputKeypress = window.handleCardInputKeypress;
window.handleCardInputBlur = window.handleCardInputBlur;
window.addFromMyCards = window.addFromMyCards;
window.filterMyCardsModal = window.filterMyCardsModal;
window.selectFromMyCards = window.selectFromMyCards;
window.getCardOffersCount = getCardOffersCount;
window.debugShowAllTrades = window.debugShowAllTrades;
window.getCardOfferDetails = getCardOfferDetails;
window.showCardOffers = window.showCardOffers;
window.getUserDisplayName = getUserDisplayName;

console.log('🚀 Módulo de intercambios cargado');