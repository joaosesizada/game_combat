import { getPlayers, getAnimator, cleanupAnimators, isGameOver, getGameOverData, getSocket, getEffects, getPlataforms } from './network.js';
import EffectAnimator from './EffectAnimator.js';
import setup from './setup.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let lastTimestamp = performance.now();
let timerLobby = 5;

// Cria (única) instância para animar efeitos – agora ela é única e reutilizada.
let effectAnimatorInstance = new EffectAnimator(setup);

// NOVO: Variáveis para controlar estado de game over
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

  // Limpa a tela antes de desenhar
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  renderPlayers(deltaTime);
  renderEffects(); // chamamos a renderização dos efeitos
  renderPlataforms(ctx)
  // MODIFICADO: Processamento do game over
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
  
  for (let id in players) {
    const player = players[id];
    const animator = getAnimator(id, player);
    
    // Usa o currentAnimation do player, já definido pelo próprio objeto
    animator.setAnimation(player.currentAnimation);
    
    // NOVO: Para jogadores mortos, verificar se a animação de morte terminou
    if (!player.isAlive) {
      // Adicionar handler só uma vez para cada jogador morto
      if (!deadPlayerIds.has(id)) {
        deadPlayerIds.add(id);
        
        // Registrar callback quando animação de morte terminar
        animator.onAnimationFinished('death', () => {
          player.deathAnimationComplete = true;
          
          // Se for nosso jogador, iniciar game over
          if (id === getSocket().id) {
            showGameOverScreen = true;
          }
        });
      }
    }
    
    // Se a animação de ataque atingiu o fim, volta ao estado default
    if (animator.currentAnimation === 'attack' && animator.currentFrame >= animator.animations['attack'].totalFrames - 1) {
      animator.setAnimation(player.isMoving ? 'run' : 'idle');
      player.isAttacking = false;
    }
    
    animator.update(deltaTime);
    animator.drawPlayer(ctx, player);
  }
}

// NOVO: Verificar condições para mostrar game over
function checkGameOverCondition() {
  // Se já recebemos evento de game over do servidor
  if (isGameOver() && !gameOverTriggered) {
    gameOverTriggered = true;
    const players = getPlayers();
    const myId = getSocket().id;
    
    // Verificar se somos o único jogador vivo (vitória)
    let amITheOnlyOneAlive = true;
    let amIAlive = false;
    
    for (let id in players) {
      if (id === myId) {
        amIAlive = players[id].isAlive;
      } else if (players[id].isAlive) {
        amITheOnlyOneAlive = false;
      }
    }
    
    // Mostrar game over imediatamente em caso de vitória
    if (amIAlive && amITheOnlyOneAlive) {
      showGameOverScreen = true;
    }
    
    // Caso eu esteja morto, esperamos a animação terminar via callback
  }
}

function renderEffects() {
  const effects = getEffects();
  const currentTime = Date.now();
  effects.forEach(effect => {
    effectAnimatorInstance.drawEffect(ctx, effect, currentTime);
  });
}

function renderPlataforms(ctx) {
  const plataforms = getPlataforms()
  ctx.fillStyle = "red"

  plataforms.forEach(plataform => {
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