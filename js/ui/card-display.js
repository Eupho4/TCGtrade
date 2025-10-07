/**
 * Módulo para mostrar y manejar cartas en la interfaz
 */

import { showSuccess, showError } from '../utils/notifications.js';
import firebaseService from '../services/firebase-service.js';

class CardDisplay {
    constructor() {
        this.cardsContainer = null;
        this.loadingSpinner = null;
        this.noResultsMessage = null;
        this.errorMessage = null;
    }

    /**
     * Inicializa el módulo con referencias del DOM
     */
    initialize(elements) {
        this.cardsContainer = elements.cardsContainer;
        this.loadingSpinner = elements.loadingSpinner;
        this.noResultsMessage = elements.noResultsMessage;
        this.errorMessage = elements.errorMessage;
    }

    /**
     * Muestra el spinner de carga
     */
    showLoading() {
        if (this.loadingSpinner) {
            this.loadingSpinner.style.display = 'block';
        }
        this.hideMessages();
    }

    /**
     * Oculta el spinner de carga
     */
    hideLoading() {
        if (this.loadingSpinner) {
            this.loadingSpinner.style.display = 'none';
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
        }
        if (this.noResultsMessage) {
            this.noResultsMessage.style.display = 'none';
        }
    }

    /**
     * Renderiza una lista de cartas
     */
    renderCards(cards, options = {}) {
        if (!this.cardsContainer) return;

        this.hideLoading();
        this.hideMessages();

        if (!cards || cards.length === 0) {
            this.showNoResults();
            return;
        }

        // Limpiar contenedor
        this.cardsContainer.innerHTML = '';

        // Renderizar cada carta
        cards.forEach(card => {
            const cardElement = this.createCardElement(card, options);
            this.cardsContainer.appendChild(cardElement);
        });

        console.log(`✅ ${cards.length} cartas renderizadas`);
    }

    /**
     * Crea un elemento HTML para una carta
     */
    createCardElement(card, options = {}) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.style.cssText = `
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            cursor: pointer;
        `;

        // Añadir hover effect
        cardDiv.addEventListener('mouseenter', () => {
            cardDiv.style.transform = 'translateY(-4px)';
            cardDiv.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
        });

        cardDiv.addEventListener('mouseleave', () => {
            cardDiv.style.transform = 'translateY(0)';
            cardDiv.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        });

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

        // Efecto de zoom en hover
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
            line-height: 1.4;
        `;

        const cardDetails = document.createElement('div');
        cardDetails.style.cssText = `
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 12px;
        `;

        // Información adicional
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

        return cardDiv;
    }

    /**
     * Muestra los detalles de una carta en un modal
     */
    showCardDetails(card) {
        // Crear modal si no existe
        let modal = document.getElementById('cardDetailsModal');
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

        // Mostrar modal
        modal.style.display = 'flex';
    }

    /**
     * Crea el modal de detalles de carta
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
            modal.style.display = 'none';
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
                modal.style.display = 'none';
            }
        });

        return modal;
    }

    /**
     * Añade una carta a la colección del usuario
     */
    async addCardToCollection(card) {
        if (!firebaseService.isAuthenticated()) {
            showError('Debes iniciar sesión para añadir cartas a tu colección');
            return;
        }

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
    clear() {
        if (this.cardsContainer) {
            this.cardsContainer.innerHTML = '';
        }
        this.hideMessages();
    }
}

// Crear instancia singleton
const cardDisplay = new CardDisplay();

export default cardDisplay;