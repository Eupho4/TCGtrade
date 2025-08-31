exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const hasApiKey = !!process.env.POKEMON_TCG_API_KEY;
    const apiKeyLength = process.env.POKEMON_TCG_API_KEY ? process.env.POKEMON_TCG_API_KEY.length : 0;
    const apiKeyStart = process.env.POKEMON_TCG_API_KEY ? process.env.POKEMON_TCG_API_KEY.substring(0, 8) + '...' : 'No configurada';

    const response = {
      hasApiKey: hasApiKey,
      apiKeyLength: apiKeyLength,
      apiKeyPreview: apiKeyStart,
      timestamp: new Date().toISOString(),
      message: hasApiKey ? 'API Key está configurada correctamente' : 'API Key NO está configurada'
    };

    console.log('API Key check:', response);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response, null, 2)
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};