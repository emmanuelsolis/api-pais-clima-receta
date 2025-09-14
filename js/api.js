'use strict';

/**
 * Busca un país en el API de Rest Countries y devuelve sus datos principales.
 * @param {string} nombrePais - El nombre del país a buscar (en inglés).
 * @returns {Promise<object>} - Un objeto con los datos del país.
 */
async function buscarPais(nombrePais) {
  try {
    const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(nombrePais)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`No se encontró el país. Código de error: ${response.status}`);
    const data = await response.json();
    const pais = data?.[0];
    if (!pais) throw new Error('Respuesta vacía de la API');

    const datosUtiles = {
      nombre: pais.name?.common ?? 'Desconocido',
      nombreOficial: pais.name?.official ?? 'Desconocido',
      capital: pais.capital?.[0] ?? 'Sin datos',
      region: pais.region ?? 'Sin datos',
      poblacion: pais.population ?? 0,
      latitud: pais.latlng?.[0] ?? null,
      longitud: pais.latlng?.[1] ?? null,
      datosCompletos: pais
    };
    return datosUtiles;
  } catch (err) {
    // Re-lanzar o manejar según conveniencia
    throw err;
  }
}
/**
 * Obtiene el clima actual para una latitud y longitud dadas usando Open-Meteo.
 * @param {number} latitud La latitud del lugar.
 * @param {number} longitud La longitud del lugar.
 * @returns {Promise<object>} Un objeto con los datos del clima actual.
 */
async function obtenerClima(latitud, longitud) {
  // Validar entrada
  if (typeof latitud !== 'number' || typeof longitud !== 'number' || Number.isNaN(latitud) || Number.isNaN(longitud)) {
    throw new TypeError('latitud y longitud deben ser números válidos');
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(latitud)}&longitude=${encodeURIComponent(longitud)}&current_weather=true`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`No se pudo obtener el clima. Código: ${response.status}`);
    }

    const data = await response.json();

    // La información que nos interesa está en la propiedad "current_weather".
    if (!data || !data.current_weather) {
      throw new Error('Respuesta inválida de la API de clima: falta current_weather');
    }

    return data.current_weather;
  } catch (err) {
    // Normalizar y propagar el error para que el llamador pueda manejarlo.
    throw new Error(`Error al obtener el clima: ${err.message}`);
  }
}

if (typeof window !== 'undefined') {
  window.obtenerClima = obtenerClima;
}
/**
 * Busca una receta aleatoria para una nacionalidad dada en TheMealDB.
 * @param {string} nacionalidad La nacionalidad de la cocina (ej. "Mexican").
 * @returns {Promise<object>} Un objeto con los datos de la receta.
 */
async function buscarReceta(nacionalidad) {
  // Normalize common country -> area mappings that TheMealDB expects.
  let area = nacionalidad;
  const mapa = {
    'United States': 'American',
    'United States of America': 'American',
    'United Kingdom': 'British',
    'England': 'British',
    'France': 'French',
    'Mexico': 'Mexican',
    'Spain': 'Spanish',
    'Italy': 'Italian',
    'China': 'Chinese',
    'Japan': 'Japanese',
    'India': 'Indian',
    'Greece': 'Greek',
    'Portugal': 'Portuguese',
    'Morocco': 'Moroccan',
    'Thailand': 'Thai',
    'Vietnam': 'Vietnamese',
    'Turkey': 'Turkish',
    'Egypt': 'Egyptian',
    'Brazil': 'Brazilian',
    'Canada': 'Canadian',
    'Argentina': 'Argentinian'
  };
  if (mapa[area]) area = mapa[area];

  const listUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(area)}`;
  const listResp = await fetch(listUrl);
  if (!listResp.ok) throw new Error(`Error fetching recipe list: ${listResp.status}`);
  const listData = await listResp.json();
  if (!listData.meals) throw new Error(`No recipes found for ${area} cuisine.`);

  // Choose a random meal summary then fetch full details by id
  const randomSummary = listData.meals[Math.floor(Math.random() * listData.meals.length)];
  const lookupUrl = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(randomSummary.idMeal)}`;
  const lookupResp = await fetch(lookupUrl);
  if (!lookupResp.ok) throw new Error(`Error fetching recipe details: ${lookupResp.status}`);
  const lookupData = await lookupResp.json();
  const meal = lookupData.meals?.[0];
  if (!meal) throw new Error('Recipe details not found');

  return meal;
}
// Hacer explícitamente la función accesible en el objeto global (window)
// para evitar ReferenceError si el archivo se carga en un contexto donde
// las funciones de módulo no quedan en el ámbito global.
if (typeof window !== 'undefined') {
  window.buscarPais = buscarPais;
  window.buscarReceta = buscarReceta;
}