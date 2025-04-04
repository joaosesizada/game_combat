// main.js
import Player from "./models/Player.js";

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Cria os jogadores e atribui um identificador único a cada um
const player_one = new Player(0, 700, canvas.height, canvas.width, "Player 1");
const player_two = new Player(500, 700, canvas.height, canvas.width, "Player 2");
const players = [player_one, player_two];

function gameloop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Atualiza e desenha cada jogador
    players.forEach(player => {
        
        console.log(player)
        
        if (player.id === "Player 1") {
            player.update(keys_one, players);
        } else {
            player.update(keys_two, players);
        }
        player.draw(ctx, player.id);
    });

    requestAnimationFrame(gameloop);
}

const keys_one = { w: false, a: false, d: false, s: false, ' ': false };
const keys_two = { ArrowUp: false, ArrowLeft: false, ArrowRight: false, ArrowDown: false};

window.addEventListener("keydown", (event) => {
    const key = event.key;
    console.log(key)
    if (keys_one.hasOwnProperty(key)) keys_one[key] = true;
    if (keys_two.hasOwnProperty(key)) keys_two[key] = true;
});

window.addEventListener("keyup", (event) => {
    const key = event.key;
    if (keys_one.hasOwnProperty(key)) keys_one[key] = false;
    if (keys_two.hasOwnProperty(key)) keys_two[key] = false;
});

gameloop();
