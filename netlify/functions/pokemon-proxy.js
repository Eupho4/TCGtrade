// netlify/functions/pokemon-proxy.js
const fetch = require('node-fetch'); // Importar node-fetch para hacer solicitudes HTTP

// Clave API de Pokémon TCG (la misma que usas en tu frontend)
const POKEMON_TCG_API_KEY = process.env.POKEMON_TCG_API_KEY; // Se cargará desde las variables de entorno de Netlify

exports.handler = async function(event, context) {
  // Obtener la ruta del proxy (ej: /cards?q=...)
  const path = event.path.replace('/.netlify/functions/pokemon-proxy', '');
  const queryString = event.rawQuery; // Obtener la cadena de consulta original

  // Construir la URL completa de la API de Pokémon TCG
  const apiUrl = `https://api.pokemontcg.io/v2${path}?${queryString}`;

  console.log(`Proxying request to: ${apiUrl}`);

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'X-Api-Key': POKEMON_TCG_API_KEY, // Enviar la clave API a la API de Pokémon TCG
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      // Si la API de Pokémon TCG devuelve un error, pasarlo
      const errorText = await response.text();
      return {
        statusCode: response.status,
        body: `Error from Pokémon TCG API: ${errorText}`,
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Permitir que cualquier origen acceda a esta función proxy
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key'
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Proxy function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to proxy request', details: error.message }),
    };
  }
};
