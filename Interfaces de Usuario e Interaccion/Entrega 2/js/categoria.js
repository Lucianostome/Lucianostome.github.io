document.addEventListener('DOMContentLoaded', () => {
  cargarJuegosDeCategoria();
});

async function cargarJuegosDeCategoria() {
  const params = new URLSearchParams(window.location.search);
  const genero = params.get('genero');
  const filtro = params.get('filtro');

  const grid = document.getElementById('categoria-grid');
  const tituloEl = document.getElementById('categoria-titulo');

  if (!grid) return;

  try {
    const respuesta = await fetch('js/games_v2_completo.json');
    if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);

    const juegos = await respuesta.json();
    let juegosAMostrar = [];

    if(filtro == 'destacados'){
      if(tituloEl) tituloEl.textContent = 'Destacados (Top 30)';
      juegosAMostrar = juegos
      .filter(juego => typeof juego.rating === 'number')
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 30);
    }

    else if(genero) {
      if (tituloEl) tituloEl.textContent = genero || 'Categoría';
      juegosAMostrar = juegos.filter(juego =>
        juego.genres && juego.genres.some(g => g.name == genero)
      );
    }
    else {
      if(tituloEl) tituloEl.textContent = 'Todos los Juegos';
      juegosAMostrar = juegos;
    }

    grid.innerHTML = juegosAMostrar
      .map(juego => crearCardJuego(juego, genero || filtro, { conWrapper: false }))
      .join('');

    detectarTitulosLargos();
    activarAnimacionesBotones();

  } catch (error) {
    console.error('No se pudo cargar la vista de categoría/filtro:', error);
  }
}