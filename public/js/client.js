const socket = io();

function desenharEstado(estado) {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha cada jogador
    for (let id in estado.players) {
        const jogador = estado.players[id];
        ctx.fillStyle = (id === socket.id) ? 'blue' : 'red';
        ctx.fillRect(jogador.x, jogador.y, 30, 30);
    }
}

socket.on('estado_atual', (estado) => {
    desenharEstado(estado);
});

document.addEventListener('keydown', (e) => {
    let direcao;
    if (e.key === "ArrowRight") direcao = 'direita';
    if (e.key === "ArrowLeft") direcao = 'esquerda';
    if (e.key === "ArrowUp") direcao = 'cima';
    if (e.key === "ArrowDown") direcao = 'baixo';
    if (direcao) {
        socket.emit('mover', { direcao });
    }
});
