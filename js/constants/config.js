/**
 * Configuración principal de la aplicación TCGtrade - Optimizada
 */

// Configuración de Firebase
export const firebaseConfig = {
    apiKey: "AIzaSyCkgz6_Zpu0VOW6GgJxOxd9QlVccsBXnog",
    authDomain: "tcgtrade-7ba27.firebaseapp.com",
    projectId: "tcgtrade-7ba27",
    storageBucket: "tcgtrade-7ba27.firebasestorage.app",
    messagingSenderId: "207150886257",
    appId: "1:207150886257:web:26edebbeb7df7a1d935ad0",
};

// ID único de la aplicación para Firestore
export const appId = 'tcgtrade-pokemon-app';

// Token de autenticación inicial (si existe)
export const initialAuthToken = null;

// Configuración de la API - Optimizada
export const API_CONFIG = {
    POKEMON_TCG_BASE_URL: '/api/pokemontcg',
    RATE_LIMIT_DELAY: 100, // ms entre requests
    CACHE_DURATION: 10 * 60 * 1000, // 10 minutos (aumentado)
    MAX_CACHE_SIZE: 100, // Máximo 100 elementos en cache
    RETRY_ATTEMPTS: 3, // Reintentos en caso de error
    RETRY_DELAY: 1000, // 1 segundo entre reintentos
};

// Configuración de la UI - Optimizada
export const UI_CONFIG = {
    NOTIFICATION_DURATION: 3000,
    LOADING_TIMEOUT: 15000, // Aumentado a 15 segundos
    SEARCH_DEBOUNCE_DELAY: 300, // Reducido para mejor UX
    CARD_ANIMATION_DURATION: 200, // Animaciones más rápidas
    LAZY_LOAD_THRESHOLD: 100, // px antes de cargar elementos
    INFINITE_SCROLL_THRESHOLD: 200, // px para scroll infinito
};

// Configuración de validación
export const VALIDATION_CONFIG = {
    PASSWORD_MIN_LENGTH: 6,
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 20,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    SEARCH_MIN_LENGTH: 2, // Mínimo 2 caracteres para búsqueda
    SEARCH_MAX_LENGTH: 100, // Máximo 100 caracteres
};

// Configuración de performance
export const PERFORMANCE_CONFIG = {
    ENABLE_LAZY_LOADING: true,
    ENABLE_IMAGE_OPTIMIZATION: true,
    ENABLE_PREFETCH: true,
    ENABLE_SERVICE_WORKER: false, // Deshabilitado por ahora
    MAX_CONCURRENT_REQUESTS: 5,
    REQUEST_TIMEOUT: 10000, // 10 segundos
};

// Configuración de cache
export const CACHE_CONFIG = {
    ENABLE_MEMORY_CACHE: true,
    ENABLE_LOCAL_STORAGE_CACHE: true,
    CACHE_VERSION: '1.0.0',
    MAX_STORAGE_SIZE: 5 * 1024 * 1024, // 5MB
};