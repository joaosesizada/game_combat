export default class Animator {
  constructor(setup, character = "ninja", defaultAnim = "idle") {
    this.animations = {};
    this.currentAnimation = defaultAnim;
    this.currentFrame = 0;
    this.elapsedTime = 0;
    this.frameDuration = 100;
    this.character = character;

    // NOVO: Controlar quando a animação de morte terminou
    this.deathAnimationCompleted = false;
    this.animationFinishedCallbacks = {};

    const animSetup = setup[character];
    if (!animSetup) {
      console.error(
        `Nenhuma configuração encontrada para o personagem: ${character}`
      );
      return;
    }

    for (let animName in animSetup) {
      const animationData = animSetup[animName];
      if (!animationData || !animationData.src) {
        console.error(
          `Dados de animação inválidos para "${animName}"`,
          animationData
        );
        continue;
      }

      const img = new Image();
      img.src = animationData.src;

      img.onload = () => {
        if (!animationData.framesWidth) {
          this.animations[animName].frameWidth =
            img.width / animationData.totalFrames;
        }
      };

      this.animations[animName] = {
        image: img,
        frameWidth: animationData.framesWidth,
        frameHeight: animationData.framesHeight,
        totalFrames: animationData.totalFrames || 1,
        loop: animationData.loop !== undefined ? animationData.loop : true,
      };
    }
  }

  setAnimation(animName) {
    if (this.animations[animName]) {
      if (this.currentAnimation !== animName) {
        // Reset da flag de morte completada ao trocar animações
        if (animName === "death") {
          this.deathAnimationCompleted = false;
        }

        this.currentAnimation = animName;
        this.currentFrame = 0;
        this.elapsedTime = 0;
      }
    } else {
      console.warn(
        `Animação "${animName}" não encontrada para ${this.character}!`
      );
    }
  }

  update(deltaTime) {
    const animation = this.animations[this.currentAnimation];
    if (!animation) return;
    if (animation.totalFrames <= 1) return;

    this.elapsedTime += deltaTime;

    if (this.elapsedTime > this.frameDuration) {
      this.elapsedTime = 0;

      if (animation.loop === false) {
        // Para animações não-loop (como morte), verificar se chegou ao último frame
        if (this.currentFrame < animation.totalFrames - 1) {
          this.currentFrame++;

          // NOVO: Se for o último frame da animação de morte, marcar como completa
          if (
            this.currentAnimation === "death" &&
            this.currentFrame === animation.totalFrames - 1
          ) {
            this.deathAnimationCompleted = true;
            this.triggerAnimationFinished("death");
          }
        }
      } else {
        this.currentFrame = (this.currentFrame + 1) % animation.totalFrames;
      }
    }
  }

  // NOVO: Método para registrar callbacks quando uma animação terminar
  onAnimationFinished(animName, callback) {
    if (!this.animationFinishedCallbacks[animName]) {
      this.animationFinishedCallbacks[animName] = [];
    }
    this.animationFinishedCallbacks[animName].push(callback);
  }

  // NOVO: Disparar callbacks quando uma animação terminar
  triggerAnimationFinished(animName) {
    if (this.animationFinishedCallbacks[animName]) {
      this.animationFinishedCallbacks[animName].forEach((callback) =>
        callback()
      );
    }
  }

  // NOVO: Verificar se a animação de morte terminou
  isDeathAnimationCompleted() {
    return this.deathAnimationCompleted;
  }

  drawSprite(ctx, x, y, width, height, flip = false) {
    const anim = this.animations[this.currentAnimation];
    if (!anim || !anim.image.complete) {
      console.warn("Sprite não pronto:", { anim });
      return;
    }

    const frameWidth = anim.frameWidth;
    const frameHeight = anim.frameHeight;

    if (!frameWidth || !frameHeight) {
      console.error("frameWidth/frameHeight inválidos!", {
        currentAnimation: this.currentAnimation,
        frameWidth,
        frameHeight,
        imageSrc: anim.image.src,
      });
      return;
    }

    const frameX = this.currentFrame * frameWidth;

    ctx.save();

    if (flip) {
      ctx.translate(x + width, y);
      ctx.scale(-1, 1);
      x = 0;
    } else {
      ctx.translate(x, y);
      x = 0;
    }

    ctx.drawImage(
      anim.image,
      frameX,
      0,
      frameWidth,
      frameHeight,
      x,
      0,
      width,
      height
    );

    ctx.restore();
  }

  drawHud(ctx, jogador) {
    // Não desenhar HUD se o jogador estiver morto
    if (!jogador.isAlive) return;

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

    ctx.fillStyle = "yellow";
    ctx.fillRect(jogador.x, staminaY, staminaWidth, barHeight);
    ctx.strokeStyle = "black";
    ctx.strokeRect(jogador.x, staminaY, jogador.width, barHeight);

    const energyWidth = (jogador.superEnergy / jogador.maxSuperEnergy) * jogador.width
    const energyY = jogador.y - (barOffset * 4)

    ctx.fillStyle = "blue";
    ctx.fillRect(jogador.x, energyY, energyWidth, barHeight);
    ctx.strokeStyle = "black";
    ctx.strokeRect(jogador.x, energyY, jogador.width, barHeight);
    
    // Texto de vida opcional (em cima da barra)
    ctx.fillStyle = "white";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      `${Math.floor(jogador.health)}/100`,
      jogador.x + jogador.width / 2,
      lifeY - 2
    );
  }

  drawPlayer(ctx, jogador) {
    const flip = jogador.facingDirection === "left";

    // Desenhar hitbox para debug (opcional)
    if (jogador.hitBoxToDraw) {
      ctx.strokeStyle = jogador.isAlive
        ? "rgba(0, 255, 0, 0.5)"
        : "rgba(255, 0, 0, 0.5)";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        jogador.hitBoxToDraw.x,
        jogador.hitBoxToDraw.y,
        jogador.hitBoxToDraw.width,
        jogador.hitBoxToDraw.height
      );
    }

    const offsetX = (jogador.renderWidth - jogador.width) / 2;
    const offsetY = jogador.renderHeight - jogador.height;

    // const attackBoxes = jogador.attackBoxToDraw;
    // if (jogador.isAttacking) {
    //   ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
    //   ctx.strokeStyle = "red";

    //   attackBoxes.forEach(box => {
    //     ctx.fillRect(box.x, box.y, box.width, box.height);
    //     ctx.strokeRect(box.x, box.y, box.width, box.height);
    //   });
    // }

    this.drawSprite(
      ctx,
      jogador.x - offsetX,
      jogador.y - offsetY,
      jogador.renderWidth,
      jogador.renderHeight,
      flip
    );

    this.drawHud(ctx, jogador);
    return;
  }
}
