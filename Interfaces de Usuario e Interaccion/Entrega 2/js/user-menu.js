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