const socket = io();

function draw(gameState) {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    
    for (let id in gameState.players) {
        const jogador = gameState.players[id];
        
        const playerColor = id === Object.keys(gameState.players)[0] ? "#838282" : "red"
        ctx.fillStyle = jogador.isDamaged ? "orange" : playerColor;
        ctx.fillRect(jogador.x, jogador.y, jogador.width, jogador.height);

        ctx.fillStyle = 'blue'
        ctx.fillRect(jogador.facingDirection == "right" ? jogador.x + 20 : jogador.x , jogador.y + 10, 40, 30);

        // Exibe a vida do player acima dele (opcional)
        ctx.fillStyle = "white";
        ctx.font = "12px Arial";
        ctx.fillText(`${jogador.health}`, jogador.x, jogador.y - 10);

        // Exibe a stamina do player (opcional)
        ctx.fillStyle = "blue";
        ctx.fillRect(jogador.x, jogador.y - (jogador.height / 2), (jogador.stamina / jogador.maxStamina) * jogador.width, 5);
        ctx.strokeStyle = "black";
        ctx.strokeRect(jogador.x, jogador.y - (jogador.height / 2), jogador.width, 5);
    }
}

socket.on('update', (gameState) => {
    draw(gameState);
});

document.addEventListener('keydown', (e) => {
    let direcao;
    if (e.key === "ArrowRight") direcao = 'direita';
    if (e.key === "ArrowLeft") direcao = 'esquerda';
    if (e.key === "ArrowUp") direcao = 'cima';
    if (e.key === "ArrowDown") direcao = 'baixo';
    if (direcao) {
        socket.emit('move', { direcao });
    }
});

