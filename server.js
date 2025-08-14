// Railway Server - Pokemon TCG Trading App
// Express server con proxy para la API de Pokemon TCG

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Cache simple para evitar requests repetidos
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Rate limiting simple
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX = 10; // máximo 10 requests por minuto

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Función de rate limiting
function checkRateLimit(identifier) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  if (!requestCounts.has(identifier)) {
    requestCounts.set(identifier, []);
  }
  
  const requests = requestCounts.get(identifier);
  
  // Limpiar requests antiguos
  const validRequests = requests.filter(time => time > windowStart);
  requestCounts.set(identifier, validRequests);
  
  if (validRequests.length >= RATE_LIMIT_MAX) {
    return false;
  }
  
  validRequests.push(now);
  return true;
}

// Función proxy para Pokemon TCG API
async function pokemonProxy(req, res) {
  console.log('🚀 Railway Proxy - Pokemon TCG API');
  console.log('📋 URL:', req.originalUrl);
  console.log('📋 Query:', req.query);
  
  // Rate limiting por IP
  const clientIP = req.ip || req.connection.remoteAddress;
  if (!checkRateLimit(clientIP)) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Demasiadas búsquedas en poco tiempo. Intenta de nuevo en 1 minuto.',
      suggestion: 'Espera un momento antes de hacer otra búsqueda',
      timestamp: new Date().toISOString()
    });
  }

  try {
    // Extraer endpoint de la URL
    const endpoint = req.path.replace('/api/pokemontcg/', '');
    const queryString = new URLSearchParams(req.query).toString();
    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    if (!endpoint) {
      return res.status(400).json({
        error: 'Missing endpoint',
        message: 'Debes especificar un endpoint de la API',
        example: '/api/pokemontcg/cards?q=name:pikachu'
      });
    }

    // Construir URL de la API
    const baseUrl = 'https://api.pokemontcg.io/v2';
    const apiUrl = `${baseUrl}/${fullEndpoint}`;
    
    console.log('🌐 Fetching from Pokemon API:', apiUrl);
    
    // Verificar cache
    const cacheKey = apiUrl;
    const cachedData = cache.get(cacheKey);
    if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
      console.log('✅ Serving from cache');
      return res.json({
        ...cachedData.data,
        _metadata: {
          ...cachedData.data._metadata,
          cached: true,
          cacheAge: Date.now() - cachedData.timestamp
        }
      });
    }

    // Configurar headers (incluyendo API Key si está disponible)
    const apiHeaders = {
      'User-Agent': 'TCGtrade-Railway/1.0',
      'Accept': 'application/json'
    };

    // Añadir API Key si está disponible
    if (process.env.POKEMON_TCG_API_KEY) {
      apiHeaders['X-Api-Key'] = process.env.POKEMON_TCG_API_KEY;
      console.log('🔑 API Key configurada correctamente');
    } else {
      console.log('⚠️ API Key no encontrada, usando acceso público limitado');
    }

    // Hacer petición a la API con reintentos automáticos
    console.log('📡 Iniciando fetch a Pokemon API...');
    const startTime = Date.now();

    // Importar fetch dinámicamente para Node.js
    const fetch = (await import('node-fetch')).default;
    
    // Función para hacer fetch con reintentos
    async function fetchWithRetry(url, options, maxRetries = 3) {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🔄 Intento ${attempt}/${maxRetries}...`);
          
          const response = await fetch(url, {
            ...options,
            timeout: 30000 // 30 segundos de timeout
          });
          
          if (response.ok) {
            console.log(`✅ Intento ${attempt} exitoso`);
            return response;
          }
          
          // Si no es exitoso pero no es un error de red, no reintentar
          if (response.status >= 400 && response.status < 500) {
            console.log(`⚠️ Error del cliente (${response.status}), no reintentando`);
            return response;
          }
          
          console.log(`⚠️ Intento ${attempt} falló con status ${response.status}`);
          
        } catch (error) {
          console.log(`❌ Intento ${attempt} falló:`, error.message);
          
          if (attempt === maxRetries) {
            throw error;
          }
          
          // Esperar antes del siguiente intento
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    const response = await fetchWithRetry(apiUrl, {
      method: 'GET',
      headers: apiHeaders
    });

    const fetchTime = Date.now() - startTime;
    console.log(`⚡ Fetch completado en ${fetchTime}ms`);
    console.log('📊 Response status:', response.status);

    // Leer respuesta como texto primero
    const responseText = await response.text();
    console.log(`📄 Response length: ${responseText.length} characters`);
    
    // Verificar si la respuesta está vacía
    if (!responseText || responseText.trim() === '') {
      console.error('❌ Respuesta vacía de la API');
      return res.status(502).json({
        error: 'Empty response',
        message: 'La API de Pokemon TCG devolvió una respuesta vacía. Esto puede ocurrir por límites de rate o sobrecarga temporal.',
        suggestion: 'Intenta la búsqueda de nuevo en unos segundos',
        url: apiUrl,
        fetchTime: `${fetchTime}ms`,
        hasApiKey: !!process.env.POKEMON_TCG_API_KEY,
        timestamp: new Date().toISOString()
      });
    }
    
    // Verificar si la respuesta es HTML (error page)
    if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
      console.error('❌ API devolvió HTML en lugar de JSON');
      console.error('📄 Response preview:', responseText.substring(0, 500));
      
      // Detectar el tipo de error HTML
      let errorType = 'HTML Response';
      let errorMessage = 'La API de Pokemon TCG devolvió una página HTML en lugar de datos JSON';
      
      if (responseText.includes('rate limit') || responseText.includes('too many requests')) {
        errorType = 'Rate Limit';
        errorMessage = 'Se ha excedido el límite de requests. Intenta de nuevo en unos minutos.';
      } else if (responseText.includes('maintenance') || responseText.includes('service unavailable')) {
        errorType = 'Service Unavailable';
        errorMessage = 'La API de Pokemon TCG está temporalmente en mantenimiento.';
      } else if (responseText.includes('unauthorized') || responseText.includes('forbidden')) {
        errorType = 'Authentication Error';
        errorMessage = 'Error de autenticación con la API. Verifica tu API Key.';
      }
      
      return res.status(502).json({
        error: errorType,
        message: errorMessage,
        suggestion: 'Intenta la búsqueda de nuevo en unos minutos',
        url: apiUrl,
        responseType: 'HTML',
        responsePreview: responseText.substring(0, 200),
        fetchTime: `${fetchTime}ms`,
        hasApiKey: !!process.env.POKEMON_TCG_API_KEY,
        timestamp: new Date().toISOString()
      });
    }

    // Intentar parsear JSON
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('✅ JSON parseado correctamente');
    } catch (parseError) {
      console.error('❌ Error al parsear JSON:', parseError.message);
      console.error('📄 Response text preview:', responseText.substring(0, 200));
      
      return res.status(502).json({
        error: 'JSON parse error',
        message: 'Error al procesar la respuesta de la API',
        details: parseError.message,
        responsePreview: responseText.substring(0, 200),
        url: apiUrl,
        fetchTime: `${fetchTime}ms`,
        timestamp: new Date().toISOString()
      });
    }

    // Verificar status de la respuesta
    if (!response.ok) {
      console.error(`❌ API Error ${response.status}:`, data);
      return res.status(response.status).json({
        error: 'API Error',
        message: data.message || `Error ${response.status} de la API de Pokemon TCG`,
        details: data,
        url: apiUrl,
        fetchTime: `${fetchTime}ms`,
        timestamp: new Date().toISOString()
      });
    }

    // Éxito - devolver datos
    console.log(`✅ Proxy exitoso: ${data.data?.length || 'N/A'} items devueltos`);
    
    // Añadir metadata útil
    const responseData = {
      ...data,
      _metadata: {
        fetchTime: `${fetchTime}ms`,
        timestamp: new Date().toISOString(),
        hasApiKey: !!process.env.POKEMON_TCG_API_KEY,
        endpoint: fullEndpoint,
        platform: 'Railway'
      }
    };

    // Guardar en cache si la respuesta es exitosa
    if (data.data && data.data.length > 0) {
      cache.set(cacheKey, {
        data: responseData,
        timestamp: Date.now()
      });
      console.log('💾 Datos guardados en cache');
    }

    return res.json(responseData);

  } catch (error) {
    console.error('❌ Error completo en proxy:', error);
    
    let errorMessage = 'Error interno del servidor';
    let errorType = 'ServerError';
    let statusCode = 500;
    
    if (error.message.includes('fetch')) {
      errorMessage = 'Error de conexión con la API de Pokemon TCG';
      errorType = 'ConnectionError';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Timeout al conectar con la API de Pokemon TCG';
      errorType = 'TimeoutError';
      statusCode = 504;
    } else if (error.message.includes('ENOTFOUND')) {
      errorMessage = 'No se pudo resolver el dominio de la API';
      errorType = 'DNSError';
      statusCode = 502;
    }

    return res.status(statusCode).json({
      error: 'Proxy error',
      type: errorType,
      message: errorMessage,
      details: error.message,
      suggestion: 'Intenta la búsqueda de nuevo en unos segundos',
      hasApiKey: !!process.env.POKEMON_TCG_API_KEY,
      url: apiUrl,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
}

// Rutas API
app.get('/api/pokemontcg/*', pokemonProxy);

// Función de prueba
app.get('/api/test', (req, res) => {
  res.json({
    message: '✅ Railway server funcionando correctamente',
    timestamp: new Date().toISOString(),
    platform: 'Railway',
    hasApiKey: !!process.env.POKEMON_TCG_API_KEY
  });
});

// Función para verificar API Key
app.get('/api/check-api-key', (req, res) => {
  const hasApiKey = !!process.env.POKEMON_TCG_API_KEY;
  const apiKeyLength = process.env.POKEMON_TCG_API_KEY ? process.env.POKEMON_TCG_API_KEY.length : 0;
  const apiKeyStart = process.env.POKEMON_TCG_API_KEY ? process.env.POKEMON_TCG_API_KEY.substring(0, 8) + '...' : 'No configurada';
  
  res.json({
    hasApiKey: hasApiKey,
    apiKeyLength: apiKeyLength,
    apiKeyPreview: apiKeyStart,
    timestamp: new Date().toISOString(),
    message: hasApiKey ? 'API Key está configurada correctamente en Railway' : 'API Key NO está configurada',
    platform: 'Railway'
  });
});

// Función para ver el estado del cache y rate limiting
app.get('/api/cache-status', (req, res) => {
  const cacheSize = cache.size;
  const requestCount = requestCounts.size;
  
  res.json({
    cacheSize: cacheSize,
    requestCount: requestCount,
    cacheDuration: CACHE_DURATION / 1000 + ' seconds',
    rateLimitWindow: RATE_LIMIT_WINDOW / 1000 + ' seconds',
    rateLimitMax: RATE_LIMIT_MAX,
    timestamp: new Date().toISOString()
  });
});

// Función para limpiar el cache
app.get('/api/clear-cache', (req, res) => {
  const cacheSize = cache.size;
  cache.clear();
  
  res.json({
    message: 'Cache limpiado correctamente',
    previousSize: cacheSize,
    timestamp: new Date().toISOString()
  });
});

// Función para probar la API directamente
app.get('/api/test-pokemon-api', async (req, res) => {
  try {
    console.log('🧪 Testing Pokemon API directly...');
    
    const fetch = (await import('node-fetch')).default;
    const testUrl = 'https://api.pokemontcg.io/v2/cards?q=name:pikachu&pageSize=1';
    
    const apiHeaders = {
      'User-Agent': 'TCGtrade-Railway/1.0',
      'Accept': 'application/json'
    };
    
    if (process.env.POKEMON_TCG_API_KEY) {
      apiHeaders['X-Api-Key'] = process.env.POKEMON_TCG_API_KEY;
    }
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: apiHeaders,
      timeout: 10000
    });
    
    const responseText = await response.text();
    
    res.json({
      status: response.status,
      ok: response.ok,
      contentType: response.headers.get('content-type'),
      responseLength: responseText.length,
      isHTML: responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html'),
      responsePreview: responseText.substring(0, 200),
      hasApiKey: !!process.env.POKEMON_TCG_API_KEY,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Test failed',
      message: error.message,
      hasApiKey: !!process.env.POKEMON_TCG_API_KEY,
      timestamp: new Date().toISOString()
    });
  }
});

// Servir archivos estáticos (HTML, CSS, JS)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Catch-all para archivos estáticos
app.get('*', (req, res) => {
  const filePath = path.join(__dirname, req.path);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send('Archivo no encontrado');
    }
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Railway Server iniciado en puerto ${PORT}`);
  console.log(`🔑 API Key configurada: ${!!process.env.POKEMON_TCG_API_KEY ? 'SÍ' : 'NO'}`);
  console.log(`🌐 Servidor listo para recibir peticiones`);
});

// Manejar errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});