#!/bin/bash

echo "🔍 Verificando sincronización de Railway..."
echo "=========================================="

# Función para verificar el estado
check_sync() {
    echo "⏰ $(date '+%H:%M:%S') - Verificando estado..."
    
    # Obtener total de cartas
    CARDS_COUNT=$(curl -s "https://tcgtrade-production.up.railway.app/api/pokemontcg/cards?pageSize=1" | grep -o '"totalCount":[0-9]*' | cut -d':' -f2)
    
    # Obtener total de sets
    SETS_COUNT=$(curl -s "https://tcgtrade-production.up.railway.app/api/pokemontcg/sets?pageSize=1" | grep -o '"totalCount":[0-9]*' | cut -d':' -f2)
    
    # Obtener timestamp de última actualización
    LAST_UPDATED=$(curl -s "https://tcgtrade-production.up.railway.app/api/status" | grep -o '"lastUpdated":"[^"]*"' | cut -d'"' -f4)
    
    echo "📊 Estado actual:"
    echo "   🎴 Cartas: $CARDS_COUNT"
    echo "   📚 Sets: $SETS_COUNT"
    echo "   🕒 Última actualización: $LAST_UPDATED"
    
    # Verificar si está sincronizado
    if [ "$CARDS_COUNT" -ge "19500" ] && [ "$SETS_COUNT" -eq "168" ]; then
        echo "✅ ¡SINCRONIZACIÓN COMPLETA!"
        echo "   🎉 Todas las cartas y sets están disponibles"
        return 0
    else
        echo "⏳ Sincronización en progreso..."
        echo "   📈 Progreso: $((CARDS_COUNT * 100 / 19500))%"
        return 1
    fi
}

# Verificar inicial
check_sync

# Si no está completo, monitorear cada minuto
if [ $? -ne 0 ]; then
    echo ""
    echo "🔄 Monitoreando cada 60 segundos..."
    echo "   Presiona Ctrl+C para detener"
    echo "=========================================="
    
    while true; do
        sleep 60
        if check_sync; then
            echo ""
            echo "🎉 ¡Sincronización completada exitosamente!"
            break
        fi
        echo ""
    done
fi