import Player from './Player.js'; 

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
  addPlayer(socketId) {
    if (Object.keys(this.players).length >= 2) {
      console.log(`[GameRoom ${this.idRoom}] Tentativa de adicionar jogador ${socketId}, mas a sala está cheia.`);
      return false;
    }

    // Distribuir a posição inicial: o primeiro na esquerda, o segundo na direita
    const positionInitX = Object.keys(this.players).length === 0 ? 0 : 500;

    const newPlayer = new Player(positionInitX, 700, `Player ${socketId}`, 'ninja');
    this.players[socketId] = newPlayer;

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

  // Inicia o loop do jogo
  startGame() {
    if (this.gameInterval) {
      console.log(`[GameRoom ${this.idRoom}] Jogo já está em andamento.`);
      return;
    }

    console.log(`[GameRoom ${this.idRoom}] Iniciando o jogo...`);

    this.gameInterval = setInterval(() => {
      Object.values(this.players).forEach(player => {
        // Atualiza a posição e o estado de cada jogador.
        // Certifique-se de que o método update da classe Player lide com colisões,
        // movimentações e demais lógicas necessárias.
        player.update(Object.values(this.players));
      });

      // Envia uma atualização para todos os sockets da sala
      this.broadcast('update', { players: this.players });
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
