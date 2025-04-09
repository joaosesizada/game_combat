import setup from './setup.js';
import Animator from './Animator.js';

const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let lastTimestamp = performance.now();

// Armazena animadores para cada jogador
const animators = {};

// Função para obter ou criar um animador para um jogador
function getAnimatorForPlayer(playerId) {
  if (!animators[playerId]) {
    animators[playerId] = new Animator(setup, 'ninja', 'idle');
  }
  return animators[playerId];
}

// Função para limpar animadores de jogadores desconectados
function cleanupAnimators(gameState) {
  for (const playerId in animators) {
    if (!gameState.players[playerId]) {
      delete animators[playerId];
    }
  }
}

function draw(gameState, deltaTime) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Limpa animadores de jogadores que saíram
  cleanupAnimators(gameState);
  
  for (let id in gameState.players) {
    const jogador = gameState.players[id];
    const animator = getAnimatorForPlayer(id);
    
    // Prioridade de animação: atacando > movendo > idle
    if (jogador.isAttacking) {
      if (animator.currentAnimation !== 'attack') {
        animator.setAnimation('attack');
        // Verifica se completou a animação de ataque
        if (animator.currentFrame >= animator.animations['attack'].totalFrames - 1) {
          jogador.isAttacking = false; // Reseta o estado de ataque quando a animação termina
        }
      }
    } else if (jogador.isMoving) {
      if (animator.currentAnimation !== 'run') {
        animator.setAnimation('run');
      }
    } else {
      if (animator.currentAnimation !== 'idle') {
        animator.setAnimation('idle');
      }
    }
    
    // Lógica adicional para retornar a idle após completar ataque
    if (animator.currentAnimation === 'attack') {
      // Se a animação de ataque terminou (chegou ao último frame)
      if (animator.currentFrame >= animator.animations['attack'].totalFrames - 1) {
        // Volte para idle ou run dependendo se está se movendo
        if (jogador.isMoving) {
          animator.setAnimation('run');
        } else {
          animator.setAnimation('idle');
        }
        jogador.isAttacking = false;
      }
    }
    
    animator.update(deltaTime);
    animator.drawPlayer(ctx, jogador);
  }
}

socket.on('update', (gameState) => {
  const now = performance.now();
  const deltaTime = now - lastTimestamp;
  lastTimestamp = now;
  
  draw(gameState, deltaTime);
});

socket.on('connect', () => {
  console.log('Conectado ao servidor com ID:', socket.id);
});

const keys = { w: false, a: false, d: false, s: false, ' ': false };

window.addEventListener("keydown", (event) => {
  const key = event.key;
  if (keys.hasOwnProperty(key)) {
    keys[key] = true;
    
    // Se a tecla de espaço for pressionada, emita um evento de ataque
    if (key === ' ') {
      socket.emit('attack');
    }
    
    socket.emit('move', keys);
  }
});

window.addEventListener("keyup", (event) => {
  const key = event.key;
  if (keys.hasOwnProperty(key)) {
    keys[key] = false;
    socket.emit('move', keys);
  }
});