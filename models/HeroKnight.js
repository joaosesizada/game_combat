import Player from './Player.js';

export default class HeroKnight extends Player {
    constructor(x, y, id) {
        super(x, y, id, "heroKnight");
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
        } else {
          const horizontalBox = {
            x: facingRight ? baseX - 65 : baseX,
            y: baseY - 80,
            width: cfg.lWidth + 15,
            height: cfg.lThickness + 45
          };
        
          // Parte vertical (descendo da frente do player)
          const verticalBox = {
            x: facingRight
              ?  baseX + bodyWidth
              : baseX - cfg.lThickness,
            y: baseY - 50,
            width: cfg.lThickness,
            height: cfg.lHeight + 10
          };
  
          const verticalBoxTwo = {
              x: facingRight
              ?  baseX + bodyWidth + cfg.lThickness
              : baseX - (cfg.lThickness * 2) + 20,
            y: baseY - 30,
            width: 20,
            height: 150
          }
        
          hitboxes.push(horizontalBox, verticalBox, verticalBoxTwo);
        }

        this.attackBoxToDraw = hitboxes
        return hitboxes;
    }   
    
    getHitbox() {
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
            this.renderHeight = 200
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

