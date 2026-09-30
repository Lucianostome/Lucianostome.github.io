document.addEventListener('DOMContentLoaded', () => {
  cargarHeader();
  cargarFooter();
});

async function cargarHeader() {
  const container = document.getElementById('header-container');
  if (!container) return;

  // Detecta si la página actual es Login o Registro
  const path = window.location.pathname;
  const esPaginaAuth = path.includes('login.html') || path.includes('registro.html');

  // Selecciona la plantilla HTML adecuada
  const archivoHeader = esPaginaAuth ? 'header-auth.html' : 'header.html';

  try {
    const respuesta = await fetch(archivoHeader);
    if (!respuesta.ok) throw new Error(`Error al cargar ${archivoHeader}`);

    container.innerHTML = await respuesta.text();

    // SOLO si no estamos en Login/Registro, avisamos a sidebar.js y user-menu.js
    if (!esPaginaAuth) {
      document.dispatchEvent(new CustomEvent('componentesCargados'));
    }
  } catch (error) {
    console.error('Error inyectando el header:', error);
  }
}

async function cargarFooter() {
  const container = document.getElementById('footer-container');
  if (!container) return;

  try {
    const respuesta = await fetch('footer.html');
    if (!respuesta.ok) throw new Error('Error al cargar footer.html');
    container.innerHTML = await respuesta.text();
  } catch (error) {
    console.error('Error inyectando el footer:', error);
  }
}