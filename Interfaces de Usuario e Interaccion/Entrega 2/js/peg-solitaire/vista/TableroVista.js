class TableroVista {
    /**
   * @param {HTMLCanvasElement} canvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {Image} bgImage Imagen de fondo
   */

    // Calcula y conserva la geometría del tablero dentro del canvas.
    constructor(canvas, ctx, bgImage) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.bgImage = bgImage;

        this.gridSize = 7;
        this.hudHeight = 72;
        this.tileSize = Math.floor(Math.min(
            this.canvas.width / this.gridSize,
            (this.canvas.height - this.hudHeight) / this.gridSize
        ));
        this.offsetX = (this.canvas.width - this.gridSize * this.tileSize) / 2;
        this.offsetY = this.hudHeight +
            (this.canvas.height - this.hudHeight - this.gridSize * this.tileSize) / 2;
    }

    // Convierte una posición de la grilla a coordenadas X e Y del canvas.
    getCoordenadasPixel(fila, columna){
        return {
            x: this.offsetX + columna * this.tileSize + this.tileSize / 2,
            y: this.offsetY + fila * this.tileSize + this.tileSize / 2
        };
    }

    // Resalta con un pulso animado los destinos válidos de la ficha seleccionada.
    dibujarHints(movimientos){
        const pulso = (Math.sin(performance.now() / 200) + 1) / 2; // va de 0 a 1;
        for(const m of movimientos){
            const pos = this.getCoordenadasPixel(m.destino.f, m.destino.c);
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, this.tileSize / 2 - 8 + pulso * 4, 0, Math.PI * 2);
            this.ctx.strokeStyle = `rgba(255, 255, 0, ${0.4 + pulso * 0.6})`;
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
        }
    }

    // Dibuja las fichas del modelo, omitiendo la que se encuentra en curso de arrastre.
    dibujarFichas(modelo, fichaVista, origenOculto) {
        for (let f = 0; f < this.gridSize; f++) {
            for (let c = 0; c < this.gridSize; c++) {
                const ficha = modelo.getFicha(f, c);
                const estaOculta = origenOculto && origenOculto.f === f && origenOculto.c === c;

                if (ficha && !estaOculta) {
                    const pos = this.getCoordenadasPixel(f, c);
                    fichaVista.dibujarFicha(ficha, pos.x, pos.y);
                }
            }
        }
    }

    // Dibuja la imagen de fondo y los huecos de todas las casillas jugables.
    dibujar(tableroModel){
        // 1. Limpiar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 2. Dibujar imagen de fondo si existe
        if(this.bgImage){
            this.ctx.drawImage(this.bgImage, 0, 0, this.canvas.width, this.canvas.height)
        }

        // 3. Dibujar las casillas jugables (huecos vacíos)
        for(let f = 0; f < 7; f++) {
            for(let c = 0; c < 7; c++){
                if(tableroModel.esCasilleroJugable(f, c)){
                    const pos = this.getCoordenadasPixel(f,c);

                    // Dibujar el espacio/hueco de la celda
                    this.ctx.beginPath();
                    this.ctx.arc(pos.x, pos.y, this.tileSize / 2 - 6, 0, Math.PI * 2);
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                    this.ctx.fill();
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeStyle = '#1d1d81';
                    this.ctx.stroke();
                }
            }
        }
    }

    // Convierte una posición del canvas en una casilla de la grilla.
    pixelAGrilla(x, y) {
        const c = Math.floor((x - this.offsetX) / this.tileSize);
        const f = Math.floor((y - this.offsetY) / this.tileSize);

        if (f >= 0 && f < this.gridSize && c >= 0 && c < this.gridSize) {
            return { f, c };
        }
        return null;
    }

    // Calcula el rectángulo del botón «Reintentar» del mensaje final.
    getRectBotonReintentar() {
        const w = 200;
        const h = 50;
        return { x: (this.canvas.width - w) / 2, y: this.canvas.height / 2 + 60, w, h };
    }

    // Indica si el clic cae dentro del botón «Reintentar».
    clickEnBotonReintentar(x, y){
        const b = this.getRectBotonReintentar();
        return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
    }

    // Calcula el área del botón de reinicio en la franja superior del canvas.
    getRectBotonReiniciar() {
        return { x: this.canvas.width - 212, y: 13, w: 188, h: 46 };
    }

    // Indica si el mouse está sobre el botón de reinicio del HUD.
    clickEnBotonReiniciar(x, y) {
        const boton = this.getRectBotonReiniciar();
        return x >= boton.x && x <= boton.x + boton.w &&
            y >= boton.y && y <= boton.y + boton.h;
    }

    // Calcula el área del selector que alterna el aspecto de las fichas.
    getRectSelectorFichas() {
        return { x: 760, y: 13, w: 284, h: 46 };
    }

    // Indica si el mouse está sobre el selector de fichas del HUD.
    clickEnSelectorFichas(x, y) {
        const boton = this.getRectSelectorFichas();
        return x >= boton.x && x <= boton.x + boton.w &&
            y >= boton.y && y <= boton.y + boton.h;
    }

    // Dibuja el resultado final, el puntaje y la opción de volver a jugar.
    dibujarFinDeJuego(estado, fichasRestantes, puntos){
        const ctx = this.ctx;
        const centroX = this.canvas.width / 2;
        const centroY = this.canvas.height / 2;

        const mensajes = {
            'ganado-centro': { titulo: '¡Partida perfecta!', detalle: 'Dejaste la última ficha en el centro', color: '#facc15' },
            'ganado':        { titulo: '¡Ganaste!',          detalle: 'Quedó una sola ficha, pero no en el centro', color: '#a3e635' },
            'perdido':       { titulo: 'Sin movimientos',    detalle: `Quedaron ${fichasRestantes} fichas`, color: '#ff4d4d' },
            'tiempo-agotado': { titulo: '¡Se acabó el tiempo!', detalle: `Quedaron ${fichasRestantes} fichas`, color: '#ff4d4d' }
        };
        const msg = mensajes[estado];


        // Capa oscura semitransparente sobre todo el canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Título: ganaste o perdiste
        ctx.fillStyle = msg.color;
        ctx.font = 'bold 48px "Space Grotesk", sans-serif';
        ctx.fillText(msg.titulo, centroX, centroY - 60);

        // Subtítulo con las fichas que quedaron
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px "Space Grotesk", sans-serif';
        ctx.fillText(msg.detalle, centroX, centroY - 15);
        ctx.fillText(`Puntaje final: ${puntos}`, centroX, centroY + 15);    

        // Botón "Reintentar"
        const b = this.getRectBotonReintentar();
        ctx.fillStyle = '#8b3ff2';
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px "Space Grotesk", sans-serif';
        ctx.fillText('Reintentar', centroX, b.y + b.h / 2);
    }
    
    // Dibuja el HUD en una franja integrada y reserva el área inferior para el tablero.
    dibujarHUD(puntos, tiempo, fichas, movimientos, tema) {
        const ctx = this.ctx;
        const boton = this.getRectBotonReiniciar();
        const selector = this.getRectSelectorFichas();

        ctx.fillStyle = 'rgba(2, 14, 48, 0.94)';
        ctx.fillRect(0, 0, this.canvas.width, this.hudHeight);
        ctx.fillStyle = '#8b3ff2';
        ctx.fillRect(0, this.hudHeight - 2, this.canvas.width, 2);

        ctx.strokeStyle = 'rgba(185, 200, 237, 0.35)';
        ctx.lineWidth = 1;
        for (const x of [190, 360, 540, 748, this.canvas.width - 236]) {
            ctx.beginPath();
            ctx.moveTo(x, 15);
            ctx.lineTo(x, this.hudHeight - 15);
            ctx.stroke();
        }

        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#b9c8ed';
        ctx.font = 'bold 13px "Space Grotesk", sans-serif';
        ctx.fillText('SCORE', 24, 21);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px "Space Grotesk", sans-serif';
        ctx.fillText(String(puntos).padStart(4, '0'), 24, 49);

        ctx.fillStyle = '#b9c8ed';
        ctx.font = 'bold 13px "Space Grotesk", sans-serif';
        ctx.fillText('TIEMPO', 214, 21);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px "Space Grotesk", sans-serif';
        ctx.fillText(tiempo, 214, 49);

        ctx.fillStyle = '#b9c8ed';
        ctx.font = 'bold 13px "Space Grotesk", sans-serif';
        ctx.fillText('FICHAS', 384, 21);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px "Space Grotesk", sans-serif';
        ctx.fillText(String(fichas), 384, 49);

        ctx.fillStyle = '#b9c8ed';
        ctx.font = 'bold 13px "Space Grotesk", sans-serif';
        ctx.fillText('MOVIMIENTOS', 564, 21);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px "Space Grotesk", sans-serif';
        ctx.fillText(String(movimientos), 564, 49);

        ctx.beginPath();
        ctx.roundRect(selector.x, selector.y, selector.w, selector.h, 6);
        ctx.fillStyle = '#172b5c';
        ctx.fill();
        ctx.strokeStyle = '#8b3ff2';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
            `CAMBIAR FICHAS: ${tema === 'frutas' ? 'FRUTAS' : 'FANTASMAS'}`,
            selector.x + selector.w / 2,
            selector.y + selector.h / 2
        );

        ctx.beginPath();
        ctx.roundRect(boton.x, boton.y, boton.w, boton.h, 6);
        ctx.fillStyle = '#8b3ff2';
        ctx.fill();
        ctx.strokeStyle = '#c9a6ff';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('REINICIAR', boton.x + boton.w / 2, boton.y + boton.h / 2);
    }
}