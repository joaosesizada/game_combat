import { getPlayers, getAnimator, cleanupAnimators, isGameOver, getGameOverData, getSocket, getEffects, getPlatforms } from './network.js';
import EffectAnimator from './EffectAnimator.js';
import setup from './setup.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let lastTimestamp = performance.now();
let timerLobby = 5;

let effectAnimatorInstance = new EffectAnimator(setup);

let showGameOverScreen = false;
let deadPlayerIds = new Set();
let gameOverTriggered = false;

export function startRenderLoop() {
  requestAnimationFrame(loop);
}

function loop() {
  const now = performance.now();
  const deltaTime = now - lastTimestamp;
  lastTimestamp = now;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  renderPlayers(deltaTime);
  renderEffects();
  renderPlatforms(ctx)
  checkGameOverCondition();

  if (showGameOverScreen) {
    if (timerLobby > 0) {
      timerLobby -= deltaTime / 1000;
      if (timerLobby < 0) timerLobby = 0;
    }
    renderGameOverOverlay(ctx, getGameOverData());
  }

  requestAnimationFrame(loop);
}

function renderPlayers(deltaTime) {

  const players = getPlayers();
  cleanupAnimators(players);
  let index = 1
  for (let id in players) {
    const player = players[id];
    const animator = getAnimator(id, player, index);

    animator.setAnimation(player.currentAnimation);

    if (!player.isAlive) {
      if (!deadPlayerIds.has(id)) {
        deadPlayerIds.add(id);

        animator.onAnimationFinished('death', () => {
          player.deathAnimationComplete = true;

          if (id === getSocket().id) {
            showGameOverScreen = true;
          }
        });
      }
    }

    if (animator.currentAnimation === 'attack' && animator.currentFrame >= animator.animations['attack'].totalFrames - 1) {
      animator.setAnimation(player.isMoving ? 'run' : 'idle');
      player.isAttacking = false;
    }

    animator.update(deltaTime);
    animator.drawPlayer(ctx, player);
    index++
  }
}

function checkGameOverCondition() {
  if (isGameOver() && !gameOverTriggered) {
    gameOverTriggered = true;
    const players = getPlayers();
    const myId = getSocket().id;

    let amITheOnlyOneAlive = true;
    let amIAlive = false;

    for (let id in players) {
      if (id === myId) {
        amIAlive = players[id].isAlive;
      } else if (players[id].isAlive) {
        amITheOnlyOneAlive = false;

        // Atualiza derrota para os perdedores
        fetch('https://eternalnexus.online/derrota/' + window.localStorage.getItem('playerId'), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(() => {
            console.log('Derrota atualizada para o jogador ' + window.localStorage.getItem('playerId'));
          })
      }

      if (amIAlive && amITheOnlyOneAlive) {
        showGameOverScreen = true;
    
        // Atualiza vitória para o vencedor
        fetch('https://eternalnexus.online/vitoria/' + window.localStorage.getItem('playerId'), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
    }
  }
}

function renderEffects() {
  const effects = getEffects();
  const currentTime = Date.now();
  effects.forEach(effect => {
    effectAnimatorInstance.drawEffect(ctx, effect, currentTime);
  });
}

function renderPlatforms(ctx) {
  const { src, positions } = getPlatforms();
  const img = new Image();
  img.src = src;

  function drawAll() {
    positions.forEach(p => {
      // coordenadas FÍSICAS (colisão)
      const { x, y, width, height } = p;

      // coordenadas VISUAIS
      const { imgX, imgY, imgWidth, imgHeight } = p;

      // cálculo de crop para manter proporção na imagem
      const imgRatio = img.width / img.height;
      const targetRatio = imgWidth / imgHeight;
      let sx = 0, sy = 0, sW = img.width, sH = img.height;
      if (imgRatio > targetRatio) {
        sW = img.height * targetRatio;
        sx = (img.width - sW) / 2;
      } else {
        sH = img.width / targetRatio;
        sy = (img.height - sH) / 2;
      }

      // desenha imagem
      ctx.drawImage(
        img,
        sx, sy, sW, sH,
        imgX, imgY, imgWidth, imgHeight
      );
    });
  }

  img.onload = drawAll;
  if (img.complete) drawAll();
}

function renderGameOverOverlay(ctx, gameOverData) {
  const players = getPlayers();
  const socketId = getSocket().id;
  const winnerId = gameOverData?.winnerId;
  const winner = players[winnerId];

  ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.fillStyle = "white";
  ctx.textAlign = "center";

  ctx.font = "bold 56px Arial";
  ctx.fillText("GAME OVER", ctx.canvas.width / 2, ctx.canvas.height / 2 - 100);

  ctx.font = "32px Arial";
  if (winnerId === socketId) {
    ctx.fillText("Parabéns! Você venceu a partida!", ctx.canvas.width / 2, ctx.canvas.height / 2 - 40);
  } else if (winner) {
    ctx.fillText(`${winner.name || "Outro jogador"} venceu a partida!`, ctx.canvas.width / 2, ctx.canvas.height / 2 - 40);
  } else {
    ctx.fillText("A partida terminou.", ctx.canvas.width / 2, ctx.canvas.height / 2 - 40);
  }

  ctx.font = "20px Arial";
  ctx.fillStyle = "#ccc";
  ctx.fillText(`Retornando ao lobby em ${Math.ceil(timerLobby)} segundos...`, ctx.canvas.width / 2, ctx.canvas.height / 2 + 50);
}