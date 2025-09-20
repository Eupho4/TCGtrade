// TCGtrade - Aplicación Principal
// JavaScript extraído del HTML para mejor organización

// Importar las funciones necesarias de Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, signInAnonymously, signInWithCustomToken, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';

// Importar módulos de chat
import ChatManager from '/js/modules/chat.js?v=33';
import ChatUI from '/js/modules/chat-ui.js?v=33';
import { ChatDebugger } from '/js/modules/chat-debug.js?v=33';

// Importar módulos de migración y sincronización
import DataMigration from '/js/modules/data-migration.js?v=34';
import DataSync from '/js/modules/data-sync.js?v=34';

// CONFIGURACIÓN DE FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyCkgz6_Zpu0VOW6GgJxOxd9QlVccsBXnog",
    authDomain: "tcgtrade-7ba27.firebaseapp.com",
    projectId: "tcgtrade-7ba27",
    storageBucket: "tcgtrade-7ba27.firebasestorage.app",
    messagingSenderId: "207150886257",
    appId: "1:207150886257:web:26edebbeb7df7a1d935ad0",
    databaseURL: "https://tcgtrade-7ba27-default-rtdb.europe-west1.firebasedatabase.app"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ID único de la aplicación para Firestore
const appId = 'tcgtrade-pokemon-app';

// Variables globales
let currentUser = null;
let allSets = []; // Cache para todos los sets de la API
let userCardsCache = []; // Cache para las cartas del usuario

// Variables para migración y sincronización
let dataMigration = null;
let dataSync = null;

// Variable para búsqueda avanzada
let advancedSearch = null;

// Hacer variables disponibles globalmente
window.currentUser = currentUser;
window.userCardsCache = userCardsCache;
window.dataMigration = dataMigration;
window.dataSync = dataSync;
window.advancedSearch = advancedSearch;
let chatManager = null; // Gestor de chat
let chatUI = null; // UI del chat

// Referencias a elementos del DOM
let searchInput, searchResultsSection, heroSection, howItWorksSection, cardsContainer, loadingSpinner, noResultsMessage, errorMessage;
let authModal, loginForm, registerForm, loginEmailInput, loginPasswordInput, loginBtn, loginError;
let registerEmailInput, registerPasswordInput, confirmPasswordInput, registerBtn, registerError;
let closeAuthModalBtn, toggleToRegister, toggleToLogin;
let loginLink, registerLink, profileLink, logoutLink;
let myCardsNavLink, myCardsLink, myCardsSection, myCardsContainer, noMyCardsMessage, myCardsErrorMessage;
let seriesFilter, setFilter, languageFilter, applyFiltersBtn, showAllSetCardsToggle;
let profileSection, profileSidebarLinks, profileGeneralInfo, profileMyCardsTabContent, profileTradeHistory, profileSettings;
let profileEmailDisplay, profileUidDisplay, profileMemberSince, profileLoginRequiredMessage, profileGeneralInfoContent;
let profileNameInput, profileLastNameInput, profileAddressInput, profilePhoneInput, profileSaveMessage, saveProfileBtn;
let settingsNewEmailInput, emailChangeMessage, saveEmailBtn;
let settingsCurrentPasswordInput, settingsNewPasswordInput, settingsConfirmNewPasswordInput, passwordChangeMessage, savePasswordBtn;
let darkModeToggle, interchangesSection, helpSection;

// Token de autenticación inicial (si existe)
const initialAuthToken = null;

// --- Funciones de Utilidad ---
function showLoadingSpinner() {
    if (loadingSpinner) loadingSpinner.style.display = 'block';
}

function hideLoadingSpinner() {
    if (loadingSpinner) loadingSpinner.style.display = 'none';
}

// Helper function para ocultar todas las secciones de inicio
function hideHomeSections() {
    if (heroSection) heroSection.classList.add('hidden');
    const howItWorksSection = document.getElementById('howItWorksSection');
    const featuresSection = document.getElementById('featuresSection');
    const ctaSection = document.getElementById('ctaSection');
    if (howItWorksSection) howItWorksSection.classList.add('hidden');
    if (featuresSection) featuresSection.classList.add('hidden');
    if (ctaSection) ctaSection.classList.add('hidden');
}

function showInitialSections() {
    // Mostrar secciones iniciales
    if (heroSection) heroSection.classList.remove('hidden');
    
    const howItWorksSection = document.getElementById('howItWorksSection');
    const featuresSection = document.getElementById('featuresSection');
    const ctaSection = document.getElementById('ctaSection');
    if (howItWorksSection) howItWorksSection.classList.remove('hidden');
    if (featuresSection) featuresSection.classList.remove('hidden');
    if (ctaSection) ctaSection.classList.remove('hidden');
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
        type === 'error' ? 'bg-red-500 text-white' :
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'warning' ? 'bg-yellow-500 text-black' :
        'bg-blue-500 text-white'
    }`;
    
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Exportar funciones para uso global
window.showNotification = showNotification;
window.showLoadingSpinner = showLoadingSpinner;
window.hideLoadingSpinner = hideLoadingSpinner;
window.hideHomeSections = hideHomeSections;
window.showInitialSections = showInitialSections;

console.log('🚀 Módulo principal de la aplicación cargado');