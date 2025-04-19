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
        this.renderWidth = this.width; 
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

        this.attackDamage = this.config.attackDamage
        this.isAttacking = false;
        this.attackCooldown = false;
        this.attackDuration = this.config.attackDuration;
        this.attackClash = false
        this.attackBoxToDraw = []
        this.attackBoxConfig  = this.config.attackBoxConfig;

        this.health = this.config.health;
        this.isDamaged = false;
        this.isAlive = true;

        this.maxStamina = this.config.maxStamina;
        this.stamina = this.maxStamina;
        this.staminaRegenRate = 0.25; 
        this.attackStaminaCost = 20;
        this.jumpStaminaCost = 15;

        this.knockbackResistance = 0.8;
        this.facingDirection = "right";
    }

    update(players) {

        if (!this.isAlive) {
            this.renderHeight = this.height
            this.renderWidth = this.width
            this.updateAnimationState();
            return; 
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

        if (this.keys.w && this.isGrounded) {
            if (this.stamina >= this.jumpStaminaCost) {
                this.stamina -= this.jumpStaminaCost;
                this.velocityY = this.jumpForce;
                this.isGrounded = false;
                
            }
        }

        if(this.keys.x && this.keys.y) {
            this.isMoving = false
            this.updateAnimationState()
        }

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

    regenStamina() {
        if (this.stamina < this.maxStamina) {
            this.stamina += this.staminaRegenRate;
            if (this.stamina > this.maxStamina) {
                this.stamina = this.maxStamina;
            }
        }
    }

    takeDamage(damage, attacker, gameRoom) {
        this.health -= damage;
        this.isDamaged = true;
        
        const knockbackStrength = 30 * this.knockbackResistance; 
        const knockbackY = -15 * this.knockbackResistance; 
        
        const direction = attacker.x > this.x ? -1 : 1;
        
        this.smokeDust(gameRoom)
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
        const knockbackStrength = 30 * this.knockbackResistance; 
        const direction = this.facingDirection === "right" ? -1 : 1;
    
        this.startKnockback(direction * knockbackStrength, 0);
        this.smokeDust(gameRoom)

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

    smokeDust(gameRoom) {
        const eW = 128, eH = 128;

        const footCenterX = this.facingDirection === "left" ? this.x + (this.width * 2): this.x - this.width;
        const footY = this.y + this.height / 2;

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
    }
    
    processKnockback() {
        this.x += this.knockbackVelocity.x;
        
        if (this.isGrounded && this.knockbackVelocity.y < 0) {
            this.isGrounded = false;
            this.velocityY = this.knockbackVelocity.y;
        }
        
        this.knockbackVelocity.x *= 0.8;
        
        if (this.x < 0) this.x = 0;
        if (this.x > this.canvasWidth - this.width) this.x = this.canvasWidth - this.width;
        
        this.knockbackTimer += 16; 
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
          person: this.person,
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
