import GameRoom from "./GameRoom.js";

export class CombatManager {
    // Chama handleAttack a cada frame, para cada jogador
    static handleAttack(attacker, players) {
      const atkBoxes = attacker.getAttackHitbox();      
      const atkDir   = attacker.facingDirection;        
      const atkDmg   = attacker.attackDamage;
  
      players.forEach(player => {
        if (player === attacker) return;
  
        if (attacker.isAttacking && player.isAttacking) {
          if (CombatManager.#oppositeDirections(attacker, player)) {
            const collision = CombatManager.#findFirstIntersection(
              attacker.getAttackHitbox(),
              player.getAttackHitbox()
            );

            if (collision) {
              // collision: { x, y, width, height }
              const centerX = collision.x + collision.width  / 2;
              const centerY = collision.y + collision.height / 2;
  
              const gameRoom = GameRoom.getGameRoom();
              
              attacker.onAttackClash?.(gameRoom);
              player.onAttackClash?.(gameRoom);
              
              gameRoom.addEffect({
                type:     "clash",
                x:        centerX  - 64, // se sua animação tem 128px de largura
                y:        centerY  - 64, // e 128px de altura
                width:    128,
                height:   128,
                duration: 750,
                flip: false
              });


            }
          }

          
        }
  
        // Caso padrão: apenas o attacker ataca
        if (attacker.isAttacking) {
          const plyHitbox = player.getHitbox();
          const hit = atkBoxes.some(ab => 
            CombatManager.#checkCollision(ab, plyHitbox)
          );
          if (hit) {
            player.takeDamage(atkDmg, attacker);
          }
        }
      });
    }

    static #findFirstIntersection(boxesA, boxesB) {
      for (let a of boxesA) {
        for (let b of boxesB) {
          if (CombatManager.#checkCollision(a, b)) {
            // calcula interseção A ∩ B
            const ix = Math.max(a.x, b.x);
            const iy = Math.max(a.y, b.y);
            const iw = Math.min(a.x + a.width,  b.x + b.width)  - ix;
            const ih = Math.min(a.y + a.height, b.y + b.height) - iy;
            return { x: ix, y: iy, width: iw, height: ih };
          }
        }
      }
      return null;
    }

    static #oppositeDirections(a, b) {
        return a.facingDirection !== b.facingDirection;
    }
  
    
    static #attacksCollide(a, b) {
        return a.getAttackHitbox().some(ab =>
          b.getAttackHitbox().some(pb =>
            CombatManager.#checkCollision(ab, pb)
          )
        );
      }
    // Verifica colisão entre dois retângulos (AABB)
    static #checkCollision(r1, r2) {
      return (
        r1.x < r2.x + r2.width &&
        r1.x + r1.width  > r2.x &&
        r1.y < r2.y + r2.height &&
        r1.y + r1.height > r2.y
      );
    }
  }
  