// netlify/functions/pokemon-proxy.js
exports.handler = async function(event, context) {
  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Manejar OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Log del evento completo para debug
    console.log('=== EVENTO COMPLETO ===');
    console.log('Path:', event.path);
    console.log('Raw URL:', event.rawUrl);
    console.log('Query params:', JSON.stringify(event.queryStringParameters, null, 2));
    
    // Extraer el path después de /api/pokemontcg/
    let endpoint = '';
    if (event.path) {
      const match = event.path.match(/\/api\/pokemontcg\/(.+)/);
      if (match) {
        endpoint = match[1];
      }
    }
    
    // Si no se puede extraer del path, intentar con query params
    if (!endpoint && event.queryStringParameters) {
      // Buscar cualquier parámetro que pueda contener el endpoint
      const params = event.queryStringParameters;
      if (params.splat) endpoint = params.splat;
      if (params.endpoint) endpoint = params.endpoint;
    }
    
    console.log('Endpoint extraído:', endpoint);
    
    if (!endpoint) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'No endpoint specified',
          debug: {
            path: event.path,
            queryParams: event.queryStringParameters
          }
        })
      };
    }
    
    // Construir query string (excluyendo parámetros internos)
    const queryParams = new URLSearchParams();
    if (event.queryStringParameters) {
      Object.keys(event.queryStringParameters).forEach(key => {
        if (!['splat', 'endpoint'].includes(key)) {
          queryParams.append(key, event.queryStringParameters[key]);
        }
      });
    }
    
    const queryString = queryParams.toString();
    const finalUrl = `https://api.pokemontcg.io/v2/${endpoint}${queryString ? '?' + queryString : ''}`;
    
    console.log('URL final de la API:', finalUrl);
    
    // Headers para la API
    const apiHeaders = { 'Content-Type': 'application/json' };
    if (process.env.POKEMON_TCG_API_KEY) {
      apiHeaders['X-Api-Key'] = process.env.POKEMON_TCG_API_KEY;
    }
    
    // Hacer la petición
    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: apiHeaders
    });
    
    console.log('Status de respuesta:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error de API:', response.status, errorText);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: 'API Error',
          status: response.status,
          details: errorText,
          requestUrl: finalUrl
        })
      };
    }
    
    const data = await response.json();
    console.log('Datos recibidos:', data.data?.length || 0, 'elementos');
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
    
  } catch (error) {
    console.error('Error en proxy:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Proxy error',
        details: error.message,
        stack: error.stack
      })
    };
  }
};
