import setup from './setup.js';
import Animator from './Animator.js';
import { setupInputListeners } from './input.js';

const socket = io();
const animators = {};
let players = {};
let effects = [];
let plataforms = []
let gameOver = false;
let gameOverData = null;

function getRoomIdFromURL() {
  const parts = window.location.pathname.split('/');
  return parts[parts.length - 1];
}

const roomId = getRoomIdFromURL()

export function initSocket(onConnected) {
  socket.on('connect', () => {
    onConnected();
    socket.emit('getRoomData', { 
      roomId: roomId,
      socketId: socket.id    
    })
    document.getElementById('infoSala').textContent = roomId
  });

  socket.on('updateRoom', ({ players }) => {
    document.getElementById('placar').textContent = `${players.length}/2`
    document.getElementById('host').textContent = players[0] || ''
    document.getElementById('player2').textContent = players[1] || ''
  });
  
  socket.on('update', (serverPlayers, serverEffects, ServePlataforms) => {
    players = serverPlayers;
    effects = serverEffects || [];
    plataforms = ServePlataforms
  });

  socket.on('goToGame', ({ map }) => {
    document.getElementById('game-box').style.display = 'flex';
    document.getElementById('lobbyContainer').style.display = 'none';
    updateMap(map)
    setupInputListeners();
  });

  socket.on('gameOver', data => {
    gameOver = true;
    gameOverData = data;
  });

  socket.on('goToLobby', () => {
    window.location.href = '/';
  });

  // **Play** só ao clicar
  document.getElementById('play').addEventListener('click', () => {
    const character = document.getElementById('characterSelect').value;
    socket.emit('addPlayer', { roomId, characterType: character });
  });
}

export function isGameOver() { return gameOver; }
export function getGameOverData() { return gameOverData; }
export function getSocket() { return socket; }
export function getPlayers() { return players; }
export function getEffects() { return effects; }
export function getPlataforms() { return plataforms; }

export function getAnimator(playerId, playerData) {
  if (!animators[playerId]) {
    animators[playerId] = new Animator(setup, playerData.person, 'idle');
  }
  return animators[playerId];
}

export function cleanupAnimators() {
  for (const id in animators) {
    if (!players[id]) delete animators[id];
  }
}

function updateMap(src) {
  const canvas = document.getElementById('gameCanvas');
  canvas.style.backgroundImage = `url(${src})`;
}