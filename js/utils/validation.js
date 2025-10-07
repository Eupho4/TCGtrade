/**
 * Utilidades de validación - Optimizadas
 */

import { VALIDATION_CONFIG } from '../constants/config.js';

// Cache de validaciones para evitar recálculos
const validationCache = new Map();

/**
 * Valida un email con cache
 */
export function validateEmail(email) {
    if (!email) return { valid: false, message: 'El email es requerido' };
    
    const cacheKey = `email_${email}`;
    if (validationCache.has(cacheKey)) {
        return validationCache.get(cacheKey);
    }
    
    const result = VALIDATION_CONFIG.EMAIL_REGEX.test(email) 
        ? { valid: true }
        : { valid: false, message: 'El formato del email no es válido' };
    
    validationCache.set(cacheKey, result);
    return result;
}

/**
 * Valida una contraseña con cache
 */
export function validatePassword(password, confirmPassword = null) {
    if (!password) return { valid: false, message: 'La contraseña es requerida' };
    
    const cacheKey = `password_${password}_${confirmPassword || ''}`;
    if (validationCache.has(cacheKey)) {
        return validationCache.get(cacheKey);
    }
    
    let result = { valid: true };
    
    if (password.length < VALIDATION_CONFIG.PASSWORD_MIN_LENGTH) {
        result = { valid: false, message: `La contraseña debe tener al menos ${VALIDATION_CONFIG.PASSWORD_MIN_LENGTH} caracteres` };
    } else if (confirmPassword && password !== confirmPassword) {
        result = { valid: false, message: 'Las contraseñas no coinciden' };
    }
    
    validationCache.set(cacheKey, result);
    return result;
}

/**
 * Valida un nombre de usuario con cache
 */
export function validateUsername(username) {
    if (!username) return { valid: false, message: 'El nombre de usuario es requerido' };
    
    const cacheKey = `username_${username}`;
    if (validationCache.has(cacheKey)) {
        return validationCache.get(cacheKey);
    }
    
    let result = { valid: true };
    
    if (username.length < VALIDATION_CONFIG.USERNAME_MIN_LENGTH) {
        result = { valid: false, message: `El nombre de usuario debe tener al menos ${VALIDATION_CONFIG.USERNAME_MIN_LENGTH} caracteres` };
    } else if (username.length > VALIDATION_CONFIG.USERNAME_MAX_LENGTH) {
        result = { valid: false, message: `El nombre de usuario no puede tener más de ${VALIDATION_CONFIG.USERNAME_MAX_LENGTH} caracteres` };
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        result = { valid: false, message: 'El nombre de usuario solo puede contener letras, números y guiones bajos' };
    }
    
    validationCache.set(cacheKey, result);
    return result;
}

/**
 * Valida datos del perfil con cache
 */
export function validateProfileData(data) {
    const cacheKey = `profile_${JSON.stringify(data)}`;
    if (validationCache.has(cacheKey)) {
        return validationCache.get(cacheKey);
    }
    
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
    
    const result = {
        valid: Object.keys(errors).length === 0,
        errors
    };
    
    validationCache.set(cacheKey, result);
    return result;
}

/**
 * Valida datos de una carta con cache
 */
export function validateCardData(cardData) {
    const cacheKey = `card_${cardData.id || 'new'}`;
    if (validationCache.has(cacheKey)) {
        return validationCache.get(cacheKey);
    }
    
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
    
    const result = {
        valid: Object.keys(errors).length === 0,
        errors
    };
    
    validationCache.set(cacheKey, result);
    return result;
}

/**
 * Valida búsqueda con optimizaciones
 */
export function validateSearchQuery(query) {
    if (!query || typeof query !== 'string') {
        return { valid: false, message: 'La búsqueda es requerida' };
    }
    
    const trimmedQuery = query.trim();
    
    if (trimmedQuery.length < VALIDATION_CONFIG.SEARCH_MIN_LENGTH) {
        return { 
            valid: false, 
            message: `La búsqueda debe tener al menos ${VALIDATION_CONFIG.SEARCH_MIN_LENGTH} caracteres` 
        };
    }
    
    if (trimmedQuery.length > VALIDATION_CONFIG.SEARCH_MAX_LENGTH) {
        return { 
            valid: false, 
            message: `La búsqueda no puede tener más de ${VALIDATION_CONFIG.SEARCH_MAX_LENGTH} caracteres` 
        };
    }
    
    // Detectar caracteres especiales peligrosos
    const dangerousChars = /[<>'"&]/;
    if (dangerousChars.test(trimmedQuery)) {
        return { 
            valid: false, 
            message: 'La búsqueda contiene caracteres no válidos' 
        };
    }
    
    return { valid: true, query: trimmedQuery };
}

/**
 * Sanitiza texto para prevenir XSS con optimizaciones
 */
export function sanitizeText(text) {
    if (typeof text !== 'string') return text;
    
    // Cache de sanitización para textos repetidos
    const cacheKey = `sanitize_${text}`;
    if (validationCache.has(cacheKey)) {
        return validationCache.get(cacheKey);
    }
    
    const sanitized = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    
    validationCache.set(cacheKey, sanitized);
    return sanitized;
}

/**
 * Valida que un campo no esté vacío con optimizaciones
 */
export function validateRequired(value, fieldName) {
    if (!value || (typeof value === 'string' && value.trim().length === 0)) {
        return { valid: false, message: `${fieldName} es requerido` };
    }
    return { valid: true };
}

/**
 * Valida formato de URL
 */
export function validateURL(url) {
    if (!url) return { valid: false, message: 'La URL es requerida' };
    
    try {
        new URL(url);
        return { valid: true };
    } catch {
        return { valid: false, message: 'El formato de la URL no es válido' };
    }
}

/**
 * Valida formato de teléfono
 */
export function validatePhone(phone) {
    if (!phone) return { valid: true }; // Opcional
    
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
        return { valid: false, message: 'El formato del teléfono no es válido' };
    }
    
    return { valid: true };
}

/**
 * Valida formato de fecha
 */
export function validateDate(dateString) {
    if (!dateString) return { valid: true }; // Opcional
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return { valid: false, message: 'El formato de la fecha no es válido' };
    }
    
    // Verificar que no sea una fecha futura
    if (date > new Date()) {
        return { valid: false, message: 'La fecha no puede ser futura' };
    }
    
    return { valid: true };
}

/**
 * Limpia el cache de validaciones
 */
export function clearValidationCache() {
    validationCache.clear();
}

/**
 * Obtiene estadísticas del cache de validaciones
 */
export function getValidationCacheStats() {
    return {
        size: validationCache.size,
        keys: Array.from(validationCache.keys())
    };
}