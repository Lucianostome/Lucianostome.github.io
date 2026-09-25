// Función para cargar componentes HTML dinámicamente
async function cargarComponente(idContenedor, rutaArchivo) {
  try {
    const respuesta = await fetch(rutaArchivo);
    if (!respuesta.ok) {
      throw new Error(`Error al cargar ${rutaArchivo}: ${respuesta.statusText}`);
    }
    const html = await respuesta.text();
    const contenedor = document.getElementById(idContenedor);
    if (contenedor) {
      contenedor.innerHTML = html;
    }
  } catch (error) {
    console.error(`Ocurrió un error inyectando el componente desde ${rutaArchivo}:`, error);
  }
}

// Evento principal que se ejecuta al abrir la página
document.addEventListener('DOMContentLoaded', async () => {
  // Carga paralela del Header y Footer
  await Promise.all([
    cargarComponente('header-container', 'header.html'),
    cargarComponente('footer-container', 'footer.html')
  ]);

  // Si tus scripts header.js o footer.js necesitan inicializar listeners 
  // (como el menú hamburguesa), puedes disparar un evento personalizado:
  document.dispatchEvent(new CustomEvent('componentesCargados'));
});


  
