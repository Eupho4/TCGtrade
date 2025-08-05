// netlify/functions/pokemon-proxy.js
const fetch = require('node-fetch');

// Clave API de Pokémon TCG (se carga desde las variables de entorno de Netlify)
const POKEMON_TCG_API_KEY = process.env.POKEMON_TCG_API_KEY;

exports.handler = async function(event, context) {
  // Permitir CORS para todas las solicitudes
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Manejar solicitudes OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Obtener el path desde los parámetros de la URL
    const pathParam = event.queryStringParameters?.splat || '';
    console.log('Path param:', pathParam);
    console.log('Query string parameters:', event.queryStringParameters);

    // Construir query string excluyendo 'splat'
    const queryParams = new URLSearchParams();
    if (event.queryStringParameters) {
      Object.keys(event.queryStringParameters).forEach(key => {
        if (key !== 'splat') {
          queryParams.append(key, event.queryStringParameters[key]);
        }
      });
    }

    const queryString = queryParams.toString();
    
    // Construir la URL completa de la API de Pokémon TCG
    const apiUrl = `https://api.pokemontcg.io/v2/${pathParam}${queryString ? '?' + queryString : ''}`;

    console.log(`Proxying request to: ${apiUrl}`);

    // Configurar headers para la API de Pokémon TCG
    const apiHeaders = {
      'Content-Type': 'application/json'
    };

    // Añadir la clave API si está disponible
    if (POKEMON_TCG_API_KEY) {
      apiHeaders['X-Api-Key'] = POKEMON_TCG_API_KEY;
      console.log('Using API key');
    } else {
      console.log('No API key provided - using rate limited access');
    }

    const response = await fetch(apiUrl, {
      method: event.httpMethod,
      headers: apiHeaders
    });

    if (!response.ok) {
      // Si la API de Pokémon TCG devuelve un error, pasarlo
      const errorText = await response.text();
      console.error(`API Error: ${response.status} - ${errorText}`);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: 'Error from Pokémon TCG API', 
          details: errorText,
          status: response.status,
          requestedUrl: apiUrl
        }),
      };
    }

    const data = await response.json();
    console.log(`Successfully fetched ${data.data?.length || 0} items`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error('Proxy function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to proxy request', 
        details: error.message 
      }),
    };
  }
};
