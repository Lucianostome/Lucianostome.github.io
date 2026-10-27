class TableroVista {
    /**
   * @param {HTMLCanvasElement} canvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {Image} bgImage Imagen de fondo
   */

    constructor(canvas, ctx, bgImage) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.bgImage = bgImage;

        // Configuración de la grilla en el Canvas
        this.gridSize = 7;
        this.tileSize = Math.floor(Math.min(this.canvas.width, this.canvas.height) / this.gridSize);; // Tamaño en px de cada casillero
        
        // Centrar el tablero en el canvas
        this.offsetX = (this.canvas.width - this.gridSize * this.tileSize) / 2;
        this.offsetY = (this.canvas.height - this.gridSize * this.tileSize) / 2;
    }

    // Convierte fila y columna del tablero a coordenadas X, Y en píxeles
    getCoordenadasPixel(fila, columna){
        return {
            x: this.offsetX + columna * this.tileSize + this.tileSize / 2,
            y: this.offsetY + fila * this.tileSize + this.tileSize / 2
        };
    }

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

    // Dibuja todas las fichas del modelo. Si se pasa origenOculto, esa ficha no se dibuja
    // (es la que se está arrastrando y se dibuja aparte, siguiendo al mouse)
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

    // Dibuja el fondo y las casillas del tablero
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

    pixelAGrilla(x, y) {
        const c = Math.floor((x - this.offsetX) / this.tileSize);
        const f = Math.floor((y - this.offsetY) / this.tileSize);

        if (f >= 0 && f < this.gridSize && c >= 0 && c < this.gridSize) {
            return { f, c };
        }
        return null;
    }

    // Calcula el rectángulo del botón "Reintentar" (centrado horizontalmente en el canvas)
    getRectBotonReintentar() {
        const w = 200;
        const h = 50;
        return { x: (this.canvas.width - w) / 2, y: this.canvas.height / 2 + 60, w, h };
    }

    // Dice si el punto (x, y) cae dentro del botón "Reintentar"
    clickEnBotonReintentar(x, y){
        const b = this.getRectBotonReintentar();
        return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
    }

    // Dibuja el cartel de fin de juego sobre el tablero, con el botón para reintentar
    dibujarFinDeJuego(estado, fichasRestantes, puntos){
        const ctx = this.ctx;
        const centroX = this.canvas.width / 2;
        const centroY = this.canvas.height / 2;

        const mensajes = {
            'ganado-centro': { titulo: '¡Partida perfecta!', detalle: 'Dejaste la última ficha en el centro', color: '#facc15' },
            'ganado':        { titulo: '¡Ganaste!',          detalle: 'Quedó una sola ficha, pero no en el centro', color: '#a3e635' },
            'perdido':       { titulo: 'Perdiste',           detalle: `Quedaron ${fichasRestantes} fichas`, color: '#ff4d4d' }
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
    
    dibujarPuntaje(puntos){
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 22px "Space Grotesk", sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(`SCORE: ${String(puntos).padStart(4, '0')}`, 20, 16);
    }
}