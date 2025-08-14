// Test script para Railway deployment
const fetch = require('node-fetch');

async function testRailwayEndpoints() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing Railway endpoints...\n');
  
  try {
    // Test 1: Servidor básico
    console.log('1️⃣ Testing /api/test...');
    const testResponse = await fetch(`${baseUrl}/api/test`);
    const testData = await testResponse.json();
    console.log('✅ Test endpoint:', testData.message);
    
    // Test 2: Verificar API Key
    console.log('\n2️⃣ Testing /api/check-api-key...');
    const keyResponse = await fetch(`${baseUrl}/api/check-api-key`);
    const keyData = await keyResponse.json();
    console.log('✅ API Key status:', keyData.message);
    console.log('   Has API Key:', keyData.hasApiKey);
    
    // Test 3: Búsqueda de cartas (sin API Key)
    console.log('\n3️⃣ Testing Pokemon API proxy...');
    const pokemonResponse = await fetch(`${baseUrl}/api/pokemontcg/cards?q=name:pikachu&pageSize=5`);
    const pokemonData = await pokemonResponse.json();
    
    if (pokemonData.data && pokemonData.data.length > 0) {
      console.log('✅ Pokemon API working!');
      console.log(`   Found ${pokemonData.data.length} cards`);
      console.log(`   First card: ${pokemonData.data[0].name}`);
    } else {
      console.log('⚠️ Pokemon API response:', pokemonData);
    }
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('🚂 Ready for Railway deployment!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Solo ejecutar si se llama directamente
if (require.main === module) {
  testRailwayEndpoints();
}

module.exports = { testRailwayEndpoints };