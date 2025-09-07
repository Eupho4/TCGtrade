#!/bin/bash

echo "🔍 Monitoreando migración de cartas Pokemon TCG..."
echo "=================================================="

while true; do
    # Verificar si el proceso está corriendo
    if pgrep -f "continue-migration.js" > /dev/null; then
        echo "✅ Migración en progreso - $(date)"
        
        # Mostrar las últimas líneas del log
        echo "📄 Últimas líneas del log:"
        tail -3 /workspace/migration.log
        echo ""
        
        # Verificar el tamaño de la base de datos
        if [ -f "/workspace/data/cards.db" ]; then
            size=$(du -h /workspace/data/cards.db | cut -f1)
            echo "💾 Tamaño de DB: $size"
        fi
        
        echo "⏳ Esperando 30 segundos..."
        echo "=================================================="
        sleep 30
    else
        echo "❌ Migración completada o detenida"
        echo "📄 Últimas líneas del log:"
        tail -10 /workspace/migration.log
        break
    fi
done