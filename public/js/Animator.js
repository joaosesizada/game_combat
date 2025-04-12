export default class Animator {
  constructor(setup, character = "ninja", defaultAnim = "idle") {
    this.animations = {};
    this.currentAnimation = defaultAnim;
    this.currentFrame = 0;
    this.elapsedTime = 0;
    this.frameDuration = 100; // 100 ms por frame
    this.character = character;

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
        frameWidth: animationData.framesWidth,
        frameHeight: animationData.framesHeight,
        totalFrames: animationData.totalFrames || 1,
      };
    }
  }

  setAnimation(animName) {
    if (this.animations[animName]) {
      if (this.currentAnimation !== animName) {
        this.currentAnimation = animName;
        this.currentFrame = 0;
        this.elapsedTime = 0;
      }
    } else {
      console.warn(`Animação "${animName}" não encontrada para ${this.character}!`);
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
      x = 0; // Após o flip, x será relativo à nova origem
    } else {
      ctx.translate(x, y);
      x = 0; // Sem flip, x ainda será relativo ao novo contexto
    }
  
    ctx.drawImage(
      anim.image,
      frameX, 0,
      anim.frameWidth, anim.frameHeight,
      x, 0, // desenha no (0, 0) do contexto temporário
      width, height // Use width e height de renderWidth e renderHeight aqui
    );
  
    ctx.restore(); // Restaura o contexto original
  }  
  
  drawPlayer(ctx, jogador) {
    const flip = jogador.facingDirection === "left";

    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;
    ctx.strokeRect(jogador.x, jogador.y, jogador.width, jogador.height);

    const offsetX = (jogador.renderWidth - jogador.width) / 2;
    const offsetY = jogador.renderHeight - jogador.height;
  
    // Ajusta a posição para que o sprite fique centrado
    this.drawSprite(ctx, jogador.x - offsetX, jogador.y - offsetY, jogador.renderWidth, jogador.renderHeight, flip);

    const barHeight = 6;
    const barOffset = 10;
    const spacing = 4;
    const borderWidth = 2;


    // Vida (Barra vermelha)
    let lifeWidth = (jogador.health / 100) * jogador.width;
    let lifeY = jogador.y - barOffset - barHeight - spacing;

    ctx.fillStyle = "red";
    ctx.fillRect(jogador.x, lifeY, lifeWidth, barHeight);
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = "black";
    ctx.strokeRect(jogador.x, lifeY, jogador.width, barHeight);

    // Stamina (Barra azul)
    const staminaWidth = (jogador.stamina / jogador.maxStamina) * jogador.width;
    const staminaY = jogador.y - barOffset;

    ctx.fillStyle = "blue";
    ctx.fillRect(jogador.x, staminaY, staminaWidth, barHeight);
    ctx.strokeStyle = "black";
    ctx.strokeRect(jogador.x, staminaY, jogador.width, barHeight);

    // Texto de vida opcional (em cima da barra)
    ctx.fillStyle = "white";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`${Math.floor(jogador.health)}/100`, jogador.x + jogador.width / 2, lifeY - 2);

    if (jogador.health <= 0) {
      lifeWidth = 0
      lifeY = 0


      // Exibe a interface de Game Over
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); // tela escura

      ctx.fillStyle = "white";
      ctx.font = "bold 48px Arial";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", ctx.canvas.width / 2, ctx.canvas.height / 2);

      ctx.font = "24px Arial";
      ctx.fillText("Pressione R para reiniciar", ctx.canvas.width / 2, ctx.canvas.height / 2 + 40);

      // Interrompe qualquer lógica adicional de jogo
      return;
    }

    window.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() === "r") {
        window.location.reload() // Isso faz o mesmo que um F5
      }
    });

    // Hitbox de ataque
    if (jogador.isAttacking) {
      const attackBox = this.getAttackHitbox(jogador);
      ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
      ctx.fillRect(attackBox.x, attackBox.y, attackBox.width, attackBox.height);
    }
  }

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