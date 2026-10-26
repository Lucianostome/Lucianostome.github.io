const menu = document.getElementById('blockaMenu');
const playArea = document.getElementById('blockaPlayArea');
const welcome = document.getElementById('blockaWelcome');
const enterGameButton = document.getElementById('enterGameButton');
const startButton = document.getElementById('startGameButton');
const backButton = document.getElementById('backToMenuButton');
const nextLevelButton = document.getElementById('nextLevelButton');
const retryButton = document.getElementById('retryButton');
const helpButton = document.getElementById('helpButton');
const thumbnails = document.querySelectorAll('.blocka-thumbnail');
const pieceOptions = document.querySelectorAll('.blocka-piece-option');
const board = document.getElementById('blockaBoard');
const levelLabel = document.getElementById('blockaLevelLabel');
const status = document.getElementById('blockaStatus');
const timerLabel = document.getElementById('blockaTimer');
const selection = document.getElementById('blockaSelection');
const filtrosPorNivel = [aplicarGrises, aplicarBrillo, aplicarNegativo];
//const filters = ['grayscale(100%)', 'brightness(130%)', 'invert(100%)'];
const maxLevelTime = 60;
let selectedPieceCount = 4;
let currentLevel = 1;
let startedAt = 0;
let timer = null;
let currentImage = '';
let currentImageName = '';
const recordsStorageKey = 'blockaRecords';

enterGameButton.addEventListener('click', () => {
  document.body.classList.remove('blocka-initial-screen');
  welcome.hidden = true;
  menu.hidden = false;
  startButton.focus();
});

function aplicarGrises(imageData){
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  for (let y = 0; y < height; y++){
    for (let x = 0; x < width; x++){
      const i = (x + y * width) * 4;
      const r = data[i];
      const g = data[i+1];
      const b = data[i+2];
      
      const gris = 0.299 * r + 0.587 * g + 0.114 * b;

      data[i] = gris;
      data[i+1] = gris;
      data[i+2] = gris;
    }
  }
}

function aplicarBrillo(imageData){
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  for(let y = 0; y < height; y++){
    for(let x = 0; x < width; x++){
      const i =  (x + y * width) * 4;
      data[i] = data[i] * 1.3;
      data[i+1] = data[i+1] * 1.3;
      data[i+2] = data[i+2] * 1.3;
    }
  }
}

function aplicarNegativo(imageData){
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  for(let y = 0; y < height; y++){
    for(let x = 0; x < width; x++){
      const i = (x + y * width) * 4;
      data[i] = 255 - data[i];
      data[i+1] = 255 - data[i+1];
      data[i+2] = 255 - data[i+2];
    }
  }
}

/*function aplicarBlur(imageData){
  const data = imageData.data;
  const originalData = Array.from(data);
  const width = imageData.width;
  const height = imageData.height;
  const radio = 2;

  for (let y = 0; y < height; y++){
    for (let x = 0; x < width; x++){
      let rojo = 0;
      let verde = 0;
      let azul = 0;
      let cantidad = 0;

      for (let offsetY = -radio; offsetY <= radio; offsetY++){
        for (let offsetX = -radio; offsetX <= radio; offsetX++){
          const vecinoX = x + offsetX;
          const vecinoY = y + offsetY;
          if (vecinoX < 0 || vecinoX >= width || vecinoY < 0 || vecinoY >= height) continue;

          const i = (vecinoX + vecinoY * width) * 4;
          rojo += originalData[i];
          verde += originalData[i + 1];
          azul += originalData[i + 2];
          cantidad++;
        }
      }

      const i = (x + y * width) * 4;
      data[i] = rojo / cantidad;
      data[i + 1] = verde / cantidad;
      data[i + 2] = azul / cantidad;
    }
  }
}*/

