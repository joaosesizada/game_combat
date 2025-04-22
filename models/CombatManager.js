import GameRoom from "./GameRoom.js";

export class CombatManager {
    static handleAttack(attacker, players) {
      const attackName = attacker.attackAnimCurrent
      const atkBoxes = attacker.getAttackHitbox(attackName);      
      const atkDmg = attacker.attacksConfig[attackName].damage;
  
      players.forEach(player => {
        if (player === attacker) return;
  
        if (attacker.isAttacking && player.isAttacking) {
          if (CombatManager.#oppositeDirections(attacker, player)) {
            const collision = CombatManager.#findFirstIntersection(
              attacker.getAttackHitbox(),
              player.getAttackHitbox()
            );

            if (collision) {
              const centerX = collision.x + collision.width  / 2;
              const centerY = collision.y + collision.height / 2;
  
              const gameRoom = GameRoom.getGameRoom();
              
              attacker.onAttackClash?.(gameRoom);
              player.onAttackClash?.(gameRoom);
              
              gameRoom.effectManager.addEffect({
                type: "clash",
                x: centerX  - 64, 
                y: centerY  - 64, 
                width: 128,
                height: 128,
                duration: 750,
                flip: false,
                impactful: false,
                speed: 0
              });
            }
          }
        }
        
        if (attacker.isAttacking) {
          const plyHitbox = player.getHitbox();
          const hit = atkBoxes.some(ab => 
            CombatManager.#checkCollision(ab, plyHitbox)
          );
          if (hit) {
            const gameRoom = GameRoom.getGameRoom();
            player.takeDamage(atkDmg, attacker, gameRoom);
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
  