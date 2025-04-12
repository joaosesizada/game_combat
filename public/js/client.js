// client.js (Novo)
import setup from './setup.js';
import Animator from './Animator.js';

const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let lastTimestamp = performance.now();

// Armazena os animadores para cada jogador
const animators = {};

// Função para obter ou criar um animador para um jogador
function getAnimatorForPlayer(playerId, playerData) {
  if (!animators[playerId]) {
    // usa playerData.person para selecionar as animações corretas
    animators[playerId] = new Animator(setup, playerData.person, 'idle');
  }
  return animators[playerId];
}

// Função para limpar animadores de jogadores desconectados
function cleanupAnimators(players) {
  for (const playerId in animators) {
    if (!players[playerId]) {
      delete animators[playerId];
    }
  }
}

// Função para desenhar os jogadores, definindo a animação correta para cada caso
function draw(players, deltaTime) {
  // Limpa a tela
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Remove animadores que não estão presentes na lista de jogadores
  cleanupAnimators(players);
  
  // Itera sobre cada jogador enviado pelo servidor
  for (let id in players) {
    const player = players[id];
    const animator = getAnimatorForPlayer(id, player);
    
    // Define a animação com base no estado do jogador:
    // Prioridade: attack > run > idle
    if (player.isAttacking) {
      if (animator.currentAnimation !== 'attack') {
        animator.setAnimation('attack');
      }
    } else if (player.isMoving) {
      if (animator.currentAnimation !== 'run') {
        animator.setAnimation('run');
      }
    } else {
      if (animator.currentAnimation !== 'idle') {
        animator.setAnimation('idle');
      }
    }
    
    // Caso o jogador esteja atacando, verifica se a animação terminou para retornar ao estado adequado
    if (animator.currentAnimation === 'attack') {
      if (animator.currentFrame >= animator.animations['attack'].totalFrames - 1) {
        if (player.isMoving) {
          animator.setAnimation('run');
        } else {
          animator.setAnimation('idle');
        }
        // Reseta o estado de ataque
        player.isAttacking = false;
      }
    }
    
    // Atualiza o animador e desenha o jogador na tela
    animator.update(deltaTime);
    animator.drawPlayer(ctx, player);
  }
}

// Evento de atualização vindo do servidor
socket.on('update', (players) => {
  const now = performance.now();
  const deltaTime = now - lastTimestamp;
  lastTimestamp = now;
  draw(players, deltaTime);
});

// Mapeia as teclas que serão monitoradas para movimentação e ataque
const keys = { w: false, a: false, d: false, s: false, ' ': false };

// Eventos de teclado para enviar comandos de movimentação e ataque para o servidor
window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (keys.hasOwnProperty(key)) {
    keys[key] = true;
    // Se a tecla de espaço for pressionada, emite um evento de ataque
    if (key === ' ') {
      socket.emit('attack');
    }
    socket.emit('move', keys);
  }
});

window.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();
  if (keys.hasOwnProperty(key)) {
    keys[key] = false;
    socket.emit('move', keys);
  }
});

// ROTAS DE SALA - Integração com a nova estrutura de sala (exemplo)
// Obtém o roomId da URL (caso esteja usando a nova estrutura de salas)
const pathParts = window.location.pathname.split('/');
const roomId = pathParts[pathParts.length - 1];

socket.on('connect', () => {
  // Após conectar, adiciona o jogador na sala após um breve atraso
  setTimeout(() => {
    socket.emit("addPlayer", { roomId });
  }, 500);
});

// Eventos de transição de telas: de sala para jogo, etc.
const play = document.getElementById("play");

play.addEventListener("click", () => {
  socket.emit("startGame", { roomId });
});

socket.on("goToGame", () => {
  const game = document.getElementById("game");
  const room = document.getElementById("room");
  game.style.display = "block";
  room.style.display = "none";
});

// Exibe informações da sala
const infoSala = document.getElementById('infoSala');
socket.on("updateRoom", ({ room }) => {
  infoSala.innerHTML = room.id;
});
