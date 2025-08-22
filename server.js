// Railway Server - Pokemon TCG Trading App
// Express server con proxy para la API de Pokemon TCG

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Cache mejorado para uso público
const cache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos (más largo para uso público)

// Rate limiting optimizado para múltiples usuarios
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX = 50; // 50 requests por minuto (más permisivo)

// Cache de respuestas vacías para evitar requests repetidos a la API
const emptyResponseCache = new Map();
const EMPTY_CACHE_DURATION = 2 * 60 * 1000; // 2 minutos para respuestas vacías

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
      
      // Cache de respuestas vacías para evitar requests repetidos
      emptyResponseCache.set(cacheKey, {
        timestamp: Date.now(),
        count: (emptyResponseCache.get(cacheKey)?.count || 0) + 1
      });
      
      const emptyCacheData = emptyResponseCache.get(cacheKey);
      const timeSinceLastEmpty = Date.now() - emptyCacheData.timestamp;
      
      // Si hemos tenido muchas respuestas vacías recientemente, sugerir esperar
      if (emptyCacheData.count >= 3 && timeSinceLastEmpty < EMPTY_CACHE_DURATION) {
        return res.status(502).json({
          error: 'API temporarily unavailable',
          message: 'La API de Pokemon TCG está temporalmente sobrecargada. Intenta de nuevo en 2 minutos.',
          suggestion: 'La API está experimentando alta demanda. Espera un momento antes de intentar de nuevo.',
          retryAfter: Math.ceil((EMPTY_CACHE_DURATION - timeSinceLastEmpty) / 1000),
          url: apiUrl,
          fetchTime: `${fetchTime}ms`,
          hasApiKey: !!process.env.POKEMON_TCG_API_KEY,
          timestamp: new Date().toISOString()
        });
      }
      
      // Intentar fallback para búsquedas populares
      const query = req.query.q || '';
      const searchTerm = query.toLowerCase().replace(/name:\*|\*/g, '').trim();
      
      if (fallbackData[searchTerm]) {
        console.log('🔄 Usando datos de fallback para:', searchTerm);
        return res.json({
          ...fallbackData[searchTerm],
          _metadata: {
            fetchTime: `${fetchTime}ms`,
            timestamp: new Date().toISOString(),
            hasApiKey: !!process.env.POKEMON_TCG_API_KEY,
            endpoint: fullEndpoint,
            platform: 'Railway',
            fallback: true,
            message: 'Datos de fallback - API temporalmente no disponible'
          }
        });
      }
      
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

