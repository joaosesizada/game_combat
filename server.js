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

let connectedPlayers = 0;

app.use(express.static(path.join(__dirname, "public")));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/room/:roomId', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'room.html'));
});

app.get('/game/:roomId', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'game.html'));
});

// Armazena todas as salas ativas
const gameRooms = {};
const socketToRoom = {};

io.on("connection", (socket) => {
  connectedPlayers++;
  io.emit("playerCountGlobal", { count: connectedPlayers });

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

  socket.on("addPlayer", ({ roomId, characterType }) => {
    const room = gameRooms[roomId];
    if (!room) return socket.emit('erro', 'Sala não existe');

    const success = room.addPlayer(socket.id, characterType);

    io.to(roomId).emit("playerCount", { count: room.getPlayerCount() });

    if (!success) return socket.emit('erro', 'Sala cheia');

    // mapeia e inscreve na sala do Socket.IO
    socketToRoom[socket.id] = roomId;
    socket.join(roomId);        // <<=== ESSENCIAL

    // envia só para quem entrou, o estado da sala
    socket.emit("updateRoom", { room: room.getState() });
  });

  socket.on("startGame", ({ roomId }) => {
    const room = gameRooms[roomId];
    if (!room) return;

    io.to(roomId).emit("goToGame");

    room.startGame();
  });


  // Evento de movimentação do jogador
  // server.js
  socket.on("move", (keys) => {
    const roomId = socketToRoom[socket.id];
    if (!roomId) return;

    const room = gameRooms[roomId];
    if (!room) return;

    const player = room.players[socket.id];
    if (!player) return;

    // atualiza as teclas pressionadas
    player.keys = keys;
  });


  socket.on("disconnect", () => {
    const roomId = socketToRoom[socket.id];

    if (roomId) {
      const room = gameRooms[roomId];
      if (room) {
        room.removePlayer(socket.id);
        console.log(`❌ Jogador ${socket.id} removido da sala ${roomId}.`);
  
        // Atualiza a contagem por sala
        io.to(roomId).emit("playerCount", { count: room.getPlayerCount() });
      }
  
      delete socketToRoom[socket.id];
    } else {
      console.log(`👋 Jogador ${socket.id} saiu da home.`);
    }
  
    // Atualiza o contador global independentemente de estar em sala
    connectedPlayers = Math.max(connectedPlayers - 1, 0);
    io.emit("playerCountGlobal", { count: connectedPlayers });
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});