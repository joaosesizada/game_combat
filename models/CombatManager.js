export class CombatManager {
    // Verifica se o ataque de 'attacker' atingiu algum outro player na lista 'players'
    static handleAttack(attacker, players) {
        const attackBoxes = attacker.getAttackHitbox(); // Agora retorna um array

        players.forEach(player => {
            if (player === attacker) return;

            const playerHitbox = player.getHitbox();

            // Verifica se QUALQUER caixa de ataque colide com o player
            const atingiu = attackBoxes.some(box => 
                CombatManager.#checkCollision(box, playerHitbox)
            );

            if (atingiu) {
                player.takeDamage(10, players);
            }
        });
    }

    // Verifica colisão entre dois retângulos
    static #checkCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }
}
