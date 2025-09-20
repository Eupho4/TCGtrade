// TCGtrade - Funciones de Autenticación
// JavaScript extraído del HTML para mejor organización

// Importar las funciones necesarias de Firebase
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, signInAnonymously, signInWithCustomToken, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

// Obtener instancias de Firebase (asumiendo que ya están inicializadas en app-main.js)
const auth = window.auth || getAuth();
const db = window.db || getFirestore();

// Variables globales
let currentUser = null;

// Función para manejar el login
async function handleLogin() {
    const loginEmailInput = document.getElementById('loginEmail');
    const loginPasswordInput = document.getElementById('loginPassword');
    const loginError = document.getElementById('loginError');
    
    const email = loginEmailInput?.value;
    const password = loginPasswordInput?.value;
    
    if (loginError) loginError.classList.add('hidden');

    try {
        console.log('🔐 Intentando iniciar sesión con:', email);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        currentUser = userCredential.user;
        window.currentUser = currentUser;
        
        hideAuthModal();
        console.log('✅ Usuario inició sesión:', currentUser.email);
        
        // Mostrar notificación de éxito
        if (typeof showNotification === 'function') {
            showNotification('¡Sesión iniciada correctamente!', 'success');
        }
        
        // Actualizar UI
        updateAuthUI();
        
    } catch (error) {
        console.error('❌ Error al iniciar sesión:', error);
        let errorMessage = 'Error al iniciar sesión.';
        
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            errorMessage = 'Correo o contraseña incorrectos.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Formato de correo inválido.';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Demasiados intentos fallidos. Intenta más tarde.';
        } else if (error.code === 'auth/network-request-failed') {
            errorMessage = 'Error de conexión. Verifica tu internet.';
        }
        
        if (loginError) {
            loginError.textContent = errorMessage;
            loginError.classList.remove('hidden');
        }
        
        // Mostrar notificación de error
        if (typeof showNotification === 'function') {
            showNotification(errorMessage, 'error');
        }
    }
}

// Función para manejar el registro
async function handleRegister() {
    const registerUsername = document.getElementById('registerUsername')?.value?.trim();
    const registerEmailInput = document.getElementById('registerEmail');
    const registerPasswordInput = document.getElementById('registerPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const registerError = document.getElementById('registerError');
    
    const email = registerEmailInput?.value;
    const password = registerPasswordInput?.value;
    const confirmPassword = confirmPasswordInput?.value;
    
    if (registerError) registerError.classList.add('hidden');

    // Validaciones
    if (!username || username.length < 3) {
        if (registerError) {
            registerError.textContent = 'El nombre de usuario debe tener al menos 3 caracteres.';
            registerError.classList.remove('hidden');
        }
        return;
    }

    if (password !== confirmPassword) {
        if (registerError) {
            registerError.textContent = 'Las contraseñas no coinciden.';
            registerError.classList.remove('hidden');
        }
        return;
    }

    if (password.length < 6) {
        if (registerError) {
            registerError.textContent = 'La contraseña debe tener al menos 6 caracteres.';
            registerError.classList.remove('hidden');
        }
        return;
    }

    try {
        console.log('📝 Intentando registrar usuario:', email);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        currentUser = userCredential.user;
        window.currentUser = currentUser;
        
        // Guardar información adicional del usuario
        await setDoc(doc(db, 'users', currentUser.uid), {
            username: registerUsername,
            email: email,
            createdAt: new Date().toISOString(),
            profile: {
                name: '',
                lastName: '',
                address: '',
                phone: ''
            },
            preferences: {
                darkMode: false
            }
        });
        
        hideAuthModal();
        console.log('✅ Usuario registrado:', currentUser.email);
        
        // Mostrar notificación de éxito
        if (typeof showNotification === 'function') {
            showNotification('¡Cuenta creada exitosamente!', 'success');
        }
        
        // Actualizar UI
        updateAuthUI();
        
    } catch (error) {
        console.error('❌ Error al registrar usuario:', error);
        let errorMessage = 'Error al crear la cuenta.';
        
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Este correo ya está registrado.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Formato de correo inválido.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'La contraseña es muy débil.';
        }
        
        if (registerError) {
            registerError.textContent = errorMessage;
            registerError.classList.remove('hidden');
        }
        
        // Mostrar notificación de error
        if (typeof showNotification === 'function') {
            showNotification(errorMessage, 'error');
        }
    }
}

// Función para cerrar sesión
async function handleLogout() {
    try {
        await signOut(auth);
        currentUser = null;
        window.currentUser = null;
        
        console.log('👋 Usuario cerró sesión');
        
        // Mostrar notificación
        if (typeof showNotification === 'function') {
            showNotification('Sesión cerrada', 'info');
        }
        
        // Actualizar UI
        updateAuthUI();
        
        // Redirigir a la página principal
        if (typeof showInitialSections === 'function') {
            showInitialSections();
        }
        
    } catch (error) {
        console.error('❌ Error al cerrar sesión:', error);
        if (typeof showNotification === 'function') {
            showNotification('Error al cerrar sesión', 'error');
        }
    }
}

