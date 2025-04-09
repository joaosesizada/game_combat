// server.js
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import GameRoom from './models/GameRoom.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/room/:roomId', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'room.html'));
});

// Armazena todas as salas ativas
const gameRooms = {};
const socketToRoom = {};

io.on("connection", (socket) => {
  
  socket.on("createRoom", ({ roomId }) => {

    if (gameRooms[roomId]) {
      socket.emit('erro', 'Sala já existe');
      return;
    }

    gameRooms[roomId] = new GameRoom(roomId, io); // estrutura real da sala
    socket.join(roomId); 

    socket.emit('connectToRoom', { roomId });
  });

  socket.on("joinRoom", ({ roomId }) => {

    const roomExists = !!gameRooms[roomId];
    if (!roomExists) {
      socket.emit('erro', 'Sala não existe');
      return;
    }

    socket.join(roomId); 
    socket.emit('connectToRoom', { roomId });
  });

  socket.on("addPlayer", ({ roomId }) => {

    if (!gameRooms[roomId]) {
      socket.emit('erro', 'Sala não existe');
      return;
    }
  
    const room = gameRooms[roomId];
    const success = room.addPlayer(socket.id);
    socketToRoom[socket.id] = roomId; // salva a sala do jogador
  
    if (!success) {
      socket.emit('erro', 'Sala cheia');
      return;
    }
  
    console.log(`player adicionado: ${roomId}`)
    socketToRoom[socket.id] = roomId; 
  });

  // Evento de movimentação do jogador
  socket.on("move", ({ roomId, ...dataKeys }) => {
    if (!roomId || !gameRooms[roomId]) return;

    const currentRoom = gameRooms[roomId];
    const player = currentRoom.players[socket.id];
    if (!player) return;

    player.keys = dataKeys;
  });

  socket.on("disconnect", () => {
    const roomId = socketToRoom[socket.id];
  
    if (!roomId) {
      console.log(`👋 Jogador ${socket.id} saiu da home, nada a fazer.`);
      return;
    }
  
    const room = gameRooms[roomId];
    if (room) {
      room.removePlayer(socket.id);
      console.log(`❌ Jogador ${socket.id} removido da sala ${roomId}.`);
  
      if (Object.keys(room.players).length === 0) {
        room.stopGame();
        delete gameRooms[roomId];
        console.log(`🗑️ Sala ${roomId} deletada por estar vazia.`);
      }
    }
  
    delete socketToRoom[socket.id]; // limpa o mapeamento
  });  
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
