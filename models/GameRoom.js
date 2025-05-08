import Ninja from './Ninja.js'; 
import Huntress from './HeroKnight.js';
import { EffectManager } from './EffectManager.js';
import maps from './maps.js';

const MAX_PLAYERS = 2;

export default class GameRoom {

  static currentGameRoom = null;
  static currentMap = 'forest'
  constructor(idRoom, io) {
    this.idRoom = idRoom;
    this.io = io; 
    this.players = {};
    this.lobbyPlayers = {}
    this.FPS = 40;     
    this.gameInterval = null;
    this.effectManager = new EffectManager();
    this.map = null
    GameRoom.currentGameRoom = this;
  }

  static getGameRoom() {
    return GameRoom.currentGameRoom;
  }

  static setMap(map) {
    GameRoom.currentMap = map
  }

  static getMap() {
    return maps[GameRoom.currentMap]
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
      this.io.to(this.idRoom).emit('goToGame', { map: maps[GameRoom.currentMap].src });
      this.startGame();
    }

    return true;
  }

  addLobbyPlayer(socketId, data) {
    this.lobbyPlayers[socketId] = data
  }

  removePlayer(socketId) {
    delete this.players[socketId];
    delete this.lobbyPlayers[socketId];
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
      effects: this.effectManager.getEffects(),
      
    };
  }
  
  startGame() {
    if (this.gameInterval) return;
    this.gameInterval = setInterval(() => {
      const allPlayers = Object.values(this.players);
      const effects = this.effectManager.getEffects();
      const platforms = maps[GameRoom.currentMap].platforms

      allPlayers.forEach(p => p.update(allPlayers, effects));

      this.effectManager.update(); 

      this.io.to(this.idRoom).emit('update', this.getState().players, effects, platforms);

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

