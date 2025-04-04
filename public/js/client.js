
const socket = io();

function draw(gameState) {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    for (let id in gameState.players) {
        const jogador = gameState.players[id];
        
        ctx.drawImage(jogador.sprite , jogador.x, jogador.y, jogador.width, jogador.height);

        // Exibe a stamina do player (opcional)
        ctx.fillStyle = "blue";
        ctx.fillRect(jogador.x, jogador.y - (jogador.height / 2), (jogador.stamina / jogador.maxStamina) * jogador.width, 5);
        ctx.strokeStyle = "black";
        ctx.strokeRect(jogador.x, jogador.y - (jogador.height / 2), jogador.width, 5);
        
        if (jogador.isAttacking) {
            const attackBox = getAttackHitbox(jogador)
            ctx.fillStyle = "red";
            ctx.fillRect(attackBox.x, attackBox.y, attackBox.width, attackBox.height);
        }
    }
}

function getAttackHitbox(jogador) {
    const attackX = jogador.facingDirection === "right"
        ? jogador.x + jogador.width 
        : jogador.x - jogador.attackRange.width; 

    return {
        x: attackX,
        y: jogador.y + jogador.height / 2 - jogador.attackRange.height / 2,
        width: jogador.attackRange.width,
        height: jogador.attackRange.height
    };
}


socket.on('update', (gameState) => {
    draw(gameState);
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