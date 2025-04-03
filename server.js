import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import Player from './models/Player.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'game.html'));
});

const gameState = { players: {} };
const FPS = 60;

setInterval(() => {
    // Aqui você pode atualizar lógicas de física e outras regras
    io.emit('update', gameState);
}, 1000 / FPS);

io.on("connection", (socket) => {
    console.log(`Novo usuário conectado: ${socket.id}`);
    
    // Limita o jogo a dois jogadores
    if (Object.keys(gameState.players).length >= 2) {
        socket.emit('erro', 'Jogo com dois jogadores já está em andamento.');
        console.log(`Conexão rejeitada para ${socket.id} - limite de 2 jogadores atingido.`);
        socket.disconnect();
        return;
    }
    
    // Ajusta a posição inicial do jogador, se necessário
    const posicaoInicialX = Object.keys(gameState.players).length === 0 ? 0 : 500;
    gameState.players[socket.id] = new Player(posicaoInicialX, 500, `Player ${socket.id}`);
    
    // Lógica de movimentação
    socket.on("move", (data) => {
        const player = gameState.players[socket.id];
        if (!player) return;

        switch (data.direcao) {
            case 'direita':
                if (player.x < player.canvasWidth - player.width) {
                    player.x += player.speed;
                    player.facingDirection = "right";
                }
                break;
            case 'esquerda':
                if (player.x > 0) {
                    player.x -= player.speed;
                    player.facingDirection = "left";
                }
                break;
            case 'cima':
                if (player.isGrounded && player.stamina >= player.jumpStaminaCost) {
                    player.stamina -= player.jumpStaminaCost;
                    player.velocityY = player.jumpForce;
                    player.isGrounded = false;
                }
                break;
            case 'baixo':
                if (player.stamina >= player.attackStaminaCost) {
                    player.stamina -= player.attackStaminaCost;
                    player.attack(Object.values(gameState.players));
                }
                break;
        }
    });

    socket.on("disconnect", () => {
        console.log(`Usuário desconectado: ${socket.id}`);
        delete gameState.players[socket.id];
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