// Función para actualizar la UI de autenticación
function updateAuthUI() {
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const profileLink = document.getElementById('profileLink');
    const logoutLink = document.getElementById('logoutLink');
    
    if (currentUser) {
        // Usuario logueado
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        if (profileLink) profileLink.style.display = 'block';
        if (logoutLink) logoutLink.style.display = 'block';
        
        // Actualizar nombre de usuario si está disponible
        const usernameDisplay = document.getElementById('usernameDisplay');
        if (usernameDisplay) {
            usernameDisplay.textContent = currentUser.displayName || currentUser.email.split('@')[0];
        }
        
    } else {
        // Usuario no logueado
        if (loginLink) loginLink.style.display = 'block';
        if (registerLink) registerLink.style.display = 'block';
        if (profileLink) profileLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'none';
    }
}

// Función para mostrar modal de autenticación
function showAuthModal(mode = 'login') {
    const authModal = document.getElementById('authModal');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const toggleToRegister = document.getElementById('toggleToRegister');
    const toggleToLogin = document.getElementById('toggleToLogin');
    
    if (!authModal) return;
    
    console.log('🔧 showAuthModal called with mode:', mode);
    
    // Mostrar modal
    authModal.classList.add('show');
    console.log('🔧 Adding show class to authModal');
    
    if (mode === 'login') {
        if (loginForm) loginForm.classList.remove('hidden');
        if (registerForm) registerForm.classList.add('hidden');
        if (toggleToRegister) toggleToRegister.classList.remove('hidden');
        if (toggleToLogin) toggleToLogin.classList.add('hidden');
    } else {
        if (loginForm) loginForm.classList.add('hidden');
        if (registerForm) registerForm.classList.remove('hidden');
        if (toggleToRegister) toggleToRegister.classList.add('hidden');
        if (toggleToLogin) toggleToLogin.classList.remove('hidden');
    }
}

// Función para ocultar modal de autenticación
function hideAuthModal() {
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.classList.remove('show');
    }
}

// Función para cambiar entre login y registro
function toggleAuthMode() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const toggleToRegister = document.getElementById('toggleToRegister');
    const toggleToLogin = document.getElementById('toggleToLogin');
    
    if (loginForm && registerForm) {
        const isLoginVisible = !loginForm.classList.contains('hidden');
        
        if (isLoginVisible) {
            // Cambiar a registro
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            if (toggleToRegister) toggleToRegister.classList.add('hidden');
            if (toggleToLogin) toggleToLogin.classList.remove('hidden');
        } else {
            // Cambiar a login
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
            if (toggleToRegister) toggleToRegister.classList.remove('hidden');
            if (toggleToLogin) toggleToLogin.classList.add('hidden');
        }
    }
}

// Configurar listener de estado de autenticación
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    window.currentUser = currentUser;
    
    if (user) {
        console.log('👤 Usuario autenticado:', user.email);
    } else {
        console.log('👤 Usuario no autenticado');
    }
    
    updateAuthUI();
});

// Configurar event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Botón de login
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    
    // Botón de registro
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', handleRegister);
    }
    
    // Botón de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Links de autenticación
    const loginLink = document.getElementById('loginLink');
    if (loginLink) {
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            showAuthModal('login');
        });
    }
    
    const registerLink = document.getElementById('registerLink');
    if (registerLink) {
        registerLink.addEventListener('click', (e) => {
            e.preventDefault();
            showAuthModal('register');
        });
    }
    
    // Toggle entre login y registro
    const toggleToRegister = document.getElementById('toggleToRegister');
    if (toggleToRegister) {
        toggleToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            toggleAuthMode();
        });
    }
    
    const toggleToLogin = document.getElementById('toggleToLogin');
    if (toggleToLogin) {
        toggleToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            toggleAuthMode();
        });
    }
    
    // Cerrar modal
    const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
    if (closeAuthModalBtn) {
        closeAuthModalBtn.addEventListener('click', hideAuthModal);
    }
    
    // Enter en formularios
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const loginInputs = loginForm.querySelectorAll('input');
        loginInputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleLogin();
                }
            });
        });
    }
    
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        const registerInputs = registerForm.querySelectorAll('input');
        registerInputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleRegister();
                }
            });
        });
    }
});

// Exportar funciones para uso global
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleLogout = handleLogout;
window.showAuthModal = showAuthModal;
window.hideAuthModal = hideAuthModal;
window.toggleAuthMode = toggleAuthMode;
window.updateAuthUI = updateAuthUI;

console.log('🚀 Módulo de autenticación cargado');