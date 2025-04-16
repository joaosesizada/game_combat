export default class EffectAnimator {
  /**
   * @param {Object} setup - Objeto com a configuração dos efeitos.
   *   Exemplo:
   *   {
   *     effects: {
   *       clash: { src: "imgs/clash.png", totalFrames: 8, frameWidth: 64, frameHeight: 64, loop: false },
   *       sparkle: { src: "imgs/sparkle.png", totalFrames: 8, frameWidth: 64, frameHeight: 64, loop: true },
   *       // etc.
   *     }
   *   }
   */
  constructor(setup) {
    this.effectsConfig = {};  // Armazena as configurações de cada efeito
    // Define a duração de cada frame em milissegundos (valor padrão)
    this.frameDuration = 100; 

    const effectSetup = setup.effects;
    if (!effectSetup) {
      console.error("Nenhuma configuração de efeitos encontrada.");
      return;
    }

    for (let effectName in effectSetup) {
      const effectData = effectSetup[effectName];
      if (!effectData || !effectData.src) {
        console.error(`Dados de efeito inválidos para "${effectName}"`, effectData);
        continue;
      }

      const img = new Image();
      img.src = effectData.src;

      // Se frameWidth não for definido, calcule automaticamente quando a imagem carregar
      img.onload = () => {
        if (!effectData.frameWidth) {
          effectData.frameWidth = img.width / effectData.totalFrames;
        }
      };

      this.effectsConfig[effectName] = {
        image: img,
        frameWidth: effectData.frameWidth,
        frameHeight: effectData.frameHeight,
        totalFrames: effectData.totalFrames || 1,
        loop: effectData.loop,
      };
    }
  }

  /**
   * Desenha o efeito dado no contexto com base no tempo atual.
   * @param {CanvasRenderingContext2D} ctx - O contexto do canvas.
   * @param {Object} effect - Objeto efeito contendo:
   *   { type, x, y, width, height, duration, created }
   * @param {Number} currentTime - Timestamp atual (em milissegundos).
   */
  drawEffect(ctx, effect, currentTime) {
    const config = this.effectsConfig[effect.type];
    if (!config || !config.image.complete) {
      console.warn("Efeito não pronto:", { config });
      return;
    }

    // Calcular o tempo decorrido desde a criação
    const elapsed = currentTime - effect.created;
    let frameIndex = Math.floor(elapsed / this.frameDuration);

    if (!config.loop) {
      // Se o efeito não for loop, clamp no último frame
      if (frameIndex >= config.totalFrames) {
        frameIndex = config.totalFrames - 1;
      }
    } else {
      // Se for loop, repete
      frameIndex = frameIndex % config.totalFrames;
    }

    const frameX = frameIndex * config.frameWidth;

    ctx.drawImage(
      config.image,
      frameX,
      0,
      config.frameWidth,
      config.frameHeight,
      effect.x,
      effect.y,
      effect.width,
      effect.height
    );
  }
}
