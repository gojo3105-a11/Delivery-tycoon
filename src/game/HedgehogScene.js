import Phaser from 'phaser';

export class HedgehogScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HedgehogScene' });
    this._jiggle = 0;
    this._bobT = 0;
    this._particles = [];
    this.onTap = null;
  }

  create() {
    this.graphics = this.add.graphics();

    this.input.on('pointerdown', (ptr) => {
      this._jiggle = 1;
      this._spawnParticle(ptr.x, ptr.y);
      if (this.onTap) this.onTap(ptr.x, ptr.y);
    });
  }

  _spawnParticle(px, py) {
    for (let i = 0; i < 6; i++) {
      this._particles.push({
        x: px + (Math.random() - 0.5) * 20,
        y: py + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 60,
        vy: -Math.random() * 80 - 40,
        life: 1.0,
        size: Math.random() * 6 + 3,
        color: Math.random() < 0.5 ? 0xFF7128 : 0xFFD060,
      });
    }
  }

  update(time, delta) {
    const dt = delta / 1000;
    this._bobT += dt * 1.8;
    if (this._jiggle > 0) this._jiggle -= dt * 3;
    if (this._jiggle < 0) this._jiggle = 0;

    for (const p of this._particles) {
      p.x  += p.vx * dt;
      p.y  += p.vy * dt;
      p.vy += 180 * dt;
      p.life -= dt * 1.8;
    }
    this._particles = this._particles.filter(p => p.life > 0);

    this._draw();
  }

  _draw() {
    const g = this.graphics;
    g.clear();

    const { width, height } = this.scale;
    const s = width / 130;
    const cx = width / 2;
    const cy = height / 2;

    const bob = Math.sin(this._bobT) * 3 * s;
    const jAngle = Math.sin(this._jiggle * Math.PI * 3) * this._jiggle * 0.18;

    g.translateCanvas(cx, cy + bob);
    g.rotateCanvas(jAngle);

    this._drawHog(g, s);

    g.rotateCanvas(-jAngle);
    g.translateCanvas(-cx, -(cy + bob));

    for (const p of this._particles) {
      const a = p.life;
      const c = p.color;
      g.fillStyle(c, a);
      g.fillCircle(p.x, p.y, p.size * p.life);
    }
  }

  _drawHog(g, s) {
    const BODY   = 0x5A4030;
    const BELLY  = 0xE8C890;
    const SPINE  = 0x6A4C34;
    const ORANGE = 0xFF7128;
    const WHITE  = 0xFFFFFF;
    const DARK   = 0x1A0800;
    const PINK   = 0xFF9090;

    // Walking legs
    const legPhase = Math.sin(this._bobT * 2.2);
    const legL = legPhase * 4 * s;
    const legR = -legPhase * 4 * s;

    g.fillStyle(BODY, 1);
    g.fillEllipse(-12 * s, 18 * s + legL, 12 * s, 22 * s);
    g.fillEllipse(12 * s,  18 * s + legR, 12 * s, 22 * s);

    // Body
    g.fillStyle(BODY, 1);
    g.fillEllipse(0, 0, 80 * s, 55 * s);

    // Spines
    const spinePositions = [
      [-26, -20], [-20, -28], [-10, -32], [0, -34],
      [10, -32],  [20, -28],  [26, -20],  [-16, -14],
      [16, -14],  [-8, -26],  [8, -26],
    ];
    g.fillStyle(SPINE, 1);
    for (const [sx, sy] of spinePositions) {
      g.fillTriangle(
        sx * s, sy * s,
        (sx - 4) * s, (sy + 10) * s,
        (sx + 4) * s, (sy + 10) * s
      );
    }

    // Belly
    g.fillStyle(BELLY, 1);
    g.fillEllipse(6 * s, 8 * s, 42 * s, 34 * s);

    // Orange package on belly
    g.fillStyle(ORANGE, 1);
    g.fillRect(-8 * s, -2 * s, 24 * s, 18 * s);
    g.fillStyle(WHITE, 1);
    g.fillRect(-1 * s, -2 * s, 3 * s, 18 * s);
    g.fillRect(-8 * s, 5 * s, 24 * s, 3 * s);

    // Head
    g.fillStyle(BODY, 1);
    g.fillCircle(32 * s, -8 * s, 22 * s);

    // Snout
    g.fillStyle(BELLY, 1);
    g.fillEllipse(40 * s, -2 * s, 20 * s, 14 * s);

    // Eye
    g.fillStyle(WHITE, 1);
    g.fillCircle(36 * s, -14 * s, 6 * s);
    g.fillStyle(DARK, 1);
    g.fillCircle(37 * s, -14 * s, 3 * s);
    g.fillStyle(WHITE, 1);
    g.fillCircle(38 * s, -15 * s, 1.2 * s);

    // Nose
    g.fillStyle(PINK, 1);
    g.fillCircle(46 * s, -1 * s, 4 * s);

    // Ear
    g.fillStyle(BODY, 1);
    g.fillEllipse(26 * s, -27 * s, 12 * s, 16 * s);
    g.fillStyle(PINK, 1);
    g.fillEllipse(26 * s, -27 * s, 7 * s, 10 * s);
  }
}

export function createPhaserConfig(containerId) {
  return {
    type: Phaser.AUTO,
    parent: containerId,
    backgroundColor: 'transparent',
    transparent: true,
    width: '100%',
    height: '100%',
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: {
      touch: true,
    },
    scene: HedgehogScene,
    audio: { noAudio: true },
  };
}
