/**
 * Sistema de notificaciones personalizadas - Optimizado
 */

import { UI_CONFIG } from '../constants/config.js';

// Queue de notificaciones para evitar spam
const notificationQueue = [];
let isProcessingQueue = false;
let notificationId = 0;

/**
 * Muestra una notificación personalizada con optimizaciones
 */
export function showNotification(message, type = 'success', duration = UI_CONFIG.NOTIFICATION_DURATION) {
    // Añadir a la cola
    notificationQueue.push({
        id: ++notificationId,
        message,
        type,
        duration,
        timestamp: Date.now()
    });
    
    // Procesar cola si no está en proceso
    if (!isProcessingQueue) {
        processNotificationQueue();
    }
}

/**
 * Procesa la cola de notificaciones
 */
async function processNotificationQueue() {
    if (isProcessingQueue || notificationQueue.length === 0) return;
    
    isProcessingQueue = true;
    
    while (notificationQueue.length > 0) {
        const notification = notificationQueue.shift();
        await createNotification(notification);
        
        // Pequeña pausa entre notificaciones
        if (notificationQueue.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    isProcessingQueue = false;
}

/**
 * Crea una notificación individual
 */
async function createNotification({ id, message, type, duration }) {
    // Crear contenedor de notificaciones si no existe
    let notificationContainer = getElement('#notificationContainer');
    if (!notificationContainer) {
        notificationContainer = createNotificationContainer();
    }

    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.dataset.id = id;
    notification.style.cssText = `
        background: ${getNotificationColor(type)};
        color: white;
        padding: 12px 16px;
        margin-bottom: 10px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease, opacity 0.3s ease;
        position: relative;
        overflow: hidden;
        max-width: 400px;
        word-wrap: break-word;
    `;

    // Añadir icono según el tipo
    const icon = getNotificationIcon(type);
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 18px; flex-shrink: 0;">${icon}</span>
            <span style="flex: 1;">${message}</span>
            <button onclick="removeNotification(${id})" style="
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                margin-left: 8px;
                opacity: 0.7;
                transition: opacity 0.2s ease;
            " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">×</button>
        </div>
        <div style="
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            background: rgba(255, 255, 255, 0.3);
            animation: progress ${duration}ms linear;
        "></div>
    `;

    // Añadir estilos de animación si no existen
    addNotificationStyles();

    // Añadir a contenedor
    notificationContainer.appendChild(notification);

    // Animar entrada
    await new Promise(resolve => {
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
            setTimeout(resolve, 300);
        });
    });

    // Auto-remover después del tiempo especificado
    setTimeout(() => {
        removeNotification(id);
    }, duration);
}

/**
 * Crea el contenedor de notificaciones
 */
function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notificationContainer';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
        pointer-events: none;
    `;
    document.body.appendChild(container);
    return container;
}

/**
 * Añade estilos de animación para notificaciones
 */
function addNotificationStyles() {
    if (document.querySelector('#notification-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes progress {
            from { width: 100%; }
            to { width: 0%; }
        }
        
        .notification {
            pointer-events: auto;
        }
        
        .notification:hover {
            transform: translateX(-5px) !important;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Remueve una notificación específica
 */
window.removeNotification = function(id) {
    const notification = document.querySelector(`[data-id="${id}"]`);
    if (notification) {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
};

/**
 * Obtiene el color de fondo según el tipo de notificación
 */
function getNotificationColor(type) {
    const colors = {
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
        loading: '#6B7280'
    };
    return colors[type] || colors.info;
}

/**
 * Obtiene el icono según el tipo de notificación
 */
function getNotificationIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
        loading: '⏳'
    };
    return icons[type] || icons.info;
}

/**
 * Muestra mensaje de error específico
 */
export function showError(message) {
    showNotification(message, 'error');
}

/**
 * Muestra mensaje de éxito
 */
export function showSuccess(message) {
    showNotification(message, 'success');
}

/**
 * Muestra mensaje de advertencia
 */
export function showWarning(message) {
    showNotification(message, 'warning');
}

/**
 * Muestra mensaje informativo
 */
export function showInfo(message) {
    showNotification(message, 'info');
}

/**
 * Muestra notificación de carga
 */
export function showLoading(message = 'Cargando...') {
    return showNotification(message, 'loading', 0); // Sin auto-remover
}

/**
 * Limpia todas las notificaciones
 */
export function clearAllNotifications() {
    const container = getElement('#notificationContainer');
    if (container) {
        container.innerHTML = '';
    }
    notificationQueue.length = 0;
}

/**
 * Obtiene estadísticas de notificaciones
 */
export function getNotificationStats() {
    return {
        queueLength: notificationQueue.length,
        isProcessing: isProcessingQueue,
        totalNotifications: notificationId
    };
}

/**
 * Helper para obtener elementos del DOM
 */
function getElement(selector) {
    return document.querySelector(selector);
}