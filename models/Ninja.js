import Player from './Player.js';
import { CombatManager } from './CombatManager.js';

export default class Ninja extends Player {
    constructor(x, y, id) {
        // Passa "ninja" para que o construtor da classe base busque a configuração correta em config["ninja"]
        super(x, y, id, "ninja");
        this.attackDamage = 20;
        
        // NOVO: Propriedades específicas de knockback para o Ninja
        this.knockbackResistance = 0.8; // O Ninja tem mais resistência ao knockback (menor valor = mais resistência)
        
        // NOVO: Propriedades para controle de morte
        this.deathAnimationDuration = 1200; // ms
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
                ? baseX + bodyWidth
                : baseX - 40,
            y: baseY - 50,
            width: cfg.lThickness,
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
    
    // NOVO: Sobrescrever o método de takeDamage para incluir knockback específico do Ninja
    takeDamage(damage, attacker) {
        this.health -= damage;
        this.isDamaged = true;
        
        // Aplicar knockback baseado na posição do atacante se estiver vivo
        if (this.isAlive) {
            const knockbackStrength = 15 * this.knockbackResistance; // Aplicar resistência ao knockback
            const knockbackY = -5 * this.knockbackResistance; // Pequeno impulso vertical
            
            // Determinar direção do knockback com base na posição relativa
            const direction = attacker.x > this.x ? -1 : 1;
            
            // Iniciar knockback
            this.startKnockback(direction * knockbackStrength, knockbackY);
        }

        setTimeout(() => {
            this.isDamaged = false;
        }, 350);
    
        if (this.health <= 0) {
            this.health = 0;
            this.isAlive = false;
            
            // Desativar controles ao morrer
            this.keys = { w: false, a: false, d: false, s: false, ' ': false };
        }
    }

    update(players) {
        // Se o jogador estiver morto, não atualize a posição/movimento
        if (!this.isAlive) {
            // Apenas atualize a animação de morte
            this.currentAnimation = 'death';
            this.updateRender();
            return;
        }
        
        this.regenStamina();
        this.updateVerticalDirection();
        this.applyGravity();
        this.hitBoxToDraw = this.getHitbox();
        
        // NOVO: Processamento de knockback se estiver ativo
        if (this.knockbackActive) {
            this.processKnockback();
            this.updateAnimationState();
            this.updateRender();
            return;
        }
        	
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

        this.updateAnimationState();
        this.updateRender();
    }
    
    // NOVO: Sobrescrever o método para lidar com animação de morte específica do Ninja
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
    
    updateRender() {
        // Ajustar render para a animação de morte
        if (!this.isAlive) {
            // Tamanhos específicos para animação de morte
            this.renderWidth = 130;
            this.renderHeight = 150;
            return;
        }
        
        if(this.currentAnimation !== "attack" && this.currentAnimation !== "fall") {
            this.renderHeight = this.height;
            this.renderWidth = this.width;
            return;
        }

        this.renderWidth = this.falling ? this.height : 300;
        this.renderHeight = this.falling ? 150 : 175;
    }
    
    // NOVO: Método para iniciar knockback (sobrescreve o método da classe base)
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
    
    // NOVO: Método específico para o fim da animação de morte
    onDeathAnimationComplete() {
        this.deathAnimationComplete = true;
    }
}