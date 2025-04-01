import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import Player from './models/Player.js';  // Certifique-se da extensão .js

// Necessário para obter __dirname em módulo ES
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

io.on("connection", (socket) => {
    console.log(`Novo usuário conectado: ${socket.id}`);
    gameState.players[socket.id] = new Player(0, 700, 800, 800, "Player 1");
    
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
