# 🚂 Deploy en Railway - TCGtrade

## Pasos para Deploy en Railway

### 1. Crear cuenta en Railway
- Ve a [railway.app](https://railway.app)
- Regístrate con tu cuenta de GitHub
- Conecta tu repositorio

### 2. Variables de Entorno en Railway
En el dashboard de Railway, añade estas variables:

```
POKEMON_TCG_API_KEY=tu_api_key_aqui
EBAY_APP_ID=tu_app_id_ebay
NODE_ENV=production
PORT=3000
```

### 3. Obtener API Key de Pokémon TCG
1. Ve a [pokemontcg.io](https://pokemontcg.io)
2. Regístrate/inicia sesión
3. Ve a tu dashboard
4. Copia tu API Key

### 4. Configurar en Railway
1. En tu proyecto de Railway
2. Ve a "Variables"
3. Añade: `POKEMON_TCG_API_KEY` = tu_api_key

### 5. Deploy Automático
Railway hará deploy automáticamente cuando hagas push a GitHub.

## URLs de Prueba

Una vez deployado, prueba estas URLs:

- **Aplicación principal**: `https://tu-app.railway.app`
- **Test del servidor**: `https://tu-app.railway.app/api/test`
- **Verificar API Key**: `https://tu-app.railway.app/api/check-api-key`
- **Búsqueda de cartas**: `https://tu-app.railway.app/api/pokemontcg/cards?q=name:pikachu`

## Ventajas de Railway vs Netlify

✅ **Sin límites de timeout** (Netlify tenía 10s)
✅ **Mejor rendimiento para APIs**
✅ **Deploy automático desde GitHub**
✅ **Logs en tiempo real**
✅ **Variables de entorno fáciles de configurar**

## Troubleshooting

### Si el deploy falla:
1. Verifica que `package.json` tenga todas las dependencias
2. Asegúrate de que `server.js` esté en la raíz
3. Revisa los logs en Railway

### Si la API no funciona:
1. Verifica que `POKEMON_TCG_API_KEY` esté configurada
2. Prueba `/api/test` para verificar el servidor
3. Revisa los logs para errores específicos

## Costos

- **Plan gratuito**: $5 de crédito/mes
- **Plan Pro**: $20/mes
- **Nuestro uso**: ~$5-10/mes (muy económico)