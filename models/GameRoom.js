import Ninja from './Ninja.js'; 
import Huntress from './Huntress.js';

const MAX_PLAYERS = 2;

export default class GameRoom {

  static currentGameRoom = null;

  constructor(idRoom, io) {
    this.idRoom = idRoom;
    this.io = io; // referência para o socket.io para poder emitir eventos
    this.players = {};  // armazenaremos os jogadores com socket.id como chave
    this.effects = []
    this.FPS = 60;      // atualizações por segundo
    this.gameInterval = null;

    console.log(`[GameRoom] Sala criada: ${idRoom}`);
    GameRoom.currentGameRoom = this;
  }

  static getGameRoom() {
    return GameRoom.currentGameRoom;
  }
  // Adiciona um jogador à sala
  addPlayer(socketId, characterType = "huntress") {
    if (Object.keys(this.players).length >= MAX_PLAYERS) {
      console.log(`[GameRoom ${this.idRoom}] Tentativa de adicionar jogador ${socketId}, mas a sala está cheia.`);
      return false;
    }

    const positionInitX = Object.keys(this.players).length === 0 ? 0 : 500;

    let player;

    const type = characterType
    ? characterType
    : (Object.keys(this.players).length === 0 ? "huntress" : "ninja");

    switch (type) {
      case "ninja":
        player = new Ninja(positionInitX, 700, socketId);
        break;
      case "huntress":
        player = new Huntress(positionInitX, 700, socketId);
        break;
      default:
        player = new Ninja(positionInitX, 700, socketId);
    }

    this.players[socketId] = player;
    console.log(`[GameRoom ${this.idRoom}] Jogador ${socketId} adicionado como ${type}. Total: ${Object.keys(this.players).length}/${MAX_PLAYERS}`);

    // Se atingiu o número máximo de jogadores, inicia a partida
    if (Object.keys(this.players).length === MAX_PLAYERS) {
      console.log(`[GameRoom ${this.idRoom}] Número máximo de jogadores alcançado. Iniciando jogo.`);
      // Notifica todos os clientes para ir à tela de jogo
      this.io.to(this.idRoom).emit('goToGame');
      // Inicia o loop de atualização
      this.startGame();
    }

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
    console.log('[GameRoom] getState players:', Object.fromEntries(
      Object.entries(this.players).map(([id, p]) => [id, p.person])
    ));
    
    return {
      id: this.idRoom,
      players: Object.fromEntries(
        Object.entries(this.players).map(([socketId, player]) => [
          socketId,
          player.getState()
        ])
      ),
      effects: this.effects
    };
  }
  
  startGame() {
    if (this.gameInterval) return;
    this.gameInterval = setInterval(() => {
      // atualiza lógica de cada player
      Object.values(this.players).forEach(p => p.update(Object.values(this.players)));
      this.cleanUpEffects()
      this.io.to(this.idRoom).emit('update', this.getState().players, this.getState().effects);

      this.checkGameOver();
    }, 1000 / this.FPS);
  }

  checkGameOver() {
    const alivePlayers = Object.values(this.players).filter(player => player.isAlive);
    if (alivePlayers.length <= 1) {
      const winner = alivePlayers[0] || null;
      // Emite evento "gameOver" para todos os sockets na sala
      this.io.to(this.idRoom).emit("gameOver", { winnerId: winner ? winner.id : null});
      
      setTimeout(() => {
        this.stopGame();
      }, 5000); 
    }
}

  stopGame() {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
      console.log(`[GameRoom ${this.idRoom}] Jogo encerrado.`);

      Object.keys(this.players).forEach(socketId => {
        delete this.players[socketId];
      });

      this.io.to(this.idRoom).emit("goToLobby")
    }
  }

  addEffect(effectData) {
    effectData.created = Date.now();
    this.effects.push(effectData);
  }

  cleanUpEffects() {
    const now = Date.now();
    this.effects = this.effects.filter(effect => {
      return !effect.duration || (now - effect.created < effect.duration);
    });
  }
  // Envia uma atualização para todos os sockets da sala
  broadcast(event, data) {
    console.log(`[GameRoom ${this.idRoom}] Broadcast: ${event}`);
    this.io.to(this.idRoom).emit(event, data);  
  }
}
