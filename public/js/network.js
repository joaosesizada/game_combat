import setup from './setup.js';
import Animator from './Animator.js';

const socket = io();
const animators = {};

let players = {};
let effects = []; 

let gameOver = false;
let gameOverData = null;

// setInterval(initSocket(onConnected)) {}


export function initSocket(onConnected) {
  socket.on('connect', () => {
    const roomId = getRoomIdFromURL();
    setTimeout(() => {
      socket.emit('addPlayer', { roomId });
      document.getElementById('infoSala').innerHTML = roomId;      
    }, 500);
    onConnected();
  });
  
  socket.on('update', (serverPlayers, serverEffects) => {
    players = serverPlayers;
    effects = serverEffects || [];
    console.log(players);
    
  });

  socket.on('goToGame', () => {
    document.getElementById("game").style.display = "block";
    document.getElementById("room").style.display = "none";
  });

  socket.on("updateRoom", ({ room }) => {
    document.getElementById('infoSala').innerHTML = room.id;
    console.log("Sala: "+room.id);

    const playerIds = Object.keys(room.players);
    console.log("Jogadores conectados:", playerIds);

    setInterval(() => {
      document.getElementById('host').innerHTML = playerIds[0]
      if(playerIds[1]) {
        document.getElementById('player2').innerHTML = playerIds[1]
      }
    }, 1000);

  });

  socket.on("playerCount", ({ count }) =>{
    console.log(count);
    document.getElementById('placar').innerHTML = count + '/2'  
  })

  socket.on("gameOver", (data) => {
    gameOver = false;
    gameOverData = data;
  });
  
  socket.on("goToLobby", () => {
    window.location.href = '/';
  })
}

export function isGameOver() {
  return gameOver;
}

export function getGameOverData() {
  return gameOverData;
}

export function getSocket() {
  return socket;
}

export function getPlayers() {
  return players;
}

export function getEffects() {
  return effects;
}

export function getAnimator(playerId, playerData) {
  if (!animators[playerId]) {
    animators[playerId] = new Animator(setup, playerData.person, 'idle');
  }
  return animators[playerId];
}

export function cleanupAnimators() {
  for (const playerId in animators) {
    if (!players[playerId]) {
      delete animators[playerId];
    }
  }
}

function getRoomIdFromURL() {
  const pathParts = window.location.pathname.split('/');
  return pathParts[pathParts.length - 1];
}
