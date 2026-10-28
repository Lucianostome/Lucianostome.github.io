class FichaVista {
    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {Object} imagenesFichas Imágenes de fantasmas y frutas.
     */

    // Guarda el contexto del canvas y las imágenes de cada tipo de ficha.
    constructor(ctx, imagenesFichas) {
        this.ctx = ctx;
        this.imagenesFichas = imagenesFichas;
        this.tema = 'fantasmas';
    }

    // Dibuja la imagen de una ficha recortada en un círculo centrado en la posición indicada.
    dibujarFicha(ficha, posX, posY, radio = 32) {
        const imagenes = this.tema === 'frutas' ? this.imagenesFichas.frutas : this.imagenesFichas;
        const imagen = imagenes[ficha.getTipo()];
        if (!imagen) return;

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(posX, posY, radio, 0, Math.PI * 2);
        this.ctx.fillStyle = '#2a2aa8';
        this.ctx.fill();
        this.ctx.clip();

        const escala = (radio * 2) / Math.max(imagen.naturalWidth, imagen.naturalHeight);
        const ancho = imagen.naturalWidth * escala;
        const alto = imagen.naturalHeight * escala;
        this.ctx.drawImage(
            imagen,
            posX - ancho / 2,
            posY - alto / 2,
            ancho,
            alto
        );
        this.ctx.restore();
    }

    // Alterna entre fantasmas y frutas manteniendo la distribución del tablero.
    alternarTema() {
        this.tema = this.tema === 'fantasmas' ? 'frutas' : 'fantasmas';
    }

    // Devuelve el tema visual seleccionado para reflejarlo en el HUD.
    getTema() {
        return this.tema;
    }
}