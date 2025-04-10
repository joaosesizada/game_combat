import setup from './setup.js';
import Animator from './Animator.js';

const socket = io();

console.log('CLIENT')

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let lastTimestamp = performance.now();

const animator = new Animator(setup, 'ninja', 'idle');

function draw(gameState, deltaTime) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let id in gameState.players) {
        const jogador = gameState.players[id];

        if (jogador.isMoving && animator.currentAnimation !== 'run') {
            animator.setAnimation('run');
          } else if (!jogador.isMoving && animator.currentAnimation !== 'idle') {
            animator.setAnimation('idle');
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



const keys = { w: false, a: false, d: false, s: false, ' ': false };

window.addEventListener("keydown", (event) => {
    const key = event.key;

    if (keys.hasOwnProperty(key) ) {
        keys[key] = true
        socket.emit('move', keys)
    };
});

window.addEventListener("keyup", (event) => {
    const key = event.key;
    if (keys.hasOwnProperty(key)) {
        keys[key] = false
        socket.emit('move', keys)
    };
});