const TIEMPO_LIMITE_SEGUNDOS = 5 * 60;

class GameController {
    /**
     * @param {Tablero} modelo Modelo que valida y conserva el estado del juego.
     * @param {TableroVista} tableroVista Vista del tablero y de sus mensajes.
     * @param {FichaVista} fichaVista Vista que dibuja las fichas.
     * @param {HTMLCanvasElement} canvas Superficie de juego y entrada del mouse.
     * @param {Puntuacion} puntuacion Registro del puntaje y movimientos.
     */
    // Conecta el modelo, las vistas y los eventos de entrada.
    constructor(modelo, tableroVista, fichaVista, canvas, puntuacion) {
        this.modelo = modelo;
        this.tableroVista = tableroVista;
        this.fichaVista = fichaVista;
        this.canvas = canvas;
        this.puntuacion = puntuacion;

        this.fichaSeleccionada = null;
        this.origen = null;
        this.movimientosValidos = [];
        this.isDragging = false;
        this.dragPos = { x: 0, y: 0 };
        this.inicioTemporizador = Date.now();
        this.tiempoRestante = TIEMPO_LIMITE_SEGUNDOS;
        this.temporizador = null;

        this._initEvents();
        this.tableroVista.actualizarEstado(this.modelo.getEstadoPartida());
        this._iniciarTemporizador();

        this._loop = this._loop.bind(this);
        requestAnimationFrame(this._loop);
    }

    // Registra los eventos de arrastre y el control HTML para reiniciar la partida.
    _initEvents() {
        this.canvas.addEventListener('mousedown', (e) => this._onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this._onMouseMove(e));
        window.addEventListener('mouseup', (e) => this._onMouseUp(e));
    }

    // Convierte las coordenadas del mouse a coordenadas internas del canvas escalado.
    _getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    // Selecciona una ficha arrastrable o activa el reinicio del mensaje final.
    _onMouseDown(e) {
        const pos = this._getMousePos(e);
        if (this.tableroVista.clickEnBotonReiniciar(pos.x, pos.y)) {
            this.reiniciarJuego();
            return;
        }
        if (this.tableroVista.clickEnSelectorFichas(pos.x, pos.y)) {
            this.fichaVista.alternarTema();
            this.render();
            return;
        }

        if (this.modelo.getEstadoPartida() !== 'jugando') {
            if (this.tableroVista.clickEnBotonReintentar(pos.x, pos.y)) {
                this.reiniciarJuego();
            }
            return;
        }

        const cell = this.tableroVista.pixelAGrilla(pos.x, pos.y);
        if (!cell) return;

        const ficha = this.modelo.getFicha(cell.f, cell.c);
        if (!ficha) return;

        const movimientos = this.modelo.movimientosDesde(cell.f, cell.c);

        this.fichaSeleccionada = ficha;
        this.origen = cell;
        this.movimientosValidos = movimientos;
        this.isDragging = true;
        this.dragPos = pos;
        this.render();
    }

    // Actualiza la posición visual de la ficha seleccionada mientras se arrastra.
    _onMouseMove(e) {
        if (!this.isDragging) {
            const pos = this._getMousePos(e);
            const sobreControl = this.tableroVista.clickEnBotonReiniciar(pos.x, pos.y) ||
                this.tableroVista.clickEnSelectorFichas(pos.x, pos.y);
            this.canvas.style.cursor = sobreControl ? 'pointer' : 'grab';
            return;
        }
        this.dragPos = this._getMousePos(e);
        this.render();
    }

    // Aplica únicamente un salto válido y devuelve la ficha a su origen si no lo es.
    _onMouseUp(e) {
        if (!this.isDragging) return;

        const pos = this._getMousePos(e);
        const destinoCell = this.tableroVista.pixelAGrilla(pos.x, pos.y);
        if (destinoCell) {
            if (this.modelo.intentarMovimiento(this.origen, destinoCell)) {
                this.puntuacion.registrarCaptura();
                this._verificarFinDeJuego();
            }
        }

        this.isDragging = false;
        this.fichaSeleccionada = null;
        this.origen = null;
        this.movimientosValidos = [];
        this.render();
    }

