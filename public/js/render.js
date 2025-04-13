import { getPlayers, getAnimator, cleanupAnimators } from './network.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let lastTimestamp = performance.now();

export function startRenderLoop() {
  requestAnimationFrame(loop);
}

function loop() {
  const now = performance.now();
  const deltaTime = now - lastTimestamp;
  lastTimestamp = now;

  renderPlayers(deltaTime);

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
