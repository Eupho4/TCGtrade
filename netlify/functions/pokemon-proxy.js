exports.handler = async (event, context) => {
  console.log('=== FUNCIÓN EJECUTÁNDOSE ===');
  console.log('Método:', event.httpMethod);
  console.log('Path completo:', event.path);
  console.log('Query string:', event.queryStringParameters);
  console.log('Raw URL:', event.rawUrl);
  console.log('Headers recibidos:', event.headers);

  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Manejar preflight
  if (event.httpMethod === 'OPTIONS') {
    console.log('Respondiendo a OPTIONS request');
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Extraer el endpoint del path con mejor handling
    let endpoint = 'cards'; // default
    
    if (event.path) {
      const pathMatch = event.path.match(/\/api\/pokemontcg\/(.+)/);
      if (pathMatch) {
        endpoint = pathMatch[1];
      }
    } else if (event.rawUrl) {
      const urlMatch = event.rawUrl.match(/\/api\/pokemontcg\/(.+?)(?:\?|$)/);
      if (urlMatch) {
        endpoint = urlMatch[1];
      }
    }
    
    console.log('Endpoint extraído:', endpoint);
    console.log('Path original:', event.path);
    console.log('Raw URL:', event.rawUrl);

    // Construir URL de la API
    let apiUrl = `https://api.pokemontcg.io/v2/${endpoint}`;
    
    // Agregar query parameters si existen
    if (event.queryStringParameters) {
      const params = new URLSearchParams(event.queryStringParameters);
      apiUrl += '?' + params.toString();
    }

    console.log('URL final:', apiUrl);

    // Headers para la API de Pokémon TCG
    const apiHeaders = {
      'Content-Type': 'application/json'
    };

    // Agregar API Key si está disponible en las variables de entorno
    if (process.env.POKEMON_TCG_API_KEY) {
      apiHeaders['X-Api-Key'] = process.env.POKEMON_TCG_API_KEY;
      console.log('API Key configurada');
    } else {
      console.log('API Key no encontrada, usando acceso público limitado');
    }

    // Hacer petición a la API con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ Timeout alcanzado, abortando petición');
      controller.abort();
    }, 25000); // 25 segundos timeout

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: apiHeaders,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    console.log('Status de API:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error de API:', errorText);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: 'API Error',
          status: response.status,
          message: errorText,
          url: apiUrl
        })
      };
    }

    // Leer respuesta como texto primero para debug
    const responseText = await response.text();
    console.log('Respuesta recibida, longitud:', responseText.length, 'caracteres');
    
    if (responseText.length === 0) {
      console.error('Respuesta vacía de la API');
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({
          error: 'Empty response',
          message: 'La API devolvió una respuesta vacía'
        })
      };
    }

    // Intentar parsear JSON
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('JSON parseado exitosamente:', data.data ? data.data.length : 0, 'items');
    } catch (jsonError) {
      console.error('Error al parsear JSON:', jsonError.message);
      console.error('Respuesta que causó el error:', responseText.substring(0, 500));
      
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({
          error: 'JSON Parse Error',
          message: jsonError.message,
          rawResponse: responseText.substring(0, 1000)
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Error en función:', error);
    
    let statusCode = 500;
    let errorMessage = error.message;
    
    if (error.name === 'AbortError') {
      statusCode = 408; // Request Timeout
      errorMessage = 'La petición a la API tardó demasiado tiempo';
      console.log('⏰ Petición abortada por timeout');
    } else if (error.message.includes('fetch')) {
      statusCode = 502; // Bad Gateway
      errorMessage = 'Error de conexión con la API externa';
    }
    
    return {
      statusCode: statusCode,
      headers,
      body: JSON.stringify({
        error: 'Proxy error',
        message: errorMessage,
        type: error.name,
        timestamp: new Date().toISOString(),
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};
