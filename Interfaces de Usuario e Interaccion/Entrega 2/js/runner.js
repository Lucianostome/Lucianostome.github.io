document.addEventListener('DOMContentLoaded', () => {
  const stage = document.getElementById('runnerStage');
  const world = document.getElementById('runnerWorld');
  const entitiesContainer = document.getElementById('runnerEntities');
  const playerElement = document.getElementById('runnerPlayer');
  const playerMotion = document.getElementById('runnerPlayerMotion');
  const playerSheet = document.querySelector('.runner-sprite-sheet');
  const overlay = document.getElementById('runnerOverlay');
  const overlayTitle = document.getElementById('runnerOverlayTitle');
  const overlayText = document.getElementById('runnerOverlayText');
  const startButton = document.getElementById('runnerStartButton');
  const scoreElement = document.getElementById('runnerScore');
  const livesElement = document.getElementById('runnerLives');
  const timeElement = document.getElementById('runnerTime');
  const statusElement = document.getElementById('runnerGameStatus');

  const WORLD_WIDTH = 960;
  const WORLD_HEIGHT = 540;
  const MIN_GAP = 100;
  const GAP_PROGRESS_DISTANCE = 12000;
  const PIPE_PROGRESS_DISTANCE = 12000;
  const MIN_GAP_CENTER_CHANGE = 45;
  const MAX_GAP_CENTER_CHANGE = 100;
  const PLAYER_WIDTH = 64;
  const PLAYER_HEIGHT = 48;
  const PLAYER_X = 180;
  const RUN_SPEED = 240;
  const GAME_TIME_LIMIT = 90;
  const GRAVITY = 1050;
  const FLAP_SPEED = -390;
  const PLAYER_FRAMES = {
    fly: { row: 0, count: 10, interval: 0.09 },
    boost: { row: 4, count: 3, interval: 0.08 },
    hurt: { row: 2, count: 3, interval: 0.11 }
  };
  const ASSETS = [
    'assets/runner/Popo-AnimationSheet.png',
    'assets/runner/Eyeball.png',
    'assets/runner/gold_spin.png',
    'assets/runner/gold_collect.png',
    'assets/runner/HearTile/Cuore1.png',
    'assets/runner/HearTile/Cuore2.png',
    'assets/runner/HearTile/Cuore3.png',
    'assets/runner/HearTile/Cuore4.png',
    'assets/runner/HearTile/Cuore5.png',
    'assets/runner/HearTile/Cuore6.png',
    'assets/runner/HearTile/Cuore7.png',
    'assets/runner/HearTile/Cuore8.png',
    'assets/runner/tuberia/PipeStyle1.png',
    'assets/runner/forest/forest_sky.png',
    'assets/runner/forest/forest_mountain.png',
    'assets/runner/forest/forest_back.png',
    'assets/runner/forest/forest_mid.png',
    'assets/runner/forest/forest_short.png',
    'assets/runner/forest/forest_long.png'
  ];

  const layers = Array.from(document.querySelectorAll('.runner-layer'), (element) => ({
    element,
    speed: Number(element.dataset.speed),
    offset: 0
  }));
  const state = {
    ready: false,
    running: false,
    score: 0,
    lives: 3,
    timeRemaining: GAME_TIME_LIMIT,
    distance: 0,
    nextPipeX: WORLD_WIDTH + 90,
    lastGapCenter: WORLD_HEIGHT / 2,
    pipeCount: 0,
    pipesUntilHeart: 8 + Math.floor(Math.random() * 5),
    enemyTimer: 4,
    invulnerable: 0,
    boostTimer: 0,
    hurtTimer: 0,
    animationTime: 0,
    lastFrame: 0,
    player: { y: 228, velocityY: 0 },
    pipes: [],
    coins: [],
    hearts: [],
    enemies: []
  };
  const heartFrames = Array.from({ length: 8 }, (_, index) => (
    `assets/runner/HearTile/Cuore${index + 1}.png`
  ));

  function preloadImage(source) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`No se pudo cargar el recurso ${source}`));
      image.src = source;
    });
  }

  function setWorldScale() {
    const scale = stage.clientWidth / WORLD_WIDTH;
    world.style.transform = `scale(${scale})`;
  }

  function clearEntities() {
    state.pipes.forEach((pipe) => pipe.element.remove());
    state.coins.forEach((coin) => coin.element.remove());
    state.hearts.forEach((heart) => heart.element.remove());
    state.enemies.forEach((enemy) => enemy.element.remove());
    state.pipes = [];
    state.coins = [];
    state.hearts = [];
    state.enemies = [];
    entitiesContainer.replaceChildren();
  }

  function resetGame() {
    clearEntities();
    state.score = 0;
    state.lives = 3;
    state.timeRemaining = GAME_TIME_LIMIT;
    state.distance = 0;
    state.nextPipeX = WORLD_WIDTH + 90;
    state.lastGapCenter = WORLD_HEIGHT / 2;
    state.pipeCount = 0;
    state.pipesUntilHeart = 8 + Math.floor(Math.random() * 5);
    state.enemyTimer = 4;
    state.invulnerable = 0;
    state.boostTimer = 0;
    state.hurtTimer = 0;
    state.animationTime = 0;
    state.player.y = 228;
    state.player.velocityY = 0;
    layers.forEach((layer) => {
      layer.offset = 0;
      layer.element.style.transform = 'translate3d(0, 0, 0)';
    });
    updateHud();
    renderPlayer();
  }

  function startGame() {
    if (!state.ready || state.running) return;
    resetGame();
    state.running = true;
    overlay.classList.add('is-hidden');
    statusElement.textContent = '¡En vuelo! Juntá monedas, buscá corazones y esquivá los obstáculos.';
    flap();
  }

  function endGame(reason) {
    state.running = false;
    overlayTitle.textContent = reason === 'time' ? '¡Tiempo agotado!' : 'Fin de la partida';
    overlayText.textContent = `Puntaje final: ${state.score}. ¡Volvé a intentarlo!`;
    startButton.textContent = 'Jugar de nuevo';
    overlay.classList.remove('is-hidden');
    statusElement.textContent = reason === 'time'
      ? 'Se agotaron los 90 segundos.'
      : 'Partida terminada.';
  }

  function flap() {
    if (!state.running) return;
    state.player.velocityY = FLAP_SPEED;
    state.boostTimer = 0.24;
    state.animationTime = 0;
  }

  function updateHud() {
    scoreElement.textContent = String(state.score);
    livesElement.textContent = String(state.lives);
    const remainingSeconds = Math.ceil(state.timeRemaining);
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = String(remainingSeconds % 60).padStart(2, '0');
    timeElement.textContent = `${minutes}:${seconds}`;
  }

  function createPipe(x, spacing) {
    const gapProgress = Math.min(1, state.distance / GAP_PROGRESS_DISTANCE);
    const gap = 220 - gapProgress * (220 - MIN_GAP);
    const margin = 52 + gap / 2;
    const minCenter = margin;
    const maxCenter = WORLD_HEIGHT - margin;
    const change = MIN_GAP_CENTER_CHANGE
      + Math.random() * (MAX_GAP_CENTER_CHANGE - MIN_GAP_CENTER_CHANGE);
    const direction = Math.random() < 0.5 ? -1 : 1;
    let gapCenter = state.lastGapCenter + direction * change;
    if (gapCenter < minCenter || gapCenter > maxCenter) {
      gapCenter = state.lastGapCenter - direction * change;
    }
    gapCenter = Math.max(minCenter, Math.min(maxCenter, gapCenter));
    state.lastGapCenter = gapCenter;
    const gapTop = gapCenter - gap / 2;
    const gapBottom = gapCenter + gap / 2;
    const element = document.createElement('div');
    const topPipe = document.createElement('div');
    const bottomPipe = document.createElement('div');

    element.className = 'runner-pipe-pair';
    topPipe.className = 'runner-pipe runner-pipe--top';
    bottomPipe.className = 'runner-pipe runner-pipe--bottom';
    topPipe.style.height = `${gapTop}px`;
    bottomPipe.style.top = `${gapBottom}px`;
    bottomPipe.style.height = `${WORLD_HEIGHT - gapBottom}px`;
    element.append(topPipe, bottomPipe);
    entitiesContainer.append(element);

    state.pipes.push({ x, gapTop, gapBottom, element });

    state.pipeCount += 1;
    const itemX = x + 80 + Math.random() * Math.max(0, spacing - 160);

    if (state.pipeCount >= state.pipesUntilHeart) {
      createHeart(itemX, 60 + Math.random() * 390);
      state.pipesUntilHeart = state.pipeCount + 8 + Math.floor(Math.random() * 5);
    } else if (Math.random() < 0.48) {
      createCoin(itemX, 60 + Math.random() * 390);
    }
  }

  function createCoin(x, y) {
    const element = document.createElement('div');
    const spinSheet = document.createElement('img');
    const collectSheet = document.createElement('img');
    element.className = 'runner-entity runner-coin';
    spinSheet.className = 'runner-coin-spin-sheet';
    spinSheet.src = 'assets/runner/gold_spin.png';
    spinSheet.alt = '';
    collectSheet.className = 'runner-coin-collect-sheet';
    collectSheet.src = 'assets/runner/gold_collect.png';
    collectSheet.alt = '';
    element.append(spinSheet, collectSheet);
    entitiesContainer.append(element);
    state.coins.push({
      x,
      y,
      frameTime: 0,
      frame: 0,
      collected: false,
      collectTime: 0,
      element,
      spinSheet,
      collectSheet
    });
  }

  function createHeart(x, y) {
    const element = document.createElement('div');
    const image = document.createElement('img');
    element.className = 'runner-entity runner-heart';
    image.src = heartFrames[0];
    image.alt = '';
    element.append(image);
    entitiesContainer.append(element);
    state.hearts.push({
      x,
      y,
      frameTime: 0,
      frame: 0,
      collected: false,
      collectTime: 0,
      element,
      image
    });
  }

  function createEnemy() {
    const element = document.createElement('div');
    const sheet = document.createElement('img');
    element.className = 'runner-entity runner-enemy';
    sheet.src = 'assets/runner/Eyeball.png';
    sheet.alt = '';
    element.append(sheet);
    entitiesContainer.append(element);
    state.enemies.push({
      x: WORLD_WIDTH + 30,
      baseY: 92 + Math.random() * 350,
      elapsed: Math.random() * Math.PI * 2,
      frameTime: 0,
      frame: 0,
      element,
      sheet
    });
  }

  function overlaps(first, second) {
    return first.left < second.right
      && first.right > second.left
      && first.top < second.bottom
      && first.bottom > second.top;
  }

  function playerHitbox() {
    return {
      left: PLAYER_X + 12,
      right: PLAYER_X + PLAYER_WIDTH - 11,
      top: state.player.y + 9,
      bottom: state.player.y + PLAYER_HEIGHT - 8
    };
  }

  function damagePlayer() {
    if (state.invulnerable > 0 || !state.running) return;
    state.lives -= 1;
    state.invulnerable = 1.15;
    state.hurtTimer = 0.52;
    state.boostTimer = 0;
    updateHud();
    statusElement.textContent = '¡Cuidado! Perdiste una vida, pero el vuelo continúa.';
    if (state.lives <= 0) endGame('lives');
  }

  function collectCoin(coin) {
    if (coin.collected) return;
    coin.collected = true;
    coin.collectTime = 0;
    coin.frameTime = 0;
    coin.frame = 0;
    coin.element.classList.add('is-collecting');
    state.score += 1;
    updateHud();
    statusElement.textContent = `¡Moneda! Puntaje: ${state.score}.`;
  }

  function collectHeart(heart) {
    if (heart.collected || state.lives >= 3) return;
    heart.collected = true;
    heart.collectTime = 0;
    state.lives = Math.min(3, state.lives + 1);
    updateHud();
    statusElement.textContent = '¡Recuperaste una vida!';
  }

  function updatePlayer(dt) {
    state.player.velocityY += GRAVITY * dt;
    state.player.y += state.player.velocityY * dt;
    state.boostTimer = Math.max(0, state.boostTimer - dt);
    state.hurtTimer = Math.max(0, state.hurtTimer - dt);
    state.invulnerable = Math.max(0, state.invulnerable - dt);
    state.animationTime += dt;

    if (state.player.y < 0) {
      state.player.y = 0;
      state.player.velocityY = 40;
      damagePlayer();
    } else if (state.player.y + PLAYER_HEIGHT > WORLD_HEIGHT) {
      state.player.y = WORLD_HEIGHT - PLAYER_HEIGHT;
      state.player.velocityY = -80;
      damagePlayer();
    }

    renderPlayer();
  }

  function renderPlayer() {
    let animation = 'fly';
    if (state.hurtTimer > 0) {
      animation = 'hurt';
    } else if (state.boostTimer > 0) {
      animation = 'boost';
    }

    const frames = PLAYER_FRAMES[animation];
    const frame = Math.floor(state.animationTime / frames.interval) % frames.count;
    playerElement.style.transform = `translate3d(${PLAYER_X}px, ${state.player.y}px, 0)`;
    playerMotion.classList.toggle('is-boosting', animation === 'boost');
    playerMotion.classList.toggle('is-hurt', animation === 'hurt');
    playerSheet.style.transform = `translate3d(${-frame * PLAYER_WIDTH}px, ${-frames.row * PLAYER_HEIGHT}px, 0)`;
    playerElement.classList.toggle('is-invulnerable', state.invulnerable > 0);
  }

  function updatePipes(dt) {
    state.distance += RUN_SPEED * dt;
    state.nextPipeX -= RUN_SPEED * dt;
    if (state.nextPipeX <= WORLD_WIDTH) {
      const progress = Math.min(1, state.distance / PIPE_PROGRESS_DISTANCE);
      const spacing = 330 - progress * 70 + Math.random() * (150 - progress * 120);
      createPipe(state.nextPipeX, spacing);
      state.nextPipeX += spacing;
    }

    const playerBox = playerHitbox();
    state.pipes = state.pipes.filter((pipe) => {
      pipe.x -= RUN_SPEED * dt;
      pipe.element.style.transform = `translate3d(${pipe.x}px, 0, 0)`;

      const topBox = {
        left: pipe.x,
        right: pipe.x + 64,
        top: 0,
        bottom: pipe.gapTop
      };
      const bottomBox = {
        left: pipe.x,
        right: pipe.x + 64,
        top: pipe.gapBottom,
        bottom: WORLD_HEIGHT
      };

      if (overlaps(playerBox, topBox) || overlaps(playerBox, bottomBox)) {
        damagePlayer();
      }

      if (pipe.x + 64 < 0) {
        pipe.element.remove();
        return false;
      }
      return true;
    });
  }

  function updateHearts(dt) {
    const playerBox = playerHitbox();
    state.hearts = state.hearts.filter((heart) => {
      heart.x -= RUN_SPEED * dt;
      heart.frameTime += dt;
      heart.frame = Math.floor(heart.frameTime / 0.1) % heartFrames.length;
      heart.image.src = heartFrames[heart.frame];

      if (!heart.collected) {
        const heartBox = {
          left: heart.x + 5,
          right: heart.x + 27,
          top: heart.y + 5,
          bottom: heart.y + 27
        };
        if (overlaps(playerBox, heartBox) && state.lives < 3) collectHeart(heart);
      } else {
        heart.collectTime += dt;
        if (heart.collectTime >= 0.3) {
          heart.element.remove();
          return false;
        }
      }

      heart.element.style.transform = `translate3d(${heart.x}px, ${heart.y}px, 0)`;
      if (heart.x + 32 < 0) {
        heart.element.remove();
        return false;
      }
      return true;
    });
  }

  function updateCoins(dt) {
    const playerBox = playerHitbox();
    state.coins = state.coins.filter((coin) => {
      coin.x -= RUN_SPEED * dt;
      coin.frameTime += dt;

      if (coin.collected) {
        coin.collectTime += dt;
        coin.frame = Math.min(5, Math.floor(coin.collectTime / 0.06));
        coin.collectSheet.style.transform = `translate3d(${-coin.frame * 50}px, 0, 0)`;
        if (coin.collectTime >= 0.36) {
          coin.element.remove();
          return false;
        }
      } else {
        coin.frame = Math.floor(coin.frameTime / 0.1) % 7;
        coin.spinSheet.style.transform = `translate3d(${-coin.frame * 50}px, 0, 0)`;
        const coinBox = {
          left: coin.x + 5,
          right: coin.x + 45,
          top: coin.y + 5,
          bottom: coin.y + 45
        };
        if (overlaps(playerBox, coinBox)) collectCoin(coin);
      }

      coin.element.style.transform = `translate3d(${coin.x}px, ${coin.y}px, 0)`;
      if (coin.x + 50 < 0) {
        coin.element.remove();
        return false;
      }
      return true;
    });
  }

  function updateEnemies(dt) {
    state.enemyTimer -= dt;
    if (state.enemyTimer <= 0) {
      createEnemy();
      state.enemyTimer = 4.2 + Math.random() * 1.8;
    }

    const playerBox = playerHitbox();
    state.enemies = state.enemies.filter((enemy) => {
      enemy.x -= RUN_SPEED * dt;
      enemy.elapsed += dt;
      enemy.frameTime += dt;
      enemy.frame = Math.floor(enemy.frameTime / 0.11) % 6;
      const y = enemy.baseY + Math.sin(enemy.elapsed * 2.4) * 28;

      enemy.sheet.style.transform = `translate3d(${-enemy.frame * 56}px, 0, 0)`;
      enemy.element.style.transform = `translate3d(${enemy.x}px, ${y}px, 0)`;

      const enemyBox = {
        left: enemy.x + 8,
        right: enemy.x + 48,
        top: y + 8,
        bottom: y + 48
      };
      if (overlaps(playerBox, enemyBox)) {
        damagePlayer();
        enemy.element.remove();
        return false;
      }
      if (enemy.x + 56 < 0) {
        enemy.element.remove();
        return false;
      }
      return true;
    });
  }

  function updateParallax(dt) {
    const traveled = RUN_SPEED * dt;
    layers.forEach((layer) => {
      layer.offset = (layer.offset + traveled * layer.speed) % WORLD_WIDTH;
      layer.element.style.transform = `translate3d(${-layer.offset}px, 0, 0)`;
    });
  }

  function update(dt) {
    if (!state.running) return;
    const previousSeconds = Math.ceil(state.timeRemaining);
    state.timeRemaining = Math.max(0, state.timeRemaining - dt);
    if (Math.ceil(state.timeRemaining) !== previousSeconds || state.timeRemaining === 0) {
      updateHud();
    }
    if (state.timeRemaining === 0) {
      endGame('time');
      return;
    }
    updateParallax(dt);
    updatePlayer(dt);
    updatePipes(dt);
    updateCoins(dt);
    updateHearts(dt);
    updateEnemies(dt);
  }

  function gameLoop(timestamp) {
    const dt = state.lastFrame
      ? Math.min((timestamp - state.lastFrame) / 1000, 0.05)
      : 0;
    state.lastFrame = timestamp;
    update(dt);
    requestAnimationFrame(gameLoop);
  }

  startButton.addEventListener('click', startGame);
  stage.addEventListener('pointerdown', (event) => {
    if (event.target.closest('button')) return;
    if (!state.running) {
      startGame();
      return;
    }
    flap();
  });

  document.addEventListener('keydown', (event) => {
    if (event.repeat || (event.code !== 'Space' && event.code !== 'ArrowUp')) return;
    if (event.target instanceof HTMLElement
      && (event.target.isContentEditable || ['INPUT', 'TEXTAREA', 'BUTTON'].includes(event.target.tagName))) {
      return;
    }
    event.preventDefault();
    if (!state.running) {
      startGame();
      return;
    }
    flap();
  });

  window.addEventListener('resize', setWorldScale);
  setWorldScale();

  Promise.all(ASSETS.map(preloadImage))
    .then(() => {
      state.ready = true;
      startButton.disabled = false;
      startButton.textContent = 'Jugar';
      statusElement.textContent = '¡Listo! Iniciá la partida con clic, ↑ o espacio.';
      requestAnimationFrame(gameLoop);
    })
    .catch((error) => {
      console.error('Error al precargar los spritesheets de Runner:', error);
      statusElement.textContent = 'No se pudieron cargar los recursos. Revisá la consola y las rutas de assets/runner.';
      overlayTitle.textContent = 'No se pudo cargar el juego';
      overlayText.textContent = 'Revisá que los spritesheets sigan en la carpeta assets/runner.';
      startButton.disabled = true;
    });
});
