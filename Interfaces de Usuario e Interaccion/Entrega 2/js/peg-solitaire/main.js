// 1. Instanciar el tablero
/*const miTablero = new Tablero();

// 2. Mostrar la grilla en consola como una tabla
// Mapeamos para ver '1' donde hay ficha, '.' donde está vacío y ' ' fuera del tablero
const grillaVisual = miTablero.grilla.map((fila, f) => 
  fila.map((casilla, c) => {
    if (!PLANTILLA[f][c]) return ' ';
    return casilla !== null ? `Ficha(${casilla.getTipo()})` : '[VACÍO]';
  })
);

console.log("--- ESTADO INICIAL DEL TABLERO ---");
console.table(grillaVisual);

// 3. Probar movimientos desde casillas vecinas al centro (3, 3)
// En la apertura clásica, las fichas en (1,3), (5,3), (3,1) y (3,5) tienen salto hacia el centro
console.log("Movimientos desde (1, 3):", miTablero.movimientosDesde(1, 3));
console.log("Movimientos desde (3, 1):", miTablero.movimientosDesde(3, 1));

// 4. Probar desde una esquina jugable (debería dar [] porque no hay saltos posibles)
console.log("Movimientos desde (0, 2):", miTablero.movimientosDesde(0, 2));

console.log("--- PROBANDO UN MOVIMIENTO DESDE (1, 3) ---");

// 1. Obtenemos el salto disponible desde (1, 3)
const saltos = miTablero.movimientosDesde(1, 3);
const movimiento = saltos[0]; // { destino: {f: 3, c: 3}, capturada: {f: 2, c: 3} }

// 2. Ejecutamos el movimiento
miTablero.moverFicha({ f: 1, c: 3 }, movimiento.destino, movimiento.capturada);

// 3. Imprimimos el estado del tablero nuevamente
const grillaDespues = miTablero.grilla.map((fila, f) => 
  fila.map((casilla, c) => {
    if (!PLANTILLA[f][c]) return ' ';
    return casilla !== null ? `Ficha(${casilla.getTipo()})` : '[VACÍO]';
  })
);
*/

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
    1: 'assets/peg-solitaire-img/fantasmaRojo.svg',          // Fantasma Rojo
    2: 'assets/peg-solitaire-img/fantasmaRosa.svg',          // Fantasma Rosa
    3: 'assets/peg-solitaire-img/fantasmaCeleste.svg',          // Fantasma Celeste
    4: 'assets/peg-solitaire-img/fantasmaAmarillo.svg'           // Fantasma Naranja
  }).then(() => {
    // 4. Instanciar la Vista del Tablero
    const tableroVista = new TableroVista(canvas, ctx, assetManager.getImage('fondo'));

    // 5. Instanciar la Vista de las Fichas pasándole el mapa de imágenes
    const imagenesFantasmas = {
      1: assetManager.getImage(1),
      2: assetManager.getImage(2),
      3: assetManager.getImage(3),
      4: assetManager.getImage(4)
    };
    const fichaVista = new FichaVista(ctx, imagenesFantasmas);

    const puntuacion = new Puntuacion();

    new GameController(tablero, tableroVista, fichaVista, canvas, puntuacion);

  }).catch(error => {
    console.error("Error al cargar assets del juego:", error);
  });
});