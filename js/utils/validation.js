/**
 * Utilidades de validación
 */

import { VALIDATION_CONFIG } from '../constants/config.js';

/**
 * Valida un email
 */
export function validateEmail(email) {
    if (!email) return { valid: false, message: 'El email es requerido' };
    if (!VALIDATION_CONFIG.EMAIL_REGEX.test(email)) {
        return { valid: false, message: 'El formato del email no es válido' };
    }
    return { valid: true };
}

/**
 * Valida una contraseña
 */
export function validatePassword(password, confirmPassword = null) {
    if (!password) return { valid: false, message: 'La contraseña es requerida' };
    if (password.length < VALIDATION_CONFIG.PASSWORD_MIN_LENGTH) {
        return { valid: false, message: `La contraseña debe tener al menos ${VALIDATION_CONFIG.PASSWORD_MIN_LENGTH} caracteres` };
    }
    if (confirmPassword && password !== confirmPassword) {
        return { valid: false, message: 'Las contraseñas no coinciden' };
    }
    return { valid: true };
}

/**
 * Valida un nombre de usuario
 */
export function validateUsername(username) {
    if (!username) return { valid: false, message: 'El nombre de usuario es requerido' };
    if (username.length < VALIDATION_CONFIG.USERNAME_MIN_LENGTH) {
        return { valid: false, message: `El nombre de usuario debe tener al menos ${VALIDATION_CONFIG.USERNAME_MIN_LENGTH} caracteres` };
    }
    if (username.length > VALIDATION_CONFIG.USERNAME_MAX_LENGTH) {
        return { valid: false, message: `El nombre de usuario no puede tener más de ${VALIDATION_CONFIG.USERNAME_MAX_LENGTH} caracteres` };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return { valid: false, message: 'El nombre de usuario solo puede contener letras, números y guiones bajos' };
    }
    return { valid: true };
}

/**
 * Valida datos del perfil
 */
export function validateProfileData(data) {
    const errors = {};
    
    if (!data.name || data.name.trim().length === 0) {
        errors.name = 'El nombre es requerido';
    }
    
    if (!data.lastName || data.lastName.trim().length === 0) {
        errors.lastName = 'Los apellidos son requeridos';
    }
    
    if (data.phone && !/^[\d\s\-\+\(\)]+$/.test(data.phone)) {
        errors.phone = 'El formato del teléfono no es válido';
    }
    
    return {
        valid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Valida datos de una carta
 */
export function validateCardData(cardData) {
    const errors = {};
    
    if (!cardData.id) {
        errors.id = 'El ID de la carta es requerido';
    }
    
    if (!cardData.name || cardData.name.trim().length === 0) {
        errors.name = 'El nombre de la carta es requerido';
    }
    
    if (!cardData.imageUrl) {
        errors.imageUrl = 'La URL de la imagen es requerida';
    }
    
    return {
        valid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Sanitiza texto para prevenir XSS
 */
export function sanitizeText(text) {
    if (typeof text !== 'string') return text;
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

/**
 * Valida que un campo no esté vacío
 */
export function validateRequired(value, fieldName) {
    if (!value || (typeof value === 'string' && value.trim().length === 0)) {
        return { valid: false, message: `${fieldName} es requerido` };
    }
    return { valid: true };
}