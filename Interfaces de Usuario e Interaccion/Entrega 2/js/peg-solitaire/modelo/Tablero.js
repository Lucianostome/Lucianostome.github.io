// Plantilla de la cruz: 1 = casillero jugable, 0 = fuera del tablero
const PLANTILLA = [
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
];

const MAPA_TIPOS = [
      [0, 0, 1, 2, 1, 0, 0],
      [0, 0, 3, 4, 3, 0, 0],
      [1, 2, 3, 4, 3, 2, 1],
      [2, 3, 4, 0, 4, 3, 2],
      [1, 2, 3, 4, 3, 2, 1],
      [0, 0, 3, 4, 3, 0, 0],
      [0, 0, 1, 2, 1, 0, 0]
    ];

// Las 4 direcciones en las que se puede saltar
const DIRECCIONES = [
  { df: -1, dc: 0 },  // arriba
  { df: 1, dc: 0 },   // abajo
  { df: 0, dc: -1 },  // izquierda
  { df: 0, dc: 1 },   // derecha
];

class Tablero {
    constructor(cantidadTipos = 4){
        this.cantidadTipos = cantidadTipos;
        this.reiniciar();
    }

    // Arma el tablero inicial: fichas en todos los casilleros menos el del centro
    reiniciar() {
    // Matriz de distribución fija de personajes

    this.grilla = [];
    for (let f = 0; f < 7; f++) {
      this.grilla[f] = [];
      for (let c = 0; c < 7; c++) {
        const tipo = MAPA_TIPOS[f][c];
        
        // Si el casillero es jugable y tiene tipo asignado (> 0), creamos la ficha
        if (PLANTILLA[f][c] === 1 && tipo > 0) {
          this.grilla[f][c] = new Ficha(tipo, f, c);
        } else {
          this.grilla[f][c] = null; // Casillero vacío (incluye el centro [3][3])
        }
      }
    }
  }

    esCasilleroJugable(f, c) {
        return f >= 0 && f < 7 && c >= 0 && c < 7 && PLANTILLA[f][c] === 1;
    }

    getFicha(f, c){
        if (!this.esCasilleroJugable(f, c)) return null;
        return this.grilla[f][c];
    }

    esVacio(f, c){
        return this.esCasilleroJugable(f, c) && this.grilla[f][c] === null;
    }

    /**
   * Devuelve un arreglo con los saltos posibles de la ficha en (f, c)
   * Cada salto es un objeto { destino: { f, c }, capturada: { f, c } }
   */
    movimientosDesde(f, c) {
        const fichaOrigen = this.getFicha(f, c);

        // 1. Si no hay ficha en (f, c), no hay movimientos posibles
        if(!fichaOrigen){
            return [];
        }

        const movimientosValidos = [];

        // 2. Recorrer las 4 direcciones (arriba, abajo, izquierda, derecha)
        for(const dir of DIRECCIONES) {
            // 3. Calcular casillero intermedio (a 1 casilla de distancia) y de destino (a 2 casillas)
            const fMedio = f + dir.df;
            const cMedio = c + dir.dc;

            const fDestino = f + dir.df * 2;
            const cDestino = c + dir.dc * 2;

            // 4. Condiciones para salto válido:
            // - Que en el medio HAYA una ficha
            // - Que el casillero de destino esté JUGABLE y VACÍO
            const hayFichaEnMedio = this.getFicha(fMedio, cMedio) !== null;
            const destinoEstaVacio = this.esVacio(fDestino, cDestino);

            if(hayFichaEnMedio && destinoEstaVacio){
                movimientosValidos.push({
                    destino: { f: fDestino, c: cDestino},
                    capturada: {f: fMedio, c: cMedio}
                });
            }
        }
        return movimientosValidos;
    }

    moverFicha(origen, destino, capturada){
        const ficha = this.grilla[origen.f][origen.c];

        ficha.setPosicion(destino.f, destino.c);

        this.grilla[destino.f][destino.c] = ficha;
        this.grilla[origen.f][origen.c] = null;

        this.grilla[capturada.f][capturada.c] = null;
    }

    hayMovimientosPosibles(){
        for(let f = 0; f < 7; f++){
            for(let c = 0; c < 7; c++){
                if(this.grilla[f][c] !== null) {
                    if(this.movimientosDesde(f, c).length > 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    getContadorFichas(){
        let contador = 0;
        for(let f = 0; f < 7; f++){
            for(let c = 0; c < 7; c++){
                if(this.grilla[f][c] !== null) contador++;
            }
        }
        return contador;
    }
}