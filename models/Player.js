import config from "./config.js";
import { CombatManager } from './CombatManager.js';
import GameRoom from "./GameRoom.js";

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
        this.gameRoom = GameRoom.getGameRoom();

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

        this.attacksConfig = this.config.attacks;
        this.attackClash = false
        this.attackBoxToDraw = []
        this.attackAnimCurrent = null

        this.maxHealth = this.config.health;
        this.health = this.config.health;
        this.isDamaged = false;
        this.isAlive = true;

        this.maxStamina = this.config.maxStamina;
        this.stamina = this.maxStamina;
        this.staminaRegenRate = this.config.staminaRegenRate;
        this.jumpStaminaCost = 15;

        this.maxSuperEnergy = this.config.maxSuperEnergy
        this.superEnergy = 0

        this.knockbackResistance = 0.8;
        this.facingDirection = this.x >= 0 ? 'right' : "left";
        this.platforms = GameRoom.getMap().platforms
    }

    update(players, effects = []) {

        if (!this.isAlive) {
            this.renderHeight = this.height
            this.renderWidth = this.width
            this.updateAnimationState();
            return; 
        }

        this.regenStamina();
        this.applyGravity();
        this.updateVerticalDirection()
        this.checkEffects(effects)
        	
        this.isMoving = false;

        if (this.knockbackActive) {
            this.processKnockback();
            this.updateAnimationState();
            this.updateRender();
            this.customUpdate(players);
            return;
        }

        if (this.keys.lastKey === 'a' && this.keys.a) {
            if (this.x > 0) {
                this.x -= this.speed;
                this.facingDirection = "left";
                this.isMoving = true;
            }
        }
        if (this.keys.lastKey === 'd' && this.keys.d) {
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

        if (this.keys.scroll) this.requestSuper('super')
        if (this.keys.mouseLeft)  this.requestAttack('attack1', players);
        if (this.keys.mouseRight) this.requestAttack('attack2', players);

        this.checkPlatforms(this.platforms)
        
        this.updateAnimationState()
        this.customUpdate(players);
    }

    customUpdate(players) {

    }

    checkPlatforms(platforms) {
        this.isGrounded = false

        for (let platform of platforms) {
            const withinX = this.x + this.width > platform.x && this.x < platform.x + platform.width
            const touchingTop = this.y + this.height >= platform.y && this.y + this.height <= platform.y + this.velocityY

            if (withinX && touchingTop && this.velocityY >= 0) {
                this.y = platform.y - this.height
                this.velocityY = 0
                this.isGrounded = true
            }
        }
    }

    collides(effect) {
        return !(
          this.x + this.width  < effect.x ||
          effect.x + effect.width  < this.x ||
          this.y + this.height < effect.y ||
          effect.y + effect.height < this.y
        );
      }
    
    checkEffects(effects) {
        effects.forEach(effect => {
          if (!effect.impactful || effect.attacker == this.id) return;
    
          if (this.collides(effect)) {
            this.takeDamage(effect.damage, effect, this.gameRoom)

            effect.created = 0;
          }
        });
    }

    requestAttack(type, players) {
        const atk = this.attacksConfig[type];
        if (!atk || this.isAttacking || this.attackCooldown) return;
        if (this.stamina < atk.staminaCost) return;
    
        this.stamina -= atk.staminaCost;
        this.isAttacking = true;
        this.attackCooldown = true;
        this.attackAnimCurrent = type;

        setTimeout(() => CombatManager.handleAttack(this, players), 120);
    
        setTimeout(() => { this.isAttacking = false; }, atk.duration);
    
        setTimeout(() => { this.attackCooldown = false; }, atk.duration + atk.cooldown);
    }
    
    requestSuper(type) {
        const config = this.attacksConfig[type];
        if(this.isAttacking || this.attackCooldown) return
        if(this.superEnergy < config.energyCost) return

        this.superEnergy -= config.energyCost
        this.isAttacking = true
        this.attackCooldown = true
        this.attackAnimCurrent = type

        const flip = this.facingDirection === 'left'
        const initX = flip ? this.x : this.x + this.width
  
        this.gameRoom.effectManager.addEffect({
          type: config.name,
          x: initX,
          y: this.y,
          width: config.width,
          height: config.height,
          duration: 5000,
          flip: flip,
          impactful: true,
          speed: config.speed,
          damage: config.damage,
          attacker: this.id
        });

        setTimeout(() => { this.isAttacking = false; }, config.duration);
    
        setTimeout(() => { this.attackCooldown = false; }, config.duration + config.cooldown);
    }

    updateAnimationState() {
        if (!this.isAlive) { 
          this.currentAnimation = 'death';
        } else if (this.attackClash) {
          this.currentAnimation = 'attackClash';
        } else if (this.isDamaged) {
          this.currentAnimation = 'hurt';
        } else if (this.isAttacking) {
          this.currentAnimation = this.attackAnimCurrent;
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
        
        if (this.health <= 0) {
            this.isAlive = false;
            return 
        }
        
        this.chargeSuper('takeDamage')
        this.smokeDust(gameRoom, direction)
        this.startKnockback(direction * knockbackStrength, knockbackY);

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
        this.smokeDust(gameRoom, direction)

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

    chargeSuper(type) {
        const energy = type === 'takeDamage' ? 10 : 5
        
        if (this.superEnergy < this.maxSuperEnergy) {
            this.superEnergy += energy
            if (this.superEnergy > this.maxSuperEnergy) {
                this.superEnergy = this.maxSuperEnergy
            }
        }
    }

    smokeDust(gameRoom, direction) {
        const eW = 128, eH = 128;
    
        const footCenterX = direction === 1 
            ? this.x + this.width   
            : this.x - this.width; 
    
        const footY = this.y + this.height / 2;
    
        const effectX = footCenterX - eW / 2;
        const effectY = footY - eH / 2 + 10;
    
        const flip = direction === 1;
    
        gameRoom.effectManager.addEffect({
            type: "smokeDust",
            x: effectX,
            y: effectY,
            width: eW,
            height: eH,
            duration: 500,
            flip: flip, 
            impactful: false,
            speed: 0,
            attacker: null
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
          maxHealth: this.maxHealth,
          isAlive: this.isAlive,
          isDamaged: this.isDamaged,
          maxStamina: this.maxStamina,
          stamina: this.stamina,
          staminaRegenRate: this.staminaRegenRate,
          maxSuperEnergy: this.maxSuperEnergy,
          superEnergy: this.superEnergy,
          attackStaminaCost: this.attackStaminaCost,
          jumpStaminaCost: this.jumpStaminaCost,
          facingDirection: this.facingDirection
        };
    }
}
