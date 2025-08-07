// Railway Server - Pokemon TCG Trading App
// Express server con proxy para la API de Pokemon TCG

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Función proxy para Pokemon TCG API
async function pokemonProxy(req, res) {
  console.log('🚀 Railway Proxy - Pokemon TCG API');
  console.log('📋 URL:', req.originalUrl);
  console.log('📋 Query:', req.query);

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

    // Hacer petición a la API SIN TIMEOUT (Railway no tiene límite de 10s)
    console.log('📡 Iniciando fetch a Pokemon API...');
    const startTime = Date.now();

    // Importar fetch dinámicamente para Node.js
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch(apiUrl, {
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
        message: 'La API de Pokemon TCG devolvió una respuesta vacía',
        url: apiUrl,
        fetchTime: `${fetchTime}ms`,
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

    return res.json(responseData);

  } catch (error) {
    console.error('❌ Error completo en proxy:', error);
    
    let errorMessage = 'Error interno del servidor';
    let errorType = 'ServerError';
    
    if (error.message.includes('fetch')) {
      errorMessage = 'Error de conexión con la API de Pokemon TCG';
      errorType = 'ConnectionError';
    }

    return res.status(500).json({
      error: 'Proxy error',
      type: errorType,
      message: errorMessage,
      details: error.message,
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