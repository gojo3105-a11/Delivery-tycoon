import Phaser from 'phaser';

export class HedgehogScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HedgehogScene' });
    this._x      = 0;
    this._offsetY = 0;   // pixels above ground (negative = in the air)
    this._vy      = 0;   // vertical velocity
    this._vxBase  = 58;  // base walk speed px/s
    this._facing  = 1;   // 1 = right, -1 = left
    this._walkCycle = 0;
    this._bobT    = 0;
    this._onGround= true;
    this._jiggle  = 0;
    this._boostT  = 0;   // speed-boost timer (seconds)
    this._blinkTimer    = 3.2;
    this._blinkDuration = 0;
    this._coins   = [];  // coin burst particles
    this._dust    = [];  // dust trail particles
    this.onTap    = null;
  }

  create() {
    const { width } = this.scale;
    this._x = width / 2;
    this.graphics = this.add.graphics();

    this.input.on('pointerdown', (ptr) => {
      if (this._onGround) {
        this._vy = -310;
        this._onGround = false;
      }
      this._boostT  = 2.2;
      this._jiggle  = 0.6;
      this._burstCoins(ptr.x, ptr.y);
      if (this.onTap) this.onTap(ptr.x, ptr.y);
    });
  }

  _burstCoins(px, py) {
    for (let i = 0; i < 9; i++) {
      this._coins.push({
        x: px + (Math.random() - .5) * 28,
        y: py + (Math.random() - .5) * 16,
        vx: (Math.random() - .5) * 90,
        vy: -Math.random() * 115 - 38,
        life: 1.0,
        r: Math.random() * 4 + 3,
        col: Math.random() < .5 ? 0xFF7128 : 0xFFD060,
      });
    }
  }

  _spawnDust(x, groundY, s) {
    this._dust.push({
      x: x + this._facing * -(16 * s) + (Math.random() - .5) * 12,
      y: groundY + (Math.random() - .5) * 4,
      vx: this._facing * -(18 + Math.random() * 22),
      vy: -Math.random() * 22 - 6,
      life: 1.0,
      r: Math.random() * 3 + 1.5,
    });
  }

  update(_, delta) {
    const dt = Math.min(delta / 1000, 0.05);
    const { width, height } = this.scale;
    const s       = height / 130;
    const groundY = height * 0.60;

    // ── Walk ─────────────────────────────────────────
    const speed = this._vxBase * (this._boostT > 0 ? 2.4 : 1);
    this._x += this._facing * speed * dt;
    this._walkCycle += (speed / 52) * dt;

    // Wall bounce
    const margin = 38;
    if (this._x > width - margin) { this._x = width - margin; this._facing = -1; }
    else if (this._x < margin)    { this._x = margin;          this._facing =  1; }

    // ── Jump physics ──────────────────────────────────
    if (!this._onGround) {
      this._vy += 760 * dt;
      this._offsetY += this._vy * dt;
      if (this._offsetY >= 0) {
        this._offsetY = 0;
        this._vy = 0;
        this._onGround = true;
      }
    }

    // ── Timers ────────────────────────────────────────
    this._bobT += dt * 2.1;
    if (this._boostT > 0) {
      this._boostT -= dt;
      if (this._onGround && Math.random() < 0.35) this._spawnDust(this._x, groundY, s);
    }
    if (this._jiggle > 0) this._jiggle = Math.max(0, this._jiggle - dt * 4.5);

    // Blink
    this._blinkTimer -= dt;
    if (this._blinkTimer <= 0 && this._blinkDuration <= 0) {
      this._blinkDuration = 0.13;
      this._blinkTimer = 2.6 + Math.random() * 4.2;
    }
    if (this._blinkDuration > 0) this._blinkDuration -= dt;

    // ── Particles ─────────────────────────────────────
    for (const p of this._coins) {
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy += 230 * dt; p.life -= dt * 2.3;
    }
    this._coins = this._coins.filter(p => p.life > 0);

    for (const p of this._dust) {
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy += 55 * dt;  p.life -= dt * 3.4;
    }
    this._dust = this._dust.filter(p => p.life > 0);

    this._draw(s, groundY);
  }

  _draw(s, groundY) {
    const g = this.graphics;
    g.clear();

    const charY      = groundY + this._offsetY;
    const bobOffset  = this._onGround ? Math.sin(this._bobT) * 1.4 * s : 0;
    const y          = charY + bobOffset;

    // Ground shadow — shrinks when airborne
    const airFrac    = Math.min(1, -this._offsetY / 70);
    const shadowW    = (48 - airFrac * 18) * s;
    const shadowAlpha= this._onGround ? 0.13 : Math.max(0.03, 0.09 - airFrac * 0.06);
    g.fillStyle(0x000000, shadowAlpha);
    g.fillEllipse(this._x, groundY + 7 * s, shadowW, shadowW * 0.27);

    // Dust trail (behind character, screen-space)
    for (const p of this._dust) {
      g.fillStyle(0xC8A070, p.life * 0.5);
      g.fillCircle(p.x, p.y, p.r * p.life);
    }

    // Walk tilt + air jiggle
    const tilt = this._onGround
      ? Math.sin(this._walkCycle * Math.PI * 2) * (this._boostT > 0 ? 0.10 : 0.05)
      : Math.sin(this._jiggle * Math.PI * 3) * this._jiggle * 0.15;

    // ── Apply transforms ──────────────────────────────
    g.translateCanvas(this._x, y);
    g.scaleCanvas(this._facing, 1);
    g.rotateCanvas(tilt);

    this._drawHog(g, s);

    // ── Undo transforms ───────────────────────────────
    g.rotateCanvas(-tilt);
    g.scaleCanvas(this._facing, 1);   // ±1 is self-inverse
    g.translateCanvas(-this._x, -y);

    // Coin burst particles (screen-space)
    for (const p of this._coins) {
      g.fillStyle(p.col, p.life);
      g.fillCircle(p.x, p.y, p.r * p.life);
    }
  }

  _drawHog(g, s) {
    const BODY  = 0x5A4030;
    const BELLY = 0xE8C890;
    const SPINE = 0x6A4C34;
    const OG    = 0xFF7128;
    const WHITE = 0xFFFFFF;
    const DARK  = 0x1A0800;
    const PINK  = 0xFF9090;

    // Leg swing amplitude: bigger when boosted
    const amp   = this._boostT > 0 ? 8 : 5;
    const swing = this._onGround
      ? Math.sin(this._walkCycle * Math.PI * 2) * amp
      : 0;

    // Back leg (opposite phase)
    g.fillStyle(BODY, 1);
    g.fillEllipse(-12 * s, (18 - swing) * s, 11 * s, 22 * s);
    // Front leg
    g.fillStyle(BODY, 1);
    g.fillEllipse(12 * s, (18 + swing) * s, 11 * s, 22 * s);

    // Body
    g.fillStyle(BODY, 1);
    g.fillEllipse(0, 0, 80 * s, 55 * s);

    // Spines
    g.fillStyle(SPINE, 1);
    for (const [sx, sy] of [
      [-26,-20],[-20,-28],[-10,-32],[0,-34],
      [10,-32],[20,-28],[26,-20],
      [-16,-14],[16,-14],[-8,-26],[8,-26],
    ]) {
      g.fillTriangle(
        sx * s, sy * s,
        (sx - 4) * s, (sy + 10) * s,
        (sx + 4) * s, (sy + 10) * s,
      );
    }

    // Belly
    g.fillStyle(BELLY, 1);
    g.fillEllipse(6 * s, 8 * s, 42 * s, 34 * s);

    // Package
    g.fillStyle(OG,    1); g.fillRect(-8 * s, -2 * s, 24 * s, 18 * s);
    g.fillStyle(WHITE, 1); g.fillRect(-1 * s, -2 * s,  3 * s, 18 * s);
    g.fillStyle(WHITE, 1); g.fillRect(-8 * s,  5 * s, 24 * s,  3 * s);

    // Head
    g.fillStyle(BODY,  1); g.fillCircle(32 * s, -8 * s, 22 * s);

    // Snout
    g.fillStyle(BELLY, 1); g.fillEllipse(40 * s, -2 * s, 20 * s, 14 * s);

    // Eye (blinks)
    if (this._blinkDuration > 0) {
      g.fillStyle(DARK, 1);
      g.fillRect(33 * s, -16 * s, 7 * s, 2.5 * s);
    } else {
      g.fillStyle(WHITE, 1); g.fillCircle(36 * s, -14 * s, 6 * s);
      g.fillStyle(DARK,  1); g.fillCircle(37 * s, -14 * s, 3 * s);
      g.fillStyle(WHITE, 1); g.fillCircle(38 * s, -15 * s, 1.2 * s);
    }

    // Nose
    g.fillStyle(PINK, 1); g.fillCircle(46 * s, -1 * s, 4 * s);

    // Ear
    g.fillStyle(BODY, 1); g.fillEllipse(26 * s, -27 * s, 12 * s, 16 * s);
    g.fillStyle(PINK, 1); g.fillEllipse(26 * s, -27 * s,  7 * s, 10 * s);
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
    input: { touch: true },
    scene: HedgehogScene,
    audio: { noAudio: true },
  };
}
