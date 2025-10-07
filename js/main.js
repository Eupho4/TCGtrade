/**
 * TCGtrade App - Versión Optimizada
 * 
 * Esta es la versión optimizada del main.js con mejoras de performance.
 * 
 * Estructura:
 * - core/app.js: Aplicación principal
 * - services/: Servicios (Firebase, API Pokémon)
 * - ui/: Módulos de interfaz
 * - utils/: Utilidades (DOM, validación, notificaciones)
 * - constants/: Configuración y constantes
 */

// Importar la aplicación principal con lazy loading
let app = null;

// Función para cargar la aplicación de forma asíncrona
async function loadApp() {
    try {
        // Mostrar loading inicial
        showInitialLoading();
        
        // Cargar módulos de forma asíncrona con timeout
        const loadPromise = import('./core/app.js');
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout loading app')), 10000)
        );
        
        const { default: App } = await Promise.race([loadPromise, timeoutPromise]);
        app = new App();
        
        // Inicializar aplicación
        await app.initialize();
        
        // Ocultar loading inicial
        hideInitialLoading();
        
        console.log('🎮 TCGtrade App cargada - Versión Optimizada');
    } catch (error) {
        console.error('❌ Error al cargar la aplicación:', error);
        showLoadingError();
    }
}

// Mostrar loading inicial
function showInitialLoading() {
    const loadingHtml = `
        <div id="initial-loading" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            color: white;
            font-family: 'Inter', sans-serif;
        ">
            <div style="text-align: center;">
                <div style="
                    width: 60px;
                    height: 60px;
                    border: 4px solid rgba(255,255,255,0.3);
                    border-top: 4px solid white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                "></div>
                <h2 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 600;">TCGtrade</h2>
                <p style="margin: 0; opacity: 0.8;">Cargando aplicación...</p>
            </div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', loadingHtml);
}

// Ocultar loading inicial
function hideInitialLoading() {
    const loading = document.getElementById('initial-loading');
    if (loading) {
        loading.style.opacity = '0';
        loading.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            loading.remove();
        }, 500);
    }
}

// Mostrar error de carga
function showLoadingError() {
    const loading = document.getElementById('initial-loading');
    if (loading) {
        loading.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                <h2 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 600;">Error de Carga</h2>
                <p style="margin: 0 0 20px 0; opacity: 0.8;">No se pudo cargar la aplicación</p>
                <p style="margin: 0 0 20px 0; opacity: 0.6; font-size: 14px;">Verifica tu conexión a internet</p>
                <button onclick="location.reload()" style="
                    background: white;
                    color: #667eea;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-right: 10px;
                ">Reintentar</button>
                <button onclick="loadApp()" style="
                    background: #667eea;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                ">Cargar Nuevamente</button>
            </div>
        `;
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadApp);
} else {
    loadApp();
}

// Exportar para uso global si es necesario
window.TCGtradeApp = app;
window.loadApp = loadApp; // Para el botón de error