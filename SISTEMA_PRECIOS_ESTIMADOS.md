# Sistema de Precios Estimados - TCGtrade

## 📋 Resumen

Sistema de estimación de precios para cartas Pokémon TCG implementado como medida previa mientras se obtienen precios reales de las APIs de TCGPlayer y CardMarket.

## ✨ Características

- ✅ Precios estimados basados en rareza de la carta
- ✅ Multiplicadores por condición de la carta (M, NM, EX, GD, LP, PL, PO)
- ✅ Multiplicadores por idioma de la carta
- ✅ Formato compatible con TCGPlayer y CardMarket
- ✅ Indicador visual en la interfaz cuando los precios son estimados
- ✅ Fácil actualización cuando lleguen precios reales

## 📁 Archivos Creados

### 1. `js/modules/price-estimator.js`
Módulo principal de estimación de precios con funciones:
- `estimateCardPrice(card)` - Estima el precio de una carta individual
- `calculateCollectionValue(cards)` - Calcula el valor total de una colección
- `formatPrice(price, currency)` - Formatea precios para visualización
- `generateTCGPlayerPrices(card)` - Genera estructura compatible con TCGPlayer
- `generateCardMarketPrices(card)` - Genera estructura compatible con CardMarket
- `addEstimatedPrices(card)` - Añade precios estimados a una carta

### 2. `js/update-estimated-prices-postgres.js`
Script para actualizar la base de datos PostgreSQL con precios estimados:
```bash
node js/update-estimated-prices-postgres.js
```

### 3. `js/update-estimated-prices.js`
Script alternativo para bases de datos SQLite locales:
```bash
node js/update-estimated-prices.js
```

## 💰 Tabla de Precios Base

| Rareza | Precio Base (EUR) |
|--------|-------------------|
| Common | €0.10 |
| Uncommon | €0.25 |
| Rare | €1.50 |
| Rare Holo | €3.00 |
| Rare Ultra | €8.00 |
| Rare Rainbow | €15.00 |
| Rare Secret | €20.00 |
| Rare Holo EX | €12.00 |
| Rare Holo GX | €10.00 |
| Rare Holo V | €8.00 |
| Rare Holo VMAX | €15.00 |
| Rare Holo VSTAR | €12.00 |
| Amazing Rare | €10.00 |
| Radiant Rare | €6.00 |
| Illustration Rare | €25.00 |
| Special Illustration Rare | €40.00 |
| Hyper Rare | €35.00 |
| Promo | €2.00 |

## 🔧 Multiplicadores de Condición

| Condición | Multiplicador | Descripción |
|-----------|---------------|-------------|
| M (Mint) | 1.5x | +50% |
| NM (Near Mint) | 1.0x | Precio base |
| EX (Excellent) | 0.8x | -20% |
| GD (Good) | 0.6x | -40% |
| LP (Light Played) | 0.4x | -60% |
| PL (Played) | 0.3x | -70% |
| PO (Poor) | 0.1x | -90% |

## 🌍 Multiplicadores de Idioma

| Idioma | Multiplicador | Nota |
|--------|---------------|------|
| Inglés | 1.2x | Idioma estándar internacional |
| Japonés | 1.1x | Alta demanda de coleccionistas |
| Español | 1.0x | Precio base |
| Francés | 0.9x | Menor circulación |
| Alemán | 0.9x | Menor circulación |
| Italiano | 0.9x | Menor circulación |
| Portugués | 0.9x | Menor circulación |
| Coreano | 1.0x | Precio base |
| Chino | 1.0x | Precio base |
| Ruso | 0.8x | Baja circulación |

## 📊 Formato de Precios Generados

### TCGPlayer
```json
{
  "prices": {
    "normal": {
      "low": 0.80,
      "mid": 1.00,
      "high": 1.30,
      "market": 0.95,
      "directLow": null
    },
    "holofoil": {
      "low": 0.96,
      "mid": 1.20,
      "high": 1.56,
      "market": 1.14,
      "directLow": null
    },
    "reverseHolofoil": {
      "low": 0.88,
      "mid": 1.10,
      "high": 1.43,
      "market": 1.05,
      "directLow": null
    },
    "updatedAt": "2025-10-03T12:00:00.000Z",
    "isEstimated": true
  }
}
```

### CardMarket
```json
{
  "prices": {
    "averageSellPrice": 1.00,
    "lowPrice": 0.75,
    "trendPrice": 1.05,
    "suggestedPrice": 1.10,
    "reverseHoloSell": 1.15,
    "reverseHoloLow": 0.86,
    "reverseHoloTrend": 1.21,
    "lowPriceExPlus": 0.85,
    "avg1": 0.95,
    "avg7": 1.00,
    "avg30": 1.02,
    "updatedAt": "2025-10-03T12:00:00.000Z",
    "isEstimated": true
  }
}
```

## 🎯 Cómo Usar

### Uso en el Módulo
```javascript
import { estimateCardPrice, addEstimatedPrices } from './js/modules/price-estimator.js';

// Estimar precio de una carta
const card = {
    rarity: 'Rare Holo',
    condition: 'NM',
    language: 'Español'
};

const priceInfo = estimateCardPrice(card);
console.log(priceInfo.estimatedPrice); // €3.00

// Añadir precios a una carta completa
const cardWithPrices = addEstimatedPrices(card);
```

### Actualizar Base de Datos

#### Para PostgreSQL en Railway:
```bash
# Asegúrate de tener DATABASE_URL en tu .env
node js/update-estimated-prices-postgres.js
```

#### Para SQLite local:
```bash
node js/update-estimated-prices.js
```

## 🎨 Interfaz de Usuario

Los precios estimados se muestran con:
- 📊 Badge "Estimado" en amarillo
- ℹ️ Nota explicativa al pie
- € Símbolo de Euro para los precios
- Misma estructura visual que precios reales

## 🔄 Actualización a Precios Reales

Cuando se obtengan precios reales de las APIs:

1. Los precios estimados tienen la bandera `isEstimated: true`
2. Al actualizar con precios reales, remover o establecer `isEstimated: false`
3. El sistema detectará automáticamente y no sobrescribirá precios reales
4. La interfaz ajustará la visualización automáticamente

## 📝 Notas Importantes

- ⚠️ Los precios estimados son aproximaciones basadas en patrones de mercado
- 🔄 Los precios reales pueden variar significativamente
- 📈 Los multiplicadores pueden ajustarse según análisis de mercado
- 🎯 Este sistema es temporal hasta obtener integración con APIs reales

## 🚀 Deployment en Railway

Los cambios están listos para:
1. Commit en la rama main
2. Push a Railway
3. Auto-deploy automático
4. Ejecutar script de actualización después del deploy:
   ```bash
   railway run node js/update-estimated-prices-postgres.js
   ```

## 🛠️ Mantenimiento

Para actualizar los precios base o multiplicadores:
1. Editar `js/modules/price-estimator.js`
2. Actualizar constantes BASE_PRICES, CONDITION_MULTIPLIERS, LANGUAGE_MULTIPLIERS
3. Volver a ejecutar el script de actualización

## 📞 Soporte

Para dudas o mejoras del sistema de precios:
- Revisar documentación en este archivo
- Consultar código fuente en `js/modules/price-estimator.js`
- Verificar logs de actualización de base de datos

---

**Fecha de Implementación**: Octubre 3, 2025  
**Versión**: 1.0.0  
**Estado**: ✅ Listo para producción
