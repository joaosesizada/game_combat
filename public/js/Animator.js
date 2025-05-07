import { hud } from "./setup.js";

export default class Animator {
  constructor(setup, character = "ninja", defaultAnim = "idle", currentPlayer) {
    this.animations = {};
    this.currentAnimation = defaultAnim;
    this.currentFrame = 0;
    this.elapsedTime = 0;
    this.frameDuration = 100;
    this.character = character;
    this.currentPlayer = currentPlayer;
    this.barSkew = 10;
    this.deathAnimationCompleted = false;
    this.animationFinishedCallbacks = {};

    this.canvasWidth = 1200;

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
        if (this.currentFrame < animation.totalFrames - 1) {
          this.currentFrame++;

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

  onAnimationFinished(animName, callback) {
    if (!this.animationFinishedCallbacks[animName]) {
      this.animationFinishedCallbacks[animName] = [];
    }
    this.animationFinishedCallbacks[animName].push(callback);
  }

  triggerAnimationFinished(animName) {
    if (this.animationFinishedCallbacks[animName]) {
      this.animationFinishedCallbacks[animName].forEach((callback) =>
        callback()
      );
    }
  }

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

    const playerKey = `player${this.currentPlayer}`;
    const bars = Object.values(hud[playerKey].bars);

    bars.forEach((bar) => {
      const type = bar.type;
      const { dark, light } = bar.color;
      this.drawBar( ctx, type, jogador[bar.max], jogador[type], bar.x, bar.y, bar.width, bar.height, dark, light, this.barSkew, bar.invert, bar.startSide, jogador.superCost);
    });

    const balls = Object.values(hud[playerKey].balls);
    let roundsGain = jogador.roundsGain;
    balls.forEach((ball) => {
      let victory = roundsGain >= 1;
      this.drawPerfectBall(ctx, ball.x, ball.y, victory);
      roundsGain--;
    });

    if (this.currentPlayer === 1) {
      this.drawTime(ctx);
    }

    const namePostions = hud[playerKey].bars.health
    this.drawText(ctx, jogador, namePostions)

    const positionProfile = hud[playerKey].profile
    this.drawProfileImage(ctx, 'https://th.bing.com/th/id/OIP.Q3LP4aVjOjZet32t-JRtXQHaEK?w=311&h=180&c=7&r=0&o=5&pid=1.7', positionProfile.x, positionProfile.y, positionProfile.width, positionProfile.height, positionProfile.flip)
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

  drawBar( ctx, type, max, current, x, y, w, h, dark, light, skew, invert, startSide = "left", superCost = null
  ) {
    const markerWidth = 4;
    x = Math.round(x);
    y = Math.round(y);
    w = Math.round(w);
    h = Math.round(h);
    skew = Math.round(skew);

    let markerXTop, markerXBot;
    if (type == "superEnergy") {
      const frac = Math.max(0, Math.min(1, superCost / max));
      const fracLogical = startSide === "right" ? 1 - frac : frac;
      markerXTop = invert ? x + (1 - fracLogical) * w : x + fracLogical * w;
      markerXBot = markerXTop + (invert ? +skew : -skew);
    }

    for (let i = 0; i < max; i++) {
      const pos = startSide === "right" ? max - 1 - i : i;

      const t0 = i / max;
      const t1 = (i + 1) / max + 0.006;
      const x0Top = invert ? x + (1 - t1) * w : x + t0 * w;
      const x1Top = invert ? x + (1 - t0) * w : x + t1 * w;
      const x0Bot = x0Top + (invert ? +skew : -skew);
      const x1Bot = x1Top + (invert ? +skew : -skew);

      let color;
      if (pos < current) {
        color = this.lerpColor(dark, light, pos / (max - 1));
      } else {
        color = "#333";
      }

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x0Top, y);
      ctx.lineTo(x1Top, y);
      ctx.lineTo(x1Bot, y + h);
      ctx.lineTo(x0Bot, y + h);
      ctx.closePath();
      ctx.fill();
    }

    if (type == "superEnergy") {
      ctx.fillStyle = "#222";
      ctx.beginPath();
      ctx.moveTo(markerXTop - markerWidth / 2, y);
      ctx.lineTo(markerXTop + markerWidth / 2, y);
      ctx.lineTo(markerXBot + markerWidth / 2, y + h);
      ctx.lineTo(markerXBot - markerWidth / 2, y + h);
      ctx.closePath();
      ctx.fill();
    }

    ctx.lineWidth = 3;
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    if (!invert) {
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w - skew, y + h);
      ctx.lineTo(x - skew, y + h);
    } else {
      ctx.moveTo(x + w, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x + skew, y + h);
      ctx.lineTo(x + w + skew, y + h);
    }
    ctx.closePath();
    ctx.stroke();
  }

  drawPerfectBall(ctx, x, y, victory) {
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = victory ? "red" : "transparent";
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    ctx.stroke();
  }

  drawTime(ctx) {
    const centroX = this.canvasWidth / 2;

    const gradiente = ctx.createLinearGradient(0, 0, 0, 100);
    gradiente.addColorStop(0, "#BEBEBE");
    gradiente.addColorStop(1, "#FFFFFF");

    ctx.font = 'bold 50px "Press Start 2P", monospace';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = gradiente;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 5;

    ctx.strokeText("∞", centroX, 60);
    ctx.fillText("∞", centroX, 60);
  }

  drawText(ctx, jogador, namePostions) {
    const isPlayerOne = this.currentPlayer === 1

    const nameX = isPlayerOne ? namePostions.x + 210 : namePostions.x  + 87.5
    const nameY = namePostions.y - 10
    const textAling = isPlayerOne ? 'left' : 'right'

    ctx.font = '14px Arial'
    ctx.fillStyle = 'white'
    ctx.textAlign = textAling;
    ctx.fillText(`HP ${jogador.health} / ${jogador.maxHealth}`, nameX, nameY)
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

  drawProfileImage(ctx, img, x, y, width, height, flip = false) {
    x = Math.round(x);
    y = Math.round(y);
    width = Math.round(width);
    height = Math.round(height);

    if (flip) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(img, -x - width, y, width, height);
        ctx.restore();
    } else {
        ctx.drawImage(img, x, y, width, height);
    }
  }

  hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m
      ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
      : [0, 0, 0];
  }

  rgbToHex(r, g, b) {
    return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
  }
}
