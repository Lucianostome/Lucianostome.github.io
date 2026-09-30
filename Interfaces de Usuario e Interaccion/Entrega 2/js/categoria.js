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

    let cantJuegosAMostrar = 30;

    if(filtro == 'destacados'){
      if(tituloEl) tituloEl.textContent = 'Destacados';
      juegosAMostrar = juegos
      .filter(juego => typeof juego.rating === 'number')
      .sort((a, b) => b.rating - a.rating)
      .slice(0, cantJuegosAMostrar);
    }
    else if (filtro == 'nuevos'){
      if(tituloEl) tituloEl.textContent = 'Nuevos Lanzamientos';
      juegosAMostrar = juegos
      .filter(juego => juego.released)
      .sort((a, b) => new Date(b.released) - new Date(a.released))
      .slice(0, cantJuegosAMostrar)
    }
    else if (filtro === 'recientes') {
      if (tituloEl) tituloEl.textContent = 'Jugados Recientemente';

      // 1. Buscar a Peg Solitaire por su nombre o slug
      const pegSolitaire = juegos.find(j => 
        j.name?.toLowerCase().includes('peg solitaire') || 
        j.slug?.toLowerCase().includes('peg-solitaire')
      );

      // 2. Obtener el resto de los juegos excluyendo a Peg Solitaire
      const otrosJuegos = juegos.filter(j => j !== pegSolitaire);

      // 3. Si existe Peg Solitaire lo coloca en 1° lugar; luego completa hasta 30 juegos
      if (pegSolitaire) {
        juegosAMostrar = [pegSolitaire, ...otrosJuegos.slice(0, cantJuegosAMostrar - 1)];
      } else {
        juegosAMostrar = juegos.slice(0, cantJuegosAMostrar);
      }
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