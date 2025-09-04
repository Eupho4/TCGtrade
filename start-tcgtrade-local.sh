#!/bin/bash

# ==============================================
# TCGtrade Local - Script de Inicio
# ==============================================
# Este script inicia todo el sistema TCGtrade local
# con base de datos SQLite y API local

echo "🚀 Iniciando TCGtrade Local..."
echo "=================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes con colores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar si Node.js está instalado
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js no está instalado. Por favor instala Node.js primero."
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    print_success "Node.js encontrado: $NODE_VERSION"
}

# Verificar si npm está instalado
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm no está instalado. Por favor instala npm primero."
        exit 1
    fi
    
    NPM_VERSION=$(npm --version)
    print_success "npm encontrado: $NPM_VERSION"
}

# Verificar dependencias
check_dependencies() {
    print_status "Verificando dependencias..."
    
    if [ ! -f "package.json" ]; then
        print_warning "package.json no encontrado. Instalando dependencias básicas..."
        npm init -y
    fi
    
    # Verificar si las dependencias están instaladas
    if [ ! -d "node_modules" ]; then
        print_status "Instalando dependencias..."
        npm install sqlite3 express cors
    else
        print_success "Dependencias ya instaladas"
    fi
}

# Crear directorio de datos si no existe
setup_data_directory() {
    if [ ! -d "data" ]; then
        print_status "Creando directorio de datos..."
        mkdir -p data
        print_success "Directorio de datos creado"
    else
        print_success "Directorio de datos ya existe"
    fi
}

# Verificar si la base de datos ya tiene datos
check_database() {
    if [ -f "data/cards.db" ]; then
        DB_SIZE=$(du -h data/cards.db | cut -f1)
        print_success "Base de datos encontrada: $DB_SIZE"
        
        # Verificar si tiene datos
        if [ -s "data/cards.db" ]; then
            print_success "Base de datos contiene datos"
            return 0
        else
            print_warning "Base de datos está vacía"
            return 1
        fi
    else
        print_warning "Base de datos no encontrada"
        return 1
    fi
}

# Migrar datos de ejemplo si es necesario
migrate_sample_data() {
    print_status "Verificando si es necesario migrar datos..."
    
    if ! check_database; then
        print_status "Migrando datos de ejemplo..."
        node js/migrate-sample-data.js
        
        if [ $? -eq 0 ]; then
            print_success "Datos de ejemplo migrados correctamente"
        else
            print_error "Error migrando datos de ejemplo"
            exit 1
        fi
    else
        print_success "Base de datos ya tiene datos"
    fi
}

# Iniciar servidor de API local
start_api_server() {
    print_status "Iniciando servidor de API local..."
    
    # Verificar si el puerto 3002 está disponible
    if lsof -Pi :3002 -sTCP:LISTEN -t >/dev/null ; then
        print_warning "Puerto 3002 ya está en uso. Deteniendo proceso anterior..."
        pkill -f "local-api-server.js"
        sleep 2
    fi
    
    # Iniciar servidor en background
    nohup node js/local-api-server.js > logs/api-server.log 2>&1 &
    API_PID=$!
    
    # Esperar a que el servidor esté listo
    print_status "Esperando a que el servidor esté listo..."
    for i in {1..30}; do
        if curl -s http://localhost:3002/api/status > /dev/null 2>&1; then
            print_success "Servidor de API local iniciado en puerto 3002"
            break
        fi
        
        if [ $i -eq 30 ]; then
            print_error "Timeout esperando servidor de API"
            exit 1
        fi
        
        sleep 1
    done
}

# Crear directorio de logs
setup_logs() {
    if [ ! -d "logs" ]; then
        print_status "Creando directorio de logs..."
        mkdir -p logs
        print_success "Directorio de logs creado"
    fi
}

# Mostrar información del sistema
show_system_info() {
    echo ""
    echo "🎉 TCGtrade Local está funcionando!"
    echo "=================================="
    echo ""
    echo "🌐 URLs disponibles:"
    echo "  - TCGtrade Principal: http://localhost:3002"
    echo "  - Panel de Admin: http://localhost:3002/admin-panel.html"
    echo "  - API Status: http://localhost:3002/api/status"
    echo ""
    echo "📊 Base de datos:"
    echo "  - Ubicación: ./data/cards.db"
    echo "  - Tamaño: $(du -h data/cards.db 2>/dev/null | cut -f1 || echo 'N/A')"
    echo ""
    echo "🔧 Comandos útiles:"
    echo "  - Ver logs: tail -f logs/api-server.log"
    echo "  - Detener servidor: pkill -f 'local-api-server.js'"
    echo "  - Reiniciar: ./start-tcgtrade-local.sh"
    echo ""
    echo "💡 Para acceder a TCGtrade, abre: http://localhost:3002"
    echo ""
}

# Función de limpieza al salir
cleanup() {
    print_status "Deteniendo servidor..."
    if [ ! -z "$API_PID" ]; then
        kill $API_PID 2>/dev/null
    fi
    pkill -f "local-api-server.js" 2>/dev/null
    print_success "Servidor detenido"
    exit 0
}

# Capturar señales de salida
trap cleanup SIGINT SIGTERM

# Función principal
main() {
    echo ""
    print_status "Iniciando TCGtrade Local..."
    echo ""
    
    # Verificaciones iniciales
    check_node
    check_npm
    check_dependencies
    setup_data_directory
    setup_logs
    
    # Migrar datos si es necesario
    migrate_sample_data
    
    # Iniciar servidor
    start_api_server
    
    # Mostrar información del sistema
    show_system_info
    
    # Mantener el script corriendo
    print_status "Presiona Ctrl+C para detener el servidor..."
    while true; do
        sleep 1
    done
}

# Ejecutar función principal
main "$@"