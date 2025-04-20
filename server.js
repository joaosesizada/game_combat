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

const gameRooms = {};
const socketToRoom = {};

io.on("connection", (socket) => {
  
  socket.on("createRoom", ({ roomId }) => {

    if (gameRooms[roomId]) {
      socket.emit('erro', 'Sala já existe');
      return;
    }

    gameRooms[roomId] = new GameRoom(roomId, io); 
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

  socket.on("addPlayer", ({ roomId, characterType}) => {
    const room = gameRooms[roomId];
    if (!room) return socket.emit('erro', 'Sala não existe');
  
    socket.join(roomId);    
    const success = room.addPlayer(socket.id, characterType);
    if (!success) return socket.emit('erro', 'Sala cheia');
  
    socketToRoom[socket.id] = roomId;
  
    socket.emit("updateRoom", { room: room.getState() });
  });  

  // socket.on("startGame", ({ roomId }) => {
  //   const room = gameRooms[roomId];
  //   if (!room) return;
  
  //   io.to(roomId).emit("goToGame");
  
  //   room.startGame();
  // });
  
  socket.on("move", (keys) => {
    const roomId = socketToRoom[socket.id];
    if (!roomId) return;

    const room = gameRooms[roomId];
    if (!room) return;

    const player = room.players[socket.id];
    if (!player) return;

    player.keys = keys;
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
    }
  
    delete socketToRoom[socket.id]; //
  });  
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
