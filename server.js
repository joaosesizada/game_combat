const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

// Rota para a sala
app.get('/room/:codigo', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'room.html'));
});

const salas = {}; // Objeto para armazenar salas e usuários

io.on("connection", (socket) => {
    console.log(`Novo usuário conectado! ID: ${socket.id}`);

    // Criar uma nova sala
    socket.on("criar_sala", (callback) => {
        const codigoSala = Math.random().toString(36).substring(2, 7); // Gera um código aleatório
        salas[codigoSala] = { usuarios: [socket.id] }; // Cria a sala e adiciona o usuário
        socket.join(codigoSala); // Faz o usuário entrar na sala
        console.log(`Sala ${codigoSala} criada por ${socket.id}`);
        // Retorna a URL da sala para redirecionamento
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

    // Evento para acessar (ou recriar) a sala quando o usuário acessa diretamente a URL
    socket.on("acessar_sala", (codigoSala, callback) => {
        if (salas[codigoSala]) {
            // Adiciona o usuário à sala existente
            salas[codigoSala].usuarios.push(socket.id);
        } else {
            // Se a sala não existir, cria-a e adiciona o usuário
            salas[codigoSala] = { usuarios: [socket.id] };
        }
        socket.join(codigoSala);
        console.log(`Usuário ${socket.id} acessou a sala ${codigoSala}`);
        // Responde ao cliente indicando sucesso
        callback({ sucesso: true });
        // Emite a lista atualizada para todos na sala
        io.to(codigoSala).emit("atualizar_sala", salas[codigoSala].usuarios);
    });



    // Quando o usuário desconectar
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

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
