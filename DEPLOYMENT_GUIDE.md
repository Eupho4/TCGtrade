# Guía de Deployment en Railway - TCGtrade

## 🚀 Resumen de Cambios Implementados

### Nuevas Funcionalidades
✅ Sistema de precios estimados para todas las cartas  
✅ Módulo de estimación de precios (`price-estimator.js`)  
✅ Scripts de actualización de base de datos  
✅ Indicadores visuales de precios estimados en la UI  
✅ Formato EUR para precios  

## 📋 Checklist Pre-Deployment

### 1. Verificar Variables de Entorno en Railway
Asegúrate de que las siguientes variables estén configuradas:

```
DATABASE_URL=postgresql://...
DATABASE_PUBLIC_URL=postgresql://...
PORT=8080
NODE_ENV=production
POKEMON_TCG_API_KEY=tu_api_key (si aplica)
```

### 2. Archivos Modificados
- ✅ `js/modules/price-estimator.js` (nuevo)
- ✅ `js/update-estimated-prices-postgres.js` (nuevo)
- ✅ `js/update-estimated-prices.js` (nuevo - fallback SQLite)
- ✅ `html/index.html` (actualizado - visualización de precios)
- ✅ `SISTEMA_PRECIOS_ESTIMADOS.md` (nuevo - documentación)
- ✅ `DEPLOYMENT_GUIDE.md` (nuevo - este archivo)

### 3. Verificar package.json
```json
{
  "scripts": {
    "start": "node server-hybrid.js",
    "dev": "node server-hybrid.js",
    "build": "echo 'Build completed for Railway'",
    "update-prices": "node js/update-estimated-prices-postgres.js"
  }
}
```

## 🔧 Pasos para el Deployment

### Opción 1: Push Directo (Recomendado)

```bash
# 1. Verificar estado del repositorio
git status

# 2. Añadir cambios
git add .

# 3. Commit con mensaje descriptivo
git commit -m "feat: Implementar sistema de precios estimados

- Añadir módulo price-estimator.js
- Crear scripts de actualización de BD
- Actualizar UI con indicadores de precios estimados
- Cambiar formato a EUR
- Añadir documentación completa"

# 4. Push a la rama main
git push origin main
```

### Opción 2: Railway CLI

```bash
# 1. Login en Railway
railway login

# 2. Link al proyecto
railway link

# 3. Deploy
railway up
```

## 📊 Post-Deployment: Actualizar Precios en Base de Datos

### Método 1: Desde Railway Dashboard

1. Ir a Railway Dashboard
2. Seleccionar tu proyecto
3. Ir a la pestaña "Terminal" o "Shell"
4. Ejecutar:
```bash
node js/update-estimated-prices-postgres.js
```

### Método 2: Railway CLI (Local)

```bash
# Ejecutar comando en el servicio de Railway
railway run node js/update-estimated-prices-postgres.js
```

### Método 3: Añadir al script de inicio (Opcional)

Modificar `package.json`:
```json
{
  "scripts": {
    "start": "node server-hybrid.js",
    "postinstall": "node js/update-estimated-prices-postgres.js"
  }
}
```

⚠️ **Nota**: El método 3 ejecutará el script en cada deploy, lo cual puede ser lento.

## 🔍 Verificación Post-Deployment

### 1. Verificar el Servicio
```bash
curl https://tu-app.railway.app/api/status
```

Respuesta esperada:
```json
{
  "status": "online",
  "timestamp": "2025-10-03T...",
  "searchEngine": "PostgreSQL en Railway",
  "totalCards": 19500,
  "databaseType": "PostgreSQL"
}
```

### 2. Verificar Precios en una Carta

Busca una carta en la interfaz y verifica:
- ✅ Se muestran precios
- ✅ Aparece el badge "📊 Estimado"
- ✅ Los precios están en EUR (€)
- ✅ Aparece la nota explicativa

### 3. Verificar Logs

```bash
railway logs
```

Busca líneas como:
```
✅ Base de datos actualizada correctamente
📊 Total de cartas a actualizar: 19500
✅ Cartas actualizadas: XXXX
```

## 🐛 Troubleshooting

### Error: "DATABASE_URL no está configurada"

**Solución**: 
```bash
# Verificar variables de entorno
railway variables

# Añadir si falta
railway variables set DATABASE_URL=postgresql://...
```

### Error: "Cannot find module 'pg'"

**Solución**:
```bash
# Asegurarse de que pg está en package.json
npm install pg

# Commit y push
git add package.json package-lock.json
git commit -m "fix: Añadir dependencia pg"
git push origin main
```

### Los precios no se muestran

**Solución**:
1. Verificar que el script de actualización se ejecutó correctamente
2. Verificar logs de Railway
3. Ejecutar manualmente: `railway run node js/update-estimated-prices-postgres.js`

### Error: "Permission denied on table cards"

**Solución**:
Verificar permisos de la base de datos PostgreSQL en Railway:
```sql
GRANT ALL PRIVILEGES ON TABLE cards TO your_user;
```

## 📈 Monitoreo Post-Deployment

### Métricas a Verificar

1. **Performance**:
   - Tiempo de respuesta de búsqueda de cartas
   - Carga inicial de la página
   - Tiempo de carga de detalles de carta

2. **Logs Importantes**:
   ```
   ✅ Conectado a PostgreSQL exitosamente
   ✅ Base de datos PostgreSQL inicializada correctamente
   🌐 GET /api/search?q=pikachu
   ```

3. **Errores a Monitorear**:
   - Errores de conexión a la base de datos
   - Timeouts en búsquedas
   - Errores 500 en endpoints

## 🔄 Rollback (Si algo sale mal)

### Opción 1: Revert en Git
```bash
# Encontrar el commit anterior
git log --oneline

# Revert al commit anterior
git revert HEAD

# Push
git push origin main
```

### Opción 2: Railway Rollback
1. Ir a Railway Dashboard
2. Pestaña "Deployments"
3. Seleccionar deployment anterior
4. Clic en "Redeploy"

## 📝 Notas Adicionales

### Frecuencia de Actualización de Precios
- Los precios estimados se calculan una vez durante el deploy
- Para actualizar precios existentes, ejecutar el script manualmente
- Futuros precios reales de APIs sobrescribirán los estimados automáticamente

### Compatibilidad con APIs Reales
El sistema está diseñado para:
1. Detectar precios reales vs estimados (flag `isEstimated`)
2. No sobrescribir precios reales con estimados
3. Actualización transparente cuando lleguen precios reales

### Backups
Antes del deploy, considera hacer backup de la base de datos:
```bash
railway connect
# Dentro de la conexión PostgreSQL:
pg_dump > backup_$(date +%Y%m%d).sql
```

## ✅ Checklist Final

- [ ] Variables de entorno configuradas en Railway
- [ ] Código commiteado y pusheado a main
- [ ] Deploy exitoso (verificar en Railway Dashboard)
- [ ] Script de actualización de precios ejecutado
- [ ] Verificar al menos 3 cartas en la UI
- [ ] Logs revisados sin errores críticos
- [ ] Performance aceptable
- [ ] Documentación actualizada

## 🎉 ¡Deployment Completo!

Una vez completados todos los pasos, el sistema estará:
- ✅ En producción en Railway
- ✅ Con precios estimados para todas las cartas
- ✅ Interfaz actualizada con indicadores visuales
- ✅ Listo para recibir actualizaciones de precios reales

---

**Última actualización**: Octubre 3, 2025  
**Responsable**: Sistema de precios estimados v1.0.0  
**Estado**: ✅ Listo para deployment
