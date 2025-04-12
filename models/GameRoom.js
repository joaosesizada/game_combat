import Ninja from './Ninja.js'; 

const MAX_PLAYERS = 2;

export default class GameRoom {
  constructor(idRoom, io) {
    this.idRoom = idRoom;
    this.io = io; // referência para o socket.io para poder emitir eventos
    this.players = {};  // armazenaremos os jogadores com socket.id como chave
    this.FPS = 60;      // atualizações por segundo
    this.gameInterval = null;

    console.log(`[GameRoom] Sala criada: ${idRoom}`);
  }

  // Adiciona um jogador à sala
  addPlayer(socketId, characterType = "ninja") {
    if (Object.keys(this.players).length >= MAX_PLAYERS) {
      console.log(`[GameRoom ${this.idRoom}] Tentativa de adicionar jogador ${socketId}, mas a sala está cheia.`);
      return false;
    }

    // Distribuir a posição inicial: o primeiro na esquerda, o segundo na direita
    const positionInitX = Object.keys(this.players).length === 0 ? 0 : 500;

    let player;
    // Um mapeamento ou if/else para instanciar a classe correta
    switch (characterType) {
      case "ninja":
        player = new Ninja(positionInitX, 700, socketId);
        break;
      case "viking":
        // player = new Viking(100, 500, socketId); // Exemplo
        break;
      // Adicione outros cases para outras classes, por exemplo "monge",     etc.
      default:
        // Pode instanciar o Player base ou o ninja como padrão
        player = new Ninja(positionInitX, 700, socketId);
    }

    this.players[socketId] = player;
    console.log(`[GameRoom ${this.idRoom}] Jogador ${socketId} adicionado. Total de jogadores: ${Object.keys(this.players).length}`);
    return true;
  }

  // Remove o jogador da sala
  removePlayer(socketId) {
    if (this.players[socketId]) {
      delete this.players[socketId];
      console.log(`[GameRoom ${this.idRoom}] Jogador ${socketId} removido. Restam: ${Object.keys(this.players).length} jogador(es).`);
    }
  }

  getState() {
    return {
      id: this.idRoom,
      players: Object.fromEntries(
        Object.entries(this.players).map(([socketId, player]) => [
          socketId,
          player.getState()
        ])
      )
    };
  }

  startGame() {
    if (this.gameInterval) return;
    this.gameInterval = setInterval(() => {
      // atualiza lógica de cada player
      Object.values(this.players).forEach(p => p.update(Object.values(this.players)));

      // emite só dados puros
      this.io.to(this.idRoom).emit('update', this.getState().players);
    }, 1000 / this.FPS);
  }

  // Para o loop se necessário
  stopGame() {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
      console.log(`[GameRoom ${this.idRoom}] Jogo encerrado.`);
    }
  }

  // Envia uma atualização para todos os sockets da sala
  broadcast(event, data) {
    console.log(`[GameRoom ${this.idRoom}] Broadcast: ${event}`);
    this.io.to(this.idRoom).emit(event, data);  
  }
}
