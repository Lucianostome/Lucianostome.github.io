document.addEventListener('DOMContentLoaded', () => {
  cargarHeroDestacados();
});

// Cantidad de juegos a mostrar en el carrusel principal
const CANTIDAD_DESTACADOS = 12;

async function cargarHeroDestacados() {
  try {
    const respuesta = await fetch('js/games_v2_completo.json');
    const juegos = await respuesta.json();

    // 1. Filtrar y ordenar los Top 7 con mayor rating
    const destacados = [...juegos]
      .filter(juego => juego.rating)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, CANTIDAD_DESTACADOS);

    // 2. Renderizar e inicializar la interacción del Hero
    renderizarHeroCarousel(destacados);

  } catch (error) {
    console.error("Error al cargar los destacados del Hero:", error);
  }
}

/* ==========================================================================
   LÓGICA DEL HERO CARROUSEL 3D CILÍNDRICO
   ========================================================================== */
function renderizarHeroCarousel(destacados) {
  const track = document.getElementById('heroTrack');
  if (!track) return;

  // Insertar las tarjetas en el DOM con su ID correspondiente
  track.innerHTML = destacados.map(juego => `
    <div class="hero-card" data-id="${juego.id}">
      <img src="${juego.background_image}" alt="${juego.name}">
    </div>
  `).join('');

  const cards = Array.from(track.querySelectorAll('.hero-card'));
  const dotsContainer = document.getElementById('heroDots');

  let currentIndex = 0;
  let autoPlayTimer = null;

  if (dotsContainer) {
    dotsContainer.innerHTML = cards.map((_, index) => `
      <button class="hero-dot" data-index="${index}" aria-label="Ir a la card ${index + 1}"></button>
    `).join('');
  }
  const dots = dotsContainer ? Array.from(dotsContainer.querySelectorAll('.hero-dot')) : [];

  // Actualiza las clases CSS para reflejar la perspectiva 3D
  function updateCarousel() {
    const total = cards.length;

    cards.forEach((card, index) => {
      card.classList.remove('active', 'prev-card', 'next-card', 'hidden-card');

      const prevIndex = (currentIndex - 1 + total) % total;
      const nextIndex = (currentIndex + 1) % total;

      if (index === currentIndex) {
        card.classList.add('active');
      } else if (index === prevIndex) {
        card.classList.add('prev-card');
      } else if (index === nextIndex) {
        card.classList.add('next-card');
      } else {
        card.classList.add('hidden-card');
      }
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % cards.length;
    updateCarousel();
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    updateCarousel();
  }

  // Control del temporizador automático (8000 ms)
  function startAutoPlay() {
    stopAutoPlay();
    autoPlayTimer = setInterval(nextSlide, 8000);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) clearInterval(autoPlayTimer);
  }

  // FUNCIÓN DE ANIMACIÓN SUAVE POR CÁLCULO DE PASOS (FRAME BY FRAME)
  function smoothScrollToPosition(targetY, duration = 800, callback) {
    const startY = window.pageYOffset || document.documentElement.scrollTop;
    const distance = targetY - startY;
    let startTime = null;

    // Curva de aceleración suave (easeInOutCubic)
    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function step(currentTime) {
      if (!startTime) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const easeProgress = easeInOutCubic(progress);

      window.scrollTo(0, startY + (distance * easeProgress));

      if (timeElapsed < duration) {
        requestAnimationFrame(step);
      } else if (callback) {
        callback();
      }
    }

    requestAnimationFrame(step);
  }

  // EVENTO DE CLIC EN LAS TARJETAS DEL HERO
  track.addEventListener('click', (e) => {
    const heroCard = e.target.closest('.hero-card');
    if (!heroCard) return;

    // Obtener la card activa actual directamente del DOM
    const activeCard = track.querySelector('.hero-card.active');

    // SI NO ES LA TARJETA DEL MEDIO (ACTIVE)
    if (heroCard !== activeCard) {
      e.preventDefault();
      e.stopPropagation();

      // Girar el carrusel a la tarjeta presionada
      if (heroCard.classList.contains('next-card')) {
        nextSlide();
      } else if (heroCard.classList.contains('prev-card')) {
        prevSlide();
      }
      
      startAutoPlay();
      return; // No ejecuta el scroll vertical
    }

    // SI ES LA TARJETA DEL MEDIO (.active)
    const gameId = heroCard.dataset.id;
    const targetCard = document.querySelector(`.game-card[data-id="${gameId}"]`);

    if (targetCard) {
      const horizontalTrack = targetCard.closest('.carousel-track');
      const wrapper3D = targetCard.closest('.card-3d-wrapper');

      if (horizontalTrack && wrapper3D && horizontalTrack.centrarCard) {
        horizontalTrack.centrarCard(wrapper3D);
      }

      // Calcular la distancia vertical para centrar el juego en la pantalla
      const rect = targetCard.getBoundingClientRect();
      const targetY = rect.top + window.pageYOffset - (window.innerHeight / 2) + (rect.height / 2);

      // Iniciar el scroll animado
      smoothScrollToPosition(targetY, 900, () => {
        targetCard.classList.remove('highlight-card');
        void targetCard.offsetWidth; // Reflow
        targetCard.classList.add('highlight-card');
      });

    } else {
      console.warn(`No se encontró la tarjeta objetivo con data-id="${gameId}" en las categorías.`);
    }
  });

  // ==========================================================================
  // SOPORTE TÁCTIL (SWIPE DE A UNA CARD EN MÓVILES)
  // ==========================================================================
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    // Solo se activa si el deslizamiento es predominantemente horizontal (> 40px)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX < 0) {
        nextSlide(); // Swipe a la izquierda -> avanza 1 card
      } else {
        prevSlide(); // Swipe a la derecha -> retrocede 1 card
      }
      startAutoPlay();
    }
  }, { passive: true });

  if (dotsContainer) {
    dotsContainer.addEventListener('click', (e) => {
      const dot = e.target.closest('.hero-dot');
      if (!dot) return;

      currentIndex = Number(dot.dataset.index);
      updateCarousel();
      startAutoPlay();
    });
  }

  // Pausar reproducción automática cuando el puntero está sobre el carrusel
  track.addEventListener('mouseenter', stopAutoPlay);
  track.addEventListener('mouseleave', startAutoPlay);

  if (dotsContainer) {
    dotsContainer.addEventListener('mouseenter', stopAutoPlay);
    dotsContainer.addEventListener('mouseleave', startAutoPlay);
  }

  // Inicialización
  updateCarousel();
  startAutoPlay();
}