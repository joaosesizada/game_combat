export default class Animator {
  constructor(setup, character = "ninja", defaultAnim = "idle", currentPlayer) {
    this.animations = {};
    this.currentAnimation = defaultAnim;
    this.currentFrame = 0;
    this.elapsedTime = 0;
    this.frameDuration = 100;
    this.character = character;
    this.currentPlayer = currentPlayer

    this.barSkew = 10
    this.barColorMap = {
      energySuper: {
        dark: "#FFD700",
        light: "#FF4500",
      },
      stamina: {
        dark: "#000080",
        light: "#0070FF",
      },
      health: {
        dark: "#800000",
        light: "#FF0333",
      },
    };

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
    if (!jogador.isAlive) return;
    //(ctx, type, max, current, x, y, w, h, skew, invert)
    const position = this.currentPlayer === 1 ? { x: 150, y: 50, flip: false } : { x: 750, y: 50, flip: true }
    this.drawBar(ctx, 'health', jogador.maxHealth, jogador.health, position.x, position.y, 300, 20, this.barSkew, position.flip)
    
  }

  drawPlayer(ctx, jogador) {
    const flip = jogador.facingDirection === "left";
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
    return;
  }

  drawBar(ctx, type, max, current, x, y, w, h, skew, invert) {
    x = Math.round(x);
    y = Math.round(y);
    w = Math.round(w);
    h = Math.round(h);
    skew = Math.round(skew);

    for (let i = 0; i < max; i++) {
        const t0 = i / max;
        const t1 = (i + 1) / max + 0.006;
        const x0Top = invert ? x + (1 - t1) * w : x + t0 * w;
        const x1Top = invert ? x + (1 - t0) * w : x + t1 * w;
        const x0Bot = x0Top + (invert ? +skew : -skew);
        const x1Bot = x1Top + (invert ? +skew : -skew);

        const { dark, light } = this.barColorMap[type] || this.defaultColors;
        const color =
        i < current
          ? this.lerpColor(dark, light, i / (max - 1))
          : "#333";

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x0Top, y);
        ctx.lineTo(x1Top, y);
        ctx.lineTo(x1Bot, y + h);
        ctx.lineTo(x0Bot, y + h);
        ctx.closePath();
        ctx.fill();
    }

    // Borda externa
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    if (!invert) {
        ctx.moveTo(x, y);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x + w - skew, y + h);
        ctx.lineTo(x - skew, y + h);
    } else {
        const topLeftX = x + w;
        const topRightX = x;
        const botRightX = x + skew;
        const botLeftX = x + w + skew;
        ctx.moveTo(topLeftX, y);
        ctx.lineTo(topRightX, y);
        ctx.lineTo(botRightX, y + h);
        ctx.lineTo(botLeftX, y + h);
    }
    ctx.closePath();
    ctx.stroke();
  }

  lerpColor(a, b, t) {
    const [ar, ag, ab] = this.hexToRgb(a);
    const [br, bg, bb] = this.hexToRgb(b);
    return this.rgbToHex(
    Math.round(ar + (br - ar) * t),
    Math.round(ag + (bg - ag) * t),
    Math.round(ab + (bb - ab) * t)
    );
  }

  hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m
    ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
    : [0, 0, 0];
  }

  rgbToHex(r, g, b) {
    return (
    "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")
    );
  }
}
