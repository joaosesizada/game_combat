const socket = io();

document.getElementById('createRoom').addEventListener('click', () => {
    const roomId = Math.random().toString(36).substr(2, 6).toLowerCase();
    socket.emit('createRoom', { roomId });
});

document.getElementById('joinRoom').addEventListener('click', () => {
    const roomId = document.getElementById('cod_entry').value
    socket.emit('joinRoom', { roomId });
});

socket.on('connectToRoom', ({ roomId }) => {
    window.location.href = `/room/${roomId}`;
});

socket.on("playerCountGlobal", ({ count }) => {
    document.getElementById("online-count").textContent = `PLAYERS: ${count}`;
    console.log(count);
});

socket.emit('getUserData')

// Receber os dados do usuário
socket.on('userData', (data) => {
    if (data.error) {
      console.log(data.error);
    } else {
      console.log('Dados do usuário:', data);
      // Aqui você pode usar as informações do usuário
      // Exemplo: Exibir no frontend
    //   document.getElementById("userProfile").innerHTML = `
    //     <h3>${data.username}</h3>
    //     <img src="${data.photo_user}" alt="Foto do usuário">
    //   `;
    }
});