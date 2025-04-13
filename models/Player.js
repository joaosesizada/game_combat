import config from "./config.js";

export default class Player {
    constructor(x, y, id, person) {
        this.config = config[person]
        this.person = person
        this.id = id;
        this.x = x;
        this.y = y;
        this.speed = this.config.speed || 5;
        this.width = 100;
        this.height = 125;
        this.renderWidth = this.width; // inicial igual à hitbox
        this.renderHeight = this.height;
        this.hitBoxToDraw = {}

        this.sprite = this.config.sprite;
        this.canvasHeight = 675;
        this.canvasWidth = 1200;

        this.keys = { w: false, a: false, d: false, s: false, ' ': false };

        this.isMoving = false;
        this.isGrounded = true;
        this.velocityY = 0;
        this.jumpForce = -21;
        this.gravity = 1.1;
        this.falling = false;
        this.rising = false;

        this.isAttacking = false;
        this.attackCooldown = false;
        this.attackDuration = this.config.attackDuration || 300;
        // Define a área de ataque: 40 pixels de largura e 20 pixels de altura
        this.attackBoxConfig  = this.config.attackBoxConfig  || { width: 40, height: 20 };
        this.attackBoxToDraw = {}

        // Propriedade para simular a vida do player
        this.health = this.config.health || 100;
        this.isDamaged = false;
        this.isAlive = true;

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

        this.regenStamina();

        this.applyGravity();

        this.updateVerticalDirection()
        	
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

    applyGravity() {
        if (!this.isGrounded) {
            this.velocityY += this.gravity;
            this.y += this.velocityY;
        }
        this.checkCollisionWithGround();
    }

    checkCollisionWithGround() {
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
        }, 350);
    
        if (this.health <= 0) {
            this.isAlive = false; 
        
            const index = players.indexOf(this);
            if (index !== -1) {
              players.splice(index, 1);
            }
        }
    }

    updateVerticalDirection() {
        this.rising = this.velocityY < 0;
        this.falling = this.velocityY > 0;
    }
    

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    getState() {
        return {
          id: this.id,
          x: this.x,
          y: this.y,
          speed: this.speed,
          height: this.height,
          width: this.width,
          hitBoxToDraw: this.hitBoxToDraw,
          renderWidth: this.renderWidth,
          renderHeight: this.renderHeight,
          sprite: this.sprite,
          canvasHeight: this.canvasHeight,
          canvasWidth: this.canvasWidth,
          keys: this.keys,
          isMoving: this.isMoving,
          isGrounded: this.isGrounded,
          velocityY: this.velocityY,
          jumpForce: this.jumpForce,
          gravity: this.gravity,
          falling: this.falling,
          rising: this.rising,
          isAttacking: this.isAttacking,
          attackCooldown: this.attackCooldown,
          attackDuration: this.attackDuration,
          attackBoxConfig: this.attackBoxConfig,
          attackBoxToDraw: this.attackBoxToDraw,
          health: this.health,
          isAlive: this.isAlive,
          isDamaged: this.isDamaged,
          maxStamina: this.maxStamina,
          stamina: this.stamina,
          staminaRegenRate: this.staminaRegenRate,
          attackStaminaCost: this.attackStaminaCost,
          jumpStaminaCost: this.jumpStaminaCost,
          facingDirection: this.facingDirection
        };
    }
}
