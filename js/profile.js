// TCGtrade - Funciones de Perfil
// JavaScript extraído del HTML para mejor organización

// Función para cargar datos del perfil
async function loadProfileData() {
    if (!currentUser) {
        console.log('❌ No hay usuario conectado');
        return;
    }

    try {
        console.log('🔄 Cargando datos del perfil...');
        
        // Cargar información del usuario
        if (typeof loadUserInfo === 'function') {
            await loadUserInfo();
        }
        
        // Cargar estadísticas
        if (typeof loadProfileStats === 'function') {
            await loadProfileStats();
        }
        
        // Cargar valoraciones del usuario
        if (typeof loadUserRating === 'function') {
            loadUserRating();
        }
        
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
        const userDocRef = doc(db, 'users', currentUser.uid);
        console.log('🔧 Referencia del documento:', userDocRef);
        
        await setDoc(userDocRef, profileData, { merge: true });
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
                await updateEmail(currentUser, email);
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
        messageElement.classList.add('bg-green-100', 'text-green-700', 'border', 'border-green-200');
    } else if (type === 'error') {
        messageElement.classList.add('bg-red-100', 'text-red-700', 'border', 'border-red-200');
    } else if (type === 'info') {
        messageElement.classList.add('bg-blue-100', 'text-blue-700', 'border', 'border-blue-200');
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
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        console.log('🔧 Credenciales creadas:', !!credential);
        
        console.log('🔧 Iniciando reautenticación...');
        await reauthenticateWithCredential(currentUser, credential);
        console.log('✅ Reautenticación exitosa');

        // Cambiar la contraseña
        console.log('🔧 Cambiando contraseña...');
        await updatePassword(currentUser, newPassword);
        console.log('✅ Contraseña cambiada exitosamente');

        // Limpiar el formulario
        const form = document.getElementById('passwordChangeForm');
        if (form) {
            form.reset();
            console.log('✅ Formulario limpiado');
        }

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
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
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
                    await setDoc(doc(db, 'users', currentUser.uid), {
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
        if (typeof loadDarkModePreference === 'function') {
            loadDarkModePreference(userData);
        }

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
        // El estado ya está sincronizado visualmente con las clases CSS
        return;
    }
    
    const darkMode = userData.darkMode;
    if (typeof applyDarkMode === 'function') {
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
    
    // Actualizar elementos flotantes
    if (typeof updateFloatingElementsOpacity === 'function') {
        updateFloatingElementsOpacity();
    }
    
    // Guardar también en localStorage para persistencia local
    localStorage.setItem('darkMode', isDark ? 'true' : 'false');
}

// Función para guardar preferencia de modo oscuro
async function saveDarkModePreference(isDark) {
    if (!currentUser) return;

    try {
        await setDoc(doc(db, 'users', currentUser.uid), {
            darkMode: isDark,
            updatedAt: new Date()
        }, { merge: true });

        applyDarkMode(isDark);
        console.log('✅ Preferencia de modo oscuro guardada:', isDark);
    } catch (error) {
        console.error('❌ Error al guardar preferencia de modo oscuro:', error);
    }
}

// Exportar funciones para uso global
window.loadProfileData = loadProfileData;
window.showProfileSaveMessage = showProfileSaveMessage;
window.saveProfileData = saveProfileData;
window.showPasswordChangeMessage = showPasswordChangeMessage;
window.changePassword = changePassword;
window.loadUserInfo = loadUserInfo;
window.loadDarkModePreference = loadDarkModePreference;
window.applyDarkMode = applyDarkMode;
window.saveDarkModePreference = saveDarkModePreference;

console.log('🚀 Módulo de perfil cargado');