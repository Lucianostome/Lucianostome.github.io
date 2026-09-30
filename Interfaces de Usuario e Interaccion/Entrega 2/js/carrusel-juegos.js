document.addEventListener('DOMContentLoaded', () => {
  obtenerJuegosYAgrupar();
});

async function obtenerJuegosYAgrupar() {
  const wrapper = document.getElementById('categories-wrapper');
  if (!wrapper) return;

  try {
    const respuesta = await fetch('js/games_v2_completo.json');
    
    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const juegos = await respuesta.json();

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
    activarAnimacionesBotones();

  } catch (error) {
    console.error("No se pudo cargar el archivo JSON:", error);
  }
}

function crearSeccionCarrusel(genero, juegos) {
  const cardsHTML = juegos.map(juego => crearCardJuego(juego, genero)).join('');

  
  return `
    <section class="carousel-section">
      <a class="carousel-title-link" href="categoria.html?genero=${encodeURIComponent(genero)}">
        <h2 class="carousel-title">${genero}</h2>
      </a>
      
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

function crearCardJuego(juego, generoActual, opciones = {}) {
  const { conWrapper = true } = opciones;

  const titulo = juego.name;
  const imagen = juego.background_image_low_res || juego.background_image;
  
  const esGratis = juego.id % 2 === 0; 
  const precioTexto = esGratis ? 'Free To Play' : '$4.99 USD';

  const dataPlayUrlAttr = juego.playUrl ? ` data-play-url="${juego.playUrl}"` : '';

  const botonGratisHTML = `
    <button class="card-btn btn-free" type="button"${dataPlayUrlAttr}>
      <span class="btn-label">Jugar</span>
      <span class="fx" aria-hidden="true">
        <span data-step="1"><img src= "assets/btntriangulo.png" alt= "Triángulo" class= "btn-icon-img"></span>
        <span data-step="2"><img src= "assets/btncirculo.png" alt= "Círculo" class= "btn-icon-img"></span>
        <span data-step="3"><img src= "assets/btnx.png" alt= "X" class= "btn-icon-img"></span>
        <span data-step="4"><img src= "assets/btncuadrado2.png" alt= "Cuadrado" class= "btn-icon-img"></span>
      </span>
    </button>`;

  const botonPaidHTML = `
    <button class="card-btn btn-paid" type="button">
      <span class="btn-label">Añadir al carrito</span>
      <span class="fx" aria-hidden="true">
        <img src="assets/icons/logo-carrito.svg" alt="Carrito" class="cart-img cart">
        <span class="badge">+1</span>
      </span>
      <span class="done">✔ ¡Agregado!</span>
    </button>`;

    // <img src="assets/paquete.png" alt="Paquete" class="box-img box">
  const botonHTML = esGratis ? botonGratisHTML : botonPaidHTML;

  const lockHTML = !esGratis 
    ? `<div class="lock-overlay">
        <svg class="lock-icon" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2">
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 018 0v4" />
        </svg>
       </div>`
    : '';

  const cardHTML = `
      <article class="game-card" data-id="${juego.id}">
        <div class="card-media">
        <img src="${imagen}" alt="${titulo}" class="card-img" draggable="false" loading="lazy">
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

  return conWrapper ? `<div class="card-3d-wrapper">${cardHTML}</div>` : cardHTML;
}

function activarAnimacionesBotones() {
  if (window.__btnAnimationInitialized) return;
  window.__btnAnimationInitialized = true;

  // Resetea el estado de los botones si el usuario regresa con el botón "Atrás"
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      document.querySelectorAll('.btn-free').forEach(btn => {
        btn.classList.remove('busy');
        btn.querySelectorAll('.fx [data-step]').forEach(el => el.classList.remove('lit'));
      });
    }
  });

  document.addEventListener('click', (e) => {
    // 1. ANIMACIÓN BOTÓN GRATIS (.btn-free)
    const btnFree = e.target.closest('.btn-free');
    if (btnFree) {
      e.preventDefault();
      e.stopPropagation();

      if (btnFree.classList.contains('busy')) return;

      const steps = 4;
      const stepMs = 300;
      const delay = 300;

      const tiempoFinAnimacion = delay + (steps * stepMs) + 300;

      const icons = btnFree.querySelectorAll('.fx [data-step]');

      btnFree.classList.add('busy');

      for (let n = 1; n <= steps; n++) {
        setTimeout(() => {
          icons.forEach(el => {
            const step = Number(el.dataset.step);
            if (step <= n) el.classList.add('lit');
          });
        }, delay + n * stepMs);
      }

      setTimeout(() => {
        // Si el botón tiene playUrl, redirige recién cuando termina la animación
        const playUrl = btnFree.dataset.playUrl;
        if (playUrl) {
          window.location.href = playUrl;
        } else {
          btnFree.classList.remove('busy');
          icons.forEach(el => el.classList.remove('lit'));
        }
      
      }, tiempoFinAnimacion);

      return;
    }

    // 2. ANIMACIÓN BOTÓN CARRITO (.btn-paid)
    const btnPaid = e.target.closest('.btn-paid');
    if (btnPaid) {
      e.preventDefault();
      e.stopPropagation();

      if (btnPaid.classList.contains('busy') || btnPaid.classList.contains('ready')) return;

      const busyMs = 1500;
      const readyMs = 3300;

      btnPaid.classList.add('busy');

      setTimeout(() => {
        btnPaid.classList.remove('busy');
        btnPaid.classList.add('ready');
      }, busyMs);

      setTimeout(() => {
        btnPaid.classList.remove('ready');
      }, readyMs);
    }
  });
}

