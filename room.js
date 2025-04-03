import express from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/room/:codigo', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'room.html'));
});

const salas = {}; 

io.on("connection", (socket) => {
    console.log(`Novo usuário conectado! ID: ${socket.id}`);

    socket.on("criar_sala", (callback) => {
        const codigoSala = Math.random().toString(36).substring(2, 7);
        salas[codigoSala] = { usuarios: [socket.id] };
        socket.join(codigoSala);
        console.log(`Sala ${codigoSala} criada por ${socket.id}`);
        callback({ codigo: codigoSala, url: `/room/${codigoSala}` });
    });

    socket.on("entrar_sala", (codigoSala, callback) => {
        if (salas[codigoSala]) {
            salas[codigoSala].usuarios.push(socket.id);
            socket.join(codigoSala);
            console.log(`Usuário ${socket.id} entrou na sala ${codigoSala}`);
            callback({ sucesso: true, url: `/room/${codigoSala}` });
            io.to(codigoSala).emit("atualizar_sala", salas[codigoSala].usuarios);
        } else {
            callback({ sucesso: false, mensagem: "Sala não encontrada!" });
        }
    });

    socket.on("acessar_sala", (codigoSala, callback) => {
        if (salas[codigoSala]) {
            salas[codigoSala].usuarios.push(socket.id);
        } else {
            salas[codigoSala] = { usuarios: [socket.id] };
        }
        socket.join(codigoSala);
        console.log(`Usuário ${socket.id} acessou a sala ${codigoSala}`);
        callback({ sucesso: true });
        io.to(codigoSala).emit("atualizar_sala", salas[codigoSala].usuarios);
    });

    socket.on("disconnect", () => {
        console.log(`Usuário desconectado: ${socket.id}`);
        for (const sala in salas) {
            salas[sala].usuarios = salas[sala].usuarios.filter(id => id !== socket.id);
            if (salas[sala].usuarios.length === 0) {
                delete salas[sala];
                console.log(`Sala ${sala} foi removida por estar vazia`);
            } else {
                io.to(sala).emit("atualizar_sala", salas[sala].usuarios);
            }
        }
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
