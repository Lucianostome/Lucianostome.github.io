class Ficha {
/**
    * @param {number} tipo    tipo de fantasma (1 = rojo, 2 = rosa, 3 = celeste, 4 = naranja)
    * @param {number} fila    fila de la grilla donde está la ficha (0 a 6)
    * @param {number} columna columna de la grilla donde está la ficha (0 a 6)
*/
    constructor(tipo, fila, columna){
        this.tipo = tipo;
        this.fila = fila;
        this.columna = columna;
    }

    /** Devuelve el tipo de la ficha (la vista lo usa para elegir la imagen del fantasma). */
    getTipo(){
        return this.tipo;
    }

    getFila(){
        return this.fila;
    }

    getColumna(){
        return this.columna;
    }

    getPosicion(){
        return {
            fila: this.fila, columna: this.columna
        }
    }

    setPosicion(fila, columna){
        this.fila = fila;
        this.columna = columna;
    }
}