function lerp(v0, v1, t) {
  return v0 * (1 - t) + v1 * t;
}

function activarNavegacionCarruseles() {
  const secciones = document.querySelectorAll('.carousel-section');

  secciones.forEach(seccion => {
    const track = seccion.querySelector('.carousel-track');
    const prevBtn = seccion.querySelector('.prev-arrow');
    const nextBtn = seccion.querySelector('.next-arrow');

    if (!track) return;

    iniciarCarruselDinamico(track, prevBtn, nextBtn);
  });
}

function iniciarCarruselDinamico(track, prevBtn, nextBtn) {
  const wrappers = Array.from(track.querySelectorAll('.card-3d-wrapper'));
  if (wrappers.length === 0) return;

  const itemWidth = 160 + 16;
  const paddingHorizontal = 32;

  let scrollObjetivo = 0;
  let scrollActual = 0;
  let scrollAnterior = 0;

  let factorSuavizado = 0.1;

  function maxScroll() {
    const anchoContenido = paddingHorizontal * 2 + wrappers.length * itemWidth - 16;
    return Math.max(0, anchoContenido - track.clientWidth);
  }

  function clamp(valor) {
    return Math.max(0, Math.min(maxScroll(), valor));
  }

  function actualizarFlechas() {
    if (!prevBtn || !nextBtn) return;
    prevBtn.classList.toggle('arrow-hidden', scrollObjetivo <= 0);
    nextBtn.classList.toggle('arrow-hidden', scrollObjetivo >= maxScroll());
  }

  actualizarFlechas();

  // NUEVO: permite centrar una card puntual desde afuera (ej: click en el Hero)
  track.centrarCard = function (wrapper) {
    const index = wrappers.indexOf(wrapper);
    if (index === -1) return;

    const centroCard = paddingHorizontal + index * itemWidth + 160 / 2;
    const centroTrack = track.clientWidth / 2;

    factorSuavizado = 0.03;

    scrollObjetivo = clamp(centroCard - centroTrack);
    actualizarFlechas();
  };

  function pintar(scroll, velocidad) {
    const skew = -velocidad * 0.2;
    const rotacion = velocidad * 0.01;
    const escala = 1 - Math.min(100, Math.abs(velocidad)) * 0.003;

    wrappers.forEach((wrapper, i) => {
      const x = paddingHorizontal + i * itemWidth - scroll;
      wrapper.style.transform = `translateX(${x}px) skewX(${skew}deg) rotate(${rotacion}deg) scale(${escala})`;
    });
  }
  pintar(0, 0);

  function render() {
    requestAnimationFrame(render);

    scrollActual = lerp(scrollActual, scrollObjetivo, factorSuavizado);

    const velocidad = scrollActual - scrollAnterior;
    scrollAnterior = scrollActual;

    pintar(scrollActual, velocidad);
  }
  render();

  // --- Arrastre (Pointer Events) ---
  let isDragging = false;
  let didDrag = false;
  let startX = 0;
  let scrollAlEmpezar = 0;

  track.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.card-btn')) return;

    factorSuavizado = 0.1;

    isDragging = true;
    didDrag = false;
    startX = e.clientX;
    scrollAlEmpezar = scrollObjetivo;

    track.setPointerCapture(e.pointerId);
    track.classList.add('is-dragging');
  });

  track.addEventListener('pointermove', (e) => {
    if (!isDragging) return;

    const delta = e.clientX - startX;
    if (Math.abs(delta) > 5) didDrag = true;

    scrollObjetivo = clamp(scrollAlEmpezar - delta * 1.5);
    actualizarFlechas();
  });

  track.addEventListener('pointerup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    track.releasePointerCapture(e.pointerId);
    track.classList.remove('is-dragging');
  });

  track.addEventListener('pointercancel', () => {
    isDragging = false;
    track.classList.remove('is-dragging');
  });

  track.addEventListener('click', (e) => {
    if (didDrag) {
      e.stopPropagation();
      e.preventDefault();
    }
  });

  // --- Flechas ---
  if (prevBtn && nextBtn) {
    nextBtn.addEventListener('click', () => {
      factorSuavizado = 0.1;
      scrollObjetivo = clamp(scrollObjetivo + itemWidth * 7);
      actualizarFlechas();
    });

    prevBtn.addEventListener('click', () => {
      factorSuavizado = 0.1;
      scrollObjetivo = clamp(scrollObjetivo - itemWidth * 7);
      actualizarFlechas();
    });
  }
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
