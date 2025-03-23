// CombatManager.js
export class CombatManager {
    // Verifica se o ataque de 'attacker' atingiu algum outro player na lista 'players'
    static handleAttack(attacker, players) {
        const attackBox = attacker.getAttackHitbox();

        players.forEach(player => {
            // Não verifica o próprio atacante
            if (player === attacker) return;

            const playerHitbox = player.getHitbox();

            if (CombatManager.#checkCollision(attackBox, playerHitbox)) {

                player.takeDamage(10, players);
            }
        });
    }

    // Método privado que verifica colisão entre dois retângulos
    static #checkCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }
}
