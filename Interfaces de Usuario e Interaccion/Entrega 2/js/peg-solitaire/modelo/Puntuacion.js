const PUNTOS_POR_CAPTURA = 10;
const BONUS_GANADO = 50;
const BONUS_GANADO_CENTRO = 100;

class Puntuacion {
    // Inicializa el puntaje y el contador de movimientos.
    constructor() {
        this.reiniciar();
    }

    // Pone el puntaje y el contador de movimientos en cero.
    reiniciar() {
        this.puntos = 0;
        this.movimientos = 0;
    }

    // Suma los puntos de una captura y registra el movimiento realizado.
    registrarCaptura(){
        this.puntos += PUNTOS_POR_CAPTURA;
        this.movimientos++;
    }

    // Agrega el bono correspondiente cuando la partida termina con una victoria.
    aplicarBonus(estado){
        if(estado === 'ganado-centro') this.puntos += BONUS_GANADO_CENTRO;
        else if(estado === 'ganado') this.puntos += BONUS_GANADO; 
    }

    // Devuelve el puntaje acumulado.
    getPuntos(){
        return this.puntos;
    }

    // Devuelve la cantidad de movimientos realizados.
    getMovimientos(){
        return this.movimientos;
    }
}