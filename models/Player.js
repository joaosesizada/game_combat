// Player.js
import { log } from "console";
import { CombatManager } from "./CombatManager.js";

const config = {
    ninja: {
        speed: 6.5,
        attackDuration: 300,
        maxStamina: 100,
    },
    monge: {},
    tedesco: {},
    viking: {},
}

export default class Player {
    constructor(x, y, id, person) {
        this.config = config[person]
        
        this.id = id;
        this.x = x;
        this.y = y;
        this.speed = this.config.speed || 5;
        this.height = 120;
        this.width = 80;
        
        this.sprite = this.config.sprite;
        this.canvasHeight = 675;
        this.canvasWidth = 1200;

        this.keys = { w: false, a: false, d: false, s: false, ' ': false };

        this.isMoving = false;
        this.isGrounded = true;
        this.velocityY = 0;
        this.jumpForce = -15;
        this.gravity = 0.3;

        this.isAttacking = false;
        this.attackCooldown = false;
        this.attackDuration = this.config.attackDuration || 300;
        // Define a área de ataque: 40 pixels de largura e 20 pixels de altura
        this.attackRange = { width: 40, height: 20 };

        // Propriedade para simular a vida do player
        this.health = this.config.health || 100;
        this.isDamaged = false;

        // NOVO: Propriedades de stamina
        this.maxStamina = this.config.maxStamina || 100;
        this.stamina = this.maxStamina;
        this.staminaRegenRate = 0.25; // Quantidade regenerada por frame (pode ajustar)
        this.attackStaminaCost = 10;
        this.jumpStaminaCost = 15;

        // Propriedade para controlar a direção que o player está olhando (left ou right)
        this.facingDirection = "right";
    }

    update(players) {
        // Regenera stamina a cada frame (até o máximo)
        this.regenStamina();

        this.#applyGravity();

        this.isMoving = false;

        // Movimento lateral e atualização da direção
        if (this.keys.a) {
            if (this.x > 0) {
                this.x -= this.speed;
                this.facingDirection = "left";
                this.isMoving = true;
            }
        }
        if (this.keys.d) {
            if (this.x < this.canvasWidth - this.width) {
                this.x += this.speed;
                this.facingDirection = "right";
                this.isMoving = true;
            }
        }

        // Pulo (verifica se há stamina suficiente para pular)
        if (this.keys.w && this.isGrounded) {
            if (this.stamina >= this.jumpStaminaCost) {
                this.stamina -= this.jumpStaminaCost;
                this.velocityY = this.jumpForce;
                this.isGrounded = false;
            }
        }


        // Ataque (verifica se há stamina suficiente para atacar)
        if (this.keys[" "] && !this.isAttacking && !this.attackCooldown) {
            if (this.stamina >= this.attackStaminaCost) {
                this.stamina -= this.attackStaminaCost;
                this.attack(players);
            }
        }

    }

    attack(players) {
        if (!this.isAttacking && !this.attackCooldown) {
            this.isAttacking = true;
            this.attackCooldown = true;

            // O CombatManager verifica se o ataque atingiu algum player
            CombatManager.handleAttack(this, players);
            
            setTimeout(() => {
                this.isAttacking = false;
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

    #applyGravity() {
        if (!this.isGrounded) {
            this.velocityY += this.gravity;
            this.y += this.velocityY;
        }
        this.#checkCollisionWithGround();
    }

    #checkCollisionWithGround() {
        if (this.y + this.height >= this.canvasHeight) {
            this.y = this.canvasHeight - this.height;
            this.velocityY = 0;
            this.isGrounded = true;
        }
    }

    // Método que regenera a stamina
    regenStamina() {
        if (this.stamina < this.maxStamina) {
            this.stamina += this.staminaRegenRate;
            if (this.stamina > this.maxStamina) {
                this.stamina = this.maxStamina;
            }
        }
    }

    takeDamage(damage, players) {
        this.health -= damage;
        this.isDamaged = true;
        setTimeout(() => {
            this.isDamaged = false;
        }, 100);

        if (this.health <= 0) {
            const index = players.indexOf(this);
            if (index !== -1) {
                players.splice(index, 1);
            }
        }
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
}
