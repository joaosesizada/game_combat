import Player from './Player.js';
import { CombatManager } from './CombatManager.js';

export default class HeroKnight extends Player {
    constructor(x, y, id) {
        super(x, y, id, "heroKnight");
    }    

    firstAttack(players) {
        if (!this.isAttacking && !this.attackCooldown) {

            this.isAttacking = true;
            this.attackCooldown = true;
            
            setTimeout(() => {
              CombatManager.handleAttack(this, players);
            }, 120);

            setTimeout(() => {
              this.isAttacking = false;
              
            }, this.attackDuration);
        
            setTimeout(() => {
              this.attackCooldown = false;
            }, this.attackDuration + 600);
        }
      }

    secondAttack(players) {
        if (!this.isAttacking && !this.attackCooldown) {

            this.isAttacking = true;
            this.attackCooldown = true;
            
            setTimeout(() => {
              CombatManager.handleAttack(this, players);
            }, 120);

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
        
        this.attackBoxToDraw = hitboxes
        return hitboxes;
    }   
    
    getHitbox() {
        const facingRight = this.facingDirection === "right";
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    updateVerticalDirection() {
        if (this.isAttacking && this.attackCooldown) return
        this.rising = this.velocityY < 0;
        this.falling = this.velocityY > 0;
    }

    customUpdate(players) {
        this.hitBoxToDraw = this.getHitbox();
        
        this.updateRender();
    }
    
    updateRender() {
      switch (this.currentAnimation) {
        case "attack1":
          this.renderWidth  = 325;
          this.renderHeight = 155
          break;
        case "attack2":
            this.renderWidth  = 325;
            this.renderHeight = 155
            break;
        case "fall":
          this.renderWidth  = this.width;
          this.renderHeight = 150;
          break;
        default:
          this.renderWidth  = this.width;
          this.renderHeight = this.height;
      }
    }    
}

