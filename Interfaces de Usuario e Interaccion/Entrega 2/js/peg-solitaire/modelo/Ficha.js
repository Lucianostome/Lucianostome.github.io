class Ficha {
    /**
    * @param {number} tipo    tipo de fantasma (1 = rojo, 2 = rosa, 3 = celeste, 4 = naranja)
    * @param {number} fila    fila de la grilla donde está la ficha (0 a 6)
    * @param {number} columna columna de la grilla donde está la ficha (0 a 6)
    */
    // Crea una ficha con su tipo y su posición inicial en la grilla.
    constructor(tipo, fila, columna){
        this.tipo = tipo;
        this.fila = fila;
        this.columna = columna;
    }

    /** Devuelve el tipo, usado por la vista para seleccionar la imagen del fantasma. */
    getTipo(){
        return this.tipo;
    }

    /** Devuelve la fila actual de la ficha. */
    getFila(){
        return this.fila;
    }

    /** Devuelve la columna actual de la ficha. */
    getColumna(){
        return this.columna;
    }

    /** Devuelve la posición actual como coordenadas de fila y columna. */
    getPosicion(){
        return {
            fila: this.fila, columna: this.columna
        }
    }

    /** Actualiza la posición de la ficha después de un movimiento válido. */
    setPosicion(fila, columna){
        this.fila = fila;
        this.columna = columna;
    }
}