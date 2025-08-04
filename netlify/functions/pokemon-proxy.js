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
    // Obtener la ruta del proxy (ej: /cards?q=...)
    const path = event.path.replace('/.netlify/functions/pokemon-proxy', '');
    const queryString = event.rawQuery || ''; // Obtener la cadena de consulta original

    // Construir la URL completa de la API de Pokémon TCG
    const apiUrl = `https://api.pokemontcg.io/v2${path}${queryString ? '?' + queryString : ''}`;

    console.log(`Proxying request to: ${apiUrl}`);

    // Configurar headers para la API de Pokémon TCG
    const apiHeaders = {
      'Content-Type': 'application/json'
    };

    // Añadir la clave API si está disponible
    if (POKEMON_TCG_API_KEY) {
      apiHeaders['X-Api-Key'] = POKEMON_TCG_API_KEY;
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
          status: response.status
        }),
      };
    }

    const data = await response.json();

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

