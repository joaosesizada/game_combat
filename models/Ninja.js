import Player from './Player.js';
import { CombatManager } from './CombatManager.js';

export default class Ninja extends Player {
    constructor(x, y, id) {
        super(x, y, id, "ninja");
    }

    attack(players) {
        if (!this.isAttacking && !this.attackCooldown) {
            this.isAttacking = true;
            this.attackCooldown = true;
            if (this.person === "ninja") {
                this.width = 300
                this.height = 175
            }
            // O CombatManager verifica se o ataque atingiu algum player
            CombatManager.handleAttack(this, players);
            
            setTimeout(() => {
                this.isAttacking = false;
                if (this.person === "ninja") {
                    this.width = 100
                    this.y += 50
                    this.height = 125
                }
            }, this.attackDuration);
    
            setTimeout(() => {
                this.attackCooldown = false;
            }, this.attackDuration + 200);
        }
    }
    
    getHitbox() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    getAttackHitbox() {
        // Define a posição do ataque baseada na direção do player
        const attackX = this.facingDirection === "right"
            ? this.x + this.width // Ataca para a direita
            : this.x - this.attackRange.width; // Ataca para a esquerda
    
        return {
            x: attackX,
            y: this.y + this.height / 2 - this.attackRange.height / 2,
            width: this.attackRange.width,
            height: this.attackRange.height
        };
    }
}

