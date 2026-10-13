const menu = document.getElementById('blockaMenu');
const playArea = document.getElementById('blockaPlayArea');
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
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const seconds = String(elapsed % 60).padStart(2, '0');
  const time = `${minutes}:${seconds}`;
  const limited = currentLevel >= 3;
  const maxTime = String(Math.floor(maxLevelTime / 60)).padStart(2, '0') + ':00';
  const shownElapsed = limited ? Math.min(elapsed, maxLevelTime) : elapsed;
  const shownTime = `${String(Math.floor(shownElapsed / 60)).padStart(2, '0')}:${String(shownElapsed % 60).padStart(2, '0')}`;
  timerLabel.textContent = limited ? `${shownTime} / ${maxTime}` : time;
  timerLabel.classList.toggle('is-limited', limited && elapsed >= 50);
  if (limited && elapsed >= maxLevelTime) loseLevel();
}

function prepareBoard(image, imageName) {
  const columns = selectedPieceCount / 2;
  const tileRatio = (16 / 9) * 2 / columns;
  const rotatedScale = Math.min(tileRatio, 1 / tileRatio) * 0.98;
  const pieces = [];
  board.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
  board.setAttribute('aria-label', `Imagen del nivel dividida en ${selectedPieceCount} piezas`);

  for (let index = 0; index < selectedPieceCount; index += 1) {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const rotation = index === 0 ? 1 : Math.floor(Math.random() * 4);
    const piece = document.createElement('button');
    piece.type = 'button';
    piece.className = 'blocka-tile';
    piece.setAttribute('aria-label', `Pieza ${index + 1}`);
    piece.dataset.rotation = rotation;
    piece.dataset.angle = rotation * 90;
    piece.dataset.rotatedScale = rotatedScale;
    piece.style.backgroundImage = `url("${image}")`;
    piece.style.backgroundSize = `${columns * 100}% 200%`;
    piece.style.backgroundPosition = `${columns === 1 ? 0 : column / (columns - 1) * 100}% ${row * 100}%`;
    piece.style.filter = currentLevel === 3 ? filters[index % filters.length] : filters[currentLevel - 1];
    piece.style.transform = `rotate(${rotation * 90}deg) scale(${rotation % 2 ? rotatedScale : 1})`;
    pieces.push(piece);
  }

  board.replaceChildren(...pieces);
  currentImage = image;
  currentImageName = imageName;
  levelLabel.textContent = `Nivel ${currentLevel}`;
  status.textContent = `${selectedPieceCount} piezas · ${imageName}`;
  nextLevelButton.hidden = true;
  retryButton.hidden = true;
  helpButton.disabled = false;
}

function completeLevel() {
  stopTimer();
  board.querySelectorAll('.blocka-tile').forEach(piece => {
    piece.style.filter = 'none';
    piece.disabled = true;
  });
  helpButton.disabled = true;
  status.textContent = `¡Nivel completado! Tiempo: ${timerLabel.textContent}`;
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
  piece.style.transform = `rotate(${angle}deg) scale(${rotation % 2 ? piece.dataset.rotatedScale : 1})`;

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