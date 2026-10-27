class FichaVista{
    /**
   * @param {CanvasRenderingContext2D} ctx 
   * @param {Object} imagenesFantasmas Diccionario con las imágenes de los tipos de fantasmas
   */
  
    constructor(ctx, imagenesFantasmas){
        this.ctx = ctx;
        this.imagenesFantasmas = imagenesFantasmas;
    }

    dibujarFicha(ficha, posX, posY, radio = 32){
        const img = this.imagenesFantasmas[ficha.getTipo()];
        if(img){
            // Dibujar la imagen recortada en forma circular con ctx.clip();
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(posX, posY, radio, 0, Math.PI * 2);
            this.ctx.fillStyle = '#2a2aa8';
            this.ctx.fill();
            this.ctx.closePath();
            this.ctx.clip(); // Limita el dibujo al área circular de la ficha

            // Dibujar la imagen dentro del clip circular
            this.ctx.drawImage(
                img,
                posX - radio,
                posY - radio,
                radio * 2,
                radio * 2
            );
            this.ctx.restore();
        } else {
            // Fallback: Si no hay imagen disponible, dibuja un círculo coloreado
            this.ctx.beginPath();
            this.ctx.arc(posX, posY, radio, 0, Math.PI * 2);
            this.ctx.fillStyle = '#ff0000';
            this.ctx.fill();
        }
    }
}