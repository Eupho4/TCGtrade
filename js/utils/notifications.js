/**
 * Sistema de notificaciones personalizadas
 */

import { UI_CONFIG } from '../constants/config.js';

/**
 * Muestra una notificación personalizada
 */
export function showNotification(message, type = 'success', duration = UI_CONFIG.NOTIFICATION_DURATION) {
    // Crear contenedor de notificaciones si no existe
    let notificationContainer = document.getElementById('notificationContainer');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notificationContainer';
        notificationContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
        `;
        document.body.appendChild(notificationContainer);
    }

    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.style.cssText = `
        background: ${getNotificationColor(type)};
        color: white;
        padding: 12px 16px;
        margin-bottom: 10px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        position: relative;
        overflow: hidden;
    `;

    // Añadir icono según el tipo
    const icon = getNotificationIcon(type);
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 18px;">${icon}</span>
            <span>${message}</span>
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

    // Añadir estilos de animación
    const style = document.createElement('style');
    style.textContent = `
        @keyframes progress {
            from { width: 100%; }
            to { width: 0%; }
        }
    `;
    if (!document.querySelector('#notification-styles')) {
        style.id = 'notification-styles';
        document.head.appendChild(style);
    }

    // Añadir a contenedor
    notificationContainer.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);

    // Auto-remover después del tiempo especificado
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}

/**
 * Obtiene el color de fondo según el tipo de notificación
 */
function getNotificationColor(type) {
    const colors = {
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6'
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
        info: 'ℹ️'
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