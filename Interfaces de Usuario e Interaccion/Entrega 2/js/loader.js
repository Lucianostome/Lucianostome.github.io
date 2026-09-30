document.addEventListener('DOMContentLoaded', () => {
  const loaderOverlay = document.getElementById('loader-overlay');
  const loaderBarFill = document.getElementById('loader-bar-fill');
  const loaderPercentage = document.getElementById('loader-percentage');

  if (loaderOverlay && loaderBarFill && loaderPercentage) {
    let progress = 0;
    const duration = 5000; // Tiempo total en ms (5 segundos)
    const intervalTime = 50; // Frecuencia de actualización
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      progress += step;

      if (progress >= 100) {
        progress = 100;
        clearInterval(timer);

        // Ocultar el loader con desvanecimiento al completar
        setTimeout(() => {
          loaderOverlay.classList.add('is-hidden');
        }, 200);
      }

      // Actualizar el porcentaje visual y la barra
      const currentPercent = Math.floor(progress);
      loaderPercentage.textContent = `${currentPercent}%`;
      loaderBarFill.style.width = `${currentPercent}%`;
    }, intervalTime);
  }
});