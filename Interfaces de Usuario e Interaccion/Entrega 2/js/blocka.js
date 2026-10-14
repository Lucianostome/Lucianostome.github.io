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
const filters = ['grayscale(100%)', 'brightness(130%)', 'invert(100%)'];
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

function prepareBoard(image, imageName) {
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
    
    piece.style.backgroundImage = `url("${image}")`;
    piece.style.backgroundSize = `${columns * 100}% 200%`;
    piece.style.backgroundPosition = `${columns === 1 ? 0 : column / (columns - 1) * 100}% ${row * 100}%`;
    piece.style.filter = currentLevel === 3 ? filters[index % filters.length] : filters[currentLevel - 1];
    
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

function completeLevel() {
  const elapsed = Math.floor((Date.now() - startedAt) / 1000);
  const bestTime = saveRecord(currentLevel, elapsed);
  stopTimer();
  board.querySelectorAll('.blocka-tile').forEach(piece => {
    piece.style.filter = 'none';
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
