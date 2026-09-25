/*document.addEventListener('DOMContentLoaded', () => {
  const btnUserToggle = document.getElementById('btn-user-toggle');
  const userMenu = document.getElementById('user-menu');

  if (btnUserToggle && userMenu) {
    // Abrir o cerrar al hacer clic en el avatar/ícono de usuario
    btnUserToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // Si el menú lateral hamburguesa estuviera abierto, podés cerrarlo
      const sidebarNav = document.getElementById('sidebar-nav');
      const navOverlay = document.getElementById('nav-overlay');
      if (sidebarNav && sidebarNav.classList.contains('is-open')) {
        sidebarNav.classList.remove('is-open');
        navOverlay.classList.remove('is-active');
      }

      userMenu.classList.toggle('is-active');
    });

    // EVITAR que el menú se cierre al hacer clic DENTRO de él
    userMenu.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // CERRAR el menú si se hace clic en cualquier lugar FUERA de él
    document.addEventListener('click', () => {
      if (userMenu.classList.contains('is-active')) {
        userMenu.classList.remove('is-active');
      }
    });
  }
});*/

document.addEventListener('componentesCargados', () => {
  const btnUserToggle = document.getElementById('btn-user-toggle');
  const userMenu = document.getElementById('user-menu');

  if (btnUserToggle && userMenu) {
    btnUserToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      userMenu.classList.toggle('is-active');
    });

    document.addEventListener('click', (e) => {
      if (!userMenu.contains(e.target) && !btnUserToggle.contains(e.target)) {
        userMenu.classList.remove('is-active');
      }
    });
  }
});