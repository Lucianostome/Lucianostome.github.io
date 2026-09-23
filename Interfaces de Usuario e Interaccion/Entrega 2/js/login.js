document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const loginCard = document.getElementById('loginCard');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      loginCard.classList.add('animated-success');

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 800);
    });
  }
});