const PUNTOS_POR_CAPTURA = 10;
const BONUS_GANADO = 50;
const BONUS_GANADO_CENTRO = 100;

class Puntuacion {
    constructor() {
        this.reiniciar();
    }

    // Pone el puntaje y el contador de movimientos en cero
    reiniciar() {
        this.puntos = 0;
        this.movimientos = 0;
    }

    registrarCaptura(){
        this.puntos += PUNTOS_POR_CAPTURA;
        this.movimientos++;
    }

    aplicarBonus(estado){
        if(estado === 'ganado-centro') this.puntos += BONUS_GANADO_CENTRO;
        else if(estado === 'ganado') this.puntos += BONUS_GANADO; 
    }

    getPuntos(){
        return this.puntos;
    }

    getMovimientos(){
        return this.movimientos;
    }
}