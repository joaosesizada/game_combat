import Ninja from './Ninja.js'; 
import Huntress from './HeroKnight.js';
import { EffectManager } from './EffectManager.js';

const MAX_PLAYERS = 2;

export default class GameRoom {

  static currentGameRoom = null;

  constructor(idRoom, io) {
    this.idRoom = idRoom;
    this.io = io; 
    this.players = {};  
    this.FPS = 60;     
    this.gameInterval = null;
    this.effectManager = new EffectManager();
    GameRoom.currentGameRoom = this;
  }

  static getGameRoom() {
    return GameRoom.currentGameRoom;
  }

  addPlayer(socketId, characterType = "heroKnight") {
    if (Object.keys(this.players).length >= MAX_PLAYERS) {
      return false;
    }

    this.players[socketId] = null
    const positionInitX = Object.keys(this.players).length === 1 ? 0 : 1000;

    let player;

    const type = characterType
    ? characterType
    : (Object.keys(this.players).length === 0 ? "heroKnight" : "ninja");

    switch (type) {
      case "ninja":
        player = new Ninja(positionInitX, 700, socketId);
        break;
      case "heroKnight":
        player = new Huntress(positionInitX, 700, socketId);
        break;
      default:
        player = new Ninja(positionInitX, 700, socketId);
    }

    this.players[socketId] = player;

    if (Object.keys(this.players).length === MAX_PLAYERS) {
      this.io.to(this.idRoom).emit('goToGame');
      this.startGame();
    }

    return true;
  }

  removePlayer(socketId) {
    if (this.players[socketId]) {
      delete this.players[socketId];
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
      ),
      effects: this.effectManager.getEffects()
    };
  }
  
  startGame() {
    if (this.gameInterval) return;
    this.gameInterval = setInterval(() => {
      const allPlayers = Object.values(this.players);
      const effects = this.effectManager.getEffects();

      allPlayers.forEach(p => p.update(allPlayers, effects));

      this.effectManager.update(); 

      this.io.to(this.idRoom).emit('update', this.getState().players, effects);

      this.checkGameOver();
    }, 1000 / this.FPS);
  }

  checkGameOver() {
    const alivePlayers = Object.values(this.players).filter(player => player.isAlive);
    if (alivePlayers.length <= 1) {
      const winner = alivePlayers[0] || null;
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

      Object.keys(this.players).forEach(socketId => {
        delete this.players[socketId];
      });

      this.io.to(this.idRoom).emit("goToLobby")
    }
  }

  broadcast(event, data) {
    this.io.to(this.idRoom).emit(event, data);  
  }

  getPlayerCount() {
    return Object.keys(this.players).length;
  }
}

