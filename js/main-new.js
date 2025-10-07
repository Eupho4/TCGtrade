/**
 * TCGtrade App - Versión Refactorizada
 * 
 * Esta es la nueva versión modular del main.js que reemplaza el archivo monolítico anterior.
 * 
 * Estructura:
 * - core/app.js: Aplicación principal
 * - services/: Servicios (Firebase, API Pokémon)
 * - ui/: Módulos de interfaz
 * - utils/: Utilidades (DOM, validación, notificaciones)
 * - constants/: Configuración y constantes
 */

// Importar la aplicación principal
import app from './core/app.js';

// La aplicación se inicializa automáticamente cuando se importa
console.log('🎮 TCGtrade App cargada - Versión Refactorizada');

// Exportar para uso global si es necesario
window.TCGtradeApp = app;