import { getPlayers } from './network.js';

export default class Animator {
  constructor(setup, character = "ninja", defaultAnim = "idle") {
    this.animations = {};
    this.currentAnimation = defaultAnim;
    this.currentFrame = 0;
    this.elapsedTime = 0;
    this.frameDuration = 100; // 100 ms por frame
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

      // Log para depurar quando a imagem carrega
      img.onload = () => {
        // Se frameWidth não estiver definido, calcular automaticamente
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
        loop: animationData.loop !== undefined ? animationData.loop : true
      };
    }
  }

  setAnimation(animName) {
    if (this.animations[animName]) {
      if (this.currentAnimation !== animName) {
        // Reset da flag de morte completada ao trocar animações
        if (animName === 'death') {
          this.deathAnimationCompleted = false;
        }
        
        this.currentAnimation = animName;
        this.currentFrame = 0;
        this.elapsedTime = 0;
      }
    } else {
      console.warn(
        `Animação "${animName}" não encontrada para ${this.character}!"`
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
          if (this.currentAnimation === 'death' && this.currentFrame === animation.totalFrames - 1) {
            this.deathAnimationCompleted = true;
            this.triggerAnimationFinished('death');
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
      this.animationFinishedCallbacks[animName].forEach(callback => callback());
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
    if (!jogador.isAlive) return;

    const canvasWidth = ctx.canvas.width;
    const barWidth = 320; 
    const barHeightLife = 50; 
    const barHeightSta = 25; 
    const margin = 20;
    const borderWidth = 2;

    // Ajuste de posição para aproximar do design original
    const yPos = margin; // Eleva as barras e fotos para o topo

    const players = Object.values(getPlayers());
    const isPlayer1 = players[0]?.id === jogador.id;

    let xPos = isPlayer1 
        ? margin 
        : canvasWidth - barWidth - margin;

    // Vida (Barra com gradiente vermelho escuro)
    const lifeWidth = (jogador.health / 100) * barWidth;
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(xPos, yPos, barWidth, barHeightLife);
    const lifeGradient = ctx.createLinearGradient(xPos, yPos, xPos + barWidth, yPos);
    lifeGradient.addColorStop(0, '#bf0000');
    lifeGradient.addColorStop(1, '#800000');
    ctx.fillStyle = lifeGradient;
    ctx.fillRect(xPos, yPos, lifeWidth, barHeightLife);
    ctx.strokeStyle = "black";
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(xPos, yPos, barWidth, barHeightLife);

    // Stamina (Barra com gradiente amarelo escuro)
    const staminaY = yPos + barHeightLife + 10;
    const staminaWidth = (jogador.stamina / jogador.maxStamina) * barWidth;
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(xPos, staminaY, barWidth, barHeightSta);
    const staGradient = ctx.createLinearGradient(xPos, staminaY, xPos + barWidth, staminaY);
    staGradient.addColorStop(0, '#cccc00');
    staGradient.addColorStop(1, '#999900');
    ctx.fillStyle = staGradient;
    ctx.fillRect(xPos, staminaY, staminaWidth, barHeightSta);
    ctx.strokeStyle = "black";
    ctx.strokeRect(xPos, staminaY, barWidth, barHeightSta);

    // Adicionar retrato do personagem
    const portraitSize = 80;
    const portraitX = isPlayer1 
        ? xPos + barWidth + 20 
        : xPos - portraitSize - 20;
    ctx.drawImage(
      this.getCharacterPortrait(),
      portraitX,
      yPos,
      portraitSize,
      portraitSize
    );
  }

  getCharacterPortrait() {
    return this.animations.idle.image;
  }

  drawPlayer(ctx, jogador) {
    const flip = jogador.facingDirection === "left";
    if (jogador.hitBoxToDraw) {
      ctx.strokeStyle = jogador.isAlive ? "rgba(0, 255, 0, 0.5)" : "rgba(255, 0, 0, 0.5)";
      ctx.lineWidth = 2;
      ctx.strokeRect(jogador.hitBoxToDraw.x, jogador.hitBoxToDraw.y, jogador.hitBoxToDraw.width, jogador.hitBoxToDraw.height);
    }
    const offsetX = (jogador.renderWidth - jogador.width) / 2;
    const offsetY = jogador.renderHeight - jogador.height;
    this.drawSprite(
      ctx,
      jogador.x - offsetX,
      jogador.y - offsetY,
      jogador.renderWidth,
      jogador.renderHeight,
      flip
    );
    this.drawHud(ctx, jogador);
  }
}
