document.addEventListener('DOMContentLoaded', () => {
  const btnMenuToggle = document.getElementById('btn-menu-toggle');
  const sidebarNav = document.getElementById('sidebar-nav');
  const navOverlay = document.getElementById('nav-overlay');

  // Función alternar (abrir/cerrar)
  const toggleMenu = () => {
    sidebarNav.classList.toggle('is-open');
    navOverlay.classList.toggle('is-active');
  };

  // Función cerrar obligatoria
  const closeMenu = () => {
    sidebarNav.classList.remove('is-open');
    navOverlay.classList.remove('is-active');
  };

  // 1. Tocar el logo del menú hamburguesa abre y cierra
  if (btnMenuToggle) {
    btnMenuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });
  }

  // 2. Tocar la capa transparente por afuera del menú lo cierra
  if (navOverlay) {
    navOverlay.addEventListener('click', closeMenu);
  }

  // 3. Resguardo: tocar cualquier parte del documento fuera del sidebar también lo cierrsa
  document.addEventListener('click', (e) => {
    const isClickInsideMenu = sidebarNav.contains(e.target);
    const isClickOnToggle = btnMenuToggle.contains(e.target);

    if (!isClickInsideMenu && !isClickOnToggle && sidebarNav.classList.contains('is-open')) {
      closeMenu();
    }
  });
});