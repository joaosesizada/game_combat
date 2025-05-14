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

socket.on()

socket.emit('getUserData')

// Receber os dados do usuário
socket.on('userData', (data) => {
    if (data.error) {
        console.error(data.error);
        // Se der erro (por exemplo, se o socket não tiver dados do usuário), você pode redirecionar para o login:
        // window.location.href = "index.html";
    } else {
        console.log('Dados recebidos:', data);

        // Atualizar informações do perfil na página
        // document.getElementById("userProfile").innerHTML = `
        //     <h3>${data.username}</h3>
        //     <img src="${data.photo_user}" alt="Foto do usuário" width="100">
        // `;
    }
});
const user = document.getElementById("user");
window.addEventListener("load", () => {
    const id = localStorage.getItem("userId");
    const nome = localStorage.getItem("username");
    const photo_user = localStorage.getItem("photo_user");
    const victory = localStorage.getItem("victory");
    const lose = localStorage.getItem("lose");

    if (id == null || nome == null || photo_user == null) {
        window.location.href = "login";
    }

    user.innerHTML = `
        <img src="../imgs/icones/${photo_user}.png" alt="Foto do usuário">
        <div>
            <h3>${nome}</h3>
            <div class="ladin">
                <img src="../imgs/ranking/trofeu.png" alt="Vitória">
                <h3>${victory}</h3>
            </div>
            <div class="ladin">   
                <img src="../imgs/ranking/morte.png" alt="Derrota">
                <h3>${lose}</h3>
            </div>
        </div>
    `;
});

const sair = document.getElementById("sair");
sair.addEventListener("click", () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("photo_user");
    window.location.href = "index.html";
});