#!/bin/bash

echo "🚀 Iniciando migración asiática de cartas Pokémon..."
echo "📅 Fecha: $(date)"
echo "📋 Idiomas: Japonés, Coreano, Chino (Simplificado y Tradicional)"
echo ""

# Crear directorio de logs si no existe
mkdir -p logs

# Ejecutar migración en background con nohup
nohup node js/asian-migration.js > logs/asian-migration-$(date +%Y%m%d_%H%M%S).log 2>&1 &

# Obtener PID del proceso
MIGRATION_PID=$!

echo "✅ Migración iniciada en background"
echo "🆔 PID del proceso: $MIGRATION_PID"
echo "📄 Log: logs/asian-migration-$(date +%Y%m%d_%H%M%S).log"
echo ""
echo "Para monitorear el progreso:"
echo "  tail -f logs/asian-migration-*.log"
echo ""
echo "Para detener la migración:"
echo "  kill $MIGRATION_PID"
echo ""
echo "Para verificar el estado:"
echo "  ps aux | grep asian-migration"

# Guardar PID en archivo para referencia
echo $MIGRATION_PID > asian-migration.pid
echo "💾 PID guardado en asian-migration.pid"