// Endpoint de búsqueda en eBay (Finding API)
app.get('/api/ebay/search', async (req, res) => {
  try {
    const clientIP = req.ip || req.connection.remoteAddress;
    if (!checkRateLimit(clientIP)) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Demasiadas búsquedas en poco tiempo. Intenta de nuevo en 1 minuto.',
        timestamp: new Date().toISOString()
      });
    }

    const appId = process.env.EBAY_APP_ID;
    if (!appId) {
      return res.status(500).json({
        error: 'EBAY_APP_ID not configured',
        message: 'Configura la variable de entorno EBAY_APP_ID en Railway',
        timestamp: new Date().toISOString()
      });
    }

    const query = (req.query.q || '').toString().trim();
    const page = parseInt(req.query.page || '1', 10) || 1;
    const entriesPerPage = Math.min(parseInt(req.query.pageSize || '24', 10) || 24, 100);

    if (!query) {
      return res.status(400).json({
        error: 'Missing query',
        message: 'Debes especificar un parámetro de búsqueda ?q=',
        example: '/api/ebay/search?q=pokemon cards',
        timestamp: new Date().toISOString()
      });
    }

    const params = new URLSearchParams({
      'OPERATION-NAME': 'findItemsByKeywords',
      'SERVICE-VERSION': '1.13.0',
      'SECURITY-APPNAME': appId,
      'RESPONSE-DATA-FORMAT': 'JSON',
      'REST-PAYLOAD': 'true',
      keywords: query,
      'paginationInput.entriesPerPage': String(entriesPerPage),
      'paginationInput.pageNumber': String(page)
    });

    const apiUrl = `https://svcs.ebay.com/services/search/FindingService/v1?${params.toString()}`;

    const cacheKey = `ebay:${apiUrl}`;
    const cached = cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return res.json({ ...cached.data, _cached: true });
    }

    const fetch = (await import('node-fetch')).default;
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-EBAY-SOA-SECURITY-APPNAME': appId,
        'User-Agent': 'TCGtrade-Railway/1.0'
      },
      timeout: 15000
    });

    const text = await response.text();
    if (!response.ok) {
      return res.status(response.status).json({
        error: 'eBay API error',
        status: response.status,
        preview: text.substring(0, 200)
      });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(502).json({ error: 'Invalid JSON from eBay', preview: text.substring(0, 200) });
    }

    const items = data?.findItemsByKeywordsResponse?.[0]?.searchResult?.[0]?.item || [];
    const pagination = {
      page,
      entriesPerPage,
      totalEntries: Number(data?.findItemsByKeywordsResponse?.[0]?.paginationOutput?.[0]?.totalEntries?.[0] || 0),
      totalPages: Number(data?.findItemsByKeywordsResponse?.[0]?.paginationOutput?.[0]?.totalPages?.[0] || 0)
    };

    const mapped = items.map(it => ({
      id: it?.itemId?.[0],
      title: it?.title?.[0],
      galleryUrl: it?.galleryURL?.[0],
      viewItemUrl: it?.viewItemURL?.[0],
      price: Number(it?.sellingStatus?.[0]?.currentPrice?.[0]?.__value__ || 0),
      currency: it?.sellingStatus?.[0]?.currentPrice?.[0]?.['@currencyId'] || 'USD',
      condition: it?.condition?.[0]?.conditionDisplayName?.[0] || undefined,
      location: it?.location?.[0] || undefined,
      shippingInfo: it?.shippingInfo?.[0] || undefined
    }));

    const payload = { query, pagination, items: mapped, timestamp: new Date().toISOString() };

    cache.set(cacheKey, { data: payload, timestamp: Date.now() });

    res.json(payload);
  } catch (error) {
    console.error('❌ eBay search error:', error);
    res.status(500).json({ error: 'Internal error', message: error.message });
  }
});

