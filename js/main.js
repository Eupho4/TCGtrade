// Firebase will be loaded from the script tags in HTML
// Using firebase compat version for backward compatibility

// TCGdex integration se carga desde tcgdex-loader.js

// CONFIGURACIÓN DE FIREBASE - REEMPLAZA CON TUS DATOS
const firebaseConfig = {
    apiKey: "AIzaSyCkgz6_Zpu0VOW6GgJxOxd9QlVccsBXnog",
    authDomain: "tcgtrade-7ba27.firebaseapp.com",
    projectId: "tcgtrade-7ba27",
    storageBucket: "tcgtrade-7ba27.firebasestorage.app",
    messagingSenderId: "207150886257",
    appId: "1:207150886257:web:26edebbeb7df7a1d935ad0",
 };

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ID único de tu aplicación para Firestore
const appId = 'tcgtrade-pokemon-app';

// Variables globales
let currentUser = null;
let allSets = []; // Cache para todos los sets de la API
let userCardsCache = []; // Cache para las cartas del usuario

// Referencias a elementos del DOM
let searchInput, searchResultsSection, heroSection, howItWorksSection, cardsContainer, loadingSpinner, noResultsMessage, errorMessage;
let authModal, loginForm, registerForm, loginEmailInput, loginPasswordInput, loginBtn, loginError;
let registerEmailInput, registerPasswordInput, confirmPasswordInput, registerBtn, registerError;
let closeAuthModalBtn, toggleToRegister, toggleToLogin;
let loginNavLink, registerNavLink, profileNavLink, logoutNavLink;
let myCardsNavLink, myCardsLink, myCardsSection, myCardsContainer, noMyCardsMessage, myCardsErrorMessage;
let seriesFilter, setFilter, languageFilter, applyFiltersBtn, showAllSetCardsToggle;
let profileLink, profileSection, profileSidebarLinks, profileGeneralInfo, profileMyCardsTabContent, profileTradeHistory, profileSettings;
let profileEmailDisplay, profileUidDisplay, profileMemberSince, profileLoginRequiredMessage, profileGeneralInfoContent;
let profileNameInput, profileLastNameInput, profileAddressInput, profilePhoneInput, profileSaveMessage, saveProfileBtn;
let settingsNewEmailInput, emailChangeMessage, saveEmailBtn;
let settingsCurrentPasswordInput, settingsNewPasswordInput, settingsConfirmNewPasswordInput, passwordChangeMessage, savePasswordBtn;
let darkModeToggle, interchangesSection, helpSection;

// Token de autenticación inicial (si existe)
const initialAuthToken = null; // Puedes configurar esto si tienes un token personalizado

// --- Funciones de Utilidad ---
function showLoadingSpinner() {
    if (loadingSpinner) loadingSpinner.style.display = 'block';
}

function hideLoadingSpinner() {
    if (loadingSpinner) loadingSpinner.style.display = 'none';
}

function showInitialSections() {
    // Mostrar secciones iniciales
    if (heroSection) heroSection.classList.remove('hidden');
    if (howItWorksSection) howItWorksSection.classList.remove('hidden');

    // Ocultar otras secciones
    if (searchResultsSection) searchResultsSection.classList.add('hidden');
    if (myCardsSection) myCardsSection.classList.add('hidden');
    if (profileSection) profileSection.classList.add('hidden');
    if (interchangesSection) interchangesSection.classList.add('hidden');
    if (helpSection) helpSection.classList.add('hidden');
}

function showSearchResults() {
    // Ocultar secciones iniciales
    if (heroSection) heroSection.classList.add('hidden');
    if (howItWorksSection) howItWorksSection.classList.add('hidden');
    if (searchResultsSection) searchResultsSection.classList.add('hidden');
    if (myCardsSection) myCardsSection.classList.add('hidden');
    if (profileSection) profileSection.classList.add('hidden');
    if (interchangesSection) interchangesSection.classList.add('hidden');
    if (helpSection) helpSection.classList.add('hidden');

    // Mostrar resultados de búsqueda
    if (searchResultsSection) searchResultsSection.classList.remove('hidden');
}

function showMyCardsSection() {
    // Ocultar otras secciones
    if (heroSection) heroSection.classList.add('hidden');
    if (howItWorksSection) howItWorksSection.classList.add('hidden');
    if (searchResultsSection) searchResultsSection.classList.add('hidden');
    if (profileSection) profileSection.classList.add('hidden');
    if (interchangesSection) interchangesSection.classList.add('hidden');
    if (helpSection) helpSection.classList.add('hidden');

    // Mostrar sección de mis cartas
    if (myCardsSection) myCardsSection.classList.remove('hidden');

    // Cargar colección si hay usuario autenticado
    if (currentUser) {
        loadMyCollection(currentUser.uid);
        fetchSetsAndPopulateFilter(); // Cargar sets para filtros
    } else {
        if (noMyCardsMessage) {
            noMyCardsMessage.textContent = 'Debes iniciar sesión para ver tu colección.';
            noMyCardsMessage.classList.remove('hidden');
        }
    }
}

function showHelpSection() {
    // Ocultar otras secciones
    if (heroSection) heroSection.classList.add('hidden');
    if (howItWorksSection) howItWorksSection.classList.add('hidden');
    if (searchResultsSection) searchResultsSection.classList.add('hidden');
    if (myCardsSection) myCardsSection.classList.add('hidden');
    if (profileSection) profileSection.classList.add('hidden');
    if (interchangesSection) interchangesSection.classList.add('hidden');

    // Mostrar sección de ayuda
    if (helpSection) helpSection.classList.remove('hidden');

    // Inicializar FAQ
    initializeFAQ();
}

function showInterchangesSection() {
    // Ocultar otras secciones
    if (heroSection) heroSection.classList.add('hidden');
    if (howItWorksSection) howItWorksSection.classList.add('hidden');
    if (searchResultsSection) searchResultsSection.classList.add('hidden');
    if (myCardsSection) myCardsSection.classList.add('hidden');
    if (profileSection) profileSection.classList.add('hidden');
    if (helpSection) helpSection.classList.add('hidden');

    // Mostrar sección de intercambios
    if (interchangesSection) interchangesSection.classList.remove('hidden');

    // Cargar datos de intercambios si hay usuario autenticado
    if (currentUser) {
        loadUserTrades();
        loadAvailableTrades();
    } else {
        // Mostrar mensaje para usuarios no autenticados
        const myTradesContainer = document.getElementById('myTradesContainer');
        const availableTradesContainer = document.getElementById('availableTradesContainer');
        
        if (myTradesContainer) {
            myTradesContainer.innerHTML = `
                <div class="text-center text-gray-500 dark:text-gray-400 py-8">
                    <p>Debes iniciar sesión para ver tus intercambios</p>
                    <button class="btn-primary mt-4 px-4 py-2 rounded-lg text-sm font-semibold" onclick="showAuthModal('login')">
                        Iniciar Sesión
                    </button>
                </div>
            `;
        }
        
        if (availableTradesContainer) {
            availableTradesContainer.innerHTML = `
                <div class="text-center text-gray-500 dark:text-gray-400 py-8">
                    <p>Debes iniciar sesión para ver intercambios disponibles</p>
                    <button class="btn-primary mt-4 px-4 py-2 rounded-lg text-sm font-semibold" onclick="showAuthModal('login')">
                        Iniciar Sesión
                    </button>
                </div>
            `;
        }
    }
}

function showProfileSection() {
    // Ocultar otras secciones
    if (heroSection) heroSection.classList.add('hidden');
    if (howItWorksSection) howItWorksSection.classList.add('hidden');
    if (searchResultsSection) searchResultsSection.classList.add('hidden');
    if (myCardsSection) myCardsSection.classList.add('hidden');
    if (interchangesSection) interchangesSection.classList.add('hidden');
    if (helpSection) helpSection.classList.add('hidden');

    // Mostrar sección de perfil
    if (profileSection) {
        profileSection.classList.remove('hidden');
        // Cargar datos del usuario y estadísticas
        loadProfileData();
    } else {
        // Si no existe la sección de perfil, mostrar mensaje
        showNotification('Sección de perfil en desarrollo. Por ahora puedes usar "Mis Cartas" para gestionar tu colección.', 'info', 5000);
        showMyCardsSection();
    }
}

// Función para cambiar entre tabs del perfil
function switchProfileTab(tabName) {
    // Ocultar todos los contenidos de tabs
    const tabContents = document.querySelectorAll('.profile-tab-content');
    tabContents.forEach(content => content.classList.add('hidden'));

    // Remover clase active de todos los tabs
    const tabs = document.querySelectorAll('.profile-tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
        tab.classList.remove('border-orange-500', 'text-orange-600');
        tab.classList.add('border-transparent', 'text-gray-500');
    });

    // Mostrar el contenido del tab seleccionado
    let targetContent;
    let targetTab;

    switch(tabName) {
        case 'personal':
            targetContent = document.getElementById('profilePersonalContent');
            targetTab = document.getElementById('profilePersonalTab');
            break;
        case 'dashboard':
            targetContent = document.getElementById('profileDashboardContent');
            targetTab = document.getElementById('profileDashboardTab');
            break;
        case 'collection':
            targetContent = document.getElementById('profileCollectionContent');
            targetTab = document.getElementById('profileCollectionTab');
            break;
        case 'trades':
            targetContent = document.getElementById('profileTradesContent');
            targetTab = document.getElementById('profileTradesTab');
            break;
        case 'settings':
            targetContent = document.getElementById('profileSettingsContent');
            targetTab = document.getElementById('profileSettingsTab');
            break;
    }

    if (targetContent) {
        targetContent.classList.remove('hidden');
    }

    if (targetTab) {
        targetTab.classList.add('active', 'border-orange-500', 'text-orange-600');
        targetTab.classList.remove('border-transparent', 'text-gray-500');
    }

    // Cargar estadísticas al abrir el Dashboard
    if (tabName === 'dashboard' && typeof loadProfileStats === 'function' && currentUser) {
        try {
            loadProfileStats();
        } catch (e) {
            console.error('Error al cargar estadísticas al abrir Dashboard:', e);
        }
    }

    // Cargar colección al abrir la pestaña Mi Colección
    if (tabName === 'collection' && typeof loadUserCollection === 'function') {
        loadUserCollection();
    }
}

// Función para cambiar entre tabs de ayuda
function switchHelpTab(tabName) {
    // Ocultar todos los contenidos de tabs
    const tabContents = document.querySelectorAll('.help-tab-content');
    tabContents.forEach(content => content.classList.add('hidden'));

    // Remover clase active de todos los tabs
    const tabs = document.querySelectorAll('.help-tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
        tab.classList.remove('border-orange-500', 'text-orange-600');
        tab.classList.add('border-transparent', 'text-gray-500');
    });

    // Mostrar el contenido del tab seleccionado
    let targetContent;
    let targetTab;

    switch(tabName) {
        case 'getting-started':
            targetContent = document.getElementById('helpGettingStartedContent');
            targetTab = document.getElementById('helpGettingStartedTab');
            break;
        case 'trading':
            targetContent = document.getElementById('helpTradingContent');
            targetTab = document.getElementById('helpTradingTab');
            break;
        case 'card-conditions':
            targetContent = document.getElementById('helpCardConditionsContent');
            targetTab = document.getElementById('helpCardConditionsTab');
            break;
        case 'account':
            targetContent = document.getElementById('helpAccountContent');
            targetTab = document.getElementById('helpAccountTab');
            break;
        case 'faq':
            targetContent = document.getElementById('helpFAQContent');
            targetTab = document.getElementById('helpFAQTab');
            break;
    }

    if (targetContent) {
        targetContent.classList.remove('hidden');
    }

    if (targetTab) {
        targetTab.classList.add('active', 'border-orange-500', 'text-orange-600');
        targetTab.classList.remove('border-transparent', 'text-gray-500');
    }
}

// Función para cambiar entre tabs de intercambios
function switchTradeTab(tabName) {
    // Ocultar todos los contenidos de tabs
    const tabContents = document.querySelectorAll('.trade-tab-content');
    tabContents.forEach(content => content.classList.add('hidden'));

    // Remover clase active de todos los tabs
    const tabs = document.querySelectorAll('.trade-tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
        tab.classList.remove('border-orange-500', 'text-orange-600');
        tab.classList.add('border-transparent', 'text-gray-500');
    });

    // Mostrar el contenido del tab seleccionado
    let targetContent;
    let targetTab;

    switch(tabName) {
        case 'active':
            targetContent = document.getElementById('tradesActiveContent');
            targetTab = document.getElementById('tradesActiveTab');
            break;
        case 'pending':
            targetContent = document.getElementById('tradesPendingContent');
            targetTab = document.getElementById('tradesPendingTab');
            break;
        case 'completed':
            targetContent = document.getElementById('tradesCompletedContent');
            targetTab = document.getElementById('tradesCompletedTab');
            break;
        case 'received':
            targetContent = document.getElementById('tradesReceivedContent');
            targetTab = document.getElementById('tradesReceivedTab');
            break;
    }

    if (targetContent) {
        targetContent.classList.remove('hidden');
    }

    if (targetTab) {
        targetTab.classList.add('active', 'border-orange-500', 'text-orange-600');
        targetTab.classList.remove('border-transparent', 'text-gray-500');
    }
}

// Función para cargar datos del perfil
async function loadProfileData() {
    if (!currentUser) {
        console.log('❌ No hay usuario conectado');
        return;
    }

    try {
        console.log('🔄 Cargando datos del perfil...');
        
        // Cargar información del usuario
        await loadUserInfo();
        
        // Cargar estadísticas
        await loadProfileStats();
        
        console.log('✅ Datos del perfil cargados correctamente');
    } catch (error) {
        console.error('❌ Error al cargar datos del perfil:', error);
    }
}

// Función para mostrar mensajes de estado del perfil
function showProfileSaveMessage(message, type = 'success') {
    const messageElement = document.getElementById('profileSaveMessage');
    if (!messageElement) return;

    const messageText = messageElement.querySelector('p');
    if (messageText) {
        messageText.textContent = message;
    }

    // Aplicar estilos según el tipo
    messageElement.className = 'mt-4 p-3 rounded-lg';
    if (type === 'success') {
        messageElement.classList.add('bg-green-100', 'text-green-700', 'border', 'border-green-200');
    } else if (type === 'error') {
        messageElement.classList.add('bg-red-100', 'text-red-700', 'border', 'border-red-200');
    } else if (type === 'info') {
        messageElement.classList.add('bg-blue-100', 'text-blue-700', 'border', 'border-blue-200');
    }

    messageElement.classList.remove('hidden');

    // Ocultar después de 3 segundos
    setTimeout(() => {
        messageElement.classList.add('hidden');
    }, 3000);
}

// Función para guardar datos del perfil
async function saveProfileData() {
    console.log('🔧 saveProfileData iniciada');
    
    if (!currentUser) {
        console.error('❌ No hay usuario conectado');
        showProfileSaveMessage('Debes iniciar sesión para guardar cambios', 'error');
        return;
    }

    try {
        console.log('🔧 Obteniendo valores del formulario...');
        const name = document.getElementById('profileName')?.value?.trim();
        const lastName = document.getElementById('profileLastName')?.value?.trim();
        const address = document.getElementById('profileAddress')?.value?.trim();
        const birthDate = document.getElementById('profileBirthDate')?.value;
        const email = document.getElementById('profileEmail')?.value?.trim();

        console.log('🔧 Valores obtenidos:', { name, lastName, address, birthDate, email });

        // Validaciones básicas
        if (!name) {
            console.error('❌ Nombre vacío');
            showProfileSaveMessage('El nombre es obligatorio', 'error');
            return;
        }
        if (!lastName) {
            console.error('❌ Apellidos vacíos');
            showProfileSaveMessage('Los apellidos son obligatorios', 'error');
            return;
        }
        if (!email) {
            console.error('❌ Email vacío');
            showProfileSaveMessage('El correo electrónico es obligatorio', 'error');
            return;
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.error('❌ Formato de email inválido');
            showProfileSaveMessage('El formato del correo electrónico no es válido', 'error');
            return;
        }

        // Preparar datos para guardar
        const profileData = {
            name: name,
            lastName: lastName,
            address: address || '',
            birthDate: birthDate || '',
            email: email,
            updatedAt: new Date()
        };

        console.log('🔧 Datos a guardar:', profileData);
        console.log('🔧 Usuario UID:', currentUser.uid);
        console.log('🔧 Firebase db disponible:', !!db);
        console.log('🔧 Firebase auth disponible:', !!auth);

        // Verificar que Firebase esté inicializado correctamente
        if (!db) {
            throw new Error('Firebase Firestore no está inicializado');
        }

        // Guardar en Firestore
        console.log('🔧 Guardando en Firestore...');
        const userDocRef = db.collection('users').doc(currentUser.uid);
        console.log('🔧 Referencia del documento:', userDocRef);
        
        await userDocRef.set(profileData, { merge: true });
        console.log('✅ Datos guardados en Firestore');

        // Actualizar el nombre en el header del perfil
        const userNameElement = document.getElementById('profileUserName');
        if (userNameElement) {
            userNameElement.textContent = `${name} ${lastName}`;
            console.log('✅ Nombre actualizado en header');
        }

        // Actualizar email en Firebase Auth si ha cambiado
        if (email !== currentUser.email) {
            console.log('🔧 Email ha cambiado, actualizando en Auth...');
            console.log('🔧 Email actual:', currentUser.email);
            console.log('🔧 Email nuevo:', email);
            
            if (!auth) {
                throw new Error('Firebase Auth no está inicializado');
            }
            
            try {
                await currentUser.updateEmail(email);
                console.log('✅ Email actualizado en Firebase Auth');
                // Actualizar el objeto currentUser localmente
                currentUser.email = email;
            } catch (authError) {
                console.error('❌ Error al actualizar email en Auth:', authError);
                console.error('❌ Código de error:', authError.code);
                console.error('❌ Mensaje de error:', authError.message);
                
                if (authError.code === 'auth/requires-recent-login') {
                    showProfileSaveMessage('⚠️ Datos guardados pero el email no se pudo actualizar. Por seguridad, debes volver a iniciar sesión para cambiar el email.', 'info');
                } else {
                    showProfileSaveMessage(`⚠️ Datos guardados pero el email no se pudo actualizar: ${authError.message}`, 'info');
                }
            }
        }

        showProfileSaveMessage('✅ Perfil actualizado correctamente', 'success');
        console.log('✅ Datos del perfil guardados exitosamente');

    } catch (error) {
        console.error('❌ Error al guardar datos del perfil:', error);
        
        // Manejo específico de errores de permisos
        if (error.code === 'permission-denied') {
            showProfileSaveMessage('❌ Error de permisos. Verifica que las reglas de Firestore estén configuradas correctamente.', 'error');
        } else if (error.code === 'unauthenticated') {
            showProfileSaveMessage('❌ Error de autenticación. Por favor, vuelve a iniciar sesión.', 'error');
        } else {
            showProfileSaveMessage('❌ Error al guardar los cambios: ' + error.message, 'error');
        }
    }
}

// Función para mostrar mensajes de cambio de contraseña
function showPasswordChangeMessage(message, type = 'success') {
    const messageElement = document.getElementById('passwordChangeMessage');
    if (!messageElement) {
        console.error('❌ Elemento passwordChangeMessage no encontrado');
        return;
    }

    const messageText = messageElement.querySelector('p');
    if (messageText) {
        messageText.textContent = message;
    }

    // Limpiar clases anteriores
    messageElement.classList.remove('bg-green-100', 'text-green-700', 'bg-red-100', 'text-red-700', 'bg-blue-100', 'text-blue-700');
    messageElement.classList.remove('hidden');

    // Aplicar clases según el tipo
    if (type === 'success') {
        messageElement.classList.add('bg-green-100', 'text-green-700');
    } else if (type === 'error') {
        messageElement.classList.add('bg-red-100', 'text-red-700');
    } else if (type === 'info') {
        messageElement.classList.add('bg-blue-100', 'text-blue-700');
    }

    // Ocultar después de 5 segundos
    setTimeout(() => {
        messageElement.classList.add('hidden');
    }, 5000);
}



// Función para cambiar contraseña
async function changePassword() {
    console.log('🔧 changePassword iniciada');
    
    if (!currentUser) {
        console.error('❌ No hay usuario conectado');
        showPasswordChangeMessage('Debes iniciar sesión para cambiar la contraseña', 'error');
        return;
    }

    try {
        console.log('🔧 Obteniendo valores del formulario...');
        const currentPassword = document.getElementById('currentPassword')?.value;
        const newPassword = document.getElementById('newPassword')?.value;
        const confirmNewPassword = document.getElementById('confirmNewPassword')?.value;

        console.log('🔧 Valores obtenidos:', { 
            hasCurrentPassword: !!currentPassword, 
            hasNewPassword: !!newPassword, 
            hasConfirmPassword: !!confirmNewPassword 
        });

        // Validaciones
        if (!currentPassword) {
            console.error('❌ Contraseña actual vacía');
            showPasswordChangeMessage('Debes ingresar tu contraseña actual', 'error');
            return;
        }
        if (!newPassword) {
            console.error('❌ Nueva contraseña vacía');
            showPasswordChangeMessage('Debes ingresar una nueva contraseña', 'error');
            return;
        }
        if (newPassword.length < 6) {
            console.error('❌ Nueva contraseña muy corta');
            showPasswordChangeMessage('La nueva contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            console.error('❌ Contraseñas no coinciden');
            showPasswordChangeMessage('Las contraseñas nuevas no coinciden', 'error');
            return;
        }
        if (newPassword === currentPassword) {
            console.error('❌ Nueva contraseña igual a la actual');
            showPasswordChangeMessage('La nueva contraseña debe ser diferente a la actual', 'error');
            return;
        }

        console.log('🔧 Validaciones pasadas, reautenticando...');
        console.log('🔧 Email del usuario:', currentUser.email);
        console.log('🔧 Firebase Auth disponible:', !!auth);

        // Verificar que Firebase Auth esté inicializado
        if (!auth) {
            throw new Error('Firebase Auth no está inicializado');
        }

        // Reautenticar al usuario antes de cambiar la contraseña
        console.log('🔧 Creando credenciales...');
        const credential = firebase.auth.EmailAuthProvider.credential(currentUser.email, currentPassword);
        console.log('🔧 Credenciales creadas:', !!credential);
        
        console.log('🔧 Iniciando reautenticación...');
        await currentUser.reauthenticateWithCredential(credential);
        console.log('✅ Reautenticación exitosa');

        // Cambiar la contraseña
        console.log('🔧 Cambiando contraseña...');
        await currentUser.updatePassword(newPassword);
        console.log('✅ Contraseña cambiada exitosamente');

        // Limpiar el formulario
        document.getElementById('passwordChangeForm').reset();
        console.log('✅ Formulario limpiado');

        showPasswordChangeMessage('✅ Contraseña cambiada correctamente', 'success');

    } catch (error) {
        console.error('❌ Error al cambiar contraseña:', error);
        console.error('❌ Tipo de error:', typeof error);
        console.error('❌ Código de error:', error.code);
        console.error('❌ Mensaje de error:', error.message);
        console.error('❌ Stack trace:', error.stack);
        
        let errorMessage = 'Error al cambiar la contraseña';
        
        if (error.code === 'auth/wrong-password') {
            errorMessage = 'La contraseña actual es incorrecta';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'La nueva contraseña es demasiado débil';
        } else if (error.code === 'auth/requires-recent-login') {
            errorMessage = 'Por seguridad, debes volver a iniciar sesión para cambiar la contraseña';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Demasiados intentos. Intenta de nuevo más tarde';
        } else if (error.code === 'auth/user-mismatch') {
            errorMessage = 'Error de autenticación. Por favor, vuelve a iniciar sesión.';
        } else if (error.code === 'auth/invalid-credential') {
            errorMessage = 'Credenciales inválidas. Verifica tu contraseña actual.';
        }
        
        showPasswordChangeMessage(`❌ ${errorMessage}`, 'error');
    }
}

// Función para cargar información del usuario
async function loadUserInfo() {
    if (!currentUser) return;

    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        let userData = userDoc.data();

        // MIGRACIÓN AUTOMÁTICA: Si el usuario tiene un name pero no username,
        // significa que es un usuario antiguo donde el username estaba en name
        if (userData && userData.name && !userData.username) {
            console.log('🔄 Detectado usuario antiguo, migrando estructura de datos...');
            
            // Verificar si el name parece ser un username (sin espacios, formato de usuario)
            const nameValue = userData.name;
            const isUsername = !nameValue.includes(' ') && /^[a-zA-Z0-9_]+$/.test(nameValue);
            
            if (isUsername) {
                // Migrar: mover name a username
                userData.username = nameValue;
                userData.name = ''; // Limpiar el campo name para el nombre real
                
                // Actualizar en Firestore
                try {
                    await db.collection('users').doc(currentUser.uid).set({
                        username: nameValue,
                        name: ''
                    }, { merge: true });
                    console.log('✅ Datos migrados exitosamente');
                } catch (migrationError) {
                    console.error('Error al migrar datos:', migrationError);
                }
            }
        }

        // Actualizar información del usuario en la UI (header del perfil)
        const userNameElement = document.getElementById('profileUserName');
        const userEmailElement = document.getElementById('profileUserEmail');
        const joinDateElement = document.getElementById('profileJoinDate');

        if (userNameElement) {
            // Mostrar username primero, luego nombre completo si existe
            let displayName = 'Usuario';
            
            if (userData?.username) {
                displayName = userData.username;
            } else if (userData?.name && userData?.lastName) {
                displayName = `${userData.name} ${userData.lastName}`;
            } else if (userData?.name) {
                displayName = userData.name;
            } else if (userData?.displayName) {
                displayName = userData.displayName;
            } else if (currentUser.displayName) {
                displayName = currentUser.displayName;
            }
            
            userNameElement.textContent = displayName;
        }

        if (userEmailElement) {
            userEmailElement.textContent = currentUser.email || 'usuario@ejemplo.com';
        }

        if (joinDateElement) {
            const joinDate = userData?.createdAt?.toDate() || currentUser.metadata?.creationTime;
            if (joinDate) {
                const date = new Date(joinDate);
                joinDateElement.textContent = date.toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'long' 
                });
            }
        }

        // Cargar datos en el formulario de perfil personal
        const profileUsernameInput = document.getElementById('profileUsername');
        const profileNameInput = document.getElementById('profileName');
        const profileLastNameInput = document.getElementById('profileLastName');
        const profileAddressInput = document.getElementById('profileAddress');
        const profileBirthDateInput = document.getElementById('profileBirthDate');
        const profileEmailInput = document.getElementById('profileEmail');

        // Usar los datos ya migrados
        if (profileUsernameInput) profileUsernameInput.value = userData?.username || '';
        if (profileNameInput) profileNameInput.value = userData?.name || '';
        if (profileLastNameInput) profileLastNameInput.value = userData?.lastName || '';
        if (profileAddressInput) profileAddressInput.value = userData?.address || '';
        if (profileBirthDateInput) profileBirthDateInput.value = userData?.birthDate || '';
        if (profileEmailInput) profileEmailInput.value = userData?.email || currentUser.email || '';

        // Cargar preferencia de modo oscuro
        loadDarkModePreference(userData);

        console.log('✅ Información del usuario cargada:', userData);

    } catch (error) {
        console.error('❌ Error al cargar información del usuario:', error);
    }
}

