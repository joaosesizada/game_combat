export default class Animator {
  constructor(setup, character = "ninja", defaultAnim = "idle") {
    this.animations = {};
    this.currentAnimation = defaultAnim;
    this.currentFrame = 0;
    this.elapsedTime = 0;
    this.frameDuration = 100; // 100 ms por frame

    const animSetup = setup[character];
    if (!animSetup) {
      console.error(`Nenhuma configuração encontrada para o personagem: ${character}`);
      return;
    }

    for (let animName in animSetup) {
      const animationData = animSetup[animName];
      if (!animationData || !animationData.src) {
        console.error(`Dados de animação inválidos para "${animName}"`, animationData);
        continue;
      }

      const img = new Image();
      img.src = animationData.src;
      
      // Log para depurar quando a imagem carrega
      img.onload = () => {
        console.log(`Imagem "${animName}" carregada:`, {
          width: img.width,
          height: img.height
        });
        // Se frameWidth não estiver definido, calcular automaticamente
        if (!animationData.framesWidth) {
          this.animations[animName].frameWidth = img.width / animationData.totalFrames;
          console.log(`Calculado frameWidth para "${animName}":`, this.animations[animName].frameWidth);
        }
      };
      
      this.animations[animName] = {
        image: img,
        frameWidth: animationData.framesWidth, // Certifique-se de usar a propriedade correta!
        frameHeight: animationData.framesHeight,
        totalFrames: animationData.totalFrames || 1,
      };

      console.log(`Carregando animação "${animName}" ->`, this.animations[animName]);
    }
  }

  setAnimation(animName) {
    if (this.animations[animName]) {
      this.currentAnimation = animName;
      this.currentFrame = 0;
      this.elapsedTime = 0;
    } else {
      console.warn(`Animação "${animName}" não encontrada!`);
    }
  }

  update(deltaTime) {
    const animation = this.animations[this.currentAnimation];
    if (!animation) return;

    if (animation.totalFrames <= 1) return;

    this.elapsedTime += deltaTime;
    if (this.elapsedTime > this.frameDuration) {
      this.elapsedTime = 0;
      this.currentFrame = (this.currentFrame + 1) % animation.totalFrames;
      console.log(`Frame da animação "${this.currentAnimation}":`, this.currentFrame);
    }
  }

  drawSprite(ctx, x, y, width, height, flip = false) {
    const anim = this.animations[this.currentAnimation];
    if (!anim || !anim.image.complete) return;
  
    const frameX = this.currentFrame * anim.frameWidth;
  
    ctx.save(); // Salva o estado atual do contexto
  
    if (flip) {
      ctx.translate(x + width, y); // Move a origem para o canto direito do sprite
      ctx.scale(-1, 1);            // Espelha horizontalmente
      x = 0; // Após o flip, o x será relativo à nova origem
    } else {
      ctx.translate(x, y);
      x = 0; // Sem flip, x ainda será relativo ao novo contexto
    }
  
    ctx.drawImage(
      anim.image,
      frameX, 0,
      anim.frameWidth, anim.frameHeight,
      x, 0, // desenha no (0, 0) do contexto temporário
      width, height
    );
  
    ctx.restore(); // Restaura o contexto original
  }
  

  drawPlayer(ctx, jogador) {
    const flip = jogador.facingDirection === "left";
  
    this.drawSprite(ctx, jogador.x, jogador.y, jogador.width, jogador.height, flip);
  
    // Vida
    ctx.fillStyle = "red";
    ctx.font = "12px Arial";
    ctx.fillText(`${jogador.health}`, jogador.x, jogador.y - 10);
  
    // Stamina
    ctx.fillStyle = "blue";
    const staminaWidth = (jogador.stamina / jogador.maxStamina) * jogador.width;
    ctx.fillRect(jogador.x, jogador.y - (jogador.height / 2), staminaWidth, 5);
    ctx.strokeStyle = "black";
    ctx.strokeRect(jogador.x, jogador.y - (jogador.height / 2), jogador.width, 5);
  
    // Hitbox de ataque
    if (jogador.isAttacking) {
      const attackBox = this.getAttackHitbox(jogador);
      ctx.fillStyle = "red";
      ctx.fillRect(attackBox.x, attackBox.y, attackBox.width, attackBox.height);
    }
  }
  

  // Método para calcular a hitbox de ataque do jogador
  getAttackHitbox(jogador) {
    const attackX = jogador.facingDirection === "right"
      ? jogador.x + jogador.width
      : jogador.x - jogador.attackRange.width;
    return {
      x: attackX,
      y: jogador.y + jogador.height / 2 - jogador.attackRange.height / 2,
      width: jogador.attackRange.width,
      height: jogador.attackRange.height
    };
  }
}