function filtrarImagen(ruta, filtro, callback){
  const imagen = new Image();
  imagen.onload = function () { 
    const canvas = document.createElement('canvas');
    canvas.width = this.naturalWidth;
    canvas.height = this.naturalHeight;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(this, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    filtro(imageData);
    ctx.putImageData(imageData, 0, 0);

    callback(canvas.toDataURL());
  }
  imagen.src = ruta;
}

function formatTime(seconds) {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const remainder = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${remainder}`;
}

function getRecords() {
  try {
    return JSON.parse(localStorage.getItem(recordsStorageKey)) || {};
  } catch {
    return {};
  }
}

function saveRecord(level, elapsed) {
  const records = getRecords();
  if (records[level] === undefined || elapsed < records[level]) {
    records[level] = elapsed;
    localStorage.setItem(recordsStorageKey, JSON.stringify(records));
  }
  return records[level];
}

pieceOptions.forEach(option => {
  option.addEventListener('click', () => {
    selectedPieceCount = Number(option.dataset.pieces);
    pieceOptions.forEach(button => {
      const selected = button === option;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', selected);
    });
  });
});

function stopTimer() {
  clearInterval(timer);
  timer = null;
}

function startTimer() {
  startedAt = Date.now();
  timer = setInterval(updateTimer, 1000);
  updateTimer();
}

function updateTimer() {
  const elapsed = Math.floor((Date.now() - startedAt) / 1000);
  const limited = currentLevel >= 3;
  const time = formatTime(limited ? Math.min(elapsed, maxLevelTime) : elapsed);
  timerLabel.textContent = limited ? `${time} / ${formatTime(maxLevelTime)}` : time;
  timerLabel.classList.toggle('is-limited', limited && elapsed >= 50);
  if (limited && elapsed >= maxLevelTime) loseLevel();
}

function armarTablero(image, imageName, fondos) {
  board.classList.remove('is-completed');
  const columns = selectedPieceCount / 2;
  const pieces = [];
  board.style.setProperty('--cols', columns);
  // board.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
  board.setAttribute('aria-label', `Imagen del nivel dividida en ${selectedPieceCount} piezas`);

  for (let index = 0; index < selectedPieceCount; index += 1) {
    const column = index % columns;
    const row = Math.floor(index / columns);
    
    // Garantiza que arranque desordenada (1, 2 o 3; nunca 0)
    const rotation = Math.floor(Math.random() * 3) + 1;
    
    const piece = document.createElement('button');
    piece.type = 'button';
    piece.className = 'blocka-tile';
    piece.setAttribute('aria-label', `Pieza ${index + 1}`);
    piece.dataset.rotation = rotation;
    piece.dataset.angle = rotation * 90;
    
    piece.style.backgroundImage = `url("${fondos[index % fondos.length]}")`;
    piece.style.backgroundSize = `${columns * 100}% 200%`;
    piece.style.backgroundPosition = `${columns === 1 ? 0 : column / (columns - 1) * 100}% ${row * 100}%`;
    
    // ROTACIÓN LIMPIA SIN SCALE
    piece.style.transform = `rotate(${rotation * 90}deg)`;
    pieces.push(piece);
  }

  board.replaceChildren(...pieces);
  currentImage = image;
  currentImageName = imageName;
  levelLabel.textContent = `Nivel ${currentLevel}`;
  const bestTime = getRecords()[currentLevel];
  const recordLabel = bestTime === undefined ? 'Sin récord' : `Récord: ${formatTime(bestTime)}`;
  status.textContent = `${selectedPieceCount} piezas · ${imageName} · ${recordLabel}`;
  nextLevelButton.hidden = true;
  retryButton.hidden = true;
  helpButton.disabled = false;
}

function prepareBoard(image, imageName) {
  if(currentLevel === 3) {
    const fondos = [];
    let terminados = 0;

    filtrosPorNivel.forEach((filtro, i) => {
      filtrarImagen(image, filtro, fondo => {
        fondos[i] = fondo;
        terminados++;
        if(terminados === filtrosPorNivel.length) {
          armarTablero(image, imageName, fondos);
        }
      })
    })
  } else {
    filtrarImagen(image, filtrosPorNivel[currentLevel - 1], fondo => {
      armarTablero(image, imageName, [fondo]);
    });
  } 
}

function completeLevel() {
  const elapsed = Math.floor((Date.now() - startedAt) / 1000);
  const bestTime = saveRecord(currentLevel, elapsed);
  stopTimer();
  board.querySelectorAll('.blocka-tile').forEach(piece => {
    piece.style.backgroundImage = `url("${currentImage}")`;
    piece.disabled = true;
  });
  
  helpButton.disabled = true;
  setTimeout(() => {
    board.classList.add('is-completed');
  }, 1200);
  status.textContent = `¡Nivel completado! Tiempo: ${formatTime(elapsed)} · Récord: ${formatTime(bestTime)}`;
  nextLevelButton.hidden = currentLevel === 3;
}

function loseLevel() {
  stopTimer();
  board.querySelectorAll('.blocka-tile').forEach(piece => piece.disabled = true);
  helpButton.disabled = true;
  nextLevelButton.hidden = true;
  retryButton.hidden = false;
  status.textContent = 'Se agotó el tiempo. Perdiste este nivel.';
}

function rotatePiece(piece, direction) {
  if (!piece || piece.disabled || timer === null) return;

  const rotation = (Number(piece.dataset.rotation) + direction + 4) % 4;
  const angle = Number(piece.dataset.angle) + direction * 90;
  
  piece.dataset.rotation = rotation;
  piece.dataset.angle = angle;
  
  // ROTACIÓN LIMPIA SIN SCALE
  piece.style.transform = `rotate(${angle}deg)`;

  if ([...board.querySelectorAll('.blocka-tile')].every(tile => Number(tile.dataset.rotation) === 0)) {
    completeLevel();
  }
}

function useHelp() {
  if (timer === null) return;
  const piece = [...board.querySelectorAll('.blocka-tile')].find(tile => Number(tile.dataset.rotation) !== 0 && !tile.disabled);
  if (!piece) return;

  startedAt -= 5000;
  updateTimer();
  if (timer === null) return;

  piece.dataset.rotation = 0;
  piece.dataset.angle = 0;
  piece.disabled = true;
  piece.classList.add('is-fixed');
  piece.style.transition = 'none';
  piece.style.transform = 'rotate(0deg)';
  status.textContent = `Pieza ${piece.getAttribute('aria-label').replace('Pieza ', '')} fijada. +5 segundos.`;

  if ([...board.querySelectorAll('.blocka-tile')].every(tile => Number(tile.dataset.rotation) === 0)) {
    completeLevel();
  }
}

startButton.addEventListener('click', () => {
  startButton.disabled = true;
  selection.textContent = 'Eligiendo imagen...';
  startTimer();

  let steps = 0;
  let selectedImage;
  const animation = setInterval(() => {
    thumbnails.forEach(thumbnail => thumbnail.classList.remove('is-selected'));
    selectedImage = thumbnails[Math.floor(Math.random() * thumbnails.length)];
    selectedImage.classList.add('is-selected');

    if (++steps < 10) return;

    clearInterval(animation);
    prepareBoard(selectedImage.getAttribute('src'), selectedImage.dataset.name);
    selection.textContent = `Imagen elegida: ${selectedImage.dataset.name}.`;
    menu.hidden = true;
    playArea.hidden = false;
    startButton.disabled = false;
  }, 140);
});

board.addEventListener('click', event => rotatePiece(event.target.closest('.blocka-tile'), -1));
board.addEventListener('contextmenu', event => {
  const piece = event.target.closest('.blocka-tile');
  if (!piece) return;
  event.preventDefault();
  rotatePiece(piece, 1);
});

helpButton.addEventListener('click', useHelp);

nextLevelButton.addEventListener('click', () => {
  currentLevel += 1;
  playArea.hidden = true;
  menu.hidden = false;
  selection.textContent = 'Al comenzar se elegirá una imagen al azar.';
  startButton.textContent = 'Comenzar';
});

retryButton.addEventListener('click', () => {
  prepareBoard(currentImage, currentImageName);
  startTimer();
});

backButton.addEventListener('click', () => {
  stopTimer();
  currentLevel = 1;
  playArea.hidden = true;
  menu.hidden = false;
  thumbnails.forEach(thumbnail => thumbnail.classList.remove('is-selected'));
  selection.textContent = 'Al comenzar se elegirá una imagen.';
  startButton.textContent = 'Comenzar';
  timerLabel.textContent = '00:00';
  timerLabel.classList.remove('is-limited');
});
