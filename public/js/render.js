import { getPlayers, getAnimator, cleanupAnimators, isGameOver, getGameOverData, getSocket } from './network.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let lastTimestamp = performance.now();
let timerLobby = 5;

export function startRenderLoop() {
  requestAnimationFrame(loop);
}

function loop() {
  const now = performance.now();
  const deltaTime = now - lastTimestamp;
  lastTimestamp = now;

  renderPlayers(deltaTime);

  if (isGameOver()) {
    const gameOverData = getGameOverData();
  
    if (timerLobby > 0) {
      timerLobby -= deltaTime / 1000;
      if (timerLobby < 0) timerLobby = 0;
    }

    renderGameOverOverlay(ctx, gameOverData);
  }

  requestAnimationFrame(loop);
}

function renderPlayers(deltaTime) {
  const players = getPlayers();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  cleanupAnimators(players);

  for (let id in players) {
    const player = players[id];
    const animator = getAnimator(id, player);
    
    if (!player.isAlive) {
      animator.setAnimation('death');
    } else if (player.attackClash) {
      animator.setAnimation('attackClash');
    } else if (player.isDamaged) {
      animator.setAnimation('hurt');
    } else if (player.isAttacking) {
      animator.setAnimation('attack');
    } else if (player.rising) {
      animator.setAnimation('jump');
    } else if (player.falling) {
      animator.setAnimation('fall');
    } else if (player.isMoving) {
      animator.setAnimation('run');
    } else {
      animator.setAnimation('idle');
    }    

    if (animator.currentAnimation === 'attack' && animator.currentFrame >= animator.animations['attack'].totalFrames - 1) {
      animator.setAnimation(player.isMoving ? 'run' : 'idle');
      player.isAttacking = false;
    }

    animator.update(deltaTime);
    animator.drawPlayer(ctx, player);
  }
}
function renderGameOverOverlay(ctx, gameOverData) {
  const players = getPlayers();
  const socketId = getSocket().id;
  const winnerId = gameOverData?.winnerId;
  const winner = players[winnerId];

  // Desenha uma tela escura semi-transparente
  ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Texto principal
  ctx.fillStyle = "white";
  ctx.textAlign = "center";

  // "GAME OVER"
  ctx.font = "bold 56px Arial";
  ctx.fillText("GAME OVER", ctx.canvas.width / 2, ctx.canvas.height / 2 - 100);

  // Mensagem personalizada de vitória/derrota
  ctx.font = "32px Arial";
  if (winnerId === socketId) {
    ctx.fillText("Parabéns! Você venceu a partida!", ctx.canvas.width / 2, ctx.canvas.height / 2 - 40);
  } else if (winner) {
    ctx.fillText(`${winner.name || "Outro jogador"} venceu a partida!`, ctx.canvas.width / 2, ctx.canvas.height / 2 - 40);
  } else {
    ctx.fillText("A partida terminou.", ctx.canvas.width / 2, ctx.canvas.height / 2 - 40);
  }

  // Contador de tempo para retornar ao lobby
  ctx.font = "20px Arial";
  ctx.fillStyle = "#ccc";
  ctx.fillText(`Retornando ao lobby em ${Math.ceil(timerLobby)} segundos...`, ctx.canvas.width / 2, ctx.canvas.height / 2 + 50);
}
