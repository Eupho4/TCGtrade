#!/bin/bash

# Script de deployment para TCGtrade con sistema de precios estimados
# Ejecutar: chmod +x deploy.sh && ./deploy.sh

echo "🚀 TCGtrade - Script de Deployment"
echo "═══════════════════════════════════"
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Verificar que estamos en la rama main
print_status "Verificando rama actual..."
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    print_warning "No estás en la rama main (actual: $CURRENT_BRANCH)"
    read -p "¿Deseas continuar de todos modos? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Deployment cancelado"
        exit 1
    fi
else
    print_success "En rama main"
fi

# Verificar cambios pendientes
print_status "Verificando cambios..."
if [[ -n $(git status -s) ]]; then
    print_success "Se encontraron cambios para commitear"
    git status -s
    echo ""
else
    print_warning "No hay cambios pendientes"
    read -p "¿Deseas hacer push de todos modos? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        print_status "Haciendo push sin nuevos cambios..."
    else
        print_error "Deployment cancelado"
        exit 1
    fi
fi

# Confirmar deployment
echo ""
print_warning "═══════════════════════════════════"
print_warning "  RESUMEN DE CAMBIOS A DEPLOYAR"
print_warning "═══════════════════════════════════"
echo ""
echo "Archivos nuevos:"
echo "  • js/modules/price-estimator.js"
echo "  • js/update-estimated-prices-postgres.js"
echo "  • js/update-estimated-prices.js"
echo "  • SISTEMA_PRECIOS_ESTIMADOS.md"
echo "  • DEPLOYMENT_GUIDE.md"
echo "  • RESUMEN_CAMBIOS.md"
echo ""
echo "Archivos modificados:"
echo "  • html/index.html (UI mejorada)"
echo ""
echo "Funcionalidades:"
echo "  ✓ Sistema de precios estimados"
echo "  ✓ Indicadores visuales en UI"
echo "  ✓ Scripts de actualización de BD"
echo "  ✓ Formato EUR para precios"
echo ""
read -p "¿Proceder con el deployment? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Deployment cancelado por el usuario"
    exit 1
fi

# Git add
print_status "Añadiendo archivos..."
git add .
if [ $? -eq 0 ]; then
    print_success "Archivos añadidos correctamente"
else
    print_error "Error al añadir archivos"
    exit 1
fi

# Git commit
print_status "Creando commit..."
git commit -m "feat: Implementar sistema de precios estimados

- Añadir módulo price-estimator.js con funciones de estimación
- Crear scripts de actualización para PostgreSQL y SQLite
- Actualizar UI con indicadores visuales de precios estimados
- Cambiar formato de precios a EUR
- Añadir documentación completa (SISTEMA_PRECIOS_ESTIMADOS.md)
- Añadir guía de deployment (DEPLOYMENT_GUIDE.md)

Sistema listo como medida previa hasta obtener precios reales de APIs."

if [ $? -eq 0 ]; then
    print_success "Commit creado correctamente"
else
    print_warning "No hay cambios para commitear o error en commit"
fi

# Git push
print_status "Haciendo push a origin main..."
git push origin main

if [ $? -eq 0 ]; then
    print_success "Push realizado correctamente"
    echo ""
    print_success "═══════════════════════════════════"
    print_success "  ✓ DEPLOYMENT INICIADO EN RAILWAY"
    print_success "═══════════════════════════════════"
    echo ""
    print_status "Próximos pasos:"
    echo "  1. Espera a que Railway complete el deployment"
    echo "  2. Ejecuta: railway run node js/update-estimated-prices-postgres.js"
    echo "  3. Verifica en: https://tu-app.railway.app"
    echo ""
    print_status "Comandos útiles:"
    echo "  • railway logs              - Ver logs en tiempo real"
    echo "  • railway status            - Ver estado del deployment"
    echo "  • railway open              - Abrir app en navegador"
    echo ""
else
    print_error "Error al hacer push"
    print_warning "Verifica tu conexión y permisos de git"
    exit 1
fi

# Preguntar si desea actualizar precios inmediatamente
echo ""
read -p "¿Deseas actualizar los precios en Railway ahora? (requiere Railway CLI) (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Verificando Railway CLI..."
    if command -v railway &> /dev/null; then
        print_success "Railway CLI encontrado"
        print_status "Esperando 30 segundos para que complete el deployment..."
        sleep 30
        print_status "Ejecutando actualización de precios..."
        railway run node js/update-estimated-prices-postgres.js
        if [ $? -eq 0 ]; then
            print_success "Precios actualizados correctamente"
        else
            print_error "Error al actualizar precios"
            print_warning "Ejecuta manualmente: railway run node js/update-estimated-prices-postgres.js"
        fi
    else
        print_warning "Railway CLI no instalado"
        print_status "Instala con: npm i -g @railway/cli"
        print_status "Luego ejecuta: railway run node js/update-estimated-prices-postgres.js"
    fi
else
    print_status "Actualización de precios omitida"
    print_warning "Recuerda ejecutar manualmente:"
    echo "  railway run node js/update-estimated-prices-postgres.js"
fi

echo ""
print_success "═══════════════════════════════════"
print_success "  ✓ PROCESO COMPLETADO"
print_success "═══════════════════════════════════"
echo ""
print_status "Documentación:"
echo "  • RESUMEN_CAMBIOS.md           - Resumen completo"
echo "  • SISTEMA_PRECIOS_ESTIMADOS.md - Doc técnica"
echo "  • DEPLOYMENT_GUIDE.md          - Guía detallada"
echo ""
print_success "¡Deployment exitoso! 🎉"
