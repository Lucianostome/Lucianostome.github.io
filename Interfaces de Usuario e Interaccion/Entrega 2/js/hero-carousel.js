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
  const btnPrev = document.querySelector('.hero-carousel-container .carousel-arrow.prev');
  const btnNext = document.querySelector('.hero-carousel-container .carousel-arrow.next');

  let currentIndex = 0;
  let autoPlayTimer = null;

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
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % cards.length;
    updateCarousel();
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    updateCarousel();
  }

  // Control del temporizador automático (4000 ms)
  function startAutoPlay() {
    stopAutoPlay();
    autoPlayTimer = setInterval(nextSlide, 4000);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) clearInterval(autoPlayTimer);
  }

  // Eventos para flechas de navegación
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      nextSlide();
      startAutoPlay();
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      prevSlide();
      startAutoPlay();
    });
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

    const gameId = heroCard.dataset.id;
    
    // Busca la primera coincidencia del juego en las categorías inferiores
    const targetCard = document.querySelector(`.game-card[data-id="${gameId}"]`);

    if (targetCard) {
      const horizontalTrack = targetCard.closest('.carousel-track');
      const wrapper3D = targetCard.closest('.card-3d-wrapper');

      console.log('horizontalTrack:', horizontalTrack);
      console.log('wrapper3D:', wrapper3D);
      console.log('tiene centrarCard:', horizontalTrack && typeof horizontalTrack.centrarCard);

      if (horizontalTrack && wrapper3D && horizontalTrack.centrarCard) {
        horizontalTrack.centrarCard(wrapper3D);
        console.log('centrarCard ejecutado');
      }
      // 2. Calcular la distancia vertical para centrar el juego en la pantalla
      const headerOffset = 100; // Espacio libre superior para evitar el header
      const rect = targetCard.getBoundingClientRect();
      const targetY = rect.top + window.pageYOffset - (window.innerHeight / 2) + (rect.height / 2);

      // 3. Iniciar el scroll animado
      smoothScrollToPosition(targetY, 900, () => {
        // Disparar el brillo de resplandor al llegar
        targetCard.classList.remove('highlight-card');
        void targetCard.offsetWidth; // Forzar reflow para reiniciar la animación
        targetCard.classList.add('highlight-card');
      });

    } else {
      console.warn(`No se encontró la tarjeta objetivo con data-id="${gameId}" en las categorías.`);
    }
  });

  // Pausar reproducción automática cuando el puntero está sobre el carrusel
  track.addEventListener('mouseenter', stopAutoPlay);
  track.addEventListener('mouseleave', startAutoPlay);

  // Inicialización
  updateCarousel();
  startAutoPlay();
}