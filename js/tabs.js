// TCGtrade - Funciones de Tabs
// JavaScript extraído del HTML para mejor organización

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
        case 'newFeatures':
            targetContent = document.getElementById('helpNewFeaturesContent');
            targetTab = document.getElementById('helpNewFeaturesTab');
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

// Exportar funciones para uso global
window.switchHelpTab = switchHelpTab;
window.switchTradeTab = switchTradeTab;

console.log('🚀 Módulo de tabs cargado');