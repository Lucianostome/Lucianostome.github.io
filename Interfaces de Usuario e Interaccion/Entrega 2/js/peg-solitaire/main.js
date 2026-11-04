document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('solitaireCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // 1. Crear la instancia del Modelo
  const tablero = new Tablero();

  // 2. Instanciar el AssetManager
  const assetManager = new AssetManager();

  // 3. Cargar imágenes (Asegurate de que las rutas coincidan con tus archivos en assets/)
  assetManager.loadImages({
    fondo: 'assets/peg-solitaire-img/fondo-peg2.jpg',  // Imagen para el fondo (o la que uses)
    frutilla: 'assets/peg-solitaire-img/frutilla.svg',
    cereza: 'assets/peg-solitaire-img/cereza.svg',
    naranja: 'assets/peg-solitaire-img/naranja.svg',
    manzana: 'assets/peg-solitaire-img/manzana.svg',
    rojo: 'assets/peg-solitaire-img/fantasmaRojo.svg',          // Fantasma Rojo
    rosa: 'assets/peg-solitaire-img/fantasmaRosa.svg',          // Fantasma Rosa
    celeste: 'assets/peg-solitaire-img/fantasmaCeleste.svg',          // Fantasma Celeste
    amarillo: 'assets/peg-solitaire-img/fantasmaAmarillo.svg'           // Fantasma Naranja
  }).then(() => {
    const controles = {
      estado: document.getElementById('gameStatus')
    };

    // 4. Instanciar la Vista del Tablero
    const tableroVista = new TableroVista(canvas, ctx, assetManager.getImage('fondo'), controles.estado);

    // 5. Instanciar la Vista de las Fichas pasándole el mapa de imágenes
    const imagenesFichas = {
      1: assetManager.getImage('rojo'),
      2: assetManager.getImage('rosa'),
      3: assetManager.getImage('celeste'),
      4: assetManager.getImage('amarillo'),
      frutas: {
        1: assetManager.getImage('frutilla'),
        2: assetManager.getImage('cereza'),
        3: assetManager.getImage('naranja'),
        4: assetManager.getImage('manzana')
      }
    };
    const fichaVista = new FichaVista(ctx, imagenesFichas);

    const puntuacion = new Puntuacion();

    // Inicia el juego una vez cargadas sus imágenes y conectadas las vistas.
    new GameController(tablero, tableroVista, fichaVista, canvas, puntuacion);

  }).catch(error => {
    console.error("Error al cargar assets del juego:", error);
  });
});