// Función de prueba
app.get('/api/test', (req, res) => {
  res.json({
    message: '✅ Railway server funcionando correctamente',
    timestamp: new Date().toISOString(),
    platform: 'Railway',
    hasApiKey: !!process.env.POKEMON_TCG_API_KEY,
    deployVersion: 'Profile Section v2.0'
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
  const emptyCacheSize = emptyResponseCache.size;
  const requestCount = requestCounts.size;
  
  res.json({
    cacheSize: cacheSize,
    emptyCacheSize: emptyCacheSize,
    requestCount: requestCount,
    cacheDuration: CACHE_DURATION / 1000 + ' seconds',
    emptyCacheDuration: EMPTY_CACHE_DURATION / 1000 + ' seconds',
    rateLimitWindow: RATE_LIMIT_WINDOW / 1000 + ' seconds',
    rateLimitMax: RATE_LIMIT_MAX,
    fallbackDataAvailable: Object.keys(fallbackData),
    timestamp: new Date().toISOString()
  });
});

// Función para limpiar el cache
app.get('/api/clear-cache', (req, res) => {
  const cacheSize = cache.size;
  const emptyCacheSize = emptyResponseCache.size;
  cache.clear();
  emptyResponseCache.clear();
  
  res.json({
    message: 'Cache limpiado correctamente',
    previousCacheSize: cacheSize,
    previousEmptyCacheSize: emptyCacheSize,
    timestamp: new Date().toISOString()
  });
});

// Datos de fallback expandidos para búsquedas populares
const fallbackData = {
  'pikachu': {
    data: [
      {
        id: 'basep-1',
        name: 'Pikachu',
        supertype: 'Pokémon',
        subtypes: ['Basic'],
        hp: '60',
        types: ['Lightning'],
        set: { name: 'Wizards Black Star Promos', series: 'Base' },
        images: { small: 'https://images.pokemontcg.io/basep/1.png' }
      }
    ],
    totalCount: 1
  },
  'charizard': {
    data: [
      {
        id: 'base4-4',
        name: 'Charizard',
        supertype: 'Pokémon',
        subtypes: ['Stage 2'],
        hp: '120',
        types: ['Fire'],
        set: { name: 'Base Set 2', series: 'Base' },
        images: { small: 'https://images.pokemontcg.io/base4/4.png' }
      }
    ],
    totalCount: 1
  },
  'ekans': {
    data: [
      {
        id: 'base1-31',
        name: 'Ekans',
        supertype: 'Pokémon',
        subtypes: ['Basic'],
        hp: '40',
        types: ['Grass'],
        set: { name: 'Base Set', series: 'Base' },
        images: { small: 'https://images.pokemontcg.io/base1/31.png' }
      }
    ],
    totalCount: 1
  },
  'zapdos': {
    data: [
      {
        id: 'base1-16',
        name: 'Zapdos',
        supertype: 'Pokémon',
        subtypes: ['Basic'],
        hp: '90',
        types: ['Lightning'],
        set: { name: 'Base Set', series: 'Base' },
        images: { small: 'https://images.pokemontcg.io/base1/16.png' }
      }
    ],
    totalCount: 1
  },
  'mewtwo': {
    data: [
      {
        id: 'base1-10',
        name: 'Mewtwo',
        supertype: 'Pokémon',
        subtypes: ['Basic'],
        hp: '90',
        types: ['Psychic'],
        set: { name: 'Base Set', series: 'Base' },
        images: { small: 'https://images.pokemontcg.io/base1/10.png' }
      }
    ],
    totalCount: 1
  },
  'blastoise': {
    data: [
      {
        id: 'base1-2',
        name: 'Blastoise',
        supertype: 'Pokémon',
        subtypes: ['Stage 2'],
        hp: '100',
        types: ['Water'],
        set: { name: 'Base Set', series: 'Base' },
        images: { small: 'https://images.pokemontcg.io/base1/2.png' }
      }
    ],
    totalCount: 1
  }
};

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
    
    console.log('🔑 Headers being sent:', apiHeaders);
    
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
      responsePreview: responseText.substring(0, 500),
      hasApiKey: !!process.env.POKEMON_TCG_API_KEY,
      apiKeyPreview: process.env.POKEMON_TCG_API_KEY ? process.env.POKEMON_TCG_API_KEY.substring(0, 8) + '...' : 'No configurada',
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

// Función para probar diferentes endpoints de la API
app.get('/api/debug-api', async (req, res) => {
  try {
    console.log('🔍 Debugging Pokemon API...');
    
    const fetch = (await import('node-fetch')).default;
    const tests = [
      {
        name: 'Basic cards endpoint',
        url: 'https://api.pokemontcg.io/v2/cards?pageSize=1'
      },
      {
        name: 'Pikachu search',
        url: 'https://api.pokemontcg.io/v2/cards?q=name:pikachu&pageSize=1'
      },
      {
        name: 'Sets endpoint',
        url: 'https://api.pokemontcg.io/v2/sets?pageSize=1'
      }
    ];
    
    const results = [];
    
    for (const test of tests) {
      try {
        const apiHeaders = {
          'User-Agent': 'TCGtrade-Railway/1.0',
          'Accept': 'application/json'
        };
        
        if (process.env.POKEMON_TCG_API_KEY) {
          apiHeaders['X-Api-Key'] = process.env.POKEMON_TCG_API_KEY;
        }
        
        const response = await fetch(test.url, {
          method: 'GET',
          headers: apiHeaders,
          timeout: 10000
        });
        
        const responseText = await response.text();
        
        results.push({
          test: test.name,
          url: test.url,
          status: response.status,
          ok: response.ok,
          responseLength: responseText.length,
          isEmpty: !responseText || responseText.trim() === '',
          isHTML: responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html'),
          responsePreview: responseText.substring(0, 200),
          contentType: response.headers.get('content-type')
        });
        
      } catch (error) {
        results.push({
          test: test.name,
          url: test.url,
          error: error.message
        });
      }
    }
    
    res.json({
      results: results,
      hasApiKey: !!process.env.POKEMON_TCG_API_KEY,
      apiKeyPreview: process.env.POKEMON_TCG_API_KEY ? process.env.POKEMON_TCG_API_KEY.substring(0, 8) + '...' : 'No configurada',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Debug failed',
      message: error.message,
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
          console.log(`📅 Deploy timestamp: ${new Date().toISOString()}`);
        console.log(`🔧 Profile section fix applied`);
        console.log(`🚀 FORCING NEW DEPLOY - Profile section should be available`);
        console.log(`🔧 Login button debug logs added`);
});

// Manejar errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});