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
            
          if (
            CombatManager.#oppositeDirections(attacker, player) &&
            CombatManager.#attacksCollide(attacker, player)
          ) {
            console.log('Clash! ataques colidiram em direções opostas.');
            attacker.onAttackClash?.(player);
            player.onAttackClash?.(attacker);
            const gameRoom = GameRoom.getGameRoom();
            gameRoom.addEffect({ type: "clash", x: 50, y: 50, width: 128, height: 128, duration: 4000 });            
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
  