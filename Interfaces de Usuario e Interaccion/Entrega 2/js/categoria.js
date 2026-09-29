document.addEventListener('DOMContentLoaded', () => {
  cargarJuegosDeCategoria();
});

async function cargarJuegosDeCategoria() {
  const params = new URLSearchParams(window.location.search);
  const genero = params.get('genero');

  const grid = document.getElementById('categoria-grid');
  const tituloEl = document.getElementById('categoria-titulo');

  if (!grid) return;
  if (tituloEl) tituloEl.textContent = genero || 'Categoría';

  try {
    const respuesta = await fetch('js/games_v2_completo.json');
    if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);

    const juegos = await respuesta.json();

    const juegosDelGenero = juegos.filter(juego =>
      juego.genres && juego.genres.some(g => g.name === genero)
    );

    grid.innerHTML = juegosDelGenero
      .map(juego => crearCardJuego(juego, genero, { conWrapper: false }))
      .join('');

    detectarTitulosLargos();
    activarAnimacionesBotones();

  } catch (error) {
    console.error('No se pudo cargar la categoría:', error);
  }
}