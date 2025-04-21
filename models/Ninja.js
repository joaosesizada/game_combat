import Player from './Player.js';

export default class Ninja extends Player {
    constructor(x, y, id) {
        super(x, y, id, "ninja");
    }
    
    getAttackHitbox(attackName) {
        const cfg = this.attacksConfig[this.attackAnimCurrent].boxConfig;
      
        const hitboxes = [];
      
        const baseX = this.x;
        const baseY = this.y;
        const facingRight = this.facingDirection === "right";
        const bodyWidth = this.width;
      
        if (attackName === 'attack1') {
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
            width: cfg.lThickness + 5,
            height: cfg.lHeight
          };

          const verticalBoxTwo = {
              x: facingRight
                  ? baseX + bodyWidth + cfg.lThickness
                  : baseX - 55 - cfg.lThickness,
              y: baseY - 30,
              width: 55,
              height: 130
          };
        
          hitboxes.push(horizontalBox, verticalBox, verticalBoxTwo);
        } else {
          const horizontalBox = {
            x: baseX,
            y: baseY + this.height / 4,
            width: cfg.lWidth,
            height: cfg.lThickness
          };
      
        // Parte vertical (descendo da frente do player)
          const verticalBox = {
            x: facingRight
              ?  baseX + bodyWidth
              : baseX - bodyWidth + 8,
            y: baseY - 20,
            width: cfg.lThickness + 5,
            height: cfg.lHeight
          };
        
          hitboxes.push(horizontalBox, verticalBox);
        }


        
        this.attackBoxToDraw = hitboxes
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
        if (this.isAttacking && this.attackCooldown) return;
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
          this.renderWidth  = 300;
          this.renderHeight = 175;
          break;
        case "attack2":
            this.renderWidth  = 300;
            this.renderHeight = 160;
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

