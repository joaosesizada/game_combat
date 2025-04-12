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

// 
const infoSala = document.getElementById('infoSala')

const pathParts = window.location.pathname.split('/');
const roomId = pathParts[pathParts.length - 1];

socket.on('connect', () => {

    setTimeout(() => {
        socket.emit("addPlayer", { roomId });
    }, 500);
});

const play = document.getElementById("play")

play.addEventListener("click", () => {
    socket.emit("startGame", { roomId })
})

socket.on("goToGame", () => {
    const game = document.getElementById("game")
    const room = document.getElementById("room")

    game.style.display = "block"
    room.style.display = "none"
})

socket.on("updateRoom", ({ room }) => {
    update(room)
});

function update(room) {
    infoSala.innerHTML = room.id
}

function draw(players, deltaTime) {
    console.log(players)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const jogador of Object.values(players)) {
        if (jogador.isMoving && animator.currentAnimation !== 'run') {
            animator.setAnimation('run');
        } else if (!jogador.isMoving && animator.currentAnimation !== 'idle') {
            animator.setAnimation('idle');
        }

        animator.update(deltaTime);
        animator.drawPlayer(ctx, jogador);
    }
}

socket.on('update', (players) => {
    console.log('update!', players);
    const now = performance.now();
    draw(players, now - lastTimestamp);
    lastTimestamp = now;
});

const keys = { w: false, a: false, d: false, s: false, ' ': false };

window.addEventListener("keydown", (event) => {
    const key = event.key;

    if (keys.hasOwnProperty(key)) {
        keys[key] = true
        socket.emit('move', keys)
    };
});

window.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();
  if (keys.hasOwnProperty(key)) {
    keys[key] = false;
    socket.emit('move', keys);
  }
});