// Función para cargar preferencia de modo oscuro
function loadDarkModePreference(userData) {
    // NO cambiar el modo si no hay preferencia guardada
    if (userData?.darkMode === undefined) {
        console.log('No hay preferencia de modo oscuro guardada, manteniendo estado actual');
        // Sincronizar el toggle con el estado actual
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            const isDarkModeActive = document.body.classList.contains('dark-mode');
            darkModeToggle.checked = isDarkModeActive;
        }
        return;
    }
    
    const darkMode = userData.darkMode;
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    if (darkModeToggle) {
        darkModeToggle.checked = darkMode;
        applyDarkMode(darkMode);
    }
}

// Función para aplicar modo oscuro
function applyDarkMode(isDark) {
    const html = document.documentElement;
    
    if (isDark) {
        html.classList.add('dark');
        document.body.classList.add('dark-mode');
    } else {
        html.classList.remove('dark');
        document.body.classList.remove('dark-mode');
    }
    
    // Guardar también en localStorage para persistencia local
    localStorage.setItem('darkMode', isDark ? 'true' : 'false');
}

// Función para guardar preferencia de modo oscuro
async function saveDarkModePreference(isDark) {
    if (!currentUser) return;

    try {
        await db.collection('users').doc(currentUser.uid).set({
            darkMode: isDark,
            updatedAt: new Date()
        }, { merge: true });

        applyDarkMode(isDark);
        console.log('✅ Preferencia de modo oscuro guardada:', isDark);
    } catch (error) {
        console.error('❌ Error al guardar preferencia de modo oscuro:', error);
    }
}

// Hacer funciones disponibles globalmente
window.saveDarkModePreference = saveDarkModePreference;
window.applyDarkMode = applyDarkMode;
window.loadDarkModePreference = loadDarkModePreference;

// Función de prueba para verificar que todo funciona
window.testNavigation = function() {
    console.log('🧪 Probando navegación...');
    console.log('Funciones disponibles:', {
        showInitialSections: typeof showInitialSections,
        showAuthModal: typeof showAuthModal,
        showMyCardsSection: typeof showMyCardsSection,
        showInterchangesSection: typeof showInterchangesSection,
        showProfileSection: typeof showProfileSection,
        logoutUser: typeof logoutUser
    });
    
    // Probar cada función
    try {
        console.log('✅ Todas las funciones están disponibles');
        return true;
    } catch (error) {
        console.error('❌ Error en las funciones:', error);
        return false;
    }
};

// Función para cargar estadísticas del perfil
async function loadProfileStats() {
    if (!currentUser) return;

    try {
        console.log('📊 Cargando estadísticas del perfil...');

        // Obtener colección del usuario
        const userCardsRef = db.collection('users').doc(currentUser.uid).collection('my_cards');
        const userCardsSnapshot = await userCardsRef.get();
        
        const cards = [];
        userCardsSnapshot.forEach(doc => {
            cards.push({ id: doc.id, ...doc.data() });
        });

        // Calcular estadísticas
        const totalCards = cards.length;
        const uniqueCards = new Set(cards.map(card => card.id)).size;
        const uniqueSets = new Set(cards.map(card => (typeof card.set === 'string' ? card.set : card.set?.name)).filter(Boolean)).size;
        
        // Por ahora, intercambios completados = 0 (se implementará más adelante)
        const completedTrades = 0;

        // Actualizar UI con las estadísticas
        updateProfileStats(totalCards, uniqueCards, uniqueSets, completedTrades, cards);

        // Cargar desglose por sets
        await loadSetsBreakdown(cards);

    } catch (error) {
        console.error('❌ Error al cargar estadísticas:', error);
    }
}

// --- Constantes de Condiciones de Cartas (CardMarket) ---
const CARD_CONDITIONS = {
    M: {
        code: 'M',
        name: 'Mint (M)',
        description: 'Perfectas condiciones, sin excusas. Carta como recién salida del sobre.',
        color: '#10B981', // Verde
        icon: '💎'
    },
    NM: {
        code: 'NM',
        name: 'Near Mint (NM)',
        description: 'Aspecto de no haber sido jugada sin fundas. Marcas mínimas permitidas.',
        color: '#059669', // Verde oscuro
        icon: '✨'
    },
    EX: {
        code: 'EX',
        name: 'Excellent (EX)',
        description: 'Como si se hubiera usado poco sin fundas. Daño visible pero menor.',
        color: '#3B82F6', // Azul
        icon: '⭐'
    },
    GD: {
        code: 'GD',
        name: 'Good (GD)',
        description: 'Aspecto de mucho uso en torneo sin fundas. Deterioro notable.',
        color: '#F59E0B', // Amarillo
        icon: '🟡'
    },
    LP: {
        code: 'LP',
        name: 'Light Played (LP)',
        description: 'Uso prolongado sin fundas. Válida para torneos con fundas.',
        color: '#F97316', // Naranja
        icon: '🟠'
    },
    PL: {
        code: 'PL',
        name: 'Played (PL)',
        description: 'Aspecto muy deteriorado. Dudoso para torneos incluso con fundas.',
        color: '#DC2626', // Rojo
        icon: '🔴'
    },
    PO: {
        code: 'PO',
        name: 'Poor (PO)',
        description: 'Literalmente destrozada o alterada. No válida para torneos.',
        color: '#7F1D1D', // Rojo oscuro
        icon: '💀'
    }
};

