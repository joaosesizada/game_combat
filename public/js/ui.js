import { getSocket } from './network.js';

export function initUI() {
  document.getElementById('play').addEventListener('click', () => {
    // 1) pega a sala a partir da URL
    const pathParts = window.location.pathname.split('/');
    const roomId = pathParts[pathParts.length - 1];
  
    // 2) pega o personagem selecionado
    const characterType = document.getElementById('characterSelect').value;
  
    // 3) emite para o servidor
    getSocket().emit('addPlayer', { roomId, characterType });
  
    // 4) opcional: desativa o botão para evitar múltiplos cliques
    document.getElementById('play').disabled = true;
  });
}