    // Dibuja el tablero, las fichas, el puntaje, las pistas y el resultado si terminó.
    render() {
        this.tableroVista.dibujar(this.modelo);
        this.tableroVista.dibujarFichas(this.modelo, this.fichaVista, this.isDragging ? this.origen : null);

        if (this.isDragging && this.fichaSeleccionada) {
            this.tableroVista.dibujarHints(this.movimientosValidos);
            this.fichaVista.dibujarFicha(this.fichaSeleccionada, this.dragPos.x, this.dragPos.y);
        }

        if (this.modelo.getEstadoPartida() !== 'jugando') {
            this.tableroVista.dibujarFinDeJuego(
                this.modelo.getEstadoPartida(),
                this.modelo.getContadorFichas(),
                this.puntuacion.getPuntos()
            );
        }

        this.tableroVista.dibujarHUD(
            this.puntuacion.getPuntos(),
            this._formatearTiempo(this.tiempoRestante),
            this.modelo.getContadorFichas(),
            this.puntuacion.getMovimientos(),
            this.fichaVista.getTema()
        );
    }

    // Mantiene el dibujo del canvas y la animación de los destinos durante la partida.
    _loop() {
        this.render();
        requestAnimationFrame(this._loop);
    }

    // Comprueba tras cada salto si quedan movimientos y finaliza la partida si no los hay.
    _verificarFinDeJuego() {
        const resultado = this.modelo.evaluarFinDeJuego();
        if (!resultado) return;

        this.puntuacion.aplicarBonus(resultado);

        this._detenerTemporizador();
        this.tableroVista.actualizarEstado(resultado);
    }

    // Inicia la cuenta regresiva de cinco minutos para la partida actual.
    _iniciarTemporizador() {
        this.inicioTemporizador = Date.now();
        this.temporizador = window.setInterval(() => this._actualizarTemporizador(), 1000);
        this._actualizarTemporizador();
    }

    // Actualiza el tiempo restante y termina la partida cuando llega a cero.
    _actualizarTemporizador() {
        if (this.modelo.getEstadoPartida() !== 'jugando') return;

        const transcurrido = Math.floor((Date.now() - this.inicioTemporizador) / 1000);
        this.tiempoRestante = Math.max(0, TIEMPO_LIMITE_SEGUNDOS - transcurrido);

        if (this.tiempoRestante === 0) {
            this.modelo.finalizarPorTiempo();
            this._detenerTemporizador();
            this.tableroVista.actualizarEstado(this.modelo.getEstadoPartida());
            this.render();
        }
    }

    // Detiene el intervalo para evitar que siga corriendo tras finalizar la partida.
    _detenerTemporizador() {
        if (this.temporizador !== null) {
            window.clearInterval(this.temporizador);
            this.temporizador = null;
        }
    }

    // Convierte una cantidad de segundos al formato de reloj MM:SS.
    _formatearTiempo(segundos) {
        const minutos = String(Math.floor(segundos / 60)).padStart(2, '0');
        const resto = String(segundos % 60).padStart(2, '0');
        return `${minutos}:${resto}`;
    }

    // Restaura el tablero, el puntaje y el reloj para iniciar una partida nueva.
    reiniciarJuego() {
        this._detenerTemporizador();
        this.modelo.reiniciar();
        this.puntuacion.reiniciar();
        this.isDragging = false;
        this.fichaSeleccionada = null;
        this.origen = null;
        this.movimientosValidos = [];
        this.tiempoRestante = TIEMPO_LIMITE_SEGUNDOS;

        this.tableroVista.actualizarEstado(this.modelo.getEstadoPartida());
        this._iniciarTemporizador();
        this.render();
    }
}
