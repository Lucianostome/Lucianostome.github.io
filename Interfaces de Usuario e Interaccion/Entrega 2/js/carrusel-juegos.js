document.addEventListener('DOMContentLoaded', () => {
  obtenerJuegosYAgrupar();
});

async function obtenerJuegosYAgrupar() {
  const wrapper = document.getElementById('categories-wrapper');
  if (!wrapper) return;

  try {
    // Ruta desde la raíz (index.html) hacia la carpeta js
    const respuesta = await fetch('js/games_v2.json');
    
    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const juegos = await respuesta.json();

    // Resto del código de agrupación...
    const juegosPorGenero = {};
    juegos.forEach(juego => {
      if (juego.genres && juego.genres.length > 0) {
        juego.genres.forEach(g => {
          const nombreGenero = g.name;
          if (!juegosPorGenero[nombreGenero]) {
            juegosPorGenero[nombreGenero] = [];
          }
          juegosPorGenero[nombreGenero].push(juego);
        });
      }
    });

    wrapper.innerHTML = '';

    Object.keys(juegosPorGenero).forEach(genero => {
      const listaJuegos = juegosPorGenero[genero];
      const seccionHTML = crearSeccionCarrusel(genero, listaJuegos);
      wrapper.innerHTML += seccionHTML;
    });

    activarNavegacionCarruseles();
    detectarTitulosLargos();    

  } catch (error) {
    console.error("No se pudo cargar el archivo JSON:", error);
  }
}

// Genera la sección HTML completa de un género con sus cards
function crearSeccionCarrusel(genero, juegos) {
  const cardsHTML = juegos.map(juego => crearCardJuego(juego, genero)).join('');

  return `
    <section class="carousel-section">
      <h2 class="carousel-title">${genero}</h2>
      
      <div class="carousel-container">
        <button class="carousel-arrow prev-arrow" aria-label="Anterior">&lt;</button>
        
        <div class="carousel-track">
          ${cardsHTML}
        </div>

        <button class="carousel-arrow next-arrow" aria-label="Siguiente">&gt;</button>
      </div>
    </section>
  `;
}

// Genera la Card individual leyendo las propiedades de TU JSON
function crearCardJuego(juego, generoActual) {
  const titulo = juego.name;
  const imagen = juego.background_image_low_res || juego.background_image;
  
  // Condición de prueba para juegos pagos / gratis
  const esGratis = juego.id % 2 === 0; 
  const precioTexto = esGratis ? 'Free To Play' : '$4.99 USD';

  const botonHTML = esGratis 
    ? `<button class="card-btn btn-free">Jugar</button>`
    : `<button class="card-btn btn-paid">Añadir al carrito</button>`;

  const lockHTML = !esGratis 
    ? `<div class="lock-overlay">
        <svg class="lock-icon" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2">
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 018 0v4" />
        </svg>
       </div>`
    : '';

  return `
    <article class="game-card" data-id="${juego.id}">
        <div class="card-media">
        <img src="${imagen}" alt="${titulo}" class="card-img" loading="lazy">
        ${lockHTML}
        </div>
        
        <div class="card-body">
        <h3 class="card-title"><span class="card-title-inner">${titulo}</span></h3>
        <p class="card-info">
            <span>${generoActual}</span> • 
            <span class="${!esGratis ? 'card-price-green' : ''}">${precioTexto}</span>
        </p>
        ${botonHTML}
        </div>
    </article>
    `;
}

function activarNavegacionCarruseles() {
  const secciones = document.querySelectorAll('.carousel-section');

  secciones.forEach(seccion => {
    const track = seccion.querySelector('.carousel-track');
    const prevBtn = seccion.querySelector('.prev-arrow');
    const nextBtn = seccion.querySelector('.next-arrow');

    if (!track) return;

    // --- FUNCIÓN DE DESPLAZAMIENTO FLUIDO (EASING ANIMATION) ---
    function smoothScrollTo(element, targetPosition, duration) {
      const startPosition = element.scrollLeft;
      const distance = targetPosition - startPosition;
      let startTime = null;

      // Función de aceleración/desaceleración (ease-in-out quintic)
      function easeInOut(t) {
        return t < 0.5 
          ? 16 * t * t * t * t * t 
          : 1 + 16 * (--t) * t * t * t * t;
      }

      function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const easeProgress = easeInOut(progress);

        element.scrollLeft = startPosition + (distance * easeProgress);

        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        }
      }

      requestAnimationFrame(animation);
    }

    // --- 1. NAVEGACIÓN POR FLECHAS ---
    if (prevBtn && nextBtn) {
        nextBtn.addEventListener('click', () => {
            const anchoCard = 160 + 16; // ancho de card + gap (coincide con flex: 0 0 160px y gap:16px del CSS)
            const cardsAAvanzar = 7;
            const scrollAmount = anchoCard * cardsAAvanzar;

            const maxScroll = track.scrollWidth - track.clientWidth;
            const target = Math.min(track.scrollLeft + scrollAmount, maxScroll);

            smoothScrollTo(track, target, 600);
        });

        prevBtn.addEventListener('click', () => {
            const anchoCard = 160 + 16;
            const cardsAAvanzar = 7;
            const scrollAmount = anchoCard * cardsAAvanzar;

            const target = Math.max(track.scrollLeft - scrollAmount, 0);

            smoothScrollTo(track, target, 600);
        });
    }

    // --- 2. MOVER AL HACER CLIC Y ARRASTRAR (DRAG TO SCROLL) ---
    let isDown = false;
    let startX;
    let scrollLeft;

    track.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });

    track.addEventListener('mouseleave', () => {
      isDown = false;
    });

    track.addEventListener('mouseup', () => {
      isDown = false;
    });

    track.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.5; // Velocidad del arrastre
      track.scrollLeft = scrollLeft - walk;
    });
  });
}

function detectarTitulosLargos() {
  const titulos = document.querySelectorAll('.card-title');

  titulos.forEach(titulo => {
    const medidor = document.createElement('span');
    medidor.style.visibility = 'hidden';
    medidor.style.position = 'absolute';
    medidor.style.whiteSpace = 'nowrap';
    medidor.style.font = window.getComputedStyle(titulo).font;
    medidor.textContent = titulo.textContent;

    document.body.appendChild(medidor);

    const anchoContenedorCard = 136;

    if (medidor.offsetWidth > anchoContenedorCard) {
      titulo.classList.add('has-overflow');
    }

    document.body.removeChild(medidor);
  });
}