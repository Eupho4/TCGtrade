/**
 * Configuración principal de la aplicación TCGtrade
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

// Configuración de la API
export const API_CONFIG = {
    POKEMON_TCG_BASE_URL: '/api/pokemontcg',
    RATE_LIMIT_DELAY: 100, // ms entre requests
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
};

// Configuración de la UI
export const UI_CONFIG = {
    NOTIFICATION_DURATION: 3000,
    LOADING_TIMEOUT: 10000,
    SEARCH_DEBOUNCE_DELAY: 500,
};

// Configuración de validación
export const VALIDATION_CONFIG = {
    PASSWORD_MIN_LENGTH: 6,
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 20,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};