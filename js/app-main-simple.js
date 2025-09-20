// TCGtrade - Aplicación Principal Simplificada
// Versión simplificada sin dependencias problemáticas

console.log('🚀 Iniciando aplicación principal simplificada...');

// Importar las funciones necesarias de Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

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
let app, auth, db;
try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('✅ Firebase inicializado correctamente');
} catch (error) {
    console.error('❌ Error inicializando Firebase:', error);
}

// Variables globales
let currentUser = null;

// Hacer variables disponibles globalmente
window.auth = auth;
window.db = db;
window.currentUser = currentUser;

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
    
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

// Función para mostrar secciones iniciales
function showInitialSections() {
    console.log('🏠 Mostrando secciones iniciales...');
    
    const sections = [
        'heroSection',
        'howItWorksSection',
        'featuresSection',
        'ctaSection'
    ];
    
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'block';
            section.style.visibility = 'visible';
            section.style.opacity = '1';
            section.classList.remove('hidden');
            console.log(`✅ ${sectionId} mostrada`);
        }
    });
    
    // Ocultar otras secciones
    const hiddenSections = [
        'searchResultsSection',
        'myCardsSection',
        'profileSection',
        'interchangesSection',
        'helpSection',
        'inboxSection'
    ];
    
    hiddenSections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'none';
            section.classList.add('hidden');
        }
    });
}

// Configurar listener de estado de autenticación
if (auth) {
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        window.currentUser = currentUser;
        
        if (user) {
            console.log('👤 Usuario autenticado:', user.email);
        } else {
            console.log('👤 Usuario no autenticado');
        }
    });
}

// Exportar funciones para uso global
window.showNotification = showNotification;
window.showInitialSections = showInitialSections;

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM cargado en app-main-simple');
    showInitialSections();
});

console.log('✅ Aplicación principal simplificada cargada');