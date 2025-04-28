// Imports
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import GameRoom from './models/GameRoom.js';
import db from './db/Conn.js';
import Users from './models/User.js';

// Configurações
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let connectedPlayers = 0;

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Conexão com o Banco
db.sync({ force: false })
    .then(() => console.log('Banco de dados conectado com sucesso!'))
    .catch((error) => console.error('Erro ao conectar ao banco de dados:', error));

// Rotas de Páginas
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
    socket.on('bindUserToSocket', ({ userId, username, photo_user }) => {
        // Armazenar as informações do usuário
        socket.data.user = { userId, username, photo_user };
        console.log(`Usuário ${username} vinculado ao socket ${socket.id}`);
    
        // Responder ao cliente com sucesso
        socket.emit('loginSuccess', { message: 'Login bem-sucedido' });
      });
    
      // Quando o cliente pedir para obter os dados do usuário
      socket.on('getUserData', () => {
        if (socket.data.user) {
          socket.emit('userData', socket.data.user);  // Envia os dados do usuário de volta ao cliente
        } else {
          socket.emit('userData', { error: 'Usuário não encontrado' });
        }
      });

        connectedPlayers++;
        io.emit("playerCountGlobal", { count: connectedPlayers });

        const updateInterval = setInterval(() => {
            const roomId = socketToRoom[socket.id];
            if (!roomId) return;

            const room = gameRooms[roomId];
            if (!room) return;

            socket.emit("updateRoom", { room: room.getState() });
            socket.emit("playerCount", { count: room.getPlayerCount() });
        }, 1000); // a cada 1 segundo (1000 ms)

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

    // Rotas de Usuário
    app.post('/cadastrar', async (req, res) => {
        const { username, email, password, photo_user } = req.body;

        Users.create({
            username,
            email,
            password,
            photo_user: photo_user || 'default',
        })
            .then((user) => res.status(201).json(user))
            .catch((error) => res.status(500).json({ error: 'Erro ao cadastrar usuário' }));
    });

    app.get('/login/:username/:password', async (req, res) => {
        const { username, password } = req.params;

        Users.findOne({ where: { username, password } })
            .then((user) => {
                if (user) res.status(200).json(user);
                else res.status(404).json({ message: 'unavailable' });
            })
            .catch((error) => res.status(500).json({ error: 'Erro ao buscar usuário' }));
    });

    app.get('/ranking', async (req, res) => {
        Users.findAll({
            order: [['victory', 'DESC'], ['lose', 'ASC'], ['createdAt', 'ASC']],
            limit: 10,
            attributes: ['id', 'username', 'photo_user', 'victory', 'lose'],
        })
            .then((users) => res.status(200).json(users))
            .catch((error) => res.status(500).json({ error: 'Erro ao listar ranking' }));
    });

    app.get('/verifica-user/:username', async (req, res) => {
        const { username } = req.params;
        Users.findOne({ where: { username } })
            .then((user) => {
                if (user) res.status(409).json({ message: 'unavailable', user: username });
                else res.status(200).json({ message: 'available', user: username });
            })
            .catch((error) => res.status(500).json({ error: 'Erro ao verificar nome de usuário' }));
    });

    app.get('/verifica-email/:email', async (req, res) => {
        const { email } = req.params;
        Users.findOne({ where: { email } })
            .then((user) => {
                if (user) res.status(200).json({ message: 'unavailable' });
                else res.status(200).json({ message: 'available' });
            })
            .catch((error) => res.status(500).json({ error: 'Erro ao verificar email' }));
    });

    // Listen
    const PORT = 3000;
    server.listen(PORT, () => {
        console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