// --- Función de Notificaciones Personalizadas ---
function showNotification(message, type = 'success', duration = 3000) {
    // Remover notificación anterior si existe
    const existingNotification = document.querySelector('.custom-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Crear nueva notificación
    const notification = document.createElement('div');
    notification.className = 'custom-notification fixed top-4 right-4 z-[10000] transform translate-x-full transition-transform duration-300';
    
    // Estilos según el tipo
    let bgColor, borderColor, iconColor, icon;
    switch(type) {
        case 'success':
            bgColor = 'bg-green-50 dark:bg-green-900/30';
            borderColor = 'border-green-200 dark:border-green-800';
            iconColor = 'text-green-600 dark:text-green-400';
            icon = '✅';
            break;
        case 'error':
            bgColor = 'bg-red-50 dark:bg-red-900/30';
            borderColor = 'border-red-200 dark:border-red-800';
            iconColor = 'text-red-600 dark:text-red-400';
            icon = '❌';
            break;
        case 'warning':
            bgColor = 'bg-yellow-50 dark:bg-yellow-900/30';
            borderColor = 'border-yellow-200 dark:border-yellow-800';
            iconColor = 'text-yellow-600 dark:text-yellow-400';
            icon = '⚠️';
            break;
        case 'info':
            bgColor = 'bg-blue-50 dark:bg-blue-900/30';
            borderColor = 'border-blue-200 dark:border-blue-800';
            iconColor = 'text-blue-600 dark:text-blue-400';
            icon = 'ℹ️';
            break;
    }
    
    notification.innerHTML = `
        <div class="${bgColor} ${borderColor} border-2 rounded-lg shadow-xl p-4 max-w-sm">
            <div class="flex items-center gap-3">
                <span class="${iconColor} text-2xl">${icon}</span>
                <p class="text-gray-800 dark:text-gray-200 font-medium">${message}</p>
                <button onclick="this.closest('.custom-notification').remove()" 
                        class="ml-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    ×
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
        notification.classList.add('translate-x-0');
    }, 10);
    
    // Auto-ocultar después de la duración especificada
    if (duration > 0) {
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
}

// --- Funciones de Intercambios ---

// Función de búsqueda de cartas para intercambios con debounce
let searchTimeout;
window.searchCardForTrade = async function(input, type, cardIndex) {
    const query = input.value.trim();
    const resultsContainer = input.parentElement.nextElementSibling;
    
    // Limpiar timeout anterior
    clearTimeout(searchTimeout);
    
    if (query.length < 2) {
        resultsContainer.classList.add('hidden');
        resultsContainer.innerHTML = '';
        return;
    }
    
    // Mostrar loading
    resultsContainer.innerHTML = `
        <div class="p-3 text-center text-gray-500 dark:text-gray-400">
            <div class="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
            <span class="ml-2">Buscando...</span>
        </div>
    `;
    resultsContainer.classList.remove('hidden');
    
    // Debounce de 300ms
    searchTimeout = setTimeout(async () => {
        try {
            // Buscar en ambas APIs en paralelo
            const [pokemonResponse, tcgdexResponse] = await Promise.allSettled([
                fetch(`/api/pokemontcg/cards?q=name:"${query}*"&pageSize=10`),
                fetch(`/api/tcgdex/cards?q=${query}&pageSize=10`)
            ]);
            
            let allCards = [];
            
            // Procesar resultados de Pokemon TCG
            if (pokemonResponse.status === 'fulfilled' && pokemonResponse.value.ok) {
                const data = await pokemonResponse.value.json();
                if (data.data) {
                    allCards.push(...data.data.map(card => ({...card, source: 'pokemontcg'})));
                }
            }
            
            // Procesar resultados de TCGdex
            if (tcgdexResponse.status === 'fulfilled' && tcgdexResponse.value.ok) {
                const data = await tcgdexResponse.value.json();
                if (data.data) {
                    allCards.push(...data.data.map(card => ({...card, source: 'tcgdex'})));
                }
            }
            
            // Eliminar duplicados por nombre
            const uniqueCards = allCards.reduce((acc, card) => {
                const key = `${card.name}-${card.set?.id}`;
                if (!acc.map.has(key)) {
                    acc.map.set(key, card);
                    acc.list.push(card);
                }
                return acc;
            }, { map: new Map(), list: [] }).list;
            
            if (uniqueCards.length > 0) {
                resultsContainer.innerHTML = uniqueCards.slice(0, 15).map(card => {
                    const sourceIcon = card.source === 'tcgdex' ? '🌏' : '🌍';
                    const imageUrl = card.images?.small || card.images?.large || '/images/card-placeholder.png';
                    return `
                        <div class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2 border-b border-gray-200 dark:border-gray-600 last:border-0"
                             onclick="selectCardForTrade('${type}', ${cardIndex}, '${card.id}', '${card.name.replace(/'/g, "\\'")}', '${imageUrl}', '${(card.set?.name || '').replace(/'/g, "\\'")}', '${card.number || ''}')">
                            <img src="${imageUrl}" alt="${card.name}" class="w-10 h-14 object-contain" onerror="this.src='/images/card-placeholder.png'">
                            <div class="flex-1">
                                <div class="font-medium text-sm text-gray-900 dark:text-white">${sourceIcon} ${card.name}</div>
                                <div class="text-xs text-gray-500 dark:text-gray-400">${card.set?.name || 'Set desconocido'} - ${card.number || 'N/A'}</div>
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                resultsContainer.innerHTML = `
                    <div class="p-3 text-center text-gray-500 dark:text-gray-400">
                        No se encontraron cartas
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error buscando cartas:', error);
            resultsContainer.innerHTML = `
                <div class="p-3 text-center text-red-500">
                    Error al buscar cartas
                </div>
            `;
        }
    }, 300);
};

// Función para seleccionar una carta del autocompletado
window.selectCardForTrade = function(type, cardIndex, cardId, cardName, cardImage, setName, cardNumber) {
    // Usar el ID correcto del contenedor
    const containerId = type === 'offered' ? 'offeredCardsContainer' : 'wantedCardsContainer';
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error('❌ selectCardForTrade: No se encontró el contenedor:', containerId);
        return;
    }
    
    const cardElement = container.querySelectorAll('.trade-card')[cardIndex];
    
    if (cardElement) {
        console.log('✅ Elemento de carta encontrado en índice:', cardIndex);
        
        // Actualizar el input visible
        const nameInput = cardElement.querySelector(`input[name="${type}_name_${cardIndex}"]`);
        if (nameInput) {
            nameInput.value = cardName;
            // Bloquear el input para indicar que esta carta está confirmada
            nameInput.readOnly = true;
            nameInput.classList.add('bg-gray-100', 'dark:bg-gray-700', 'cursor-not-allowed');
            console.log('✅ Nombre establecido y bloqueado en selectCardForTrade:', cardName);
            
            // Automáticamente añadir una nueva fila vacía
            setTimeout(() => {
                addCardToTrade(type);
            }, 100);
        } else {
            console.error('❌ No se encontró el input de nombre');
        }
        
        // Actualizar los campos ocultos
        const idInput = cardElement.querySelector(`input[name="${type}_id_${cardIndex}"]`);
        const imageInput = cardElement.querySelector(`input[name="${type}_image_${cardIndex}"]`);
        const setInput = cardElement.querySelector(`input[name="${type}_set_${cardIndex}"]`);
        const numberInput = cardElement.querySelector(`input[name="${type}_number_${cardIndex}"]`);
        
        if (idInput) idInput.value = cardId;
        if (imageInput) imageInput.value = cardImage;
        if (setInput) setInput.value = setName;
        if (numberInput) numberInput.value = cardNumber;
        
        // Ocultar resultados (solo si existe nameInput)
        if (nameInput && nameInput.parentElement && nameInput.parentElement.nextElementSibling) {
            const resultsContainer = nameInput.parentElement.nextElementSibling;
            resultsContainer.classList.add('hidden');
            resultsContainer.innerHTML = '';
        }
        
        // Mostrar miniatura de la carta seleccionada
        showCardThumbnail(cardElement, cardImage, cardName);
        
        // Actualizar título generado
        updateGeneratedTitle();
    }
};

// Función para mostrar miniatura de carta seleccionada
function showCardThumbnail(cardElement, imageUrl, cardName) {
    // Buscar el input de nombre
    const nameInput = cardElement.querySelector('.card-name-input');
    if (!nameInput) return;
    
    // Buscar o crear contenedor de miniatura al lado del input
    let thumbnailContainer = cardElement.querySelector('.card-thumbnail-inline');
    
    if (!thumbnailContainer) {
        // Crear contenedor inline para el icono con hover
        thumbnailContainer = document.createElement('div');
        thumbnailContainer.className = 'card-thumbnail-inline absolute right-2 top-1/2 -translate-y-1/2 z-10';
        nameInput.parentElement.style.position = 'relative';
        nameInput.parentElement.appendChild(thumbnailContainer);
        
        // Ajustar padding del input para hacer espacio al icono
        nameInput.style.paddingRight = '2.5rem';
    }
    
    // Obtener el índice de la carta
    const cardIndex = Array.from(cardElement.parentElement.children).indexOf(cardElement);
    const type = cardElement.closest('#offeredCardsContainer') ? 'offered' : 'wanted';
    
    thumbnailContainer.innerHTML = `
        <div class="relative group">
            <button type="button" 
                    class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    title="Ver carta / Cambiar selección"
                    onclick="event.stopPropagation(); clearCardSelection('${type}', ${cardIndex});">
                <span class="text-xl">🖼️</span>
            </button>
            <!-- Preview on hover - Tamaño grande y centrado -->
            <div class="fixed inset-0 z-[10000] hidden group-hover:flex items-center justify-center pointer-events-none">
                <div class="relative">
                    <img src="${imageUrl}" alt="${cardName}" 
                         class="max-w-[400px] max-h-[560px] w-auto h-auto shadow-2xl rounded-lg border-2 border-white dark:border-gray-700">
                </div>
            </div>
        </div>
    `;
}

// Función para limpiar la selección de una carta
window.clearCardSelection = function(type, cardIndex) {
    const containerId = type === 'offered' ? 'offeredCardsContainer' : 'wantedCardsContainer';
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const cardElement = container.querySelectorAll('.trade-card')[cardIndex];
    if (!cardElement) return;
    
    // Limpiar el input de nombre y desbloquearlo
    const nameInput = cardElement.querySelector(`input[name="${type}_name_${cardIndex}"]`);
    if (nameInput) {
        nameInput.value = '';
        nameInput.readOnly = false;
        nameInput.classList.remove('bg-gray-100', 'dark:bg-gray-700', 'cursor-not-allowed');
        nameInput.focus();
    }
    
    // Limpiar campos ocultos
    const idInput = cardElement.querySelector(`input[name="${type}_id_${cardIndex}"]`);
    const imageInput = cardElement.querySelector(`input[name="${type}_image_${cardIndex}"]`);
    const setInput = cardElement.querySelector(`input[name="${type}_set_${cardIndex}"]`);
    const numberInput = cardElement.querySelector(`input[name="${type}_number_${cardIndex}"]`);
    
    if (idInput) idInput.value = '';
    if (imageInput) imageInput.value = '';
    if (setInput) setInput.value = '';
    if (numberInput) numberInput.value = '';
    
    // Quitar el icono de miniatura
    const thumbnailContainer = cardElement.querySelector('.card-thumbnail-inline');
    if (thumbnailContainer) {
        thumbnailContainer.remove();
        // Restaurar el padding del input
        const nameInput2 = cardElement.querySelector('.card-name-input');
        if (nameInput2) {
            nameInput2.style.paddingRight = '';
        }
    }
    
    // Actualizar título generado
    updateGeneratedTitle();
};

// Función para manejar Enter en el input de carta
window.handleCardInputKeypress = function(event, type, cardIndex) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const input = event.target;
        
        // Si hay texto en el input, bloquear y añadir nueva fila
        if (input.value.trim() && !input.readOnly) {
            // Bloquear el input actual
            input.readOnly = true;
            input.classList.add('bg-gray-100', 'dark:bg-gray-700', 'cursor-not-allowed');
            
            // Añadir nueva fila vacía
            addCardToTrade(type);
            
            // Enfocar la nueva fila
            setTimeout(() => {
                const containerId = type === 'offered' ? 'offeredCardsContainer' : 'wantedCardsContainer';
                const container = document.getElementById(containerId);
                const newCards = container.querySelectorAll('.trade-card');
                const lastCard = newCards[newCards.length - 1];
                const newInput = lastCard?.querySelector('.card-name-input');
                if (newInput) {
                    newInput.focus();
                }
            }, 100);
        }
    }
};

// Función para manejar cuando el input pierde el foco
window.handleCardInputBlur = function(input, type, cardIndex) {
    // Si hay texto y no está bloqueado, y no hay una siguiente fila vacía, añadir una
    if (input.value.trim() && !input.readOnly) {
        const containerId = type === 'offered' ? 'offeredCardsContainer' : 'wantedCardsContainer';
        const container = document.getElementById(containerId);
        const cards = container.querySelectorAll('.trade-card');
        
        // Verificar si esta es la última carta
        const isLastCard = cardIndex === cards.length - 1;
        
        if (isLastCard) {
            // Bloquear el input actual
            input.readOnly = true;
            input.classList.add('bg-gray-100', 'dark:bg-gray-700', 'cursor-not-allowed');
            
            // Añadir nueva fila vacía
            setTimeout(() => {
                addCardToTrade(type);
            }, 100);
        }
    }
};

// Función para añadir cartas desde "Mis Cartas"
window.addFromMyCards = async function(type) {
    if (!currentUser) {
        showNotification('Debes iniciar sesión para acceder a tu colección', 'warning', 4000);
        return;
    }
    
    // Si no hay cache, cargar las cartas desde Firestore
    if (!userCardsCache || userCardsCache.length === 0) {
        try {
            const myCardsCollectionRef = db.collection( `users/${currentUser.uid}/my_cards`);
            const querySnapshot = await myCardsCollectionRef.get();
            userCardsCache = [];
            
            querySnapshot.forEach(doc => {
                userCardsCache.push(doc.data());
            });
        } catch (error) {
            console.error('Error cargando cartas:', error);
            showNotification('Error al cargar tu colección. Por favor, intenta de nuevo.', 'error', 5000);
            return;
        }
    }
    
    if (userCardsCache.length === 0) {
        showNotification('No tienes cartas guardadas en tu colección. Ve a "Mis Cartas" para añadir algunas.', 'info', 5000);
        return;
    }
    
    // Crear modal para seleccionar cartas
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.onclick = function(e) {
        if (e.target === modal) modal.remove();
    };
    
    // Ordenar cartas por set y número
    const sortedCards = [...userCardsCache].sort((a, b) => {
        if (a.set !== b.set) return (a.set || '').localeCompare(b.set || '');
        return parseInt(a.number || 0) - parseInt(b.number || 0);
    });
    
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div class="p-4 border-b dark:border-gray-700">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                        Seleccionar de Mis Cartas (${userCardsCache.length} cartas)
                    </h3>
                    <button onclick="this.closest('.fixed').remove()" 
                            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl">
                        &times;
                    </button>
                </div>
                
                <!-- Barra de búsqueda -->
                <div class="flex gap-2">
                    <input type="text" 
                           id="myCardsSearchInput"
                           placeholder="Buscar en tu colección..."
                           class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                           oninput="filterMyCardsModal(this.value)">
                    
                    <select id="myCardsSetFilter" 
                            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                            onchange="filterMyCardsModal(document.getElementById('myCardsSearchInput').value)">
                        <option value="">Todos los sets</option>
                        ${[...new Set(sortedCards.map(c => c.set))].filter(Boolean).sort().map(set => 
                            `<option value="${set}">${set}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
            
            <div class="p-3 overflow-y-auto flex-1" id="myCardsListContainer">
                <div class="space-y-1" id="myCardsList">
                    ${sortedCards.map((card, index) => {
                        const safeCardName = (card.name || '').replace(/'/g, "\\'");
                        const safeImageUrl = (card.imageUrl || '').replace(/'/g, "\\'");
                        const safeSet = (card.set || '').replace(/'/g, "\\'");
                        const safeNumber = (card.number || '').replace(/'/g, "\\'");
                        
                        return `
                        <div class="my-card-row flex items-center gap-2 p-2 bg-white dark:bg-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                             data-card-name="${card.name?.toLowerCase() || ''}"
                             data-card-set="${card.set?.toLowerCase() || ''}">
                            
                            <!-- Icono de imagen con hover -->
                            <div class="relative group">
                                <button type="button" 
                                        class="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                                        title="Ver carta">
                                    <span class="text-lg">🖼️</span>
                                </button>
                                
                                <!-- Vista previa al hover (solo imagen) -->
                                <div class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000] hidden group-hover:block pointer-events-none">
                                    <img src="${card.imageUrl}" 
                                         alt="${card.name}" 
                                         class="w-80 h-auto shadow-2xl rounded-lg">
                                </div>
                            </div>
                            
                            <!-- Información de la carta (más compacta) -->
                            <div class="flex-1 min-w-0">
                                <div class="font-medium text-sm text-gray-900 dark:text-white truncate">${card.name || 'Sin nombre'}</div>
                                <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    ${card.set || 'Set desconocido'} • #${card.number || 'N/A'} • ${card.language || 'Español'} ${card.condition ? `• ${CARD_CONDITIONS[card.condition]?.icon || ''} ${card.condition}` : ''}
                                </div>
                            </div>
                            
                            <!-- Botón de seleccionar -->
                            <button onclick="selectFromMyCards('${type}', '${card.id}', '${safeCardName}', '${safeImageUrl}', '${safeSet}', '${safeNumber}', '${card.language || 'Español'}', '${card.condition || 'NM'}'); this.closest('.fixed').remove();"
                                    class="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-medium">
                                + Añadir
                            </button>
                        </div>
                        `;
                    }).join('')}
                </div>
                
                <!-- Mensaje cuando no hay resultados -->
                <div id="noResultsMessage" class="hidden text-center py-8 text-gray-500 dark:text-gray-400">
                    No se encontraron cartas que coincidan con tu búsqueda
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
};

// Función para filtrar cartas en el modal
window.filterMyCardsModal = function(searchTerm) {
    const setFilter = document.getElementById('myCardsSetFilter');
    const selectedSet = setFilter ? setFilter.value.toLowerCase() : '';
    const searchLower = searchTerm.toLowerCase();
    
    const cardRows = document.querySelectorAll('.my-card-row');
    const noResultsMsg = document.getElementById('noResultsMessage');
    let visibleCount = 0;
    
    cardRows.forEach(row => {
        const cardName = row.dataset.cardName || '';
        const cardSet = row.dataset.cardSet || '';
        
        const matchesSearch = !searchLower || cardName.includes(searchLower);
        const matchesSet = !selectedSet || cardSet === selectedSet;
        
        if (matchesSearch && matchesSet) {
            row.style.display = 'flex';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Mostrar mensaje si no hay resultados
    if (noResultsMsg) {
        noResultsMsg.classList.toggle('hidden', visibleCount > 0);
    }
};

// Función para seleccionar carta desde "Mis Cartas"
window.selectFromMyCards = function(type, cardId, cardName, cardImage, setName, cardNumber, language = 'Español', condition = 'NM') {
    console.log('📋 selectFromMyCards llamada con:', { type, cardId, cardName, cardImage, setName, cardNumber, language, condition });
    
    // Obtener el contenedor correcto
    const containerId = type === 'offered' ? 'offeredCardsContainer' : 'wantedCardsContainer';
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error('❌ No se encontró el contenedor:', containerId);
        return;
    }
    
    const cards = container.querySelectorAll('.trade-card');
    
    // Buscar la primera fila vacía
    let targetCardIndex = -1;
    let cardElement = null;
    
    for (let i = 0; i < cards.length; i++) {
        const nameInput = cards[i].querySelector(`input[name="${type}_name_${i}"]`);
        if (nameInput && !nameInput.value && !nameInput.readOnly) {
            targetCardIndex = i;
            cardElement = cards[i];
            break;
        }
    }
    
    // Si no hay filas vacías, añadir una nueva
    if (targetCardIndex === -1) {
        addCardToTrade(type);
        const newCards = container.querySelectorAll('.trade-card');
        targetCardIndex = newCards.length - 1;
        cardElement = newCards[targetCardIndex];
    }
    
    if (!cardElement) {
        console.error('❌ No se encontró el elemento de carta');
        return;
    }
    
    // Rellenar los datos de la carta seleccionada
    selectCardForTrade(type, targetCardIndex, cardId, cardName, cardImage, setName, cardNumber);
    
    // Establecer el idioma de la carta
    const languageSelect = cardElement.querySelector(`select[name="${type}_language_${targetCardIndex}"]`);
    if (languageSelect) {
        console.log('✅ Selector de idioma encontrado, estableciendo:', language);
        // Buscar la opción que coincida con el idioma
        const options = languageSelect.options;
        for (let i = 0; i < options.length; i++) {
            if (options[i].value === language) {
                languageSelect.selectedIndex = i;
                console.log('✅ Idioma establecido en índice:', i);
                break;
            }
        }
    } else {
        console.error('❌ No se encontró el selector de idioma');
    }
    
    // Establecer la condición de la carta
    const conditionSelect = cardElement.querySelector(`select[name="${type}_condition_${targetCardIndex}"]`);
    if (conditionSelect) {
        console.log('✅ Selector de condición encontrado, estableciendo:', condition);
        conditionSelect.value = condition;
    } else {
        console.error('❌ No se encontró el selector de condición');
    }
    
    // Verificar que el nombre se haya establecido correctamente
    const nameInput = cardElement.querySelector(`input[name="${type}_name_${targetCardIndex}"]`);
    if (nameInput) {
        console.log('✅ Nombre establecido:', nameInput.value);
    } else {
        console.error('❌ No se encontró el input de nombre');
    }
};

// Función para contar cuántas personas ofrecen una carta específica
function getCardOffersCount(cardName) {
    let offersCount = 0;
    
    // Buscar en todos los intercambios guardados en localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith('userTrades_')) {
            try {
                const trades = JSON.parse(localStorage.getItem(key) || '[]');
                
                // Contar las veces que esta carta aparece en las cartas ofrecidas
                trades.forEach(trade => {
                    if (trade.offeredCards && Array.isArray(trade.offeredCards)) {
                        trade.offeredCards.forEach(offeredCard => {
                            const offeredCardName = offeredCard.name || offeredCard;
                            if (offeredCardName && offeredCardName.toLowerCase().includes(cardName.toLowerCase())) {
                                offersCount++;
                            }
                        });
                    }
                });
            } catch (error) {
                console.error('Error al procesar intercambios:', error);
            }
        }
    }
    
    return offersCount;
}

// Función para obtener todos los intercambios que ofrecen una carta específica
function getCardOfferDetails(cardName) {
    const offers = [];
    
    // Buscar en todos los intercambios guardados en localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith('userTrades_')) {
            try {
                const trades = JSON.parse(localStorage.getItem(key) || '[]');
                
                trades.forEach(trade => {
                    if (trade.offeredCards && Array.isArray(trade.offeredCards)) {
                        const hasCard = trade.offeredCards.some(offeredCard => {
                            const offeredCardName = offeredCard.name || offeredCard;
                            return offeredCardName && offeredCardName.toLowerCase().includes(cardName.toLowerCase());
                        });
                        
                        if (hasCard) {
                            offers.push({
                                user: trade.user || 'Usuario desconocido',
                                userId: trade.userId || key.replace('userTrades_', ''),
                                title: trade.title,
                                offeredCards: trade.offeredCards,
                                wantedCards: trade.wantedCards,
                                createdAt: trade.createdAt
                            });
                        }
                    }
                });
            } catch (error) {
                console.error('Error al procesar intercambios:', error);
            }
        }
    }
    
    return offers;
}

// Función para mostrar el modal con las ofertas de una carta
window.showCardOffers = function(cardName, cardImageUrl) {
    const offers = getCardOfferDetails(cardName);
    
    if (offers.length === 0) {
        showNotification('No hay ofertas disponibles para esta carta en este momento.', 'info', 4000);
        return;
    }
    
    // Crear el modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.onclick = function(e) {
        if (e.target === modal) modal.remove();
    };
    
    let offersHTML = offers.map(offer => `
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-600">
            <div class="flex justify-between items-start mb-3">
                <div>
                    <h4 class="font-semibold text-gray-800 dark:text-white">${offer.title || 'Intercambio sin título'}</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Por: <span class="font-medium">${offer.user}</span></p>
                </div>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                    ${offer.createdAt ? new Date(offer.createdAt).toLocaleDateString('es-ES') : 'Fecha no disponible'}
                </span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">📤 Ofrece:</h5>
                    <div class="space-y-1">
                        ${offer.offeredCards.map(card => `
                            <div class="bg-white dark:bg-gray-600 px-2 py-1 rounded text-xs flex items-center gap-1">
                                ${card.image ? `<img src="${card.image}" alt="${card.name}" class="w-6 h-8 object-contain">` : ''}
                                <span class="text-gray-700 dark:text-gray-200">${card.name || card}</span>
                                ${card.condition ? `<span class="ml-2 text-gray-500 dark:text-gray-400">(${card.condition})</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div>
                    <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">📥 Busca:</h5>
                    <div class="space-y-1">
                        ${offer.wantedCards.map(card => `
                            <div class="bg-white dark:bg-gray-600 px-2 py-1 rounded text-xs flex items-center gap-1">
                                ${card.image ? `<img src="${card.image}" alt="${card.name}" class="w-6 h-8 object-contain">` : ''}
                                <span class="text-gray-700 dark:text-gray-200">${card.name || card}</span>
                                ${card.condition ? `<span class="ml-2 text-gray-500 dark:text-gray-400">(${card.condition})</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div class="mt-3 flex justify-end">
                <button class="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm"
                        onclick="alert('Función de contacto en desarrollo')">
                    💬 Contactar
                </button>
            </div>
        </div>
    `).join('');
    
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div class="p-6 border-b dark:border-gray-700">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <img src="${cardImageUrl}" alt="${cardName}" class="w-16 h-20 object-contain rounded">
                        <div>
                            <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                                Ofertas de ${cardName}
                            </h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400">
                                ${offers.length} ${offers.length === 1 ? 'persona ofrece' : 'personas ofrecen'} esta carta
                            </p>
                        </div>
                    </div>
                    <button onclick="this.closest('.fixed').remove()" 
                            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl">
                        &times;
                    </button>
                </div>
            </div>
            
            <div class="p-6 overflow-y-auto flex-1">
                ${offersHTML}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
};

// Función helper para obtener el nombre de usuario para mostrar en intercambios
async function getUserDisplayName(uid = null) {
    try {
        const userId = uid || currentUser?.uid;
        if (!userId) return 'Usuario';
        
        // Si es el usuario actual y no se proporciona uid
        if (!uid && currentUser) {
            // Primero intentar obtener de Firestore
            if (typeof db !== 'undefined' && db) {
                const userDoc = await db.collection('users').doc(userId).get();
                const userData = userDoc.data();
                
                if (userData) {
                    // PRIORIDAD 1: Username (nombre de usuario único)
                    if (userData.username) {
                        return userData.username;
                    }
                    // PRIORIDAD 2: Nombre completo si no hay username
                    if (userData.name && userData.lastName) {
                        return `${userData.name} ${userData.lastName}`;
                    }
                    // PRIORIDAD 3: Solo nombre
                    if (userData.name) {
                        return userData.name;
                    }
                    // PRIORIDAD 4: DisplayName guardado
                    if (userData.displayName) {
                        return userData.displayName;
                    }
                }
            }
            
            // Si no hay datos en Firestore, usar displayName de Auth
            if (currentUser.displayName) {
                return currentUser.displayName;
            }
            
            // Como último recurso, usar parte del email antes del @
            if (currentUser.email) {
                return currentUser.email.split('@')[0];
            }
        }
        
        return 'Usuario';
    } catch (error) {
        console.error('Error obteniendo nombre de usuario:', error);
        // Si hay error, intentar con el displayName o email del currentUser
        if (currentUser?.displayName) return currentUser.displayName;
        if (currentUser?.email) return currentUser.email.split('@')[0];
        return 'Usuario';
    }
}

// Función para cargar intercambios del usuario
async function loadUserTrades() {
    if (!currentUser) return;

    try {
        console.log('🤝 Cargando intercambios del usuario...');

        // Cargar intercambios guardados del usuario ACTUAL (usando su UID)
        const userTradesKey = `userTrades_${currentUser.uid}`;
        const savedTrades = JSON.parse(localStorage.getItem(userTradesKey) || '[]');
        
        // Usar solo los intercambios guardados reales, sin datos de ejemplo
        let allTrades = [...savedTrades];

        // Convertir fechas de string a Date si es necesario
        allTrades = allTrades.map(trade => ({
            ...trade,
            createdAt: typeof trade.createdAt === 'string' ? new Date(trade.createdAt) : trade.createdAt
        }));

        displayTrades(allTrades, 'myTradesContainer');

    } catch (error) {
        console.error('❌ Error al cargar intercambios:', error);
    }
}

// Función para cargar intercambios disponibles
async function loadAvailableTrades() {
    if (!currentUser) return;

    try {
        console.log('🎯 Cargando intercambios disponibles...');

        // Cargar TODOS los intercambios de localStorage
        let allAvailableTrades = [];
        
        // Obtener todas las claves de localStorage que sean de intercambios
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            
            // Si la clave es de intercambios y NO es del usuario actual
            if (key.startsWith('userTrades_') && key !== `userTrades_${currentUser.uid}`) {
                const trades = JSON.parse(localStorage.getItem(key) || '[]');
                
                // Añadir todos los intercambios de otros usuarios
                trades.forEach(trade => {
                    // Asegurarse de que no se puedan editar intercambios de otros
                    allAvailableTrades.push({
                        ...trade,
                        type: 'available', // Marcar como disponible, no creado
                        userId: key.replace('userTrades_', '') // Extraer el userId de la clave
                    });
                });
            }
        }

        // No mostrar datos de ejemplo, solo intercambios reales

        // Convertir fechas si es necesario
        allAvailableTrades = allAvailableTrades.map(trade => ({
            ...trade,
            createdAt: typeof trade.createdAt === 'string' ? new Date(trade.createdAt) : trade.createdAt
        }));

        displayTrades(allAvailableTrades, 'availableTradesContainer');

    } catch (error) {
        console.error('❌ Error al cargar intercambios disponibles:', error);
    }
}

// Función para mostrar intercambios en un contenedor
function displayTrades(trades, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (trades.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 dark:text-gray-400 py-8">
                <p>No hay intercambios disponibles</p>
            </div>
        `;
        return;
    }

    let tradesHTML = '';
    trades.forEach(trade => {
        tradesHTML += `
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-400 transition-colors">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h4 class="font-semibold text-gray-800 dark:text-white">${trade.title}</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-300">${trade.description}</p>
                    </div>
                    <span class="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400">${formatDate(trade.createdAt)}</span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">📤 Ofrezco:</h5>
                        <div class="space-y-2">
                            ${trade.offeredCards.map(card => `
                                <div class="flex items-center justify-between bg-white dark:bg-gray-600 px-3 py-2 rounded border border-gray-200 dark:border-gray-500">
                                    <div class="flex items-center gap-2 flex-1">
                                        ${card.image ? `<img src="${card.image}" alt="${card.name}" class="w-8 h-11 object-contain rounded">` : ''}
                                        <span class="text-sm text-gray-700 dark:text-gray-200">${card.name || card}</span>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <span class="text-xs px-2 py-1 rounded-full text-white font-medium" 
                                              style="background-color: ${CARD_CONDITIONS[card.condition || 'NM'].color}">
                                            ${CARD_CONDITIONS[card.condition || 'NM'].icon} ${card.condition || 'NM'}
                                        </span>
                                        <span class="text-xs text-gray-500 dark:text-gray-400">${card.language || 'Español'}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div>
                        <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">📥 Busco:</h5>
                        <div class="space-y-2">
                            ${trade.wantedCards.map(card => `
                                <div class="flex items-center justify-between bg-white dark:bg-gray-600 px-3 py-2 rounded border border-gray-200 dark:border-gray-500">
                                    <div class="flex items-center gap-2 flex-1">
                                        ${card.image ? `<img src="${card.image}" alt="${card.name}" class="w-8 h-11 object-contain rounded">` : ''}
                                        <span class="text-sm text-gray-700 dark:text-gray-200">${card.name || card}</span>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <span class="text-xs px-2 py-1 rounded-full text-white font-medium" 
                                              style="background-color: ${CARD_CONDITIONS[card.condition || 'NM'].color}">
                                            ${CARD_CONDITIONS[card.condition || 'NM'].icon} ${card.condition || 'NM'}
                                        </span>
                                        <span class="text-xs text-gray-500 dark:text-gray-400">${card.language || 'Español'}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="flex justify-between items-center">
                    <span class="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-400">Por: ${trade.user}</span>
                    <div class="flex space-x-2">
                        ${trade.userId === currentUser?.uid ? `
                            <button class="btn-secondary px-3 py-1 rounded text-xs" onclick="editTrade('${trade.id}')">
                                ✏️ Editar
                            </button>
                            <button class="btn-secondary px-3 py-1 rounded text-xs" onclick="deleteTrade('${trade.id}')">
                                🗑️ Eliminar
                            </button>
                        ` : `
                            <button class="btn-primary px-3 py-1 rounded text-xs" onclick="proposeTrade('${trade.id}')">
                                💬 Proponer
                            </button>
                            <button class="btn-secondary px-3 py-1 rounded text-xs" onclick="viewTradeDetails('${trade.id}')">
                                👁️ Ver
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = tradesHTML;
}

// Función para formatear fechas
function formatDate(date) {
    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Funciones de acción para intercambios
// Función para encontrar un intercambio por ID
function findTradeById(tradeId) {
    // Primero buscar en los intercambios del usuario actual
    if (currentUser) {
        const userTradesKey = `userTrades_${currentUser.uid}`;
        const userTrades = JSON.parse(localStorage.getItem(userTradesKey) || '[]');
        const userTrade = userTrades.find(trade => trade.id === tradeId);
        if (userTrade) return userTrade;
    }
    
    // Si no se encuentra, buscar en todos los intercambios disponibles
    // Esto incluye intercambios de otros usuarios
    const allKeys = Object.keys(localStorage);
    for (const key of allKeys) {
        if (key.startsWith('userTrades_')) {
            const trades = JSON.parse(localStorage.getItem(key) || '[]');
            const trade = trades.find(t => t.id === tradeId);
            if (trade) return trade;
        }
    }
    
    return null;
}

// Función para editar intercambio (abre modal con datos pre-cargados)
function editTrade(tradeId) {
    console.log('🔍 === INICIANDO EDICIÓN ===');
    console.log('✏️ Editando intercambio ID:', tradeId);
    
    // Verificar localStorage
    const userTradesKey = `userTrades_${currentUser.uid}`;
    const savedTrades = JSON.parse(localStorage.getItem(userTradesKey) || '[]');
    console.log('📦 Intercambios en localStorage:', savedTrades.length);
    console.log('📦 Todos los intercambios:', savedTrades);
    
    const trade = findTradeById(tradeId);
    console.log('🔍 Intercambio encontrado:', trade);
    
    if (!trade) {
        console.error('❌ No se encontró el intercambio para editar. ID buscado:', tradeId);
        showNotification('No se encontró el intercambio para editar', 'error', 4000);
        return;
    }
    
    console.log('📋 Datos completos del intercambio a editar:');
    console.log('- ID:', trade.id);
    console.log('- Título:', trade.title);
    console.log('- Descripción:', trade.description);
    console.log('- Cartas ofrecidas:', trade.offeredCards);
    console.log('- Cartas buscadas:', trade.wantedCards);
    
    // Abrir modal de crear intercambio con datos pre-cargados
    console.log('🚀 Abriendo modal con datos...');
    showCreateTradeModal(trade);
}

// Función para eliminar intercambio directamente
async function deleteTrade(tradeId) {
    console.log('🗑️ Eliminando intercambio:', tradeId);
    
    const trade = findTradeById(tradeId);
    if (!trade) {
        showNotification('No se encontró el intercambio para eliminar', 'error', 4000);
        return;
    }
    
    // Usar modal personalizado en lugar de confirm()
    const confirmed = await showConfirmDeleteModal(trade.title);
    
    if (confirmed) {
        // Eliminar del localStorage
        const userTradesKey = `userTrades_${currentUser.uid}`;
        let savedTrades = JSON.parse(localStorage.getItem(userTradesKey) || '[]');
        savedTrades = savedTrades.filter(t => t.id !== tradeId);
        localStorage.setItem(userTradesKey, JSON.stringify(savedTrades));
        
        console.log('✅ Intercambio eliminado exitosamente');
        
        // Mostrar mensaje de éxito con estilo personalizado
        showSuccessMessage('¡Intercambio eliminado exitosamente! 🗑️');
        
        // Recargar la lista de intercambios
        loadUserTrades();
    }
}

function proposeTrade(tradeId) {
    console.log('💬 Proponiendo intercambio:', tradeId);
    alert('Función de propuesta en desarrollo');
}

function viewTradeDetails(tradeId) {
    console.log('👁️ Viendo detalles del intercambio:', tradeId);
    
    // Buscar el intercambio
    const trade = findTradeById(tradeId);
    if (!trade) {
        showNotification('No se encontró el intercambio', 'error');
        return;
    }
    
    // Crear modal de detalles
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    
    // Generar HTML para las cartas ofrecidas
    const offeredCardsHTML = trade.offeredCards.map(card => `
        <div class="bg-white dark:bg-gray-700 rounded-lg p-5 shadow-xl flex flex-col items-center hover:shadow-2xl transition-shadow w-full max-w-sm">
            ${card.image ? `
                <img src="${card.image}" alt="${card.name}" 
                     class="w-full h-64 object-contain mb-3 rounded">
            ` : `
                <div class="w-full h-64 bg-gray-200 dark:bg-gray-600 rounded mb-3 flex items-center justify-center">
                    <span class="text-6xl">🎴</span>
                </div>
            `}
            <h4 class="font-bold text-lg text-gray-900 dark:text-white mb-2 text-center">${card.name || 'Sin nombre'}</h4>
            <div class="space-y-1 text-sm w-full">
                ${card.set ? `<p class="text-gray-600 dark:text-gray-300 text-center"><span class="font-semibold">Set:</span> ${card.set}</p>` : ''}
                ${card.number ? `<p class="text-gray-600 dark:text-gray-300 text-center"><span class="font-semibold">Número:</span> #${card.number}</p>` : ''}
                <p class="text-gray-600 dark:text-gray-300 text-center">
                    <span class="font-semibold">Estado:</span> 
                    ${CARD_CONDITIONS[card.condition]?.icon || ''} ${CARD_CONDITIONS[card.condition]?.label || card.condition || 'No especificado'}
                </p>
                <p class="text-gray-600 dark:text-gray-300 text-center">
                    <span class="font-semibold">Idioma:</span> ${card.language || 'Español'}
                </p>
            </div>
        </div>
    `).join('');
    
    // Determinar el grid layout basado en el número de cartas ofrecidas
    const offeredGridClass = trade.offeredCards.length === 1 
        ? 'flex justify-center' 
        : trade.offeredCards.length === 2 
            ? 'grid grid-cols-1 md:grid-cols-2 gap-4 justify-items-center'
            : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center';
    
    // Generar HTML para las cartas buscadas
    const wantedCardsHTML = trade.wantedCards.map(card => `
        <div class="bg-white dark:bg-gray-700 rounded-lg p-5 shadow-xl flex flex-col items-center hover:shadow-2xl transition-shadow w-full max-w-sm">
            ${card.image ? `
                <img src="${card.image}" alt="${card.name}" 
                     class="w-full h-64 object-contain mb-3 rounded">
            ` : `
                <div class="w-full h-64 bg-gray-200 dark:bg-gray-600 rounded mb-3 flex items-center justify-center">
                    <span class="text-6xl">🎴</span>
                </div>
            `}
            <h4 class="font-bold text-lg text-gray-900 dark:text-white mb-2 text-center">${card.name || 'Sin nombre'}</h4>
            <div class="space-y-1 text-sm w-full">
                ${card.set ? `<p class="text-gray-600 dark:text-gray-300 text-center"><span class="font-semibold">Set:</span> ${card.set}</p>` : ''}
                ${card.number ? `<p class="text-gray-600 dark:text-gray-300 text-center"><span class="font-semibold">Número:</span> #${card.number}</p>` : ''}
                <p class="text-gray-600 dark:text-gray-300 text-center">
                    <span class="font-semibold">Estado:</span> 
                    ${CARD_CONDITIONS[card.condition]?.icon || ''} ${CARD_CONDITIONS[card.condition]?.label || card.condition || 'No especificado'}
                </p>
                <p class="text-gray-600 dark:text-gray-300 text-center">
                    <span class="font-semibold">Idioma:</span> ${card.language || 'Español'}
                </p>
            </div>
        </div>
    `).join('');
    
    // Determinar el grid layout basado en el número de cartas buscadas
    const wantedGridClass = trade.wantedCards.length === 1 
        ? 'flex justify-center' 
        : trade.wantedCards.length === 2 
            ? 'grid grid-cols-1 md:grid-cols-2 gap-4 justify-items-center'
            : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center';
    
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <!-- Header -->
            <div class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
                <div class="flex justify-between items-start">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            🔄 ${trade.title || 'Intercambio sin título'}
                        </h2>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                            Creado por: <span class="font-semibold">${trade.userName || 'Usuario'}</span> • 
                            ${trade.createdAt ? new Date(trade.createdAt).toLocaleDateString('es-ES') : 'Fecha desconocida'}
                        </p>
                    </div>
                    <button onclick="this.closest('.fixed').remove()" 
                            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-3xl">
                        &times;
                    </button>
                </div>
            </div>
            
            <!-- Content -->
            <div class="p-6">
                <!-- Trade Flow -->
                <div class="flex flex-col lg:flex-row items-stretch justify-center gap-6 mb-8">
                    <!-- Offered Cards -->
                    <div class="flex-1 w-full max-w-2xl mx-auto">
                        <h3 class="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4 text-center">
                            📤 Cartas Ofrecidas
                        </h3>
                        <div class="${offeredGridClass}">
                            ${offeredCardsHTML || '<p class="text-gray-500 text-center italic">No hay cartas ofrecidas</p>'}
                        </div>
                    </div>
                    
                    <!-- Arrow -->
                    <div class="flex items-center justify-center px-4">
                        <div class="text-5xl lg:text-6xl text-orange-500 animate-pulse">
                            ⇄
                        </div>
                    </div>
                    
                    <!-- Wanted Cards -->
                    <div class="flex-1 w-full max-w-2xl mx-auto">
                        <h3 class="text-xl font-bold text-green-600 dark:text-green-400 mb-4 text-center">
                            📥 Cartas Buscadas
                        </h3>
                        <div class="${wantedGridClass}">
                            ${wantedCardsHTML || '<p class="text-gray-500 text-center italic">No hay cartas buscadas</p>'}
                        </div>
                    </div>
                </div>
                
                <!-- Description -->
                ${trade.description ? `
                    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                        <h3 class="font-bold text-gray-900 dark:text-white mb-2">📝 Descripción</h3>
                        <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">${trade.description}</p>
                    </div>
                ` : ''}
                
                <!-- Action Buttons -->
                <div class="flex gap-3 justify-center">
                    ${currentUser && trade.userId !== currentUser.uid ? `
                        <button onclick="proposeTrade('${tradeId}')" 
                                class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors">
                            <span>💬</span> Proponer Intercambio
                        </button>
                        <button onclick="contactUser('${trade.userId}')" 
                                class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors">
                            <span>📧</span> Contactar
                        </button>
                    ` : ''}
                    <button onclick="this.closest('.fixed').remove()" 
                            class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Cerrar con ESC o click fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', escHandler);
        }
    });
}

// Función para contactar con un usuario
function contactUser(userId) {
    console.log('📧 Contactando con usuario:', userId);
    showNotification('Función de contacto en desarrollo', 'info');
}

// Función para mostrar modal de crear intercambio
window.showCreateTradeModal = (existingTrade = null) => {
    console.log('🚀 === ABRIENDO MODAL ===');
    console.log('📥 Parámetro existingTrade recibido:', existingTrade);
    
    if (!currentUser) {
        showNotification('Debes iniciar sesión para crear intercambios', 'warning', 4000);
        showAuthModal('login');
        return;
    }

    const isEditing = !!existingTrade;
    console.log('🔧 isEditing calculado:', isEditing);
    console.log(isEditing ? '✏️ Modo edición activado' : '🆕 Modo crear nuevo');
    
    if (isEditing) {
        console.log('📋 Datos para edición:');
        console.log('- existingTrade completo:', existingTrade);
        console.log('- offeredCards:', existingTrade?.offeredCards);
        console.log('- wantedCards:', existingTrade?.wantedCards);
    }

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    <span class="icon mr-3">${isEditing ? '✏️' : '🤝'}</span> ${isEditing ? 'Editar Intercambio' : 'Crear Nuevo Intercambio'}
                </h3>
                <button id="closeCreateTradeModal" 
                        class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-3xl">
                    &times;
                </button>
            </div>

            <form id="createTradeForm" class="space-y-6">
                ${isEditing ? `<input type="hidden" id="editingTradeId" value="${existingTrade.id}">` : ''}
                <!-- Vista previa del título generado -->
                <div class="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                    <h4 class="text-lg font-semibold text-orange-800 dark:text-orange-300 mb-2 flex items-center">
                        <span class="mr-2">✨</span> Vista Previa del Título
                    </h4>
                    <div id="generatedTitle" class="text-gray-700 dark:text-gray-300 font-medium italic">
                        El título se generará automáticamente cuando añadas cartas
                    </div>
                </div>

                <!-- Cartas que ofrezco -->
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 class="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center">
                        <span class="mr-2">📤</span> Cartas que Ofrezco
                    </h4>
                    <div id="offeredCardsContainer" class="space-y-3 mb-4">
                        <!-- Las cartas ofrecidas se añadirán aquí -->
                    </div>
                    <div class="flex gap-2">
                        <button type="button" id="addOfferedCardBtn"
                                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center">
                            <span class="mr-2">+</span> Añadir Carta
                        </button>
                        <button type="button" onclick="addFromMyCards('offered')"
                                class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center">
                            <span class="mr-2">📚</span> Desde Mis Cartas
                        </button>
                    </div>
                </div>

                <!-- Cartas que busco -->
                <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h4 class="text-lg font-semibold text-green-800 dark:text-green-300 mb-4 flex items-center">
                        <span class="mr-2">📥</span> Cartas que Busco
                    </h4>
                    <div id="wantedCardsContainer" class="space-y-3 mb-4">
                        <!-- Las cartas buscadas se añadirán aquí -->
                    </div>
                    <div class="flex gap-2">
                        <button type="button" id="addWantedCardBtn"
                                class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center">
                            <span class="mr-2">+</span> Añadir Carta
                        </button>
                    </div>
                </div>

                <!-- Otros detalles -->
                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 class="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                        <span class="mr-2">📝</span> Otros Detalles
                    </h4>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Información adicional (opcional)
                        </label>
                        <textarea id="tradeDescription" rows="3"
                                  placeholder="Describe condiciones específicas, preferencias, ubicación para intercambio presencial, etc..."
                                  class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-600 text-gray-900 dark:text-white resize-none"></textarea>
                    </div>
                </div>

                <!-- Botones de acción -->
                <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <button type="button" id="cancelCreateTrade"
                            class="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold">
                        Cancelar
                    </button>
                    <button type="submit" id="submitCreateTrade"
                            class="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold flex items-center">
                        <span class="mr-2">${isEditing ? '✅' : '🚀'}</span> ${isEditing ? 'Confirmar Intercambio' : 'Crear Intercambio'}
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    setupCreateTradeModalEvents(modal, isEditing, existingTrade);
};

// Configurar eventos del modal de crear intercambio
function setupCreateTradeModalEvents(modal, isEditing = false, existingTrade = null) {
    console.log('🔧 === CONFIGURANDO EVENTOS DEL MODAL ===');
    console.log('🔧 isEditing recibido:', isEditing);
    console.log('🔧 existingTrade recibido:', existingTrade);
    const closeBtn = modal.querySelector('#closeCreateTradeModal');
    const cancelBtn = modal.querySelector('#cancelCreateTrade');
    const form = modal.querySelector('#createTradeForm');
    const addOfferedBtn = modal.querySelector('#addOfferedCardBtn');
    const addWantedBtn = modal.querySelector('#addWantedCardBtn');

    // Cerrar modal
    const closeModal = () => modal.remove();
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Cerrar con ESC o click fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    });

    // Añadir cartas
    addOfferedBtn.addEventListener('click', () => addCardToTrade('offered'));
    addWantedBtn.addEventListener('click', () => addCardToTrade('wanted'));

    // Enviar formulario
    form.addEventListener('submit', handleCreateTradeSubmit);

    // Añadir cartas iniciales o pre-cargar datos existentes
    console.log('🔍 === INICIANDO SETUP DE CARTAS ===');
    console.log('🔧 isEditing:', isEditing);
    console.log('📦 existingTrade:', existingTrade);
    
    if (isEditing && existingTrade) {
        console.log('📋 ✅ ENTRANDO EN MODO EDICIÓN');
        console.log('📋 Modo edición: pre-cargando cartas existentes...', existingTrade);
        console.log('📋 offeredCards para pre-cargar:', existingTrade.offeredCards);
        console.log('📋 wantedCards para pre-cargar:', existingTrade.wantedCards);
        
        // Pre-cargar descripción inmediatamente
        setTimeout(() => {
            const descriptionTextarea = document.getElementById('tradeDescription');
            if (descriptionTextarea && existingTrade.description) {
                descriptionTextarea.value = existingTrade.description;
                console.log('✅ Descripción pre-cargada:', existingTrade.description);
            }
        }, 50);
        
        // Pre-cargar cartas ofrecidas
        existingTrade.offeredCards.forEach((card, index) => {
            console.log(`📝 Añadiendo carta ofrecida ${index}:`, card);
            addCardToTrade('offered');
            // Pre-cargar datos con delay para asegurar que el DOM esté listo
            setTimeout(() => {
                preloadCardData('offered', index, card);
            }, 100 + (index * 50));
        });
        
        // Pre-cargar cartas buscadas  
        existingTrade.wantedCards.forEach((card, index) => {
            console.log(`📝 Añadiendo carta buscada ${index}:`, card);
            addCardToTrade('wanted');
            // Pre-cargar datos con delay para asegurar que el DOM esté listo
            setTimeout(() => {
                preloadCardData('wanted', index, card);
            }, 100 + (index * 50));
        });
        
        // Actualizar título después de pre-cargar todo
        setTimeout(() => {
            updateGeneratedTitle();
            console.log('✅ Pre-carga completada en modo edición');
        }, 500);
    } else {
        // Modo crear nuevo: añadir cartas vacías
        console.log('🆕 Modo crear nuevo: añadiendo cartas vacías');
        addCardToTrade('offered');
        addCardToTrade('wanted');
    }
}

// Función para pre-cargar datos en una carta existente
function preloadCardData(type, cardIndex, cardData) {
    console.log(`📝 Pre-cargando datos para ${type} carta ${cardIndex}:`, cardData);
    
    const container = document.getElementById(type === 'offered' ? 'offeredCardsContainer' : 'wantedCardsContainer');
    const cardElement = container.children[cardIndex];
    
    if (!cardElement) {
        console.error('❌ No se encontró el elemento de carta para pre-cargar');
        return;
    }
    
    // Pre-cargar nombre
    const nameInput = cardElement.querySelector(`input[name*="${type}_name_"]`);
    if (nameInput && cardData.name) {
        nameInput.value = cardData.name;
    }
    
    // Pre-cargar condición
    const conditionSelect = cardElement.querySelector(`select[name*="${type}_condition_"]`);
    if (conditionSelect && cardData.condition) {
        conditionSelect.value = cardData.condition;
    }
    
    // Pre-cargar idioma
    const languageSelect = cardElement.querySelector(`select[name*="${type}_language_"]`);
    if (languageSelect && cardData.language) {
        languageSelect.value = cardData.language;
    }
    
    console.log(`✅ Carta ${type} ${cardIndex} pre-cargada y EDITABLE (modo edición)`);
}

// Función para añadir carta al intercambio
function addCardToTrade(type) {
    const container = document.getElementById(type === 'offered' ? 'offeredCardsContainer' : 'wantedCardsContainer');
    
    // IMPORTANTE: Bloquear todas las cartas existentes antes de añadir una nueva
    console.log(`🔒 Bloqueando cartas existentes de tipo: ${type}`);
    Array.from(container.children).forEach(existingCard => {
        lockExistingCard(existingCard);
    });
    
    const cardIndex = container.children.length;
    const cardId = `${type}_card_${cardIndex}`;

    const cardElement = document.createElement('div');
    cardElement.className = 'trade-card bg-white dark:bg-gray-600 rounded-lg p-4 border border-gray-200 dark:border-gray-500';
    cardElement.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div class="relative">
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre de la carta *
                </label>
                <div class="relative">
                    <input type="text" name="${type}_name_${cardIndex}"
                           placeholder="Buscar carta..."
                           value=""
                           class="card-name-input w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                           oninput="searchCardForTrade(this, '${type}', ${cardIndex})"
                           onkeypress="handleCardInputKeypress(event, '${type}', ${cardIndex})"
                           onblur="handleCardInputBlur(this, '${type}', ${cardIndex})"
                           title="Buscar carta en la base de datos">
                    <input type="hidden" name="${type}_id_${cardIndex}" value="">
                    <input type="hidden" name="${type}_image_${cardIndex}" value="">
                    <input type="hidden" name="${type}_set_${cardIndex}" value="">
                    <input type="hidden" name="${type}_number_${cardIndex}" value="">
                </div>
                <div class="card-search-results absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto hidden"></div>
            </div>
            <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Condición *
                </label>
                <select name="${type}_condition_${cardIndex}"
                        class="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                        title="Selecciona la condición de la carta">
                    ${Object.values(CARD_CONDITIONS).map(condition => 
                        `<option value="${condition.code}">${condition.icon} ${condition.code}</option>`
                    ).join('')}
                </select>
            </div>
            <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Idioma
                </label>
                <select name="${type}_language_${cardIndex}"
                        class="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                        title="Selecciona el idioma de la carta">
                    <option value="Español">🇪🇸 Español</option>
                    <option value="Inglés">🇺🇸 Inglés</option>
                    <option value="Francés">🇫🇷 Francés</option>
                    <option value="Italiano">🇮🇹 Italiano</option>
                    <option value="Alemán">🇩🇪 Alemán</option>
                    <option value="Portugués">🇵🇹 Portugués</option>
                    <option value="Japonés">🇯🇵 Japonés</option>
                    <option value="Chino">🇨🇳 Chino</option>
                    <option value="Coreano">🇰🇷 Coreano</option>
                    <option value="Tailandés">🇹🇭 Tailandés</option>
                    <option value="Ruso">🇷🇺 Ruso</option>
                    <option value="Holandés">🇳🇱 Holandés</option>
                    <option value="Sueco">🇸🇪 Sueco</option>
                    <option value="Noruego">🇳🇴 Noruego</option>
                    <option value="Danés">🇩🇰 Danés</option>
                    <option value="Finlandés">🇫🇮 Finlandés</option>
                    <option value="Polaco">🇵🇱 Polaco</option>
                    <option value="Checo">🇨🇿 Checo</option>
                    <option value="Húngaro">🇭🇺 Húngaro</option>
                    <option value="Griego">🇬🇷 Griego</option>
                    <option value="Turco">🇹🇷 Turco</option>
                    <option value="Árabe">🇸🇦 Árabe</option>
                    <option value="Hebreo">🇮🇱 Hebreo</option>
                    <option value="Hindi">🇮🇳 Hindi</option>
                    <option value="Vietnamita">🇻🇳 Vietnamita</option>
                    <option value="Malayo">🇲🇾 Malayo</option>
                    <option value="Indonesio">🇮🇩 Indonesio</option>
                    <option value="Filipino">🇵🇭 Filipino</option>
                    <option value="Cualquiera">🌍 Cualquiera</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 opacity-0">
                    Eliminar
                </label>
                <button type="button" onclick="removeCardFromTrade(this)"
                        class="w-full h-[38px] bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm font-semibold transition-colors flex items-center justify-center"
                        title="Eliminar carta">
                    🗑️
                </button>
            </div>
        </div>
    `;

    container.appendChild(cardElement);
    updateGeneratedTitle();
    
    console.log(`✅ Nueva carta ${type} añadida y lista para editar`);
}

// Función para bloquear una carta completa (todos sus campos)
function lockExistingCard(cardElement) {
    console.log('🔒 Bloqueando carta completa');
    
    // Bloquear input de nombre
    const nameInput = cardElement.querySelector('input[name*="_name_"]');
    if (nameInput && !nameInput.readOnly) {
        nameInput.readOnly = true;
        nameInput.className = nameInput.className.replace('bg-white dark:bg-gray-700', 'bg-gray-100 dark:bg-gray-600');
        nameInput.className = nameInput.className.replace('text-gray-900 dark:text-white', 'text-gray-700 dark:text-gray-300');
        nameInput.className = nameInput.className.replace(' focus:outline-none focus:ring-2 focus:ring-orange-400', '');
        nameInput.className += ' cursor-not-allowed';
        nameInput.title = "Carta bloqueada - solo se puede eliminar";
    }
    
    // Bloquear select de condición
    const conditionSelect = cardElement.querySelector('select[name*="_condition_"]');
    if (conditionSelect && !conditionSelect.disabled) {
        conditionSelect.disabled = true;
        conditionSelect.className = conditionSelect.className.replace('bg-white dark:bg-gray-700', 'bg-gray-100 dark:bg-gray-600');
        conditionSelect.className = conditionSelect.className.replace('text-gray-900 dark:text-white', 'text-gray-700 dark:text-gray-300');
        conditionSelect.className = conditionSelect.className.replace(' focus:outline-none focus:ring-2 focus:ring-orange-400', '');
        conditionSelect.className += ' cursor-not-allowed';
        conditionSelect.title = "Carta bloqueada - solo se puede eliminar";
    }
    
    // Bloquear select de idioma
    const languageSelect = cardElement.querySelector('select[name*="_language_"]');
    if (languageSelect && !languageSelect.disabled) {
        languageSelect.disabled = true;
        languageSelect.className = languageSelect.className.replace('bg-white dark:bg-gray-700', 'bg-gray-100 dark:bg-gray-600');
        languageSelect.className = languageSelect.className.replace('text-gray-900 dark:text-white', 'text-gray-700 dark:text-gray-300');
        languageSelect.className = languageSelect.className.replace(' focus:outline-none focus:ring-2 focus:ring-orange-400', '');
        languageSelect.className += ' cursor-not-allowed';
        languageSelect.title = "Carta bloqueada - solo se puede eliminar";
    }
}

// Función para eliminar carta y actualizar título
window.removeCardFromTrade = function(button) {
    console.log('🗑️ Intentando eliminar carta...');
    
    // Buscar el elemento de la carta usando la clase específica
    const cardElement = button.closest('.trade-card');
    
    if (!cardElement) {
        console.error('❌ No se pudo encontrar el elemento de la carta');
        return;
    }
    
    const container = cardElement.parentElement;
    console.log('📦 Container encontrado, tiene', container.children.length, 'cartas');
    
    // Verificar que no sea la única carta del tipo
    if (container.children.length <= 1) {
        showNotification('Debes mantener al menos una carta de cada tipo', 'warning', 4000);
        return;
    }
    
    // Eliminar la carta
    console.log('✅ Eliminando carta...');
    cardElement.remove();
    
    // Actualizar el título
    console.log('🔄 Actualizando título...');
    updateGeneratedTitle();
    
    console.log('✨ Carta eliminada exitosamente');
};

// Función para generar título automáticamente
function updateGeneratedTitle() {
    const titleElement = document.getElementById('generatedTitle');
    if (!titleElement) return;

    const offeredCards = [];
    const wantedCards = [];

    // Recoger cartas ofrecidas
    const offeredContainer = document.getElementById('offeredCardsContainer');
    if (offeredContainer) {
        offeredContainer.querySelectorAll('.card-name-input').forEach(input => {
            if (input.value.trim()) {
                offeredCards.push(input.value.trim());
            }
        });
    }

    // Recoger cartas buscadas
    const wantedContainer = document.getElementById('wantedCardsContainer');
    if (wantedContainer) {
        wantedContainer.querySelectorAll('.card-name-input').forEach(input => {
            if (input.value.trim()) {
                wantedCards.push(input.value.trim());
            }
        });
    }

    // Generar título
    let generatedTitle = '';
    
    if (offeredCards.length > 0 && wantedCards.length > 0) {
        const offeredText = offeredCards.length === 1 
            ? offeredCards[0] 
            : `${offeredCards[0]} (+${offeredCards.length - 1} más)`;
        
        const wantedText = wantedCards.length === 1 
            ? wantedCards[0] 
            : `${wantedCards[0]} (+${wantedCards.length - 1} más)`;
        
        generatedTitle = `Intercambio ${offeredText} por ${wantedText}`;
    } else if (offeredCards.length > 0) {
        const offeredText = offeredCards.length === 1 
            ? offeredCards[0] 
            : `${offeredCards[0]} (+${offeredCards.length - 1} más)`;
        generatedTitle = `Intercambio ${offeredText} por [Cartas buscadas]`;
    } else if (wantedCards.length > 0) {
        const wantedText = wantedCards.length === 1 
            ? wantedCards[0] 
            : `${wantedCards[0]} (+${wantedCards.length - 1} más)`;
        generatedTitle = `Intercambio [Cartas ofrecidas] por ${wantedText}`;
    } else {
        generatedTitle = 'El título se generará automáticamente cuando añadas cartas';
    }

    titleElement.textContent = generatedTitle;
    titleElement.className = generatedTitle.includes('[') 
        ? 'text-gray-500 dark:text-gray-400 font-medium italic'
        : 'text-gray-800 dark:text-gray-200 font-semibold';
}

// Manejar envío del formulario
async function handleCreateTradeSubmit(e) {
    e.preventDefault();
    
    // Desactivar validación HTML nativa para hacer nuestra propia validación
    const form = e.target;
    const formData = new FormData(form);
    
    // Detectar si estamos editando
    const editingTradeIdElement = document.getElementById('editingTradeId');
    const isEditing = !!editingTradeIdElement;
    const editingTradeId = isEditing ? editingTradeIdElement.value : null;
    
    console.log(isEditing ? `✏️ Editando intercambio: ${editingTradeId}` : '🆕 Creando nuevo intercambio');
    
    // Recoger datos básicos
    const generatedTitleElement = document.getElementById('generatedTitle');
    const generatedTitle = generatedTitleElement ? generatedTitleElement.textContent : '';
    
    const tradeData = {
        title: generatedTitle,
        description: document.getElementById('tradeDescription').value || '',
        offeredCards: [],
        wantedCards: [],
        user: await getUserDisplayName(),
        userId: currentUser.uid, // ID del usuario propietario
        status: 'active',
        type: 'created',
        createdAt: new Date()
    };
    
    // Si estamos editando, mantener datos existentes
    if (isEditing) {
        tradeData.id = editingTradeId;
        const existingTrade = findTradeById(editingTradeId);
        if (existingTrade) {
            tradeData.createdAt = existingTrade.createdAt; // Mantener fecha original
            tradeData.updatedAt = new Date(); // Añadir fecha de actualización
        }
    } else {
        tradeData.createdAt = new Date();
    }

    // Recoger cartas ofrecidas
    const offeredContainer = document.getElementById('offeredCardsContainer');
    Array.from(offeredContainer.children).forEach((cardEl, index) => {
        const nameInput = cardEl.querySelector(`input[name*="offered_name_"]`);
        const idInput = cardEl.querySelector(`input[name*="offered_id_"]`);
        const imageInput = cardEl.querySelector(`input[name*="offered_image_"]`);
        const setInput = cardEl.querySelector(`input[name*="offered_set_"]`);
        const numberInput = cardEl.querySelector(`input[name*="offered_number_"]`);
        const conditionSelect = cardEl.querySelector(`select[name*="offered_condition_"]`);
        const languageSelect = cardEl.querySelector(`select[name*="offered_language_"]`);
        
        if (nameInput && nameInput.value.trim()) {
            tradeData.offeredCards.push({
                name: nameInput.value.trim(),
                id: idInput ? idInput.value : '',
                image: imageInput ? imageInput.value : '',
                set: setInput ? setInput.value : '',
                number: numberInput ? numberInput.value : '',
                condition: conditionSelect ? conditionSelect.value : 'NM',
                language: languageSelect ? languageSelect.value : 'Español'
            });
        }
    });

    // Recoger cartas buscadas
    const wantedContainer = document.getElementById('wantedCardsContainer');
    Array.from(wantedContainer.children).forEach((cardEl, index) => {
        const nameInput = cardEl.querySelector(`input[name*="wanted_name_"]`);
        const idInput = cardEl.querySelector(`input[name*="wanted_id_"]`);
        const imageInput = cardEl.querySelector(`input[name*="wanted_image_"]`);
        const setInput = cardEl.querySelector(`input[name*="wanted_set_"]`);
        const numberInput = cardEl.querySelector(`input[name*="wanted_number_"]`);
        const conditionSelect = cardEl.querySelector(`select[name*="wanted_condition_"]`);
        const languageSelect = cardEl.querySelector(`select[name*="wanted_language_"]`);
        
        if (nameInput && nameInput.value.trim()) {
            tradeData.wantedCards.push({
                name: nameInput.value.trim(),
                id: idInput ? idInput.value : '',
                image: imageInput ? imageInput.value : '',
                set: setInput ? setInput.value : '',
                number: numberInput ? numberInput.value : '',
                condition: conditionSelect ? conditionSelect.value : 'NM',
                language: languageSelect ? languageSelect.value : 'Español'
            });
        }
    });

    // Validaciones mejoradas - solo cuentan cartas con nombre
    console.log('📋 Validando intercambio:', {
        totalOfferedCards: offeredContainer.children.length,
        validOfferedCards: tradeData.offeredCards.length,
        totalWantedCards: wantedContainer.children.length,
        validWantedCards: tradeData.wantedCards.length,
        title: tradeData.title
    });

    if (tradeData.offeredCards.length === 0) {
        showNotification('Debes completar al menos una carta que ofreces', 'warning', 5000);
        return;
    }

    if (tradeData.wantedCards.length === 0) {
        showNotification('Debes completar al menos una carta que buscas', 'warning', 5000);
        return;
    }

    if (!tradeData.title.trim() || tradeData.title.includes('[') || tradeData.title.includes('automáticamente')) {
        showNotification('El título no se ha generado correctamente. Completa las cartas primero.', 'warning', 5000);
        return;
    }

    try {
        const userTradesKey = `userTrades_${currentUser.uid}`;
        let savedTrades = JSON.parse(localStorage.getItem(userTradesKey) || '[]');
        
        if (isEditing) {
            // Modo edición: actualizar intercambio existente
            console.log('✏️ Actualizando intercambio existente:', tradeData);
            
            const tradeIndex = savedTrades.findIndex(t => t.id === editingTradeId);
            if (tradeIndex !== -1) {
                savedTrades[tradeIndex] = tradeData;
                localStorage.setItem(userTradesKey, JSON.stringify(savedTrades));
                
                // Aquí se implementará la actualización en Firestore
                // await updateTradeInFirestore(tradeData);
                
                showSuccessMessage('¡Intercambio actualizado exitosamente! ✏️');
            } else {
                throw new Error('No se encontró el intercambio para actualizar');
            }
        } else {
            // Modo creación: crear nuevo intercambio
            tradeData.id = 'trade_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            console.log('💾 Creando nuevo intercambio:', tradeData);
            
            savedTrades.unshift(tradeData); // Añadir al principio
            localStorage.setItem(userTradesKey, JSON.stringify(savedTrades));
            
            // Aquí se implementará el guardado en Firestore
            // await saveTradeToFirestore(tradeData);
            
            showSuccessMessage('¡Intercambio creado exitosamente! 🎉');
        }
        document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50').remove(); // Cerrar modal
        
        // Recargar intercambios
        if (typeof loadUserTrades === 'function') {
            loadUserTrades();
        }
        
    } catch (error) {
        console.error('❌ Error al crear intercambio:', error);
        showNotification('Error al crear el intercambio. Inténtalo de nuevo.', 'error', 5000);
    }
}

// Función para mostrar mensaje de éxito
function showSuccessMessage(message) {
    const successModal = document.createElement('div');
    successModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    successModal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 text-center shadow-xl">
            <div class="text-6xl mb-4">🎉</div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">${message}</h3>
            <p class="text-gray-600 dark:text-gray-300 mb-6">Tu intercambio estará visible para otros coleccionistas.</p>
            <button onclick="this.parentElement.parentElement.remove()" 
                    class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold">
                ¡Perfecto!
            </button>
        </div>
    `;
    
    document.body.appendChild(successModal);
    
    // Auto-cerrar después de 3 segundos
    setTimeout(() => {
        if (successModal.parentElement) {
            successModal.remove();
        }
    }, 3000);
}

// Función para mostrar modal de confirmación personalizado
function showConfirmDeleteModal(tradeTitle, onConfirm) {
    return new Promise((resolve) => {
        const confirmModal = document.createElement('div');
        confirmModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        confirmModal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 text-center shadow-xl">
                <div class="text-6xl mb-4">🗑️</div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">¿Estás seguro de que quieres eliminar este intercambio?</h3>
                <div class="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 mb-6">
                    <p class="text-gray-800 dark:text-gray-200 font-semibold">"${tradeTitle}"</p>
                </div>
                <p class="text-gray-600 dark:text-gray-300 mb-6">⚠️ Esta acción no se puede deshacer.</p>
                <div class="flex gap-3 justify-center">
                    <button id="cancelDelete" 
                            class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                        Cancelar
                    </button>
                    <button id="confirmDelete" 
                            class="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                        🗑️ Eliminar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(confirmModal);
        
        // Eventos
        const cancelBtn = confirmModal.querySelector('#cancelDelete');
        const confirmBtn = confirmModal.querySelector('#confirmDelete');
        
        cancelBtn.addEventListener('click', () => {
            confirmModal.remove();
            resolve(false);
        });
        
        confirmBtn.addEventListener('click', () => {
            confirmModal.remove();
            resolve(true);
        });
        
        // ESC para cancelar
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                confirmModal.remove();
                document.removeEventListener('keydown', handleEsc);
                resolve(false);
            }
        };
        document.addEventListener('keydown', handleEsc);
        
        // Click fuera del modal para cancelar
        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) {
                confirmModal.remove();
                resolve(false);
            }
        });
    });
}

// Función para generar selector de condición de carta
function createConditionSelector(selectedCondition = 'NM', onChangeCallback = null) {
    const select = document.createElement('select');
    select.className = 'condition-selector text-xs px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400';
    
    Object.values(CARD_CONDITIONS).forEach(condition => {
        const option = document.createElement('option');
        option.value = condition.code;
        option.textContent = `${condition.icon} ${condition.name}`;
        option.style.backgroundColor = condition.color;
        option.style.color = 'white';
        
        if (condition.code === selectedCondition) {
            option.selected = true;
        }
        
        select.appendChild(option);
    });

    if (onChangeCallback) {
        select.addEventListener('change', (e) => {
            onChangeCallback(e.target.value);
        });
    }

    return select;
}

// Función para mostrar información de condición al hacer hover
function showConditionInfo(conditionCode) {
    const condition = CARD_CONDITIONS[conditionCode];
    if (!condition) return;

    const tooltip = document.createElement('div');
    tooltip.className = 'condition-tooltip absolute z-50 bg-gray-900 text-white text-xs rounded-lg p-2 max-w-xs shadow-lg';
    tooltip.innerHTML = `
        <div class="font-semibold mb-1">${condition.icon} ${condition.name}</div>
        <div class="text-gray-300">${condition.description}</div>
    `;

    return tooltip;
}

// Función para obtener el color de una condición
function getConditionColor(conditionCode) {
    return CARD_CONDITIONS[conditionCode]?.color || '#6B7280';
}

// Función para obtener el icono de una condición
function getConditionIcon(conditionCode) {
    return CARD_CONDITIONS[conditionCode]?.icon || '❓';
}

// Función para inicializar FAQ
function initializeFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const icon = question.querySelector('span:last-child');
            
            // Toggle respuesta
            if (answer.classList.contains('hidden')) {
                answer.classList.remove('hidden');
                answer.classList.add('show');
                icon.textContent = '−';
            } else {
                answer.classList.add('hidden');
                answer.classList.remove('show');
                icon.textContent = '+';
            }
        });
    });
}

// Función para actualizar estadísticas en la UI
function updateProfileStats(totalCards, uniqueCards, uniqueSets, completedTrades, cards = []) {
    const totalCardsElement = document.getElementById('totalCardsCount');
    const uniqueCardsElement = document.getElementById('uniqueCardsCount');
    const uniqueSetsElement = document.getElementById('uniqueSetsCount');
    const completedTradesElement = document.getElementById('completedTradesCount');
    const totalValueElement = document.getElementById('totalCollectionValue');

    if (totalCardsElement) totalCardsElement.textContent = totalCards;
    if (uniqueCardsElement) uniqueCardsElement.textContent = uniqueCards;
    if (uniqueSetsElement) uniqueSetsElement.textContent = uniqueSets;
    if (completedTradesElement) completedTradesElement.textContent = completedTrades;

    // Calcular valor total de la colección
    if (totalValueElement && cards.length > 0) {
        const totalValue = calculateCollectionValue(cards);
        totalValueElement.textContent = formatCurrency(totalValue);
    } else if (totalValueElement) {
        totalValueElement.textContent = '€0.00';
    }
}

// Función para calcular el valor total de la colección
function calculateCollectionValue(cards) {
    let totalValue = 0;
    
    cards.forEach(card => {
        // Obtener el precio base de la carta según su rareza
        const basePrice = getCardBasePrice(card.rarity || 'Common');
        
        // Aplicar multiplicadores según la condición
        const conditionMultiplier = getConditionMultiplier(card.condition || 'NM');
        
        // Aplicar multiplicador según el idioma (cartas en inglés suelen valer más)
        const languageMultiplier = getLanguageMultiplier(card.language || 'Español');
        
        // Calcular precio final de la carta
        const cardValue = basePrice * conditionMultiplier * languageMultiplier;
        
        totalValue += cardValue;
    });
    
    return totalValue;
}

// Función para obtener el precio base según la rareza
function getCardBasePrice(rarity) {
    const basePrices = {
        'Common': 0.10,
        'Uncommon': 0.25,
        'Rare': 1.00,
        'Rare Holo': 3.00,
        'Rare Ultra': 5.00,
        'Rare Secret': 10.00,
        'Rare Rainbow': 15.00,
        'Rare Gold': 20.00,
        'Rare Shiny': 8.00,
        'Rare Shiny GX': 25.00,
        'Rare Shiny V': 30.00,
        'Rare Shiny VMAX': 50.00,
        'Rare Shiny GX Rainbow': 100.00,
        'Rare Shiny V Rainbow': 120.00,
        'Rare Shiny VMAX Rainbow': 200.00,
        'Rare Shiny Gold': 150.00,
        'Rare Shiny Gold GX': 300.00,
        'Rare Shiny Gold V': 400.00,
        'Rare Shiny Gold VMAX': 600.00,
        'Rare Shiny Gold Rainbow': 800.00,
        'Rare Shiny Gold Rainbow GX': 1000.00,
        'Rare Shiny Gold Rainbow V': 1200.00,
        'Rare Shiny Gold Rainbow VMAX': 1500.00,
        'Rare Shiny Gold Rainbow GX Rainbow': 2000.00,
        'Rare Shiny Gold Rainbow V Rainbow': 2500.00,
        'Rare Shiny Gold Rainbow VMAX Rainbow': 3000.00,
        'Rare Shiny Gold Rainbow GX Rainbow Gold': 5000.00,
        'Rare Shiny Gold Rainbow V Rainbow Gold': 7500.00,
        'Rare Shiny Gold Rainbow VMAX Rainbow Gold': 10000.00
    };
    
    return basePrices[rarity] || 0.50; // Precio por defecto
}

// Función para obtener el multiplicador según la condición
function getConditionMultiplier(condition) {
    const conditionMultipliers = {
        'M': 1.5,    // Mint - 50% más
        'NM': 1.0,   // Near Mint - precio base
        'EX': 0.8,   // Excellent - 20% menos
        'GD': 0.6,   // Good - 40% menos
        'LP': 0.4,   // Light Played - 60% menos
        'PL': 0.2,   // Played - 80% menos
        'PO': 0.1    // Poor - 90% menos
    };
    
    return conditionMultipliers[condition] || 1.0;
}

// Función para obtener el multiplicador según el idioma
function getLanguageMultiplier(language) {
    const languageMultipliers = {
        'English': 1.2,    // Inglés - 20% más
        'Español': 1.0,    // Español - precio base
        'Français': 0.9,   // Francés - 10% menos
        'Deutsch': 0.9,    // Alemán - 10% menos
        'Italiano': 0.9,   // Italiano - 10% menos
        'Português': 0.9,  // Portugués - 10% menos
        '日本語': 1.1,      // Japonés - 10% más
        '한국어': 1.0,      // Coreano - precio base
        '中文': 1.0,        // Chino - precio base
        'Русский': 0.8     // Ruso - 20% menos
    };
    
    return languageMultipliers[language] || 1.0;
}

// Función para formatear moneda
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Función para cargar desglose por sets
async function loadSetsBreakdown(cards) {
    const setsBreakdownElement = document.getElementById('setsBreakdown');
    if (!setsBreakdownElement) return;

    try {
        // Agrupar cartas por set
        const setsMap = new Map();
        cards.forEach(card => {
            const setName = (typeof card.set === 'string' ? card.set : card.set?.name) || 'Sin Set';
            if (!setsMap.has(setName)) {
                setsMap.set(setName, []);
            }
            setsMap.get(setName).push(card);
        });

        // Crear HTML para el desglose
        if (setsMap.size === 0) {
            setsBreakdownElement.innerHTML = `
                <div class="text-center text-gray-500 dark:text-gray-400 py-8">
                    <p>No hay cartas en tu colección</p>
                </div>
            `;
            return;
        }

        let setsHTML = '';
        setsMap.forEach((cardsInSet, setName) => {
            setsHTML += `
                <div class="set-item bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div class="flex justify-between items-center">
                        <div>
                            <h4 class="font-semibold text-gray-800 dark:text-gray-100">${setName}</h4>
                            <p class="text-sm text-gray-600 dark:text-gray-300">${cardsInSet.length} cartas</p>
                        </div>
                        <div class="text-right">
                            <div class="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                <div class="h-full bg-orange-500 rounded-full" style="width: ${Math.min(100, (cardsInSet.length / 10) * 100)}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        setsBreakdownElement.innerHTML = setsHTML;

    } catch (error) {
        console.error('❌ Error al cargar desglose por sets:', error);
        setsBreakdownElement.innerHTML = `
            <div class="text-center text-gray-500 dark:text-gray-400 py-8">
                <p>Error al cargar el desglose por sets</p>
            </div>
        `;
    }
}

// --- Funciones del Modal de Autenticación ---
function showAuthModal(mode) {
    console.log('🔧 showAuthModal called with mode:', mode);
    if (!authModal) {
        console.error('❌ authModal not found!');
        return;
    }

    console.log('🔧 Adding show class to authModal');
    authModal.classList.add('show');

    const forgotPasswordForm = document.getElementById('forgotPasswordForm');

    if (mode === 'login') {
        if (loginForm) loginForm.classList.remove('hidden');
        if (registerForm) registerForm.classList.add('hidden');
        if (forgotPasswordForm) forgotPasswordForm.classList.add('hidden');
    } else if (mode === 'register') {
        if (loginForm) loginForm.classList.add('hidden');
        if (registerForm) registerForm.classList.remove('hidden');
        if (forgotPasswordForm) forgotPasswordForm.classList.add('hidden');
    } else if (mode === 'forgot') {
        if (loginForm) loginForm.classList.add('hidden');
        if (registerForm) registerForm.classList.add('hidden');
        if (forgotPasswordForm) forgotPasswordForm.classList.remove('hidden');
    }
}

// Hacer funciones disponibles globalmente
window.showAuthModal = showAuthModal;

function hideAuthModal() {
    if (authModal) authModal.classList.remove('show');
}

// --- Función de Búsqueda de Cartas (MEJORADA CON TCGDEX) ---
async function fetchCards(query, searchMode = 'pokemontcg') {
    console.log('🔍 fetchCards called with query:', query, 'mode:', searchMode);
    
    if (!cardsContainer) {
        console.error('❌ cardsContainer not found!');
        return;
    }

    // Limpiar resultados anteriores
    cardsContainer.innerHTML = '';
    if (noResultsMessage) noResultsMessage.classList.add('hidden');
    if (errorMessage) errorMessage.classList.add('hidden');

    // Si la query es muy corta, mostrar página inicial
    if (query.length < 3) {
        showInitialSections();
        return;
    }

    showLoadingSpinner();
    showSearchResults();

    try {
        let data;
        let cards = [];
        
        // Dependiendo del modo de búsqueda, usar diferentes APIs
        if (searchMode === 'combined') {
            // Búsqueda combinada usando TCGdex integration
            console.log('🔍 Using combined search mode');
            data = await window.tcgdexIntegration.searchCardsCombined(query);
            cards = data.data || [];
        } else if (searchMode === 'tcgdex') {
            // Solo TCGdex
            console.log('🔍 Using TCGdex only search mode');
            data = await window.tcgdexIntegration.searchTCGdexCards(query);
            cards = data.data || [];
        } else {
            // Modo por defecto: Pokemon TCG API
            console.log('🔍 Using Pokemon TCG API search mode');
            
            // Construir URL optimizada con paginación
            const base = query.length <= 4 ? `name:${query.toLowerCase()}*` : `name:*${query.toLowerCase()}*`;
            lastSearchBase = base;
            searchPage = 1;
            searchPageSize = 20;
            const apiUrl = buildCardsApiUrl(base, searchPage, searchPageSize);

            console.log('🌐 Fetching from URL:', apiUrl);

            // Hacer petición con timeout mejorado
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                console.log('⏰ Timeout alcanzado, abortando petición...');
                controller.abort();
            }, 60000); // Aumentado a 60s para dar más tiempo al API

            let response;
            try {
                response = await fetch(apiUrl, {
                    signal: controller.signal,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                clearTimeout(timeoutId);
            } catch (fetchError) {
                clearTimeout(timeoutId);
                if (fetchError.name === 'AbortError') {
                    console.log('🔄 Petición cancelada por timeout');
                    throw new Error('TIMEOUT');
                }
                throw fetchError;
            }

            console.log('📡 Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error Response:', errorText);
                throw new Error(`API Error ${response.status}: ${errorText}`);
            }

            data = await response.json();
            cards = data.data || [];
        }

        console.log('✅ API Response received:', {
            totalCount: data.totalCount,
            cardsReturned: cards.length
        });

        // Render paginación
        const totalCount = data.totalCount || 0;
        renderPagination(totalCount, searchPage, searchPageSize);

        if (cards.length > 0) {
            cards.forEach((card, index) => {
                console.log(`📋 Processing card ${index + 1}:`, card.name);
                
                const row = document.createElement('div');
                row.className = 'relative flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 h-16 overflow-visible';

                const safeCardId = (card.id || '').replace(/'/g, "\\'");
                const safeCardName = (card.name || '').replace(/'/g, "\\'");
                const safeSetName = (card.set?.name || 'N/A').replace(/'/g, "\\'");
                const safeSeries = (card.set?.series || 'N/A').replace(/'/g, "\\'");
                const safeNumber = (card.number || 'N/A').replace(/'/g, "\\'");
                const safeImageUrl = (card.images?.small || '').replace(/'/g, "\\'");

                const imgWrapper = document.createElement('div');
                imgWrapper.className = 'w-10 h-10 flex items-center justify-center bg-transparent rounded cursor-pointer absolute left-3 top-1/2 -translate-y-1/2 z-10';
                imgWrapper.title = 'Pasa el mouse para ver imagen';
                imgWrapper.innerHTML = '<span class="text-xl">🎴</span>';

                // Crear contenedor de imagen con hover
                const imgContainer = document.createElement('div');
                imgContainer.className = 'hidden absolute left-14 top-1/2 -translate-y-1/2 z-30';
                imgContainer.style.pointerEvents = 'none';
                
                const imgEl = document.createElement('img');
                imgEl.src = (card.images?.large || card.images?.small) || 'https://placehold.co/400x550/a0aec0/ffffff?text=Sin+imagen';
                imgEl.alt = card.name || 'Carta';
                imgEl.className = 'w-64 h-auto object-contain rounded-lg shadow-2xl border-2 border-gray-200';
                imgEl.onerror = () => { imgEl.src = 'https://placehold.co/400x550/a0aec0/ffffff?text=Error'; };
                
                imgContainer.appendChild(imgEl);
                row.appendChild(imgContainer);
                
                // Eventos de hover
                imgWrapper.addEventListener('mouseenter', () => { 
                    imgContainer.classList.remove('hidden');
                });
                
                imgWrapper.addEventListener('mouseleave', () => { 
                    imgContainer.classList.add('hidden');
                });

                const info = document.createElement('div');
                info.className = 'flex-1 min-w-0 pl-16';
                info.innerHTML = `
                    <div class="flex items-center justify-between">
                        <div class="truncate">
                            <div class="font-semibold text-gray-900 dark:text-white truncate">${card.name || 'Nombre no disponible'}</div>
                            <div class="text-xs text-gray-600 dark:text-gray-300 truncate">Set: ${card.set?.name || 'N/A'} · Serie: ${card.set?.series || 'N/A'} · Nº: ${card.number || 'N/A'}</div>
                        </div>
                        <div class="flex gap-2 items-center">
                            <button class="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                                    onclick="showCardOffers('${safeCardName}', '${safeImageUrl}')">
                                <span>🤝</span>
                                <span>Ofrecidas: ${getCardOffersCount(card.name)}</span>
                            </button>
                            <button class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                                onclick="showCardDetailsOnly('${safeCardId}', '${safeCardName}', '${safeImageUrl}', '${safeSetName}', '${safeSeries}', '${safeNumber}')">Ver Detalles</button>
                            <button class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                                onclick="addCardDirectly('${safeCardId}', '${safeCardName}', '${safeImageUrl}', '${safeSetName}', '${safeSeries}', '${safeNumber}')">+ Añadir</button>
                        </div>
                    </div>
                `;

                row.appendChild(imgWrapper);
                row.appendChild(info);
                cardsContainer.appendChild(row);
            });
            
            console.log('✅ All cards rendered successfully');
        } else {
            console.log('ℹ️ No cards found for query:', query);
            if (noResultsMessage) {
                noResultsMessage.textContent = `No se encontraron cartas para "${query}". Intenta con otro nombre.`;
                noResultsMessage.classList.remove('hidden');
            }
        }

    } catch (error) {
        console.error('❌ Error completo en fetchCards:', error);

        // Si es timeout, intentar con búsqueda más simple y menos resultados
        if ((error.name === 'AbortError' || error.message.includes('408') || error.message === 'TIMEOUT') && !query.includes('_retry')) {
            console.log('🔄 Timeout detectado, reintentando con búsqueda optimizada...');
            
            try {
                // Usar búsqueda más simple para el retry
                const retryUrl = buildCardsApiUrl(`name:${query.toLowerCase()}`, 1, 20);
                console.log('🔄 Retry URL (búsqueda exacta):', retryUrl);
                
                const retryController = new AbortController();
                const retryTimeoutId = setTimeout(() => {
                    console.log('⏰ Retry timeout alcanzado');
                    retryController.abort();
                }, 30000); // 30 segundos para retry
                
                let retryResponse;
                try {
                    retryResponse = await fetch(retryUrl, {
                        signal: retryController.signal,
                        headers: { 'Content-Type': 'application/json' }
                    });
                    clearTimeout(retryTimeoutId);
                } catch (retryError) {
                    clearTimeout(retryTimeoutId);
                    throw retryError;
                }
                
                if (retryResponse.ok) {
                    const retryData = await retryResponse.json();
                    const retryCards = retryData.data || [];
                    
                    console.log('✅ Retry successful:', retryCards.length, 'cards');
                    
                    // Mostrar mensaje de retry con opción de cargar más
                    if (errorMessage) {
                        errorMessage.innerHTML = `
                            ⚠️ Búsqueda optimizada: ${retryCards.length} cartas encontradas. La API está lenta hoy.<br>
                            <button onclick="loadMoreResults('${query}')" class="btn-primary px-4 py-2 mt-2 rounded-lg text-sm">
                                🔄 Intentar Cargar Más Cartas
                            </button>
                        `;
                        errorMessage.classList.remove('hidden');
                    }
                    
                    // Renderizar cartas del retry
                    if (retryCards.length > 0) {
                        retryCards.forEach((card, index) => {
                            const cardElement = document.createElement('div');
                            cardElement.className = 'card-bg rounded-xl shadow-lg overflow-hidden transform transition-transform hover:scale-105';
                            
                            const safeCardId = (card.id || '').replace(/'/g, "\\'");
                            const safeCardName = (card.name || '').replace(/'/g, "\\'");
                            const safeSetName = (card.set?.name || 'N/A').replace(/'/g, "\\'");
                            const safeSeries = (card.set?.series || 'N/A').replace(/'/g, "\\'");
                            const safeNumber = (card.number || 'N/A').replace(/'/g, "\\'");
                            const safeImageUrl = (card.images?.small || '').replace(/'/g, "\\'");
                            
                            cardElement.innerHTML = `
                                <img src="${card.images?.small || 'https://placehold.co/400x550/a0aec0/ffffff?text=Sin+imagen'}"
                                     alt="${card.name || 'Carta sin nombre'}"
                                     class="w-full h-auto object-cover rounded-t-xl"
                                     onerror="this.src='https://placehold.co/400x550/a0aec0/ffffff?text=Error+imagen'">
                                <div class="p-4">
                                    <h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">${card.name || 'Nombre no disponible'}</h3>
                                    <p class="text-gray-600 text-sm mb-3">Set: ${card.set?.name || 'N/A'}</p>
                                    <p class="text-gray-600 text-sm mb-3">Serie: ${card.set?.series || 'N/A'}</p>
                                    <p class="text-gray-600 text-sm mb-3">Número: ${card.number || 'N/A'}</p>
                                    <button class="w-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 mb-3 hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                                            onclick="showCardOffers('${safeCardName}', '${safeImageUrl}')">
                                        <span>🤝</span>
                                        <span>Ofrecidas: ${getCardOffersCount(card.name)}</span>
                                    </button>
                                    <div class="flex justify-between items-center gap-2">
                                        <button class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold"
                                                onclick="showCardDetailsOnly('${safeCardId}', '${safeCardName}', '${safeImageUrl}', '${safeSetName}', '${safeSeries}', '${safeNumber}')">
                                            Ver Detalles
                                        </button>
                                        <button class="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-semibold"
                                                onclick="addCardDirectly('${safeCardId}', '${safeCardName}', '${safeImageUrl}', '${safeSetName}', '${safeSeries}', '${safeNumber}')">
                                            + Añadir
                                        </button>
                                    </div>
                                </div>
                            `;
                            cardsContainer.appendChild(cardElement);
                        });
                        
                        hideLoadingSpinner();
                        return; // Exit successfully
                    }
                }
            } catch (retryError) {
                console.error('❌ Retry también falló:', retryError);
            }
        }

        let errorMsg = '';
        let suggestions = '';
        
        if (error.name === 'AbortError' || error.message === 'TIMEOUT') {
            errorMsg = '⏰ La búsqueda está tardando demasiado tiempo.';
            suggestions = `
                <div class="mt-2 text-sm">
                    <strong>Sugerencias:</strong>
                    <ul class="list-disc list-inside mt-1 text-gray-600 dark:text-gray-400">
                        <li>Intenta con un nombre más corto o específico</li>
                        <li>Busca solo una palabra (ej: "Pikachu" en vez de "Pikachu VMAX")</li>
                        <li>Espera unos segundos antes de reintentar</li>
                    </ul>
                </div>
            `;
        } else if (error.message.includes('Failed to fetch')) {
            errorMsg = '🌐 Problema de conexión con el servidor.';
            suggestions = '<small class="text-gray-600 dark:text-gray-400">Verifica tu conexión a internet.</small>';
        } else if (error.message.includes('504')) {
            errorMsg = '⚠️ El servidor de Pokémon TCG no responde.';
            suggestions = '<small class="text-gray-600 dark:text-gray-400">El servicio puede estar sobrecargado. Intenta más tarde.</small>';
        } else {
            errorMsg = '❌ Error al buscar cartas.';
            suggestions = '<small class="text-gray-600 dark:text-gray-400">Intenta de nuevo en unos momentos.</small>';
        }

        if (errorMessage) {
            errorMessage.innerHTML = `
                <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div class="text-yellow-800 dark:text-yellow-200 font-semibold">${errorMsg}</div>
                    ${suggestions}
                    <button onclick="fetchCards('${query}')" 
                            class="mt-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                        🔄 Reintentar Búsqueda
                    </button>
                </div>
            `;
            errorMessage.classList.remove('hidden');
        }
    } finally {
        hideLoadingSpinner();
    }
}

// Función corregida para obtener cartas de un set (INCLUYE TCGDEX)
async function fetchAllCardsInSet(setId) {
    console.log(`Obteniendo todas las cartas del set: ${setId}`);

    try {
        // Verificar si el set es de TCGdex (asiático)
        const setInfo = allSets.find(s => s.id === setId);
        const isTCGdexSet = setInfo && setInfo.source === 'tcgdex';

        if (isTCGdexSet) {
            // Obtener cartas de TCGdex
            const response = await fetch(`/api/tcgdex/cards?set=${setId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log(`Obtenidas ${data.data?.length || 0} cartas TCGdex del set ${setId}`);
            return data.data || [];
        } else {
            // Obtener cartas de Pokemon TCG API
            const response = await fetch(`/api/pokemontcg/cards?q=set.id:${setId}&pageSize=500`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log(`Obtenidas ${data.data?.length || 0} cartas Pokemon TCG del set ${setId}`);
            return data.data || [];
        }

    } catch (error) {
        console.error('Error al obtener cartas del set:', error);
        if (myCardsErrorMessage) {
            myCardsErrorMessage.textContent = 'Error al cargar las cartas de esta expansión.';
            myCardsErrorMessage.classList.remove('hidden');
        }
        return [];
    }
}
// Función para cargar la colección del usuario
async function loadMyCollection(userId) {
    if (!myCardsContainer) return;

    myCardsContainer.innerHTML = '';
    if (noMyCardsMessage) noMyCardsMessage.classList.add('hidden');
    if (myCardsErrorMessage) myCardsErrorMessage.classList.add('hidden');
    showLoadingSpinner();

    try {
        const myCardsCollectionRef = db.collection( `users/${userId}/my_cards`);
        const querySnapshot = await myCardsCollectionRef.get();
        userCardsCache = [];

        querySnapshot.forEach(doc => {
            userCardsCache.push(doc.data());
        });

        // Aplicar filtros
        const selectedSeries = seriesFilter?.value || '';
        const selectedSetId = setFilter?.value || '';
        const selectedLanguage = languageFilter?.value || '';
        const showAll = showAllSetCardsToggle?.checked || false;

        let cardsToDisplay = [];

        if (showAll && selectedSetId) {
            // Mostrar todas las cartas del set (incluyendo faltantes)
            const allCardsInSet = await fetchAllCardsInSet(selectedSetId);
            const ownedCardIds = new Set(userCardsCache.map(card => card.id));

            allCardsInSet.forEach(apiCard => {
                const matchesSeries = selectedSeries === "" || (apiCard.set && apiCard.set.series === selectedSeries);
                const matchesLanguage = selectedLanguage === "" || (ownedCardIds.has(apiCard.id) && userCardsCache.find(c => c.id === apiCard.id).language === selectedLanguage);

                if (matchesSeries && matchesLanguage) {
                    if (ownedCardIds.has(apiCard.id)) {
                        const ownedCard = userCardsCache.find(c => c.id === apiCard.id);
                        cardsToDisplay.push({ ...ownedCard, isOwned: true });
                    } else {
                        cardsToDisplay.push({
                            id: apiCard.id,
                            name: apiCard.name,
                            number: apiCard.number,
                            imageUrl: 'https://placehold.co/400x550/e2e8f0/4a5568?text=Falta',
                            set: apiCard.set ? apiCard.set.name : 'N/A',
                            series: apiCard.set && apiCard.set.series ? apiCard.set.series : 'N/A',
                            language: 'N/A',
                            isOwned: false
                        });
                    }
                }
            });

            // Ordenar por número de carta
            cardsToDisplay.sort((a, b) => {
                const numA = parseInt(a.number, 10) || Infinity;
                const numB = parseInt(b.number, 10) || Infinity;
                return numA - numB;
            });

        } else {
            // Modo normal: solo cartas poseídas
            let filteredCards = userCardsCache.filter(card => {
                const matchesSeries = selectedSeries === "" || card.series === selectedSeries;
                const matchesSet = selectedSetId === "" || card.setId === selectedSetId;
                const matchesLanguage = selectedLanguage === "" || card.language === selectedLanguage;
                return matchesSeries && matchesSet && matchesLanguage;
            });

            filteredCards.sort((a, b) => {
                if (a.set !== b.set) return a.set.localeCompare(b.set);
                const numA = parseInt(a.number, 10) || Infinity;
                const numB = parseInt(b.number, 10) || Infinity;
                return numA - numB;
            });

            cardsToDisplay = filteredCards;
        }

        renderCardsInCollection(cardsToDisplay);

        if (cardsToDisplay.length === 0) {
            if (noMyCardsMessage) {
                noMyCardsMessage.textContent = 'No se encontraron cartas con los filtros aplicados.';
                noMyCardsMessage.classList.remove('hidden');
            }
        }

    } catch (error) {
        console.error('Error al cargar la colección:', error);
        if (myCardsErrorMessage) myCardsErrorMessage.classList.remove('hidden');
    } finally {
        hideLoadingSpinner();
    }
}

// Función para renderizar cartas en la colección (nuevo diseño de lista)
function renderCardsInCollection(cards) {
    if (!myCardsContainer) return;

    myCardsContainer.innerHTML = '';

    if (cards.length === 0) {
        if (noMyCardsMessage) noMyCardsMessage.classList.remove('hidden');
        return;
    }

    // Cambiar el contenedor a diseño de lista
    myCardsContainer.className = 'space-y-1 border rounded-lg bg-white dark:bg-gray-800';

    cards.forEach((card, index) => {
        const isOwned = card.isOwned !== undefined ? card.isOwned : true;
        const imageUrl = card.imageUrl;
        
        const row = document.createElement('div');
        row.className = 'relative flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 h-16 overflow-visible';
        if (index < cards.length - 1) {
            row.className += ' border-b';
        }
        
        // Icono de imagen con hover
        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'w-10 h-10 flex items-center justify-center bg-transparent rounded cursor-pointer absolute left-3 top-1/2 -translate-y-1/2 z-10';
        imgWrapper.title = 'Pasa el mouse para ver imagen';
        imgWrapper.innerHTML = isOwned ? '<span class="text-xl">🎴</span>' : '<span class="text-xl opacity-50">🎴</span>';
        
        // Contenedor de imagen con hover
        const imgContainer = document.createElement('div');
        imgContainer.className = 'hidden absolute left-14 top-1/2 -translate-y-1/2 z-30';
        imgContainer.style.pointerEvents = 'none';
        
        const imgEl = document.createElement('img');
        imgEl.src = imageUrl || 'https://placehold.co/400x550/a0aec0/ffffff?text=Sin+imagen';
        imgEl.alt = card.name || 'Carta';
        imgEl.className = 'w-64 h-auto object-contain rounded-lg shadow-2xl border-2 border-gray-200';
        imgEl.onerror = () => { imgEl.src = 'https://placehold.co/400x550/a0aec0/ffffff?text=Error'; };
        
        imgContainer.appendChild(imgEl);
        row.appendChild(imgContainer);
        
        // Eventos de hover
        imgWrapper.addEventListener('mouseenter', () => { 
            imgContainer.classList.remove('hidden');
        });
        
        imgWrapper.addEventListener('mouseleave', () => { 
            imgContainer.classList.add('hidden');
        });
        
        // Información de la carta
        const info = document.createElement('div');
        info.className = 'flex-1 min-w-0 pl-16';
        
        if (isOwned) {
            info.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-2">
                            <span class="font-semibold text-gray-900 dark:text-white">${card.name}</span>
                            <span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">En colección</span>
                        </div>
                        <div class="text-xs text-gray-600">
                            #${card.number} · ${card.set} · ${card.series || 'N/A'} · ${card.language || 'N/A'}
                        </div>
                    </div>
                    <button class="btn-secondary px-3 py-1.5 rounded text-xs" onclick="removeCardFromCollection('${card.id}')">
                        Eliminar
                    </button>
                </div>
            `;
        } else {
            info.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-2">
                            <span class="font-semibold text-gray-500 line-through">${card.name}</span>
                            <span class="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Falta</span>
                        </div>
                        <div class="text-xs text-gray-400">
                            #${card.number} · ${card.set} · ${card.series || 'N/A'}
                        </div>
                    </div>
                    <span class="text-sm text-gray-500 dark:text-gray-400">Falta en tu colección</span>
                </div>
            `;
        }
        
        row.appendChild(imgWrapper);
        row.appendChild(info);
        myCardsContainer.appendChild(row);
    });
}

// Función para eliminar carta de la colección
window.removeCardFromCollection = async (cardId) => {
    if (!currentUser) {
        alert('Por favor, inicia sesión.');
        return;
    }

    try {
        await db.collection('users').doc(currentUser.uid).collection('my_cards').doc(cardId).delete();
        showNotification('Carta eliminada de tu colección', 'success', 3000);
        await loadMyCollection(currentUser.uid);
    } catch (error) {
        console.error('Error al eliminar carta:', error);
        showNotification('Error al eliminar la carta. Inténtalo de nuevo.', 'error', 5000);
    }
};

// Función para obtener sets de la API (MEJORADA CON TCGDEX)
async function fetchSetsAndPopulateFilter() {
    if (allSets.length > 0) return;

    console.log('🔄 Cargando sets desde las APIs...');

    try {
        // Cargar sets de ambas APIs en paralelo
        const [pokemonTCGResponse, tcgdexResponse] = await Promise.allSettled([
            // Pokemon TCG API
            fetch('/api/pokemontcg/sets?pageSize=50', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }),
            // TCGdex API
            fetch('/api/tcgdex/sets', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        ]);

        let pokemonTCGSets = [];
        let tcgdexSets = [];

        // Procesar respuesta de Pokemon TCG
        if (pokemonTCGResponse.status === 'fulfilled' && pokemonTCGResponse.value.ok) {
            const data = await pokemonTCGResponse.value.json();
            pokemonTCGSets = data.data || [];
            console.log('✅ Sets Pokemon TCG cargados:', pokemonTCGSets.length);
        }

        // Procesar respuesta de TCGdex
        if (tcgdexResponse.status === 'fulfilled' && tcgdexResponse.value.ok) {
            const data = await tcgdexResponse.value.json();
            tcgdexSets = data.data || [];
            console.log('✅ Sets TCGdex cargados:', tcgdexSets.length);
        }

        // Combinar sets de ambas fuentes
        const combinedSets = [...pokemonTCGSets];
        
        // Añadir sets de TCGdex que no estén duplicados
        tcgdexSets.forEach(tcgSet => {
            const exists = combinedSets.some(set => 
                set.id === tcgSet.id || 
                (set.name === tcgSet.name && set.releaseDate === tcgSet.releaseDate)
            );
            if (!exists) {
                // Marcar sets exclusivos de TCGdex (japoneses, coreanos, chinos)
                combinedSets.push({
                    ...tcgSet,
                    source: 'tcgdex',
                    isAsian: true // Marcador para sets asiáticos
                });
            }
        });

        allSets = combinedSets;
        console.log('✅ Total sets combinados:', allSets.length);
        
        console.log('✅ Sets cargados:', allSets.length);

        allSets.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));

        // Poblar filtro de Series
        const uniqueSeries = [...new Set(allSets.map(set => set.series))].filter(Boolean).sort();
        if (seriesFilter) {
            seriesFilter.innerHTML = '<option value="">Todas las Series</option>';
            uniqueSeries.forEach(series => {
                const option = document.createElement('option');
                option.value = series;
                option.textContent = series;
                seriesFilter.appendChild(option);
            });
        }

        // Poblar filtro de Sets
        populateSetFilter(allSets);
        if (setFilter) setFilter.disabled = false;

        console.log(`Cargados ${allSets.length} sets y ${uniqueSeries.length} series`);

    } catch (error) {
        console.error('Error al cargar sets:', error);
        console.log('🔄 Intentando cargar sets básicos como fallback...');
        
        // Fallback: usar sets básicos si la API falla
        try {
            const fallbackResponse = await fetch('/api/pokemontcg/sets?pageSize=10');
            if (fallbackResponse.ok) {
                const fallbackData = await fallbackResponse.json();
                allSets = fallbackData.data || [];
                console.log('✅ Sets básicos cargados como fallback:', allSets.length);
                
                if (allSets.length > 0) {
                    // Poblar filtros con datos básicos
                    const uniqueSeries = [...new Set(allSets.map(set => set.series))].filter(Boolean).sort();
                    if (seriesFilter) {
                        seriesFilter.innerHTML = '<option value="">Todas las Series</option>';
                        uniqueSeries.forEach(series => {
                            const option = document.createElement('option');
                            option.value = series;
                            option.textContent = series;
                            seriesFilter.appendChild(option);
                        });
                    }
                    populateSetFilter(allSets);
                    if (setFilter) setFilter.disabled = false;
                    return; // Exit successfully
                }
            }
        } catch (fallbackError) {
            console.error('Fallback también falló:', fallbackError);
        }
        
        // Si todo falla, deshabilitar filtros
        if (setFilter) setFilter.disabled = true;
        if (seriesFilter) seriesFilter.disabled = true;
        if (myCardsErrorMessage) {
            myCardsErrorMessage.textContent = 'No se pudieron cargar los filtros. La API está lenta. Intenta más tarde o configura tu API Key.';
            myCardsErrorMessage.classList.remove('hidden');
        }
    }
}

// Función para poblar el filtro de sets
function populateSetFilter(setsToDisplay) {
    if (!setFilter) return;

    setFilter.innerHTML = '<option value="">Todas las Expansiones</option>';
    setsToDisplay.forEach(set => {
        const option = document.createElement('option');
        option.value = set.id;
        option.textContent = set.name;
        setFilter.appendChild(option);
    });
}

// --- Funciones de Autenticación ---
window.logoutUser = async () => {
    try {
        console.log('🚪 Cerrando sesión...');
        
        // Cerrar sesión en Firebase
        await auth.signOut();
        
        // Limpiar datos del usuario actual
        currentUser = null;
        
        // Limpiar cualquier dato en caché
        userCardsCache = [];
        
        // Limpiar formularios si existen
        const forms = document.querySelectorAll('form');
        forms.forEach(form => form.reset());
        
        // Limpiar contenido sensible de los contenedores
        const myCardsContainer = document.getElementById('myCardsContainer');
        if (myCardsContainer) myCardsContainer.innerHTML = '';
        
        const myTradesContainer = document.getElementById('myTradesContainer');
        if (myTradesContainer) myTradesContainer.innerHTML = '';
        
        const availableTradesContainer = document.getElementById('availableTradesContainer');
        if (availableTradesContainer) availableTradesContainer.innerHTML = '';
        
        // Ocultar todas las secciones privadas
        const profileSection = document.getElementById('profileSection');
        const myCardsSection = document.getElementById('myCardsSection');
        const interchangesSection = document.getElementById('interchangesSection');
        const helpSection = document.getElementById('helpSection');
        const searchResultsSection = document.getElementById('searchResultsSection');
        
        if (profileSection) profileSection.classList.add('hidden');
        if (myCardsSection) myCardsSection.classList.add('hidden');
        if (interchangesSection) interchangesSection.classList.add('hidden');
        if (helpSection) helpSection.classList.add('hidden');
        if (searchResultsSection) searchResultsSection.classList.add('hidden');
        
        // Mostrar la pantalla inicial (hero y how it works)
        showInitialSections();
        
        // Limpiar la barra de búsqueda si existe
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';
        
        // Scroll al inicio de la página
        window.scrollTo(0, 0);
        
        console.log('✅ Sesión cerrada exitosamente');
        
        // Opcional: Mostrar mensaje de confirmación
        // alert('Has cerrado sesión exitosamente');
        
    } catch (error) {
        console.error('❌ Error al cerrar sesión:', error);
        showNotification('Error al cerrar sesión. Por favor, intenta de nuevo.', 'error', 5000);
    }
};

// --- Configuración de Event Listeners ---
function setupNavigationEvents() {
    console.log('🚀 Inicializando aplicación...');
    
    // Verificar que las funciones estén disponibles
    if (typeof showInitialSections === 'undefined') {
        console.error('❌ showInitialSections no está definida');
        return;
    }
    if (typeof showAuthModal === 'undefined') {
        console.error('❌ showAuthModal no está definida');
        return;
    }
    if (typeof showMyCardsSection === 'undefined') {
        console.error('❌ showMyCardsSection no está definida');
        return;
    }
    if (typeof showInterchangesSection === 'undefined') {
        console.error('❌ showInterchangesSection no está definida');
        return;
    }
    if (typeof showProfileSection === 'undefined') {
        console.error('❌ showProfileSection no está definida');
        return;
    }
    if (typeof logoutUser === 'undefined') {
        console.error('❌ logoutUser no está definida');
        return;
    }

    console.log('✅ Todas las funciones están disponibles');

    // Configurar event listeners simples y directos
    const homeLink = document.getElementById('homeLink');
    if (homeLink) {
        homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🏠 Home link clicked');
            showInitialSections();
        });
    }

    const startTradingBtn = document.getElementById('startTradingBtn');
    if (startTradingBtn) {
        startTradingBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🚀 Start trading clicked');
            showAuthModal('register');
        });
    }

    const loginLink = document.getElementById('loginLink');
    if (loginLink) {
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🚪 Login link clicked');
            showAuthModal('login');
        });
    }

    const registerLink = document.getElementById('registerLink');
    if (registerLink) {
        registerLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('📝 Register link clicked');
            showAuthModal('register');
        });
    }

    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('👋 Logout link clicked');
            logoutUser();
        });
    }

    const myCardsLink = document.getElementById('myCardsLink');
    if (myCardsLink) {
        myCardsLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('📦 My cards link clicked');
            showMyCardsSection();
        });
    }

    const interchangesLink = document.getElementById('interchangesLink');
    if (interchangesLink) {
        interchangesLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🤝 Interchanges link clicked');
            showInterchangesSection();
        });
    }

    const profileLink = document.getElementById('profileLink');
    if (profileLink) {
        profileLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('👤 Profile link clicked');
            if (currentUser) {
                showProfileSection();
            } else {
                showAuthModal('login');
            }
        });
    }

    const helpLink = document.getElementById('helpLink');
    if (helpLink) {
        helpLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('❓ Help link clicked');
            showHelpSection();
        });
    }

    // Nuevo link de Inicio (en el navbar)
    const navHomeLink = document.getElementById('navHomeLink');
    if (navHomeLink) {
        navHomeLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🏠 Inicio (navbar) link clicked');
            showInitialSections();
            // Limpiar búsqueda si existe
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.value = '';
            // Scroll al inicio
            window.scrollTo(0, 0);
        });
    }

    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', (e) => {
            console.log('🌙 Dark mode toggle clicked:', e.target.checked);
            saveDarkModePreference(e.target.checked);
        });
    }



    console.log('✅ Event listeners configurados correctamente');
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM cargado, configurando eventos...');
    
    // CARGAR MODO OSCURO DESDE LOCALSTORAGE AL INICIO
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
        const isDark = savedDarkMode === 'true';
        console.log('🌙 Cargando modo oscuro desde localStorage:', isDark);
        applyDarkMode(isDark);
        
        // Sincronizar el toggle si existe
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.checked = isDark;
        }
    }

    // Asignar referencias a elementos del DOM
    searchInput = document.getElementById('searchInput');
    searchResultsSection = document.getElementById('searchResults');
    heroSection = document.getElementById('heroSection');
    howItWorksSection = document.getElementById('howItWorks');
    cardsContainer = document.getElementById('cardsContainer');
    loadingSpinner = document.getElementById('loadingSpinner');
    noResultsMessage = document.getElementById('noResultsMessage');
    errorMessage = document.getElementById('errorMessage');
    
    authModal = document.getElementById('authModal');
    loginForm = document.getElementById('loginForm');
    registerForm = document.getElementById('registerForm');
    loginEmailInput = document.getElementById('loginEmail');
    loginPasswordInput = document.getElementById('loginPassword');
    loginBtn = document.getElementById('loginBtn');
    loginError = document.getElementById('loginError');
    registerEmailInput = document.getElementById('registerEmail');
    registerPasswordInput = document.getElementById('registerPassword');
    confirmPasswordInput = document.getElementById('confirmPassword');
    registerBtn = document.getElementById('registerBtn');
    registerError = document.getElementById('registerError');
    closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
    toggleToRegister = document.getElementById('toggleToRegister');
    toggleToLogin = document.getElementById('toggleToLogin');

    loginNavLink = document.getElementById('loginNavLink');
    registerNavLink = document.getElementById('registerNavLink');
    profileNavLink = document.getElementById('profileNavLink');
    logoutNavLink = document.getElementById('logoutNavLink');
    
    myCardsNavLink = document.getElementById('myCardsNavLink');
    myCardsLink = document.getElementById('myCardsLink');
    myCardsSection = document.getElementById('myCardsSection');
    myCardsContainer = document.getElementById('myCardsContainer');
    noMyCardsMessage = document.getElementById('noMyCardsMessage');
    myCardsErrorMessage = document.getElementById('myCardsErrorMessage');

    seriesFilter = document.getElementById('seriesFilter');
    setFilter = document.getElementById('setFilter');
    languageFilter = document.getElementById('languageFilter');
    applyFiltersBtn = document.getElementById('applyFiltersBtn');
    showAllSetCardsToggle = document.getElementById('showAllSetCardsToggle');

    interchangesSection = document.getElementById('interchangesSection');
    helpSection = document.getElementById('helpSection');
    
    // Inicializar elementos del perfil
    profileLink = document.getElementById('profileLink');
    profileSection = document.getElementById('profileSection');

    // Inicializar la aplicación después de un pequeño delay
    setTimeout(() => {
        setupNavigationEvents();
    }, 100);



    // Event listeners para tabs del perfil
    const profilePersonalTab = document.getElementById('profilePersonalTab');
    const profileDashboardTab = document.getElementById('profileDashboardTab');
    const profileCollectionTab = document.getElementById('profileCollectionTab');
    const profileTradesTab = document.getElementById('profileTradesTab');
    const profileSettingsTab = document.getElementById('profileSettingsTab');

    if (profilePersonalTab) {
        profilePersonalTab.addEventListener('click', () => switchProfileTab('personal'));
    }
    if (profileDashboardTab) {
        profileDashboardTab.addEventListener('click', () => switchProfileTab('dashboard'));
    }
    if (profileCollectionTab) {
        profileCollectionTab.addEventListener('click', () => switchProfileTab('collection'));
    }
    if (profileTradesTab) {
        profileTradesTab.addEventListener('click', () => switchProfileTab('trades'));
    }
    if (profileSettingsTab) {
        profileSettingsTab.addEventListener('click', () => switchProfileTab('settings'));
    }

    // Event listeners para tabs de ayuda
    const helpGettingStartedTab = document.getElementById('helpGettingStartedTab');
    const helpTradingTab = document.getElementById('helpTradingTab');
    const helpCardConditionsTab = document.getElementById('helpCardConditionsTab');
    const helpAccountTab = document.getElementById('helpAccountTab');
    const helpFAQTab = document.getElementById('helpFAQTab');

    if (helpGettingStartedTab) {
        helpGettingStartedTab.addEventListener('click', () => switchHelpTab('getting-started'));
    }
    if (helpTradingTab) {
        helpTradingTab.addEventListener('click', () => switchHelpTab('trading'));
    }
    if (helpCardConditionsTab) {
        helpCardConditionsTab.addEventListener('click', () => switchHelpTab('card-conditions'));
    }
    if (helpAccountTab) {
        helpAccountTab.addEventListener('click', () => switchHelpTab('account'));
    }
    if (helpFAQTab) {
        helpFAQTab.addEventListener('click', () => switchHelpTab('faq'));
    }

    // Event listeners para tabs de intercambios
    const tradesActiveTab = document.getElementById('tradesActiveTab');
    const tradesPendingTab = document.getElementById('tradesPendingTab');
    const tradesCompletedTab = document.getElementById('tradesCompletedTab');
    const tradesReceivedTab = document.getElementById('tradesReceivedTab');

    if (tradesActiveTab) {
        tradesActiveTab.addEventListener('click', () => switchTradeTab('active'));
    }
    if (tradesPendingTab) {
        tradesPendingTab.addEventListener('click', () => switchTradeTab('pending'));
    }
    if (tradesCompletedTab) {
        tradesCompletedTab.addEventListener('click', () => switchTradeTab('completed'));
    }
    if (tradesReceivedTab) {
        tradesReceivedTab.addEventListener('click', () => switchTradeTab('received'));
    }

    // Event listeners para botones de ayuda
    const searchHelpBtn = document.getElementById('searchHelpBtn');
    const contactSupportBtn = document.getElementById('contactSupportBtn');

    if (searchHelpBtn) {
        searchHelpBtn.addEventListener('click', () => {
            console.log('🔍 Buscar ayuda clicked');
            alert('Función de búsqueda de ayuda en desarrollo');
        });
    }

    if (contactSupportBtn) {
        contactSupportBtn.addEventListener('click', () => {
            console.log('📧 Contactar soporte clicked');
            alert('Función de contacto con soporte en desarrollo');
        });
    }

    // Event listeners para botones de intercambios
    const createTradeBtn = document.getElementById('createTradeBtn');
    const findTradesBtn = document.getElementById('findTradesBtn');

    if (createTradeBtn) {
        createTradeBtn.addEventListener('click', () => {
            console.log('➕ Crear intercambio clicked');
            showCreateTradeModal();
        });
    }

    if (findTradesBtn) {
        findTradesBtn.addEventListener('click', () => {
            console.log('🔍 Buscar intercambios clicked');
            alert('Función de búsqueda en desarrollo');
        });
    }

    // Event listener para el formulario de perfil personal
    const profilePersonalForm = document.getElementById('profilePersonalForm');
    if (profilePersonalForm) {
        profilePersonalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveProfileData();
        });
    }

    // Event listener para el botón cancelar
    const cancelProfileBtn = document.getElementById('cancelProfileBtn');
    if (cancelProfileBtn) {
        cancelProfileBtn.addEventListener('click', () => {
            loadUserInfo(); // Recargar datos originales
            showProfileSaveMessage('Cambios cancelados', 'info');
        });
    }

    // Event listeners para cambio de contraseña
    const passwordChangeForm = document.getElementById('passwordChangeForm');
    if (passwordChangeForm) {
        passwordChangeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await changePassword();
        });
    }

    const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');
    if (cancelPasswordBtn) {
        cancelPasswordBtn.addEventListener('click', () => {
            document.getElementById('passwordChangeForm').reset();
            showPasswordChangeMessage('Cambios cancelados', 'info');
        });
    }

    // Event listeners para modal
    if (closeAuthModalBtn) closeAuthModalBtn.addEventListener('click', hideAuthModal);
    if (toggleToRegister) toggleToRegister.addEventListener('click', (e) => { e.preventDefault(); showAuthModal('register'); });
    if (toggleToLogin) toggleToLogin.addEventListener('click', (e) => { e.preventDefault(); showAuthModal('login'); });
    
    // Event listeners para recuperación de contraseña
    const toggleToForgotPassword = document.getElementById('toggleToForgotPassword');
    const backToLogin = document.getElementById('backToLogin');
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');
    const resetEmailInput = document.getElementById('resetEmail');
    const resetPasswordError = document.getElementById('resetPasswordError');
    const resetPasswordSuccess = document.getElementById('resetPasswordSuccess');
    
    if (toggleToForgotPassword) {
        toggleToForgotPassword.addEventListener('click', (e) => {
            e.preventDefault();
            showAuthModal('forgot');
        });
    }
    
    if (backToLogin) {
        backToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            showAuthModal('login');
        });
    }
    
    // Función para manejar el reset de contraseña
    async function handlePasswordReset() {
        const email = resetEmailInput?.value;
        
        if (!email) {
            if (resetPasswordError) {
                resetPasswordError.textContent = 'Por favor, ingresa tu correo electrónico.';
                resetPasswordError.classList.remove('hidden');
            }
            return;
        }
        
        // Ocultar mensajes anteriores
        if (resetPasswordError) resetPasswordError.classList.add('hidden');
        if (resetPasswordSuccess) resetPasswordSuccess.classList.add('hidden');
        
        try {
            console.log('📧 Enviando email de recuperación a:', email);
            await auth.sendPasswordResetEmail(email);
            
            // Mostrar mensaje de éxito con aviso de SPAM
            if (resetPasswordSuccess) {
                resetPasswordSuccess.innerHTML = `
                    <span class="block font-semibold">✅ ¡Email enviado exitosamente!</span>
                    <span class="block mt-1">📧 Enviado a: ${email}</span>
                    <span class="block mt-2 text-yellow-600 font-semibold">
                        ⚠️ IMPORTANTE: Revisa tu carpeta de SPAM/Correo no deseado
                    </span>
                    <span class="block text-xs mt-1">
                        El email puede tardar 1-2 minutos en llegar
                    </span>
                `;
                resetPasswordSuccess.classList.remove('hidden');
            }
            
            // Limpiar el campo
            if (resetEmailInput) resetEmailInput.value = '';
            
            // Volver al login después de 10 segundos (más tiempo para leer el aviso)
            setTimeout(() => {
                showAuthModal('login');
            }, 10000);
            
        } catch (error) {
            console.error('❌ Error al enviar email de recuperación:', error);
            
            let errorMessage = 'Error al enviar el email de recuperación.';
            
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No existe una cuenta con este correo electrónico.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'El formato del correo electrónico no es válido.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Demasiados intentos. Por favor, espera un momento.';
            }
            
            if (resetPasswordError) {
                resetPasswordError.textContent = errorMessage;
                resetPasswordError.classList.remove('hidden');
            }
        }
    }
    
    // Event listener para el botón de reset
    if (resetPasswordBtn) {
        resetPasswordBtn.addEventListener('click', handlePasswordReset);
    }
    
    // Event listener para Enter en el campo de email
    if (resetEmailInput) {
        resetEmailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handlePasswordReset();
            }
        });
    }

    // Event listeners para filtros
    if (seriesFilter) {
        seriesFilter.addEventListener('change', () => {
            const selectedSeries = seriesFilter.value;
            if (selectedSeries === "") {
                populateSetFilter(allSets);
            } else {
                const setsInSeries = allSets.filter(set => set.series === selectedSeries);
                populateSetFilter(setsInSeries);
            }
            if (setFilter) setFilter.value = "";
            if (showAllSetCardsToggle) {
                showAllSetCardsToggle.checked = false;
                showAllSetCardsToggle.disabled = selectedSeries === "";
            }
        });
    }

    if (setFilter) {
        setFilter.addEventListener('change', () => {
            if (showAllSetCardsToggle) {
                showAllSetCardsToggle.disabled = !setFilter.value;
                if (!setFilter.value) showAllSetCardsToggle.checked = false;
            }
        });
    }

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            console.log('🔍 Aplicando filtros...');
            if (currentUser) {
                loadMyCollection(currentUser.uid);
            } else {
                if (noMyCardsMessage) {
                    noMyCardsMessage.textContent = 'Debes iniciar sesión para aplicar filtros.';
                    noMyCardsMessage.classList.remove('hidden');
                }
            }
        });
    }

    // Event listener para el filtro de idioma (actualización automática)
    if (languageFilter) {
        languageFilter.addEventListener('change', () => {
            console.log('🌍 Idioma seleccionado:', languageFilter.value);
            if (currentUser) {
                loadMyCollection(currentUser.uid);
            }
        });
    }

    if (showAllSetCardsToggle) {
        showAllSetCardsToggle.addEventListener('change', () => {
            if (currentUser && setFilter?.value) {
                loadMyCollection(currentUser.uid);
            } else if (showAllSetCardsToggle.checked) {
                alert('Debes iniciar sesión y seleccionar una expansión.');
                showAllSetCardsToggle.checked = false;
            }
        });
    }

    // Función para manejar el login
    async function handleLogin() {
        const email = loginEmailInput?.value;
        const password = loginPasswordInput?.value;
        if (loginError) loginError.classList.add('hidden');

        try {
            await auth.signInWithEmailAndPassword(email, password);
            hideAuthModal();
            console.log('Usuario inició sesión:', auth.currentUser.email);
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            let errorMessage = 'Error al iniciar sesión.';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = 'Correo o contraseña incorrectos.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Formato de correo inválido.';
            }
            if (loginError) {
                loginError.textContent = errorMessage;
                loginError.classList.remove('hidden');
            }
        }
    }

    // Event listeners para autenticación - BOTÓN LOGIN
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }

    // Event listener para ENTER en el formulario de login
    if (loginForm) {
        // Agregar event listener a los campos de input del login
        const loginInputs = [loginEmailInput, loginPasswordInput];
        loginInputs.forEach(input => {
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleLogin();
                    }
                });
            }
        });
    }

    // Función para manejar el registro
    async function handleRegister() {
            const username = document.getElementById('registerUsername')?.value?.trim();
            const email = registerEmailInput?.value;
            const password = registerPasswordInput?.value;
            const confirmPassword = confirmPasswordInput?.value;
            if (registerError) registerError.classList.add('hidden');

            // Validaciones
            if (!username) {
                if (registerError) {
                    registerError.textContent = 'El nombre de usuario es obligatorio.';
                    registerError.classList.remove('hidden');
                }
                return;
            }

            if (username.length < 3) {
                if (registerError) {
                    registerError.textContent = 'El nombre de usuario debe tener al menos 3 caracteres.';
                    registerError.classList.remove('hidden');
                }
                return;
            }

            if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                if (registerError) {
                    registerError.textContent = 'El nombre de usuario solo puede contener letras, números y guiones bajos.';
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
                console.log('🚀 Iniciando proceso de registro...');
                console.log('📝 Username:', username);
                console.log('📧 Email:', email);
                
                // NOTA: La verificación de nombre de usuario duplicado está deshabilitada
                // porque requeriría permisos especiales en Firestore para leer todos los usuarios.
                // En producción, esto se manejaría con una Cloud Function o un índice especial.
                console.log('ℹ️ Saltando verificación de nombre de usuario duplicado (requiere configuración adicional)');

                console.log('🔐 Creando cuenta con Firebase Auth...');
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;
                console.log('✅ Cuenta creada exitosamente:', user.uid);

                // Crear perfil completo en Firestore
                console.log('💾 Guardando perfil en Firestore...');
                await db.collection('users').doc(user.uid).set({
                    username: username, // Username único elegido en el registro
                    name: '', // Nombre real (se llenará después en el perfil)
                    lastName: '', // Apellido (se llenará después en el perfil)
                    email: user.email,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                console.log('✅ Perfil guardado en Firestore');

                hideAuthModal();
                console.log('🎉 Usuario registrado exitosamente:', user.email, 'Username:', username);
                
                // Mostrar mensaje de éxito
                alert(`¡Bienvenido ${username}! Tu cuenta ha sido creada exitosamente.`);
                
            } catch (error) {
                console.error('❌ Error detallado al registrar:', error);
                console.error('Código de error:', error.code);
                console.error('Mensaje de error:', error.message);
                
                let errorMessage = 'Error al registrar. Por favor, intenta de nuevo.';
                
                // Errores de Firebase Auth
                if (error.code === 'auth/email-already-in-use') {
                    errorMessage = 'Este correo ya está registrado.';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Formato de correo inválido.';
                } else if (error.code === 'auth/weak-password') {
                    errorMessage = 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
                } else if (error.code === 'auth/network-request-failed') {
                    errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
                } else if (error.code === 'auth/too-many-requests') {
                    errorMessage = 'Demasiados intentos. Por favor, espera un momento.';
                } else if (error.code === 'auth/operation-not-allowed') {
                    errorMessage = 'El registro está temporalmente deshabilitado.';
                } else if (error.message) {
                    // Si hay un mensaje de error específico, mostrarlo
                    errorMessage = `Error: ${error.message}`;
                }
                
                if (registerError) {
                    registerError.textContent = errorMessage;
                    registerError.classList.remove('hidden');
                }
            }
    }

    // Event listener para BOTÓN REGISTRO
    if (registerBtn) {
        registerBtn.addEventListener('click', handleRegister);
    }

    // Event listener para ENTER en el formulario de registro
    if (registerForm) {
        const registerUsernameInput = document.getElementById('registerUsername');
        const registerInputs = [registerUsernameInput, registerEmailInput, registerPasswordInput, confirmPasswordInput];
        registerInputs.forEach(input => {
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleRegister();
                    }
                });
            }
        });
    }

    // Escuchar cambios de autenticación
    auth.onAuthStateChanged(auth, async (user) => {
        currentUser = user;
        console.log('Estado de autenticación:', !!user);

        // Mis Cartas siempre visible
        if (myCardsNavLink) myCardsNavLink.classList.remove('hidden');

        if (user) {
            // Usuario conectado: ocultar login/register, mostrar logout
            if (loginNavLink) loginNavLink.classList.add('hidden');
            if (registerNavLink) registerNavLink.classList.add('hidden');
            if (logoutNavLink) logoutNavLink.classList.remove('hidden');
            // Mi Perfil siempre visible (funciona diferente según estado)
            if (profileNavLink) profileNavLink.classList.remove('hidden');
            
            // CARGAR MODO OSCURO INMEDIATAMENTE AL INICIAR SESIÓN
            try {
                console.log('🌙 Cargando preferencia de modo oscuro del usuario...');
                const userDoc = await db.collection('users').doc(user.uid).get();
                const userData = userDoc.data();
                
                if (userData && userData.darkMode !== undefined) {
                    console.log('🌙 Aplicando modo oscuro:', userData.darkMode);
                    applyDarkMode(userData.darkMode);
                    
                    // Sincronizar el toggle si existe
                    const darkModeToggle = document.getElementById('darkModeToggle');
                    if (darkModeToggle) {
                        darkModeToggle.checked = userData.darkMode;
                    }
                } else {
                    console.log('🌙 No hay preferencia guardada, manteniendo modo actual');
                }
            } catch (error) {
                console.error('Error al cargar preferencia de modo oscuro:', error);
            }
        } else {
            // Usuario desconectado: mostrar login/register, ocultar logout
            if (loginNavLink) loginNavLink.classList.remove('hidden');
            if (registerNavLink) registerNavLink.classList.remove('hidden');
            if (logoutNavLink) logoutNavLink.classList.add('hidden');
            // Mi Perfil siempre visible (redirige a login si no está conectado)
            if (profileNavLink) profileNavLink.classList.remove('hidden');
            
            // Opcional: Restaurar modo por defecto al cerrar sesión
            // Si quieres que al cerrar sesión vuelva al modo claro, descomenta estas líneas:
            // applyDarkMode(false);
            // const darkModeToggle = document.getElementById('darkModeToggle');
            // if (darkModeToggle) darkModeToggle.checked = false;
        }
    });

    // Event listener para búsqueda
    let searchTimeout;
    if (searchInput) {
        searchInput.addEventListener('keyup', (event) => {
            clearTimeout(searchTimeout);
            const query = event.target.value.trim();
            if (query.length >= 3 || query.length === 0) {
                searchTimeout = setTimeout(() => {
                    // Obtener el modo de búsqueda seleccionado
                    const searchMode = document.querySelector('input[name="search-mode"]:checked')?.value || 'pokemontcg';
                    fetchCards(query, searchMode);
                }, 500);
            }
        });
    }

    // Mostrar secciones iniciales
    showInitialSections();

    // Filtros de búsqueda
    const filterSetSelect = document.getElementById('filterSetSelect');
    const filterRaritySelect = document.getElementById('filterRaritySelect');
    const filterTypeSelect = document.getElementById('filterTypeSelect');
    const filterLanguageSelect = document.getElementById('filterLanguageSelect');
    const applySearchFiltersBtn = document.getElementById('applySearchFiltersBtn');
    const clearSearchFiltersBtn = document.getElementById('clearSearchFiltersBtn');

    if (applySearchFiltersBtn) {
        applySearchFiltersBtn.addEventListener('click', () => {
            searchFiltersState.set = filterSetSelect?.value || '';
            searchFiltersState.rarity = filterRaritySelect?.value || '';
            searchFiltersState.type = filterTypeSelect?.value || '';
            searchFiltersState.language = filterLanguageSelect?.value || '';
            const q = (searchInput?.value || '').trim();
            if (q.length >= 3) {
                const searchMode = document.querySelector('input[name="search-mode"]:checked')?.value || 'pokemontcg';
                fetchCards(q, searchMode);
            }
        });
    }
    if (clearSearchFiltersBtn) {
        clearSearchFiltersBtn.addEventListener('click', () => {
            if (filterSetSelect) filterSetSelect.value = '';
            if (filterRaritySelect) filterRaritySelect.value = '';
            if (filterTypeSelect) filterTypeSelect.value = '';
            if (filterLanguageSelect) filterLanguageSelect.value = '';
            searchFiltersState.set = '';
            searchFiltersState.rarity = '';
            searchFiltersState.type = '';
            searchFiltersState.language = '';
            const q = (searchInput?.value || '').trim();
            if (q.length >= 3) {
                const searchMode = document.querySelector('input[name="search-mode"]:checked')?.value || 'pokemontcg';
                fetchCards(q, searchMode);
            }
        });
    }


});

// Función para mostrar detalles de carta (solo información)
window.showCardDetailsOnly = (cardId, cardName, imageUrl, setName, series, number) => {
    // Crear modal de detalles
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">Detalles de la Carta</h3>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                        class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div class="text-center mb-4">
                <img src="${imageUrl}" alt="${cardName}" 
                     class="w-48 h-auto mx-auto rounded-lg shadow-lg"
                     onerror="this.src='https://placehold.co/400x550/a0aec0/ffffff?text=Error+imagen'">
            </div>
            <div class="space-y-2 text-sm">
                <p><strong>Nombre:</strong> ${cardName}</p>
                <p><strong>Set:</strong> ${setName}</p>
                <p><strong>Serie:</strong> ${series}</p>
                <p><strong>Número:</strong> ${number}</p>
                <p><strong>ID:</strong> ${cardId}</p>
            </div>
            <div class="mt-6 flex justify-end">
                <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                        class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                    Cerrar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
};

// Función para mostrar modal de confirmación personalizado
window.showAddCardModal = (cardId, cardName, imageUrl, setName, series, number) => {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full shadow-xl">
                <div class="mb-6">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">Añadir a Colección</h3>
                    
                    <!-- Vista previa de la carta -->
                    <div class="flex flex-col items-center mb-4">
                        <img src="${imageUrl}" alt="${cardName}" class="w-32 h-44 object-contain rounded mb-3">
                        <div class="text-center">
                            <p class="font-semibold text-gray-900 dark:text-white">${cardName}</p>
                            <p class="text-sm text-gray-600 dark:text-gray-400">${setName} • #${number}</p>
                        </div>
                    </div>
                    
                    <!-- Selector de condición -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Condición de la carta
                        </label>
                        <select id="cardConditionSelect" 
                                class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400">
                            ${Object.values(CARD_CONDITIONS).map(condition => 
                                `<option value="${condition.code}" ${condition.code === 'NM' ? 'selected' : ''}>
                                    ${condition.icon} ${condition.code} - ${condition.name}
                                </option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <!-- Selector de idioma -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Idioma de la carta
                        </label>
                        <select id="cardLanguageSelect" 
                                class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400">
                            <option value="Español" selected>🇪🇸 Español</option>
                            <option value="Inglés">🇺🇸 Inglés</option>
                            <option value="Francés">🇫🇷 Francés</option>
                            <option value="Italiano">🇮🇹 Italiano</option>
                            <option value="Alemán">🇩🇪 Alemán</option>
                            <option value="Portugués">🇵🇹 Portugués</option>
                            <option value="Japonés">🇯🇵 Japonés</option>
                            <option value="Chino">🇨🇳 Chino</option>
                            <option value="Coreano">🇰🇷 Coreano</option>
                            <option value="Otro">🌍 Otro</option>
                        </select>
                    </div>
                </div>
                
                <div class="flex gap-3 justify-end">
                    <button id="cancelAddCard" 
                            class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors">
                        Cancelar
                    </button>
                    <button id="confirmAddCard" 
                            class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                        Añadir a Colección
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        const cancelBtn = modal.querySelector('#cancelAddCard');
        const confirmBtn = modal.querySelector('#confirmAddCard');
        const conditionSelect = modal.querySelector('#cardConditionSelect');
        const languageSelect = modal.querySelector('#cardLanguageSelect');
        
        cancelBtn.addEventListener('click', () => {
            modal.remove();
            resolve(null);
        });
        
        confirmBtn.addEventListener('click', () => {
            const selectedCondition = conditionSelect.value;
            const selectedLanguage = languageSelect.value;
            modal.remove();
            resolve({ condition: selectedCondition, language: selectedLanguage });
        });
        
        // Cerrar con ESC o click fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                resolve(null);
            }
        });
        
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escHandler);
                resolve(null);
            }
        });
    });
};

// Función para añadir carta directamente (botón separado)
window.addCardDirectly = async (cardId, cardName, imageUrl, setName, series, number) => {
    if (!currentUser) {
        showNotification('Inicia sesión para añadir cartas a tu colección', 'warning', 4000);
        showAuthModal('login');
        return;
    }

    const result = await showAddCardModal(cardId, cardName, imageUrl, setName, series, number);
    
    if (result) {
        addCardToCollection(cardId, cardName, imageUrl, setName, series, number, result.condition, result.language);
        if (typeof loadUserCollection === 'function') {
            loadUserCollection();
        }
        if (typeof loadProfileStats === 'function') {
            loadProfileStats();
        }
    }
};

// Mantener función original para compatibilidad (deprecated)
window.showCardDetails = window.addCardDirectly;

// Función para añadir carta a la colección
async function addCardToCollection(cardId, cardName, imageUrl, setName, series, number, condition = 'NM', language = 'Español') {
    if (!currentUser) return;

    try {
        const cardData = {
            id: cardId,
            name: cardName,
            imageUrl: imageUrl,
            set: setName,
            series: series,
            number: number,
            condition: condition,
            language: language,
            setId: cardId.split('-')[0], // Extraer setId del cardId
            addedAt: new Date()
        };

        await db.collection('users').doc(currentUser.uid).collection('my_cards').doc(cardId).set(cardData);
        showNotification(`¡Carta "${cardName}" añadida a tu colección!`, 'success', 4000);
    } catch (error) {
        console.error('Error al añadir carta:', error);
        showNotification('Error al añadir la carta. Inténtalo de nuevo.', 'error', 5000);
    }
}

// Función para cargar más resultados
window.loadMoreResults = async (query) => {
    console.log('🔄 Intentando cargar más resultados para:', query);
    
    if (errorMessage) errorMessage.classList.add('hidden');
    showLoadingSpinner();
    
    try {
        // Intentar con wildcard pero menos resultados
        const encodedQuery = encodeURIComponent(query.toLowerCase());
        const moreUrl = `/api/pokemontcg/cards?q=name:*${encodedQuery}*&pageSize=50`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // Más tiempo
        
        const response = await fetch(moreUrl, {
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const data = await response.json();
            const cards = data.data || [];
            
            // Limpiar contenedor y mostrar nuevos resultados
            cardsContainer.innerHTML = '';
            
            if (cards.length > 0) {
                cards.forEach(card => {
                    const cardElement = document.createElement('div');
                    cardElement.className = 'card-bg rounded-xl shadow-lg overflow-hidden transform transition-transform hover:scale-105';
                    
                    const safeCardId = (card.id || '').replace(/'/g, "\\'");
                    const safeCardName = (card.name || '').replace(/'/g, "\\'");
                    const safeSetName = (card.set?.name || 'N/A').replace(/'/g, "\\'");
                    const safeSeries = (card.set?.series || 'N/A').replace(/'/g, "\\'");
                    const safeNumber = (card.number || 'N/A').replace(/'/g, "\\'");
                    const safeImageUrl = (card.images?.small || '').replace(/'/g, "\\'");
                    
                    cardElement.innerHTML = `
                        <img src="${card.images?.small || 'https://placehold.co/400x550/a0aec0/ffffff?text=Sin+imagen'}"
                             alt="${card.name || 'Carta sin nombre'}"
                             class="w-full h-auto object-cover rounded-t-xl"
                             onerror="this.src='https://placehold.co/400x550/a0aec0/ffffff?text=Error+imagen'">
                        <div class="p-4">
                            <h3 class="text-xl font-semibold mb-2 text-gray-900">${card.name || 'Nombre no disponible'}</h3>
                            <p class="text-gray-600 text-sm mb-3">Set: ${card.set?.name || 'N/A'}</p>
                            <p class="text-gray-600 text-sm mb-3">Serie: ${card.set?.series || 'N/A'}</p>
                            <p class="text-gray-600 text-sm mb-3">Número: ${card.number || 'N/A'}</p>
                            <div class="flex justify-between items-center gap-2">
                                <button class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold"
                                        onclick="showCardDetailsOnly('${safeCardId}', '${safeCardName}', '${safeImageUrl}', '${safeSetName}', '${safeSeries}', '${safeNumber}')">
                                    Ver Detalles
                                </button>
                                <button class="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-semibold"
                                        onclick="addCardDirectly('${safeCardId}', '${safeCardName}', '${safeImageUrl}', '${safeSetName}', '${safeSeries}', '${safeNumber}')">
                                    + Añadir
                                </button>
                            </div>
                        </div>
                    `;
                    cardsContainer.appendChild(cardElement);
                });
                
                if (errorMessage) {
                    errorMessage.innerHTML = `✅ ¡Éxito! Cargadas ${cards.length} cartas adicionales.`;
                    errorMessage.classList.remove('hidden');
                }
            }
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
        
    } catch (error) {
        console.error('Error al cargar más resultados:', error);
        if (errorMessage) {
            errorMessage.textContent = '❌ No se pudieron cargar más resultados. La API está muy lenta en este momento.';
            errorMessage.classList.remove('hidden');
        }
    } finally {
        hideLoadingSpinner();
    }
};

// Función de búsqueda súper rápida (solo 10 resultados)
window.quickSearch = async () => {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (query.length < 2) {
        alert('Ingresa al menos 2 caracteres');
        return;
    }
    
    console.log('🚀 Búsqueda rápida iniciada para:', query);
    
    // Obtener el modo de búsqueda seleccionado
    const searchMode = document.querySelector('input[name="search-mode"]:checked')?.value || 'pokemontcg';
    
    if (cardsContainer) cardsContainer.innerHTML = '';
    if (noResultsMessage) noResultsMessage.classList.add('hidden');
    if (errorMessage) errorMessage.classList.add('hidden');
    
    showLoadingSpinner();
    showSearchResults();
    
    try {
        const encodedQuery = encodeURIComponent(query.toLowerCase());
        // Búsqueda súper específica y rápida
        const quickUrl = `/api/pokemontcg/cards?q=name:${encodedQuery}&pageSize=10`;
        
        console.log('🚀 Quick URL:', quickUrl);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // Solo 5 segundos
        
        const response = await fetch(quickUrl, {
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const data = await response.json();
            const cards = data.data || [];
            
            console.log('🚀 Quick search success:', cards.length, 'cards');
            
            if (cards.length > 0) {
                cards.forEach(card => {
                    const cardElement = document.createElement('div');
                    cardElement.className = 'card-bg rounded-xl shadow-lg overflow-hidden transform transition-transform hover:scale-105';
                    
                    const safeCardId = (card.id || '').replace(/'/g, "\\'");
                    const safeCardName = (card.name || '').replace(/'/g, "\\'");
                    const safeSetName = (card.set?.name || 'N/A').replace(/'/g, "\\'");
                    const safeSeries = (card.set?.series || 'N/A').replace(/'/g, "\\'");
                    const safeNumber = (card.number || 'N/A').replace(/'/g, "\\'");
                    const safeImageUrl = (card.images?.small || '').replace(/'/g, "\\'");
                    
                    cardElement.innerHTML = `
                        <img src="${card.images?.small || 'https://placehold.co/400x550/a0aec0/ffffff?text=Sin+imagen'}"
                             alt="${card.name || 'Carta sin nombre'}"
                             class="w-full h-auto object-cover rounded-t-xl"
                             onerror="this.src='https://placehold.co/400x550/a0aec0/ffffff?text=Error+imagen'">
                        <div class="p-4">
                            <h3 class="text-xl font-semibold mb-2 text-gray-900">${card.name || 'Nombre no disponible'}</h3>
                            <p class="text-gray-600 text-sm mb-3">Set: ${card.set?.name || 'N/A'}</p>
                            <p class="text-gray-600 text-sm mb-3">Serie: ${card.set?.series || 'N/A'}</p>
                            <p class="text-gray-600 text-sm mb-3">Número: ${card.number || 'N/A'}</p>
                            <div class="flex justify-between items-center gap-2">
                                <button class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold"
                                        onclick="showCardDetailsOnly('${safeCardId}', '${safeCardName}', '${safeImageUrl}', '${safeSetName}', '${safeSeries}', '${safeNumber}')">
                                    Ver Detalles
                                </button>
                                <button class="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-semibold"
                                        onclick="addCardDirectly('${safeCardId}', '${safeCardName}', '${safeImageUrl}', '${safeSetName}', '${safeSeries}', '${safeNumber}')">
                                    + Añadir
                                </button>
                            </div>
                        </div>
                    `;
                    cardsContainer.appendChild(cardElement);
                });
                
                if (errorMessage) {
                    errorMessage.innerHTML = `✅ Búsqueda rápida: ${cards.length} cartas encontradas. <button onclick="fetchCards('${query}')" class="bg-blue-500 text-white px-3 py-1 rounded ml-2">🔍 Buscar Más</button>`;
                    errorMessage.classList.remove('hidden');
                }
            } else {
                if (noResultsMessage) {
                    noResultsMessage.textContent = `Búsqueda rápida: No se encontraron cartas para "${query}".`;
                    noResultsMessage.classList.remove('hidden');
                }
            }
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
        
    } catch (error) {
        console.error('❌ Quick search error:', error);
        if (errorMessage) {
            errorMessage.textContent = '⚡ Búsqueda rápida falló. Prueba la búsqueda normal.';
            errorMessage.classList.remove('hidden');
        }
    } finally {
        hideLoadingSpinner();
    }
};

// Hacer funciones disponibles globalmente
// Hacer funciones disponibles globalmente
window.showAuthModal = showAuthModal;
window.hideAuthModal = hideAuthModal;
window.showMyCardsSection = showMyCardsSection;
window.showHelpSection = showHelpSection;
window.showInterchangesSection = showInterchangesSection;
window.showProfileSection = showProfileSection;
window.showInitialSections = showInitialSections;
window.fetchCards = fetchCards;
window.editTrade = editTrade;
window.deleteTrade = deleteTrade;
window.proposeTrade = proposeTrade;
window.viewTradeDetails = viewTradeDetails;
window.createConditionSelector = createConditionSelector;
window.showConditionInfo = showConditionInfo;
window.getConditionColor = getConditionColor;
window.getConditionIcon = getConditionIcon;
window.calculateCollectionValue = calculateCollectionValue;
window.formatCurrency = formatCurrency;

// Cargar y renderizar Mi Colección
async function loadUserCollection() {
    const grid = document.getElementById('myCardsGrid');
    const status = document.getElementById('myCardsStatus');
    if (!grid) return;
    if (!currentUser) {
        if (status) status.textContent = 'Inicia sesión para ver tu colección';
        grid.innerHTML = `
            <div class="col-span-full text-center text-gray-500 py-8">
                <p>No hay cartas en tu colección</p>
            </div>
        `;
        return;
    }

    try {
        if (status) status.textContent = 'Cargando tu colección...';
        const cardsRef = db.collection('users').doc(currentUser.uid).collection('my_cards');
        const snap = await cardsRef.get();
        const cards = [];
        snap.forEach(d => cards.push({ id: d.id, ...d.data() }));

        if (cards.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full text-center text-gray-500 py-8">
                    <p>No hay cartas en tu colección</p>
                </div>
            `;
        } else {
            renderMyCards(cards);
        }
        if (status) status.textContent = '';
    } catch (err) {
        console.error('Error al cargar colección:', err);
        if (status) status.textContent = 'Error al cargar tu colección';
    }
}

function renderMyCards(cards) {
    const container = document.getElementById('myCardsGrid');
    if (!container) return;
    
    // Cambiar el contenedor a diseño de lista
    container.className = 'space-y-1 border rounded-lg bg-white dark:bg-gray-800';
    container.innerHTML = '';
    
    if (cards.length === 0) {
        container.innerHTML = '<div class="text-center text-gray-500 py-8">No hay cartas en tu colección</div>';
        return;
    }
    
    cards.forEach((card, index) => {
        const imageUrl = card.imageUrl || '';
        const name = card.name || card.id;
        const setName = (typeof card.set === 'string' ? card.set : card.set?.name) || 'Set';
        const number = card.number || '';
        const language = card.language || 'Español';
        const condition = card.condition || 'NM';
        
        const row = document.createElement('div');
        row.className = 'relative flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 h-16 overflow-visible';
        if (index < cards.length - 1) {
            row.className += ' border-b';
        }
        
        // Icono de imagen con hover
        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'w-10 h-10 flex items-center justify-center bg-transparent rounded cursor-pointer absolute left-3 top-1/2 -translate-y-1/2 z-10';
        imgWrapper.title = 'Pasa el mouse para ver imagen';
        imgWrapper.innerHTML = '<span class="text-xl">🎴</span>';
        
        // Contenedor de imagen con hover
        const imgContainer = document.createElement('div');
        imgContainer.className = 'hidden absolute left-14 top-1/2 -translate-y-1/2 z-30';
        imgContainer.style.pointerEvents = 'none';
        
        const imgEl = document.createElement('img');
        imgEl.src = imageUrl || 'https://placehold.co/400x550/a0aec0/ffffff?text=Sin+imagen';
        imgEl.alt = name || 'Carta';
        imgEl.className = 'w-64 h-auto object-contain rounded-lg shadow-2xl border-2 border-gray-200';
        imgEl.onerror = () => { imgEl.src = 'https://placehold.co/400x550/a0aec0/ffffff?text=Error'; };
        
        imgContainer.appendChild(imgEl);
        row.appendChild(imgContainer);
        
        // Eventos de hover
        imgWrapper.addEventListener('mouseenter', () => { 
            imgContainer.classList.remove('hidden');
        });
        
        imgWrapper.addEventListener('mouseleave', () => { 
            imgContainer.classList.add('hidden');
        });
        
        // Información de la carta
        const info = document.createElement('div');
        info.className = 'flex-1 min-w-0 pl-16';
        info.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <div class="flex items-center gap-2">
                                                            <span class="font-semibold text-gray-900 dark:text-white">${name}</span>
                        <span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">En colección</span>
                    </div>
                    <div class="text-xs text-gray-600">
                        #${number} · ${setName} · ${language} · ${condition}
                    </div>
                </div>
                <button class="btn-secondary px-3 py-1.5 rounded text-xs" onclick="removeCardFromCollection('${card.id || name}')">
                    Eliminar
                </button>
            </div>
        `;
        
        row.appendChild(imgWrapper);
        row.appendChild(info);
        container.appendChild(row);
    });
}

// Estado de filtros de búsqueda
const searchFiltersState = {
    set: '', rarity: '', type: '', language: ''
};

// Estado de paginación de búsqueda
let lastSearchBase = '';
let searchPage = 1;
let searchPageSize = 20;
let searchTotal = 0;

function buildCardsQuery(baseQuery) {
    const filters = [];
    if (searchFiltersState.set) filters.push(`set.name:"${searchFiltersState.set}"`);
    if (searchFiltersState.rarity) filters.push(`rarity:"${searchFiltersState.rarity}"`);
    if (searchFiltersState.type) filters.push(`types:"${searchFiltersState.type}"`);
    // language no está en API oficial; se aplica client-side si existiera
    return filters.length ? `${baseQuery} AND ${filters.join(' AND ')}` : baseQuery;
}

function buildCardsApiUrl(baseQuery, page, pageSize) {
    const withFilters = buildCardsQuery(baseQuery);
    const qParam = encodeURIComponent(withFilters);
    const pageParam = page ? `&page=${page}` : '';
    return `/api/pokemontcg/cards?q=${qParam}${pageParam}&pageSize=${pageSize}`;
}

function renderPagination(totalCount, page, pageSize) {
    const pagination = document.getElementById('searchPagination');
    if (!pagination) return;
    pagination.innerHTML = '';
    if (!totalCount || totalCount <= pageSize) return;

    const totalPages = Math.ceil(totalCount / pageSize);
    const maxButtons = 7;
    const start = Math.max(1, page - 3);
    const end = Math.min(totalPages, start + maxButtons - 1);

    const makeBtn = (label, targetPage, isActive = false, disabled = false) => {
        const btn = document.createElement('button');
        btn.textContent = label;
        btn.className = `px-3 py-1 rounded ${isActive ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
        if (!disabled && !isActive) {
            btn.addEventListener('click', () => goToSearchPage(targetPage));
        }
        return btn;
    };

    pagination.appendChild(makeBtn('«', 1, false, page === 1));
    pagination.appendChild(makeBtn('‹', Math.max(1, page - 1), false, page === 1));

    for (let p = start; p <= end; p++) {
        pagination.appendChild(makeBtn(String(p), p, p === page));
    }

    pagination.appendChild(makeBtn('›', Math.min(totalPages, page + 1), false, page === totalPages));
    pagination.appendChild(makeBtn('»', totalPages, false, page === totalPages));
}

async function goToSearchPage(targetPage) {
    searchPage = targetPage;
    const apiUrl = buildCardsApiUrl(lastSearchBase, searchPage, searchPageSize);
    console.log('🌐 Fetching page:', searchPage, apiUrl);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    try {
        const response = await fetch(apiUrl, { signal: controller.signal, headers: { 'Content-Type': 'application/json' } });
        clearTimeout(timeoutId);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        const cards = data.data || [];
        cardsContainer.innerHTML = '';
        cards.forEach((card) => {
            const safeCardId = (card.id || '').replace(/'/g, "\\'");
            const safeCardName = (card.name || '').replace(/'/g, "\\'");
            const safeSetName = (card.set?.name || 'N/A').replace(/'/g, "\\'");
            const safeSeries = (card.set?.series || 'N/A').replace(/'/g, "\\'");
            const safeNumber = (card.number || 'N/A').replace(/'/g, "\\'");
            const safeImageUrl = (card.images?.small || '').replace(/'/g, "\\'");

            const row = document.createElement('div');
            row.className = 'relative flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 h-16 overflow-visible';
            const imgWrapper = document.createElement('div');
            imgWrapper.className = 'w-10 h-10 flex items-center justify-center bg-transparent rounded cursor-pointer absolute left-3 top-1/2 -translate-y-1/2 z-10';
            imgWrapper.title = 'Pasa el mouse para ver imagen';
            imgWrapper.innerHTML = '<span class="text-xl">🎴</span>';
            
            // Crear contenedor de imagen con hover
            const imgContainer = document.createElement('div');
            imgContainer.className = 'hidden absolute left-14 top-1/2 -translate-y-1/2 z-30';
            imgContainer.style.pointerEvents = 'none';
            
            const imgEl = document.createElement('img');
            imgEl.src = (card.images?.large || card.images?.small) || 'https://placehold.co/400x550/a0aec0/ffffff?text=Sin+imagen';
            imgEl.alt = card.name || 'Carta';
            imgEl.className = 'w-64 h-auto object-contain rounded-lg shadow-2xl border-2 border-gray-200';
            imgEl.onerror = () => { imgEl.src = 'https://placehold.co/400x550/a0aec0/ffffff?text=Error'; };
            
            imgContainer.appendChild(imgEl);
            row.appendChild(imgContainer);
            
            // Eventos de hover
            imgWrapper.addEventListener('mouseenter', () => { 
                imgContainer.classList.remove('hidden');
            });
            
            imgWrapper.addEventListener('mouseleave', () => { 
                imgContainer.classList.add('hidden');
            });

            const info = document.createElement('div');
            info.className = 'flex-1 min-w-0 pl-16';
            info.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="truncate">
                        <div class="font-semibold text-gray-900 dark:text-white truncate">${card.name || 'Nombre no disponible'}</div>
                        <div class="text-xs text-gray-600 dark:text-gray-300 truncate">Set: ${card.set?.name || 'N/A'} · Serie: ${card.set?.series || 'N/A'} · Nº: ${card.number || 'N/A'}</div>
                    </div>
                    <div class="flex gap-2 items-center">
                        <button class="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                                onclick="showCardOffers('${safeCardName}', '${safeImageUrl}')">
                            <span>🤝</span>
                            <span>Ofrecidas: ${getCardOffersCount(card.name)}</span>
                        </button>
                        <button class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                            onclick="showCardDetailsOnly('${safeCardId}', '${safeCardName}', '${safeImageUrl}', '${safeSetName}', '${safeSeries}', '${safeNumber}')">Ver Detalles</button>
                        <button class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                            onclick="addCardDirectly('${safeCardId}', '${safeCardName}', '${safeImageUrl}', '${safeSetName}', '${safeSeries}', '${safeNumber}')">+ Añadir</button>
                    </div>
                </div>
            `;

            row.appendChild(imgWrapper);
            row.appendChild(info);
            cardsContainer.appendChild(row);
        });

        const totalCount = data.totalCount || 0;
        renderPagination(totalCount, searchPage, searchPageSize);
    } catch (e) {
        clearTimeout(timeoutId);
        console.error('❌ Error al cargar página:', e);
    }
}
