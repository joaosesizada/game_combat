export class EffectManager {
  constructor() {
    this.effects = [];
  }

  addEffect({ type, x, y, width, height, duration = 1000, flip = false, impactful = true, speed = 2, damage = 0, attacker = null }) {
    const vx = flip ? -speed : speed
    const effectData = {
      type,
      x,
      y,
      vx,
      flip,
      width,
      height,
      duration,
      impactful,
      damage,
      attacker,
      created: Date.now()
    };
    this.effects.push(effectData);
  }

  update() {
    const now = Date.now();

    this.effects.forEach(eff => {
      eff.x += eff.vx;
    });

    this.effects = this.effects.filter(eff => {
      return now - eff.created < eff.duration;
    });
  }

  getEffects() {
    return this.effects;
  }
}
