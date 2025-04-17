import GameRoom from "./GameRoom.js";
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
        this.currentAnimation = 'idle'

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

        this.attackDamage = 25
        this.isAttacking = false;
        this.attackCooldown = false;
        this.attackDuration = this.config.attackDuration || 300;
        this.attackClash = false
        // Define a área de ataque: 40 pixels de largura e 20 pixels de altura
        this.attackBoxConfig  = this.config.attackBoxConfig  || { width: 40, height: 20 };

        // Propriedade para simular a vida do player
        this.health = this.config.health || 100;
        this.isDamaged = false;
        this.isAlive = true;

        // NOVO: Propriedades de stamina
        this.maxStamina = this.config.maxStamina || 100;
        this.stamina = this.maxStamina;
        this.staminaRegenRate = 0.25; // Quantidade regenerada por frame (pode ajustar)
        this.attackStaminaCost = 20;
        this.jumpStaminaCost = 15;

        this.knockbackResistance = 0.8;
        // Propriedade para controlar a direção que o player está olhando (left ou right)
        this.facingDirection = "right";
    }

    update(players) {

        if (!this.isAlive) {
            this.renderHeight = this.height
            this.renderWidth = this.width
            this.updateAnimationState();
            return; // retorna depois de atualizar a animação de morte
        }

        this.regenStamina();
        this.applyGravity();
        this.updateVerticalDirection()
        	
        this.isMoving = false;

        if (this.knockbackActive) {
            this.processKnockback();
            this.updateAnimationState();
            this.updateRender();
            this.customUpdate(players);
            return;
        }

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

        this.updateAnimationState()
        this.customUpdate(players);
    }

    customUpdate(players) {

    }

    updateAnimationState() {
        if (!this.isAlive) { 
          this.currentAnimation = 'death';
        } else if (this.attackClash) {
          this.currentAnimation = 'attackClash';
        } else if (this.isDamaged) {
          this.currentAnimation = 'hurt';
        } else if (this.isAttacking) {
          this.currentAnimation = 'attack';
        } else if (this.rising) {
          this.currentAnimation = 'jump';
        } else if (this.falling) {
          this.currentAnimation = 'fall';
        } else if (this.isMoving) {
          this.currentAnimation = 'run';
        } else {
          this.currentAnimation = 'idle';
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

    takeDamage(damage, attacker) {
        this.health -= damage;
        this.isDamaged = true;
        
        const knockbackStrength = 30 * this.knockbackResistance; // Aplicar resistência ao knockback
        const knockbackY = -15 * this.knockbackResistance; // Pequeno impulso vertical
        
        // Determinar direção do knockback com base na posição relativa
        const direction = attacker.x > this.x ? -1 : 1;
        
        // Iniciar knockback
        this.startKnockback(direction * knockbackStrength, knockbackY);

        if (this.health <= 0) {
            this.isAlive = false; 
        }

        setTimeout(() => {
            this.isDamaged = false;
        }, 350);
    
    }

    updateVerticalDirection() {
        this.rising = this.velocityY < 0;
        this.falling = this.velocityY > 0;
    }
    
    onAttackClash(gameRoom) {
        const knockbackStrength = 30 * this.knockbackResistance; // Aplicar resistência ao knockback
        const direction = this.facingDirection === "right" ? -1 : 1;
    
        this.startKnockback(direction * knockbackStrength, 0);
        // dimensões do efeito
        const eW = 128, eH = 128;
        // posição dos pés
        const footCenterX = this.facingDirection === "left" ? this.x + (this.width * 2): this.x - this.width;
        const footY = this.y + this.height / 2;
        // aplica offsets para centralizar
        const effectX = footCenterX - eW / 2;
        const effectY = footY - eH / 2 + 10;

        gameRoom.addEffect({
            type: "smokeDust",
            x: effectX,
            y: effectY,
            width: eW,
            height: eH,
            duration: 500,
            flip: this.facingDirection === "left"
        });

        setTimeout(() => {
            this.isAttacking = false
            this.attackClash = true;
            this.renderWidth = this.width;
            this.renderHeight = this.height;
        }, 350)
        
        setTimeout(() => {
            this.attackClash = false;
        }, 1000);
    }

    startKnockback(velocityX, velocityY) {
        this.knockbackVelocity = { x: velocityX, y: velocityY };
        this.knockbackActive = true;
        this.knockbackTimer = 0;
    }
    
    // NOVO: Processa o movimento de knockback (sobrescreve o método da classe base)
    processKnockback() {
        // Aplicar velocidade de knockback
        this.x += this.knockbackVelocity.x;
        
        // Se estiver no chão, aplicar um pequeno salto durante o knockback
        if (this.isGrounded && this.knockbackVelocity.y < 0) {
            this.isGrounded = false;
            this.velocityY = this.knockbackVelocity.y;
        }
        
        // Aplicar fricção/resistência ao knockback
        this.knockbackVelocity.x *= 0.8;
        
        // Checar limites da tela
        if (this.x < 0) this.x = 0;
        if (this.x > this.canvasWidth - this.width) this.x = this.canvasWidth - this.width;
        
        // Gerenciar timer de knockback
        this.knockbackTimer += 16; // Aproximadamente 16ms por frame em 60fps
        if (this.knockbackTimer >= this.knockbackDuration || Math.abs(this.knockbackVelocity.x) < 0.5) {
            this.knockbackActive = false;
            this.knockbackVelocity = { x: 0, y: 0 };
        }
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
          currentAnimation: this.currentAnimation,
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
          attackClash: this.attackClash,
          attackDamage: this.attackDamage,
          isAttacking: this.isAttacking,
          attackCooldown: this.attackCooldown,
          attackDuration: this.attackDuration,
          attackBoxConfig: this.attackBoxConfig,
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
