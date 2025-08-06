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

    // Hacer petición a la API
    const response = await fetch(apiUrl);
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
          message: errorText
        })
      };
    }

    const data = await response.json();
    console.log('Datos recibidos exitosamente');

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
        message: error.message
      })
    };
  }
};
