'use strict';

// --- 1. SELECCIÓN DE ELEMENTOS (esto sigue igual) ---
const paisInput = document.querySelector('#paisInput');
const buscarBtn = document.querySelector('#buscarBtn');
// En el HTML el contenedor de información del país tiene id="infoPais"
const infoPaisDiv = document.querySelector('#infoPais');
const infoClimaDiv = document.querySelector('#infoClima');
const infoRecetaDiv = document.querySelector('#infoReceta');
const debugOutput = document.querySelector('#debugOutput');

// --- 2. ASOCIAR EVENTOS ---
// ¡Convertimos la función a ASYNC para poder usar AWAIT adentro!
buscarBtn.addEventListener('click', async () => {
  const paisBuscado = paisInput.value.trim();

  if (!paisBuscado) {
    infoPaisDiv.innerHTML = `<p style="color: red;">Por favor, escribe el nombre de un país.</p>`;
    return; // Detenemos la ejecución aquí
  }

  infoPaisDiv.innerHTML = `<p>Buscando datos para "${paisBuscado}"...</p>`;
  buscarBtn.disabled = true; // Deshabilitamos el botón mientras busca

    // --- ¡Aquí está la magia que describiste! ---
    try {
        // 1. Llamamos a nuestra función del API y esperamos (await) el resultado.
        const datosDelPais = await buscarPais(paisBuscado);

        // 2. Usamos el resultado para construir el HTML y mostrarlo.
        infoPaisDiv.innerHTML = `
        <h2>${datosDelPais.nombre}</h2>
        <p><strong>Capital:</strong> ${datosDelPais.capital}</p>
        <p><strong>Población:</strong> ${datosDelPais.poblacion.toLocaleString(
            "es-MX"
        )}</p>
        <p><strong>Coordenadas:</strong> ${datosDelPais.latitud.toFixed(
            4
        )}, ${datosDelPais.longitud.toFixed(4)}</p>
        `;

        // Mostramos el objeto completo en el área de depuración.
        debugOutput.textContent = JSON.stringify(datosDelPais, null, 2);
                // --- OBTENER Y MOSTRAR EL CLIMA ---
                // Solo intentamos obtener el clima si ya recuperamos correctamente los datos del país.
                const infoClimaDiv = document.querySelector('#infoClima');
                infoClimaDiv.innerHTML = `<p>Obteniendo clima...</p>`;

                try {
                    const datosDelClima = await obtenerClima(
                        datosDelPais.latitud,
                        datosDelPais.longitud
                    );

                    // Mostrar resultados del clima (con ligeros formateos).
                    infoClimaDiv.innerHTML = `
                        <h2>Clima en ${datosDelPais.capital}</h2>
                        <p><strong>Temperatura:</strong> ${Number(datosDelClima.temperature).toFixed(1)}°C</p>
                        <p><strong>Velocidad del viento:</strong> ${Number(datosDelClima.windspeed).toFixed(1)} km/h</p>
                    `;
                } catch (err) {
                    console.error('Error al obtener el clima:', err);
                    infoClimaDiv.innerHTML = `<p style="color: red;">No se pudo obtener el clima: ${err.message}</p>`;
                }

                    // Pedimos una receta usando la función en api.js (expuesta en window)
                    infoRecetaDiv.innerHTML = `<p>Buscando una receta típica...</p>`;
                    try {
                        // Intentamos usar la nacionalidad/area: preferimos datosDelPais.region o nombre del país
                        const areaParaReceta = datosDelPais.nombre ?? datosDelPais.region ?? paisBuscado;
                        const receta = await window.buscarReceta(areaParaReceta);

                        // Construimos la lista de ingredientes/medidas
                        const ingredientes = [];
                        for (let i = 1; i <= 20; i++) {
                            const ing = receta[`strIngredient${i}`];
                            const med = receta[`strMeasure${i}`];
                            if (ing && ing.trim()) {
                                ingredientes.push(`${med ? med.trim() + ' ' : ''}${ing.trim()}`.trim());
                            }
                        }

                        infoRecetaDiv.innerHTML = `
                            <h2>${receta.strMeal}</h2>
                            <p><strong>Categoría:</strong> ${receta.strCategory ?? '—'}</p>
                            <p><strong>Área:</strong> ${receta.strArea ?? '—'}</p>
                            ${receta.strMealThumb ? `<img src="${receta.strMealThumb}" alt="${receta.strMeal}" style="max-width:200px;border-radius:6px;">` : ''}
                            <h3>Ingredientes</h3>
                            <ul>${ingredientes.map(it => `<li>${it}</li>`).join('')}</ul>
                            <h3>Instrucciones</h3>
                            <p>${receta.strInstructions ?? '—'}</p>
                            ${receta.strSource ? `<p><a href="${receta.strSource}" target="_blank">Fuente</a></p>` : ''}
                        `;
                    } catch (err) {
                        console.error('Error al obtener la receta:', err);
                        infoRecetaDiv.innerHTML = `<p style="color: red;">No se pudo obtener la receta: ${err.message}</p>`;
                    }
        
    } catch (error) {
        // Si algo falla en el bloque 'try', el código salta directamente aquí.
        console.error("Ocurrió un error:", error);
        infoPaisDiv.innerHTML = `<p style="color: red;">Error al buscar: ${error.message}</p>`;
        debugOutput.textContent = error;
    } finally {
        // Esto se ejecuta siempre, haya error o no.
        buscarBtn.disabled = false; // Reactivamos el botón
    }
    // ...existing code...
});