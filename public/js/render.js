import { getPlayers, getAnimator, cleanupAnimators, isGameOver, getGameOverData, getSocket, getEffects, getMapa } from './network.js';
import EffectAnimator from './EffectAnimator.js';
import setup from './setup.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let lastTimestamp = performance.now();
let timerLobby = 5;

// Cria (única) instância para animar efeitos – agora ela é única e reutilizada.
let effectAnimatorInstance = new EffectAnimator(setup);

export function startRenderLoop() {
  requestAnimationFrame(loop);
}

function loop() {
  const now = performance.now();
  const deltaTime = now - lastTimestamp;
  lastTimestamp = now;

  // Limpa a tela antes de desenhar
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  renderPlayers(deltaTime);
  renderEffects(); // chamamos a renderização dos efeitos
  renderPlataforms(ctx);

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
  cleanupAnimators(players);

  for (let id in players) {
    const player = players[id];
    const animator = getAnimator(id, player);
    
    // Usa o currentAnimation do player, já definido pelo próprio objeto
    animator.setAnimation(player.currentAnimation);
    
    // Se a animação de ataque atingiu o fim, volta ao estado default
    if (animator.currentAnimation === 'attack' && animator.currentFrame >= animator.animations['attack'].totalFrames - 1) {
      animator.setAnimation(player.isMoving ? 'run' : 'idle');
      player.isAttacking = false;
    }
    
    animator.update(deltaTime);
    animator.drawPlayer(ctx, player);
  }
}

function renderEffects() {
  const effects = getEffects();
  console.log("Efeitos recebidos:", effects);
  const currentTime = Date.now();
  effects.forEach(effect => {
    effectAnimatorInstance.drawEffect(ctx, effect, currentTime);
  });
}

function renderPlataforms(ctx){
  const mapa = getMapa()
  const plataforms = mapa.platforms
  console.log(mapa)
  ctx.fillStyle = 'black'
  plataforms.forEach(plataform =>{
    ctx.fillRect(plataform.x, plataform.y, plataform.width, plataform.height)
  })
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
