// Dark Mode functionality
console.log('🌙 Cargando modo oscuro...');

// Función para inicializar el modo oscuro
function initializeDarkMode() {
    console.log('🌙 Inicializando modo oscuro...');
    
    // Cargar preferencia guardada
    loadDarkModePreference();
    
    // Configurar el botón de toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleDarkMode);
        console.log('✅ Botón de modo oscuro configurado');
    }
    
    // Observar cambios en la preferencia del sistema
    if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addListener(handleSystemThemeChange);
    }
}

// Función para cargar la preferencia guardada
function loadDarkModePreference() {
    const savedTheme = localStorage.getItem('darkMode');
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'true' || (savedTheme === null && systemPrefersDark)) {
        applyDarkMode(true);
    } else {
        applyDarkMode(false);
    }
}

// Función para aplicar el modo oscuro
function applyDarkMode(isDark) {
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    
    if (isDark) {
        body.classList.add('dark-mode');
        if (themeToggle) {
            themeToggle.textContent = '☀️';
            themeToggle.title = 'Modo claro';
        }
        console.log('🌙 Modo oscuro activado');
    } else {
        body.classList.remove('dark-mode');
        if (themeToggle) {
            themeToggle.textContent = '🌙';
            themeToggle.title = 'Modo oscuro';
        }
        console.log('☀️ Modo claro activado');
    }
}

// Función para alternar el modo oscuro
function toggleDarkMode() {
    const body = document.body;
    const isDark = body.classList.contains('dark-mode');
    
    applyDarkMode(!isDark);
    localStorage.setItem('darkMode', (!isDark).toString());
    
    // Mostrar notificación
    showThemeNotification(!isDark);
}

// Función para manejar cambios en la preferencia del sistema
function handleSystemThemeChange(e) {
    const savedTheme = localStorage.getItem('darkMode');
    
    // Solo aplicar si no hay preferencia guardada
    if (savedTheme === null) {
        applyDarkMode(e.matches);
    }
}

// Función para mostrar notificación del tema
function showThemeNotification(isDark) {
    const message = isDark ? 'Modo oscuro activado' : 'Modo claro activado';
    showNotification(message, 'success');
}

// Función para mostrar notificaciones (si existe)
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDarkMode);
} else {
    initializeDarkMode();
}

console.log('✅ Modo oscuro cargado');