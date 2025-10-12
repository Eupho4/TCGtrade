/**
 * Módulo para mostrar y manejar cartas en la interfaz - Optimizado
 */

import { showSuccess, showError, showLoading } from '../utils/notifications.js';
import { UI_CONFIG, PERFORMANCE_CONFIG } from '../constants/config.js';
import firebaseService from '../services/firebase-service.js';

class CardDisplay {
    constructor() {
        this.cardsContainer = null;
        this.loadingSpinner = null;
        this.noResultsMessage = null;
        this.errorMessage = null;
        this.intersectionObserver = null;
        this.renderedCards = new Set();
        this.cardElements = new Map();
        this.isRendering = false;
    }

    /**
     * Inicializa el módulo con referencias del DOM
     */
    initialize(elements) {
        this.cardsContainer = elements.cardsContainer;
        this.loadingSpinner = elements.loadingSpinner;
        this.noResultsMessage = elements.noResultsMessage;
        this.errorMessage = elements.errorMessage;
        
        // Configurar Intersection Observer para lazy loading
        this.setupIntersectionObserver();
    }

    /**
     * Configura el Intersection Observer para lazy loading
     */
    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) return;
        
        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadCardImage(entry.target);
                }
            });
        }, {
            rootMargin: '50px'
        });
    }

    /**
     * Carga la imagen de una carta de forma lazy
     */
    loadCardImage(cardElement) {
        const img = cardElement.querySelector('img');
        if (!img || img.dataset.src) return;
        
        const src = img.dataset.src;
        if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            this.intersectionObserver?.unobserve(cardElement);
        }
    }

    /**
     * Muestra el spinner de carga con animación optimizada
     */
    showLoading(container = null) {
        const spinner = container ? 
            container.querySelector('.loading-spinner') : 
            this.loadingSpinner;
    
        if (spinner) {
            spinner.style.display = 'block';
            spinner.style.opacity = '0';
            requestAnimationFrame(() => {
                spinner.style.transition = 'opacity 0.3s ease';
                spinner.style.opacity = '1';
            });
        }
        this.hideMessages();
    }

    /**
     * Oculta el spinner de carga
     */
    hideLoading(container = null) {
        const spinner = container ? 
            container.querySelector('.loading-spinner') : 
            this.loadingSpinner;
    
        if (spinner) {
            spinner.style.transition = 'opacity 0.3s ease';
            spinner.style.opacity = '0';
            setTimeout(() => {
                spinner.style.display = 'none';
            }, 300);
        }
    }

    /**
     * Oculta todos los mensajes
     */
    hideMessages() {
        if (this.noResultsMessage) {
            this.noResultsMessage.style.display = 'none';
        }
        if (this.errorMessage) {
            this.errorMessage.style.display = 'none';
        }
    }

    /**
     * Muestra mensaje de "no hay resultados"
     */
    showNoResults() {
        this.hideLoading();
        if (this.noResultsMessage) {
            this.noResultsMessage.style.display = 'block';
            this.noResultsMessage.style.opacity = '0';
            requestAnimationFrame(() => {
                this.noResultsMessage.style.transition = 'opacity 0.5s ease';
                this.noResultsMessage.style.opacity = '1';
            });
        }
        if (this.errorMessage) {
            this.errorMessage.style.display = 'none';
        }
    }

    /**
     * Muestra mensaje de error
     */
    showError(message) {
        this.hideLoading();
        if (this.errorMessage) {
            this.errorMessage.textContent = message;
            this.errorMessage.style.display = 'block';
            this.errorMessage.style.opacity = '0';
            requestAnimationFrame(() => {
                this.errorMessage.style.transition = 'opacity 0.5s ease';
                this.errorMessage.style.opacity = '1';
            });
        }
        if (this.noResultsMessage) {
            this.noResultsMessage.style.display = 'none';
        }
    }

    /**
     * Renderiza una lista de cartas con optimizaciones de performance
     */
    async renderCards(cards, options = {}) {
        if (!this.cardsContainer) return;

        // Evitar renderizado concurrente
        if (this.isRendering) return;
        this.isRendering = true;

        try {
            this.hideLoading();
            this.hideMessages();

            if (!cards || cards.length === 0) {
                this.showNoResults();
                return;
            }

            // Limpiar contenedor
            this.clearCards();

            // Renderizar cartas en lotes para mejor performance
            await this.renderCardsInBatches(cards, options);
            
            console.log(`✅ ${cards.length} cartas renderizadas`);
        } finally {
            this.isRendering = false;
        }
    }

    /**
     * Renderiza cartas en lotes para mejor performance
     */
    async renderCardsInBatches(cards, options = {}) {
        const batchSize = 10; // Renderizar 10 cartas a la vez
        const batches = [];
        
        for (let i = 0; i < cards.length; i += batchSize) {
            batches.push(cards.slice(i, i + batchSize));
        }
        
        for (const batch of batches) {
            await this.renderBatch(batch, options);
            // Pequeña pausa entre lotes para no bloquear el UI
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }

    /**
     * Renderiza un lote de cartas
     */
    async renderBatch(cards, options = {}) {
        const fragment = document.createDocumentFragment();
        
        for (const card of cards) {
            const cardElement = this.createCardElement(card, options);
            fragment.appendChild(cardElement);
        }
        
        this.cardsContainer.appendChild(fragment);
    }

    /**
     * Crea un elemento HTML para una carta con optimizaciones
     */
    createCardElement(card, options = {}) {
        // Verificar si ya existe en cache
        const cacheKey = `${card.id}_${options.hideAddButton || false}`;
        if (this.cardElements.has(cacheKey)) {
            return this.cardElements.get(cacheKey).cloneNode(true);
        }

        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.dataset.cardId = card.id;
        cardDiv.style.cssText = `
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            cursor: pointer;
            opacity: 0;
            transform: translateY(20px);
        `;

        // Añadir animación de entrada
        requestAnimationFrame(() => {
            cardDiv.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            cardDiv.style.opacity = '1';
            cardDiv.style.transform = 'translateY(0)';
        });

        // Añadir hover effect optimizado
        cardDiv.addEventListener('mouseenter', () => {
            cardDiv.style.transform = 'translateY(-4px)';
            cardDiv.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
        });

        cardDiv.addEventListener('mouseleave', () => {
            cardDiv.style.transform = 'translateY(0)';
            cardDiv.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        });

        // Imagen de la carta con lazy loading
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
        cardImage.alt = card.name;
        cardImage.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
        `;

        // Lazy loading de imagen
        const imageUrl = card.imageUrl || card.imageUrlHiRes || '/images/card-placeholder.svg';
        cardImage.dataset.src = imageUrl;
        cardImage.src = '/images/card-placeholder.svg'; // Placeholder inicial

        // Configurar Intersection Observer para esta imagen
        if (this.intersectionObserver) {
            this.intersectionObserver.observe(cardDiv);
        }

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
            line-height: 1.4;
        `;

        const cardDetails = document.createElement('div');
        cardDetails.style.cssText = `
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 12px;
        `;

        // Información adicional optimizada
        const details = [];
        if (card.set) details.push(`Set: ${card.set}`);
        if (card.number) details.push(`#${card.number}`);
        if (card.rarity) details.push(card.rarity);
        if (card.hp) details.push(`HP: ${card.hp}`);

        cardDetails.textContent = details.join(' • ');

        // Botones de acción
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 8px;
            margin-top: 12px;
        `;

        // Botón "Ver Detalles"
        const detailsBtn = document.createElement('button');
        detailsBtn.textContent = 'Ver Detalles';
        detailsBtn.className = 'btn btn-outline';
        detailsBtn.style.cssText = `
            flex: 1;
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            background: white;
            color: #374151;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
        `;

        detailsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showCardDetails(card);
        });

        // Botón "Añadir a Colección" (solo si el usuario está autenticado)
        if (firebaseService.isAuthenticated() && !options.hideAddButton) {
            const addBtn = document.createElement('button');
            addBtn.textContent = 'Añadir';
            addBtn.className = 'btn btn-primary';
            addBtn.style.cssText = `
                flex: 1;
                padding: 8px 12px;
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s ease;
            `;

            addBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                await this.addCardToCollection(card);
            });

            buttonContainer.appendChild(addBtn);
        }

        buttonContainer.appendChild(detailsBtn);

        // Ensamblar el elemento
        cardInfo.appendChild(cardName);
        cardInfo.appendChild(cardDetails);
        cardInfo.appendChild(buttonContainer);

        cardDiv.appendChild(imageContainer);
        cardDiv.appendChild(cardInfo);

        // Click en la carta para ver detalles
        cardDiv.addEventListener('click', () => {
            this.showCardDetails(card);
        });

        // Guardar en cache
        this.cardElements.set(cacheKey, cardDiv.cloneNode(true));

        return cardDiv;
    }

    /**
     * Muestra los detalles de una carta en un modal optimizado
     */
    showCardDetails(card) {
        // Crear modal si no existe
        let modal = getElement('#cardDetailsModal');
        if (!modal) {
            modal = this.createCardDetailsModal();
            document.body.appendChild(modal);
        }

        // Llenar con datos de la carta
        const modalImage = modal.querySelector('#cardDetailsImage');
        const modalName = modal.querySelector('#cardDetailsName');
        const modalInfo = modal.querySelector('#cardDetailsInfo');

        if (modalImage) {
            modalImage.src = card.imageUrl || card.imageUrlHiRes || '/images/card-placeholder.svg';
            modalImage.alt = card.name;
        }

        if (modalName) {
            modalName.textContent = card.name;
        }

        if (modalInfo) {
            const info = [];
            if (card.set) info.push(`<strong>Set:</strong> ${card.set}`);
            if (card.number) info.push(`<strong>Número:</strong> ${card.number}`);
            if (card.rarity) info.push(`<strong>Rareza:</strong> ${card.rarity}`);
            if (card.hp) info.push(`<strong>HP:</strong> ${card.hp}`);
            if (card.types) info.push(`<strong>Tipos:</strong> ${card.types.join(', ')}`);
            if (card.attacks) {
                const attackNames = card.attacks.map(attack => attack.name).join(', ');
                info.push(`<strong>Ataques:</strong> ${attackNames}`);
            }

            modalInfo.innerHTML = info.join('<br>');
        }

        // Mostrar modal con animación
        modal.style.display = 'flex';
        modal.style.opacity = '0';
        requestAnimationFrame(() => {
            modal.style.transition = 'opacity 0.3s ease';
            modal.style.opacity = '1';
        });
    }

    /**
     * Crea el modal de detalles de carta optimizado
     */
    createCardDetailsModal() {
        const modal = document.createElement('div');
        modal.id = 'cardDetailsModal';
        modal.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            border-radius: 12px;
            max-width: 500px;
            width: 100%;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
            transform: scale(0.9);
            transition: transform 0.3s ease;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 15px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #6b7280;
            z-index: 1;
        `;

        closeBtn.addEventListener('click', () => {
            modal.style.opacity = '0';
            modalContent.style.transform = 'scale(0.9)';
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        });

        modalContent.innerHTML = `
            <div style="padding: 20px;">
                <img id="cardDetailsImage" src="" alt="" style="width: 100%; max-width: 300px; margin: 0 auto 20px; display: block; border-radius: 8px;">
                <h2 id="cardDetailsName" style="margin: 0 0 15px 0; text-align: center; color: #1f2937;"></h2>
                <div id="cardDetailsInfo" style="color: #6b7280; line-height: 1.6;"></div>
            </div>
        `;

        modalContent.insertBefore(closeBtn, modalContent.firstChild);
        modal.appendChild(modalContent);

        // Cerrar al hacer click fuera del modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.opacity = '0';
                modalContent.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 300);
            }
        });

        // Animar entrada
        modal.addEventListener('transitionend', () => {
            if (modal.style.opacity === '1') {
                modalContent.style.transform = 'scale(1)';
            }
        });

        return modal;
    }

    /**
     * Añade una carta a la colección del usuario con feedback optimizado
     */
    async addCardToCollection(card) {
        if (!firebaseService.isAuthenticated()) {
            showError('Debes iniciar sesión para añadir cartas a tu colección');
            return;
        }

        const loadingId = showLoading('Añadiendo carta...');

        try {
            const cardData = {
                id: card.id,
                name: card.name,
                imageUrl: card.imageUrl || card.imageUrlHiRes,
                set: card.set,
                series: card.series,
                number: card.number,
                language: 'Español', // Por defecto
                setId: card.setId || card.id.split('-')[0]
            };

            const result = await firebaseService.addCardToCollection(cardData);
            
            if (result.success) {
                showSuccess(`"${card.name}" añadida a tu colección`);
            } else {
                showError(result.error);
            }
        } catch (error) {
            console.error('❌ Error al añadir carta:', error);
            showError('Error al añadir carta a la colección');
        }
    }

    /**
     * Limpia el contenedor de cartas
     */
    clearCards() {
        if (this.cardsContainer) {
            this.cardsContainer.innerHTML = '';
        }
        this.renderedCards.clear();
        this.hideMessages();
    }

    /**
     * Limpia el cache de elementos
     */
    clearCache() {
        this.cardElements.clear();
        this.renderedCards.clear();
    }

    /**
     * Destruye el módulo y limpia recursos
     */
    destroy() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        this.clearCache();
    }
}

// Helper para obtener elementos del DOM
function getElement(selector) {
    return document.querySelector(selector);
}

// Crear instancia singleton
const cardDisplay = new CardDisplay();

export default cardDisplay;