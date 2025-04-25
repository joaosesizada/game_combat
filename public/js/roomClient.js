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