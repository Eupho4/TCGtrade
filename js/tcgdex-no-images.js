// Sets de TCGdex que NO tienen imágenes disponibles
// Estos sets antiguos no tienen el campo 'image' en la API

const setsWithoutImages = [
  // Primera generación
  'pmcg1', 'pmcg2', 'pmcg3', 'pmcg4', 'pmcg5', 'pmcg6',
  
  // VS y Web
  'vs1', 'web1',
  
  // E-Card Series
  'e1', 'e2', 'e3', 'e4', 'e5',
  
  // ADV Series
  'adv1', 'adv2', 'adv3', 'adv4', 'adv5',
  
  // PCG Series
  'pcg1', 'pcg2', 'pcg3', 'pcg4', 'pcg5', 
  'pcg6', 'pcg7', 'pcg8', 'pcg9', 'pcg10',
  
  // Algunos sets de Legend
  'l1a', 'l1b', 'l2', 'll', 'l3'
];

// Función para verificar si un set tiene imágenes
function setHasImages(setId) {
  return !setsWithoutImages.includes(setId?.toLowerCase());
}

module.exports = {
  setsWithoutImages,
  setHasImages
};