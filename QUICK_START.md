# 🚀 Quick Start - Sistema de Precios Estimados

## ⚡ Resumen Ejecutivo

Se ha implementado un **sistema completo de precios estimados** para TCGtrade como medida previa hasta obtener precios reales de APIs.

---

## 📦 ¿Qué se ha implementado?

### ✅ Código
- **Módulo de estimación**: `js/modules/price-estimator.js`
- **Script PostgreSQL**: `js/update-estimated-prices-postgres.js`
- **Script SQLite**: `js/update-estimated-prices.js`
- **UI mejorada**: `html/index.html` (con indicadores visuales)

### ✅ Documentación
- **RESUMEN_CAMBIOS.md** - Resumen completo de cambios
- **SISTEMA_PRECIOS_ESTIMADOS.md** - Documentación técnica
- **DEPLOYMENT_GUIDE.md** - Guía paso a paso de deployment

### ✅ Scripts
- **deploy.sh** - Script automatizado de deployment

---

## 🎯 Deploy en 3 Pasos

### Método Automático (Recomendado)
```bash
./deploy.sh
```

### Método Manual
```bash
# 1. Commit y push
git add .
git commit -m "feat: Sistema de precios estimados"
git push origin main

# 2. Esperar auto-deploy en Railway

# 3. Actualizar precios en BD
railway run node js/update-estimated-prices-postgres.js
```

---

## 💰 Sistema de Precios

### Fórmula
```
Precio Final = Precio Base × Multiplicador Condición × Multiplicador Idioma
```

### Ejemplo
```
Carta: Charizard V
Rareza: Rare Holo V → €8.00 (base)
Condición: Near Mint → ×1.0
Idioma: Español → ×1.0
─────────────────────────────
Precio Final: €8.00
```

### Rarezas Principales
- Common: €0.10
- Rare: €1.50
- Rare Holo V: €8.00
- Rare Holo VMAX: €15.00
- Hyper Rare: €35.00

---

## 🔍 Verificación Post-Deploy

### 1. Verificar Servicio
```bash
curl https://tu-app.railway.app/api/status
```

### 2. Ver Logs
```bash
railway logs
```

### 3. Verificar UI
1. Abre la app
2. Busca una carta
3. Verifica que aparezca:
   - ✅ Precios en EUR (€)
   - ✅ Badge "📊 Estimado"
   - ✅ Nota explicativa

---

## 📊 Características del Sistema

| Característica | Estado |
|----------------|--------|
| Precios por rareza | ✅ 18 rarezas |
| Multiplicadores condición | ✅ 7 niveles |
| Multiplicadores idioma | ✅ 10 idiomas |
| Formato TCGPlayer | ✅ Compatible |
| Formato CardMarket | ✅ Compatible |
| Indicadores UI | ✅ Implementado |
| Detección precios reales | ✅ Automática |

---

## 🎨 Visualización en UI

### Antes (sin precios)
```
┌─────────────────────────┐
│  Pikachu V              │
│  ⚡ Electric            │
│                         │
│  [Sin precios]          │
└─────────────────────────┘
```

### Después (con precios estimados)
```
┌─────────────────────────┐
│  Pikachu V   📊 Estimado│
│  ⚡ Electric            │
│                         │
│  💰 Precios de Mercado  │
│  TCGPlayer: €8.00       │
│  CardMarket: €7.50      │
│                         │
│  ℹ️ Precios estimados   │
└─────────────────────────┘
```

---

## 🔄 Transición a Precios Reales

### Automática
Cuando lleguen precios reales de APIs:
1. El sistema los detectará automáticamente
2. No sobrescribirá precios reales
3. El badge "Estimado" desaparecerá
4. **No se requiere cambio de código**

### Indicador
```javascript
{
  "prices": {
    "normal": { "mid": 8.00 },
    "isEstimated": false  // ← Se cambia a false
  }
}
```

---

## 🛠️ Comandos Útiles

```bash
# Ver estado de git
git status

# Deploy automático
./deploy.sh

# Deploy manual
git push origin main

# Actualizar precios
railway run node js/update-estimated-prices-postgres.js

# Ver logs en tiempo real
railway logs --follow

# Abrir app
railway open

# Ver variables de entorno
railway variables
```

---

## 📁 Estructura de Archivos

```
/workspace
├── js/
│   ├── modules/
│   │   └── price-estimator.js           (8.3K) ✨ NEW
│   ├── update-estimated-prices.js       (9.6K) ✨ NEW
│   └── update-estimated-prices-postgres.js (8.5K) ✨ NEW
│
├── html/
│   └── index.html                       (Modified) 🔧
│
├── SISTEMA_PRECIOS_ESTIMADOS.md         (6.2K) ✨ NEW
├── DEPLOYMENT_GUIDE.md                  (6.5K) ✨ NEW
├── RESUMEN_CAMBIOS.md                   (6.9K) ✨ NEW
├── QUICK_START.md                       (Este archivo) ✨ NEW
├── deploy.sh                            (6.3K) ✨ NEW
└── README.md                            (Modified) 🔧

Total: 7 archivos nuevos + 2 modificados
Tamaño total: ~60KB de código y documentación
```

---

## ⚠️ Notas Importantes

### Antes del Deploy
- ✅ Verificar que DATABASE_URL esté configurada en Railway
- ✅ Revisar que el código esté en la rama main
- ✅ Backup de base de datos (opcional pero recomendado)

### Después del Deploy
- ⚠️ **Importante**: Ejecutar el script de actualización de precios
- ⚠️ Verificar que al menos 3 cartas muestren precios correctamente
- ⚠️ Revisar logs por posibles errores

### Limitaciones
- Los precios son estimaciones aproximadas
- No considera factores especiales (1st Edition, Shadowless, etc.)
- Los multiplicadores son valores promedio del mercado

---

## 🎯 Siguiente Paso

### ¡Hacer el Deploy!

```bash
# Opción 1: Automático
./deploy.sh

# Opción 2: Manual
git add . && git commit -m "feat: Sistema de precios estimados" && git push origin main
```

### Después del Deploy
```bash
# Esperar 1-2 minutos para que complete el deploy en Railway
# Luego ejecutar:
railway run node js/update-estimated-prices-postgres.js
```

---

## 📞 Ayuda Rápida

### ¿Algo salió mal?
1. Revisa [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) → Sección "Troubleshooting"
2. Verifica logs: `railway logs`
3. Verifica variables: `railway variables`

### ¿Necesitas más info?
- **Detalles técnicos**: [SISTEMA_PRECIOS_ESTIMADOS.md](SISTEMA_PRECIOS_ESTIMADOS.md)
- **Guía completa**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Resumen de cambios**: [RESUMEN_CAMBIOS.md](RESUMEN_CAMBIOS.md)

---

## ✅ Checklist Final

- [ ] Leer este Quick Start
- [ ] Ejecutar `./deploy.sh` o deploy manual
- [ ] Esperar auto-deploy en Railway
- [ ] Ejecutar script de actualización de precios
- [ ] Verificar 3 cartas en la UI
- [ ] Revisar logs sin errores
- [ ] Marcar como completado ✓

---

**🎉 ¡Listo para Producción!**

Todo está preparado para hacer el push a main y el auto-deploy en Railway.

---

*Última actualización: Octubre 3, 2025*  
*Versión: 1.0.0*  
*Estado: ✅ Listo*
