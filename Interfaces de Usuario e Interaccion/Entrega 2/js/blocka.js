const menu = document.getElementById('blockaMenu');
const playArea = document.getElementById('blockaPlayArea');
const startButton = document.getElementById('startGameButton');
const backButton = document.getElementById('backToMenuButton');
const nextLevelButton = document.getElementById('nextLevelButton');
const thumbnails = document.querySelectorAll('.blocka-thumbnail');
const pieceOptions = document.querySelectorAll('.blocka-piece-option');
const board = document.getElementById('blockaBoard');
const levelLabel = document.getElementById('blockaLevelLabel');
const status = document.getElementById('blockaStatus');
const timerLabel = document.getElementById('blockaTimer');
const selection = document.getElementById('blockaSelection');
const filters = ['grayscale(100%)', 'brightness(160%)', 'invert(100%)'];
let selectedPieceCount = 4;
let currentLevel = 1;
let startedAt = 0;
let timer = null;

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
  timerLabel.textContent = '00:00';
  timer = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const seconds = String(elapsed % 60).padStart(2, '0');
    timerLabel.textContent = `${minutes}:${seconds}`;
  }, 1000);
}

function prepareBoard(image, imageName) {
  const columns = selectedPieceCount / 2;
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
    piece.style.backgroundImage = `url("${image}")`;
    piece.style.backgroundSize = `${columns * 100}% 200%`;
    piece.style.backgroundPosition = `${columns === 1 ? 0 : column / (columns - 1) * 100}% ${row * 100}%`;
    piece.style.filter = currentLevel === 3 ? filters[index % filters.length] : filters[currentLevel - 1];
    piece.style.transform = `rotate(${rotation * 90}deg)`;
    pieces.push(piece);
  }

  board.replaceChildren(...pieces);
  levelLabel.textContent = `Nivel ${currentLevel}`;
  status.textContent = `${selectedPieceCount} piezas · ${imageName}`;
  nextLevelButton.hidden = true;
}

function completeLevel() {
  stopTimer();
  board.querySelectorAll('.blocka-tile').forEach(piece => piece.style.filter = 'none');
  status.textContent = `¡Nivel completado! Tiempo: ${timerLabel.textContent}`;
  nextLevelButton.hidden = currentLevel === 3;
}

function rotatePiece(piece, direction) {
  if (!piece || timer === null) return;

  const rotation = (Number(piece.dataset.rotation) + direction + 4) % 4;
  piece.dataset.rotation = rotation;
  piece.style.transform = `rotate(${rotation * 90}deg)`;

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

nextLevelButton.addEventListener('click', () => {
  currentLevel += 1;
  playArea.hidden = true;
  menu.hidden = false;
  selection.textContent = `Nivel ${currentLevel}: se sorteará una nueva imagen.`;
  startButton.textContent = `Comenzar nivel ${currentLevel}`;
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
});