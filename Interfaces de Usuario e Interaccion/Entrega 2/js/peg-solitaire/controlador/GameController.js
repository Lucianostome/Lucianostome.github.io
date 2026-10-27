class GameController {
    /**
   * @param {Tablero} modelo 
   * @param {TableroVista} tableroVista 
   * @param {FichaVista} fichaVista 
   * @param {HTMLCanvasElement} canvas 
   */

    constructor(modelo, tableroVista, fichaVista, canvas, puntuacion){
        this.modelo = modelo;
        this.tableroVista = tableroVista;
        this.fichaVista = fichaVista;
        this.canvas = canvas;
        this.puntuacion = puntuacion;

        this.estado = 'jugando';    // 'jugando' | 'ganado' | 'perdido'
        
        // Estado del Drag & Drop
        this.fichaSeleccionada = null;
        this.origen = null;
        this.movimientosValidos = [];
        this.isDragging = false;
        this.dragPos = {x: 0, y: 0};

        this._initEvents();

        this._loop = this._loop.bind(this);
        requestAnimationFrame(this._loop);
    }

    _initEvents(){
        this.canvas.addEventListener('mousedown', (e) => this._onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this._onMouseMove(e));
        window.addEventListener('mouseup', (e) => this._onMouseUp(e));
    }

    // Obtiene las coordenadas X, Y del clic contemplando escalado del Canvas
    _getMousePos(e){
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    _onMouseDown(e) {
        const pos = this._getMousePos(e);
        // Si el juego terminó, el único click que importa es el del botón "Reintentar"
        if (this.estado !== 'jugando') {
            if (this.tableroVista.clickEnBotonReintentar(pos.x, pos.y)) {
                this.reiniciarJuego();
            }
            return;
        }

        const cell = this.tableroVista.pixelAGrilla(pos.x, pos.y);

        if(!cell) return;

        const ficha = this.modelo.getFicha(cell.f, cell.c);
        if(ficha){
            // Obtener saltos válidos desde esta casilla
            const movs = this.modelo.movimientosDesde(cell.f, cell.c);
            // Solo permitimos arrastrar si tiene al menos un movimiento posible
            if(movs.length > 0) {
                this.fichaSeleccionada = ficha;
                this.origen = cell;
                this.movimientosValidos = movs;
                this.isDragging = true;
                this.dragPos = pos;
                this.render();
            }
        }
    }

    _onMouseMove(e){
        if(!this.isDragging) return;
        this.dragPos = this._getMousePos(e);
        this.render();
    }

    _onMouseUp(e) {
        if (!this.isDragging) return;

        const pos = this._getMousePos(e);
        const destinoCell = this.tableroVista.pixelAGrilla(pos.x, pos.y);

        if(destinoCell) {
            // Verificar si el casillero soltado coincide con alguno de los movimientos válidos
            const movValido = this.movimientosValidos.find(
                m => m.destino.f === destinoCell.f && m.destino.c === destinoCell.c
            );

            if(movValido){
                // Ejecutar el movimiento en el modelo
                this.modelo.moverFicha(this.origen, movValido.destino, movValido.capturada);
                this.puntuacion.registrarCaptura();
                this._verificarFinDeJuego();
            }
        }

        // Resetear el estado del drag
        this.isDragging = false;
        this.fichaSeleccionada = null;
        this.origen = null;
        this.movimientosValidos = [];
        this.render();
    }

    // Pide a las vistas que dibujen el estado actual del juego
    render(){
        this.tableroVista.dibujar(this.modelo);
        this.tableroVista.dibujarFichas(this.modelo, this.fichaVista, this.isDragging ? this.origen : null);
        this.tableroVista.dibujarPuntaje(this.puntuacion.getPuntos());

        if (this.isDragging && this.fichaSeleccionada) {
            this.tableroVista.dibujarHints(this.movimientosValidos);
            this.fichaVista.dibujarFicha(this.fichaSeleccionada, this.dragPos.x, this.dragPos.y);
        }

        if (this.estado !== 'jugando') {
            this.tableroVista.dibujarFinDeJuego(this.estado, this.modelo.getContadorFichas(), this.puntuacion.getPuntos());
        }
    }

    _loop() {
        this.render();
        requestAnimationFrame(this._loop);
    }

    // Después de cada movimiento: si no quedan saltos posibles, termina la partida.
    // Con una sola ficha se gana; con más de una se pierde.
    // con más de una ficha, derrota.
    _verificarFinDeJuego() {
        if (this.modelo.hayMovimientosPosibles()) {
            return;
        }
        console.log('fichas:', this.modelo.getContadorFichas(), 'centro:', this.modelo.getFicha(3, 3));
        if(this.modelo.getContadorFichas() === 1){
            const enElCentro = this.modelo.getFicha(3, 3) !== null;
            this.estado = enElCentro ? 'ganado-centro' : 'ganado';
        } else {
            this.estado = 'perdido';
        }

        this.puntuacion.aplicarBonus(this.estado);
    }

    // Vuelve todo al principio: tablero inicial y sin ningún drag en curso
    reiniciarJuego() {
        this.modelo.reiniciar();
        this.puntuacion.reiniciar();
        this.estado = 'jugando';
        this.isDragging = false;
        this.fichaSeleccionada = null;
        this.origen = null;
        this.movimientosValidos = [];
    }
}   