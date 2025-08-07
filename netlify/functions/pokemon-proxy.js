exports.handler = async (event, context) => {
  console.log('=== FUNCIÓN EJECUTÁNDOSE ===');
  console.log('Método:', event.httpMethod);
  console.log('Path completo:', event.path);
  console.log('Query string:', event.queryStringParameters);

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
    // Extraer el endpoint del path
    const pathMatch = event.path.match(/\/api\/pokemontcg\/(.+)/);
    const endpoint = pathMatch ? pathMatch[1] : 'cards';
    
    console.log('Endpoint extraído:', endpoint);

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

    // Hacer petición a la API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: apiHeaders
    });
    
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
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};
