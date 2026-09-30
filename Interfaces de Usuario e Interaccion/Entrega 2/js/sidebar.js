document.addEventListener('componentesCargados', () => {
  const btnMenuToggle = document.getElementById('btn-menu-toggle');
  const sidebarNav = document.getElementById('sidebar-nav');
  const navOverlay = document.getElementById('nav-overlay');

  if (btnMenuToggle && sidebarNav) {
    btnMenuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebarNav.classList.toggle('is-open');

      if (navOverlay) {
        navOverlay.classList.toggle('is-active');
      }
    });
  }

  if (navOverlay && sidebarNav) {
    navOverlay.addEventListener('click', () => {
      sidebarNav.classList.remove('is-open');
      navOverlay.classList.remove('is-active');
    });
  }

  // Carga las categorías dinámicas
  cargarCategoriasSidebar();
});

async function cargarCategoriasSidebar() {
  const placeholder = document.getElementById('nav-categorias-placeholder');
  if (!placeholder) return;

  try {
    const respuesta = await fetch('js/games_v2_completo.json');
    if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);

    const juegos = await respuesta.json();

    // Extraer nombres de géneros/categorías sin duplicados
    const generosSet = new Set();
    juegos.forEach(juego => {
      if (juego.genres && Array.isArray(juego.genres)) {
        juego.genres.forEach(g => generosSet.add(g.name));
      }
    });

    const generos = Array.from(generosSet).sort();

    // Usamos 'genero' como nombre del parámetro URL para que coincida exactamente con categoria.js
    const htmlCategorias = generos.map(genero => {
      const generoEncoded = encodeURIComponent(genero);
      // Normaliza el nombre para buscar el SVG (ej: "Massively Multiplayer" -> "massively-multiplayer")
      const nombreIcono = genero
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-');

      const rutaIcono = `assets/icons/${nombreIcono}.svg`;

      return `
        <li class="nav-item-categoria">
          <a href="categoria.html?genero=${generoEncoded}" class="nav-link nav-link-sub">
          <img src="${rutaIcono}" alt="" class="nav-icon" onerror="this.style.display='none'">
            <span>${genero}</span>
          </a>
        </li>
      `;
    }).join('');

    placeholder.outerHTML = htmlCategorias;

  } catch (error) {
    console.error("No se pudieron cargar las categorías en el sidebar:", error);
  }
}