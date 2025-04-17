import Player from './Player.js';
import { CombatManager } from './CombatManager.js';

export default class Huntress extends Player {
    constructor(x, y, id) {
        // Passa "ninja" para que o construtor da classe base busque a configuração correta em config["ninja"]
        super(x, y, id, "huntress");
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

    customUpdate(players) {
        this.hitBoxToDraw = this.getHitbox();
        
        this.updateRender();
    }
    
    updateRender() {
      switch (this.currentAnimation) {
        case "attack":
          // sempre força o tamanho de ataque, independentemente de `falling`
          this.renderWidth  = 300;
          this.renderHeight = 175;
          break;
        case "fall":
          // tamanho de queda
          this.renderWidth  = this.width;
          this.renderHeight = 150;
          break;
        default:
          // qualquer outra animação volta ao padrão
          this.renderWidth  = this.width;
          this.renderHeight = this.height;
      }
    }    
}

