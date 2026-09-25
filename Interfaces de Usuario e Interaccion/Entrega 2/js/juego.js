document.addEventListener('DOMContentLoaded', () => {
  const backButton = document.getElementById('backButton');
  const gameImageBox = document.querySelector('.game-image-box');
  const instructionsBox = document.querySelector('.instructions-box');

  function ajustarAlturaInstrucciones() {
    if (window.innerWidth <= 700) {
      instructionsBox.style.height = 'auto';
      return;
    }

    instructionsBox.style.height = `${gameImageBox.offsetHeight}px`;
  }

  ajustarAlturaInstrucciones();
  window.addEventListener('resize', ajustarAlturaInstrucciones);

  backButton.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
});
