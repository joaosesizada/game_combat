import Player from './Player.js';
import { CombatManager } from './CombatManager.js';

export default class Ninja extends Player {
    constructor(x, y, id) {
        // Passa "ninja" para que o construtor da classe base busque a configuração correta em config["ninja"]
        super(x, y, id, "ninja");
        this.attackDamage = 20
    }

    attack(players) {
        if (!this.isAttacking && !this.attackCooldown) {
      
            this.isAttacking = true;
            this.attackCooldown = true;

            CombatManager.handleAttack(this, players);

            setTimeout(() => {
              this.isAttacking = false;
              
            }, this.attackDuration);
        
            setTimeout(() => {
              this.attackCooldown = false;
            }, this.attackDuration + 600);
        }
      }
    
    getAttackHitbox() {
        const cfg = this.attackBoxConfig;
      
        const hitboxes = [];
      
        const baseX = this.x;
        const baseY = this.y;
        const facingRight = this.facingDirection === "right";
        const bodyWidth = this.width;
        const bodyHeight = this.height;
      
        // Parte horizontal (acima e à frente do player)
        const horizontalBox = {
          x: baseX,
          y: baseY - 50,
          width: cfg.lWidth,
          height: cfg.lThickness
        };
      
        // Parte vertical (descendo da frente do player)
        const verticalBox = {
          x: facingRight
            ?  baseX + bodyWidth
            : baseX - 40,
          y: baseY - 50,
          width: cfg.lThickness,
          height: cfg.lHeight
        };

        const verticalBoxTwo = {
            x: facingRight
            ?  baseX + bodyWidth + cfg.lThickness
            : baseX - 55 - cfg.lThickness,
          y: baseY - 30,
          width: 55,
          height: 130
        }
      
        hitboxes.push(horizontalBox, verticalBox, verticalBoxTwo);
      
        return hitboxes;
    }      
    
    getHitbox() {
        const facingRight = this.facingDirection === "right";
        return {
            x: facingRight ? this.x + 30 : this.x,
            y: this.y,
            width: 70,
            height: this.height
        };
    }

    updateVerticalDirection() {
        if (this.isAttacking && this.attackCooldown) return
        this.rising = this.velocityY < 0;
        this.falling = this.velocityY > 0;
    }

    update(players) {

        if(!this.isAlive) return

        this.regenStamina();

        this.updateVerticalDirection()

        this.applyGravity();

        this.hitBoxToDraw = this.getHitbox();
        	
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

        this.updateAnimationState()
        this.updateRender()
    }
    
    updateRender() {
        if(this.currentAnimation !== "attack" && this.currentAnimation !== "fall") {
            this.renderHeight = this.height
            this.renderWidth = this.width
            return
        }

        this.renderWidth = this.falling ? this.height : 300
        this.renderHeight = this.falling ? 150 : 175
    }
}

