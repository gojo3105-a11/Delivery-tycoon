import Phaser from 'phaser';

const D  = 28;
const DX = D * 0.55;
const DY = D * -0.28;

const FAC_IDS = ['packing', 'bag', 'belt', 'scooter', 'battery', 'snackbar'];

export class IsometricScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IsometricScene' });
    this._t     = 0;
    this._busX  = 0;
    this._coins = [];
    this.onTap    = null;
    this.getState = null;
  }

  create() {
    const { width } = this.scale;
    this._busX = width + 80;
    this.graphics = this.add.graphics();

    this.input.on('pointerdown', (ptr) => {
      this._burst(ptr.x, ptr.y);
      if (this.onTap) this.onTap(ptr.x, ptr.y);
    });
  }

  _burst(px, py) {
    for (let i = 0; i < 8; i++) {
      this._coins.push({
        x: px + (Math.random() - .5) * 28,
        y: py + (Math.random() - .5) * 18,
        vx: (Math.random() - .5) * 85,
        vy: -Math.random() * 105 - 35,
        life: 1.0,
        r: Math.random() * 4 + 3,
        col: Math.random() < .5 ? 0xFF7128 : 0xFFD060,
      });
    }
  }

  update(_, delta) {
    const dt = Math.min(delta / 1000, 0.05);
    this._t += dt;

    this._busX -= dt * 50;
    if (this._busX < -120) this._busX = this.scale.width + 80;

    for (const p of this._coins) {
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy += 220 * dt; p.life -= dt * 2.2;
    }
    this._coins = this._coins.filter(p => p.life > 0);

    this._draw();
  }

  _draw() {
    const g = this.graphics;
    g.clear();
    const { width: W, height: H } = this.scale;

    // Sky
    g.fillStyle(0xC8E4F5, 1);
    g.fillRect(0, 0, W, H);
    g.fillStyle(0xD8EEFA, 0.45);
    g.fillRect(0, 0, W, H * 0.5);

    // Grass
    g.fillStyle(0x7CBD5A, 1);
    g.fillRect(0, H - 56, W, 56);

    // Sidewalk
    g.fillStyle(0xD0C4B0, 1);
    g.fillRect(0, H - 56, W, 14);
    g.lineStyle(1, 0xBBB0A0, 0.4);
    for (let x = 0; x < W; x += 28) g.lineBetween(x, H - 56, x, H - 42);

    // Road
    g.fillStyle(0x5A5A5A, 1);
    g.fillRect(0, H - 42, W, 42);

    // Road center dashes (scrolling left)
    g.fillStyle(0xFFFFFF, 0.35);
    const dashOff = (this._t * 40) % 66;
    for (let x = -dashOff; x < W + 66; x += 66) {
      g.fillRect(x, H - 22, 40, 4);
    }

    // Building (drawn before trees so trees overlap road edge)
    this._drawBuilding(g, W, H);

    // Trees
    this._drawTree(g, W * 0.08, H - 56, 0.9);
    this._drawTree(g, W * 0.87, H - 56, 0.82);

    // Bus
    this._drawBus(g, this._busX, H - 42);

    // Coin particles
    for (const p of this._coins) {
      g.fillStyle(p.col, p.life);
      g.fillCircle(p.x, p.y, p.r * p.life);
    }
  }

  _drawBuilding(g, W, H) {
    const st = this.getState ? this.getState() : {};
    const facLevels = st.facLevels || {};
    const facReady  = st.facReady  || {};

    const ROOM_W  = Math.min(74, Math.floor((W * 0.62) / 3));
    const FLOOR_H = 62;
    const BW = ROOM_W * 3;
    const BH = FLOOR_H * 2;

    const groundY = H - 56;
    const topY    = groundY - BH;
    const bx      = Math.round((W - BW - DX) / 2);

    // Back face
    g.fillStyle(0xC4B4A4, 1);
    g.fillPoints([
      { x: bx + DX,      y: topY + DY },
      { x: bx + BW + DX, y: topY + DY },
      { x: bx + BW + DX, y: groundY + DY },
      { x: bx + DX,      y: groundY + DY },
    ], true);

    // Front face floors
    // fl=0: upper floor (top of building), fac: scooter/battery/snackbar
    // fl=1: ground floor (bottom of building), fac: packing/bag/belt
    const WALL_COLS = [0xF6EDE0, 0xF8EEE0, 0xFBF0E2];

    for (let fl = 0; fl < 2; fl++) {
      const fy_top   = topY + fl * FLOOR_H;
      const fy_bot   = fy_top + FLOOR_H;
      const facOffset = (1 - fl) * 3;  // fl=0→3 (upper fac), fl=1→0 (lower fac)

      for (let room = 0; room < 3; room++) {
        const facIdx = facOffset + room;
        const facId  = FAC_IDS[facIdx];
        const lv     = facLevels[facId] || 0;
        const ready  = facReady[facId]  || false;
        const rx     = bx + room * ROOM_W;

        // Wall
        g.fillStyle(lv > 0 ? WALL_COLS[room] : 0xD8CECC, 1);
        g.fillRect(rx, fy_top, ROOM_W, FLOOR_H);

        // Window
        const wx = rx + 9, wy = fy_top + 9;
        const ww = ROOM_W - 18, wh = FLOOR_H - 20;

        // Window frame
        g.fillStyle(0xAA9888, 1);
        g.fillRect(wx - 2, wy - 2, ww + 4, wh + 4);

        // Glass
        g.fillStyle(lv > 0 ? (ready ? 0xFFE87C : 0xBEDDF8) : 0x9AA0A8, 1);
        g.fillRect(wx, wy, ww, wh);

        // Window cross
        g.fillStyle(0xAA9888, 0.55);
        g.fillRect(wx + Math.round(ww / 2) - 1, wy, 2, wh);
        g.fillRect(wx, wy + Math.round(wh / 2) - 1, ww, 2);

        // Worker
        if (lv > 0) {
          const wkX = wx + ww * 0.38;
          const wkY = wy + wh - 5 + Math.sin(this._t * 1.3 + facIdx * 1.05) * 1.8;
          this._drawWorker(g, wkX, wkY);
        }

        // Ready glow
        if (ready) {
          g.fillStyle(0xFFCC00, 0.22);
          g.fillRect(rx, fy_top, ROOM_W, FLOOR_H);
        }
      }

      // Floor divider
      if (fl === 0) {
        g.lineStyle(2, 0xAA9888, 0.75);
        g.lineBetween(bx, fy_bot, bx + BW, fy_bot);
      }

      // Room dividers
      for (let r = 1; r < 3; r++) {
        g.lineStyle(1.5, 0xBAAA99, 0.65);
        g.lineBetween(bx + r * ROOM_W, fy_top, bx + r * ROOM_W, fy_bot);
      }
    }

    // Building outline
    g.lineStyle(2.5, 0x8A7A68, 1);
    g.strokeRect(bx, topY, BW, BH);

    // Right side face
    g.fillStyle(0xBEAE9E, 1);
    g.fillPoints([
      { x: bx + BW,      y: topY },
      { x: bx + BW + DX, y: topY + DY },
      { x: bx + BW + DX, y: groundY + DY },
      { x: bx + BW,      y: groundY },
    ], true);

    // Side floor line
    g.lineStyle(1, 0xA89888, 0.5);
    g.lineBetween(bx + BW, topY + FLOOR_H, bx + BW + DX, topY + FLOOR_H + DY);

    // Side outline
    g.lineStyle(2, 0x8A7A68, 1);
    g.strokePoints([
      { x: bx + BW,      y: topY },
      { x: bx + BW + DX, y: topY + DY },
      { x: bx + BW + DX, y: groundY + DY },
      { x: bx + BW,      y: groundY },
    ], true);

    // Roof face
    g.fillStyle(0xE2D4C4, 1);
    g.fillPoints([
      { x: bx,           y: topY },
      { x: bx + BW,      y: topY },
      { x: bx + BW + DX, y: topY + DY },
      { x: bx + DX,      y: topY + DY },
    ], true);

    // Roof room divider lines
    for (let r = 1; r < 3; r++) {
      const rx1 = bx + r * ROOM_W;
      g.lineStyle(1, 0xC0B0A0, 0.6);
      g.lineBetween(rx1, topY, rx1 + DX, topY + DY);
    }

    // Roof outline
    g.lineStyle(2, 0x8A7A68, 1);
    g.strokePoints([
      { x: bx,           y: topY },
      { x: bx + BW,      y: topY },
      { x: bx + BW + DX, y: topY + DY },
      { x: bx + DX,      y: topY + DY },
    ], true);

    // Plinth / foundation
    g.fillStyle(0xC4B4A4, 1);
    g.fillRect(bx - 3, groundY, BW + 6, 7);
    g.fillStyle(0xB0A090, 1);
    g.fillPoints([
      { x: bx + BW + 3,      y: groundY },
      { x: bx + BW + 3 + DX, y: groundY + DY },
      { x: bx + BW + 3 + DX, y: groundY + 7 + DY },
      { x: bx + BW + 3,      y: groundY + 7 },
    ], true);
    g.lineStyle(1.5, 0x8A7A68, 0.8);
    g.strokeRect(bx - 3, groundY, BW + 6, 7);

    // Rooftop AC unit detail
    const acX = bx + BW * 0.68 + DX * 0.68;
    const acY = topY + DY * 0.68 - 5;
    g.fillStyle(0xD0C4B4, 1);
    g.fillRect(acX, acY - 5, 14, 9);
    g.fillStyle(0xBCACAC, 1);
    g.fillRect(acX + 1, acY - 4, 12, 7);
    g.lineStyle(1, 0xA8A0A0, 1);
    g.strokeRect(acX, acY - 5, 14, 9);
  }

  _drawWorker(g, cx, cy) {
    const s = 0.22;
    // Body
    g.fillStyle(0x5A4030, 1);
    g.fillEllipse(cx, cy - 4, 80 * s, 55 * s);
    // Head
    g.fillStyle(0x5A4030, 1);
    g.fillCircle(cx + 32 * s, cy - 4 - 8 * s, 22 * s);
    // Belly
    g.fillStyle(0xE8C890, 1);
    g.fillEllipse(cx + 6 * s, cy - 4 + 8 * s, 42 * s, 34 * s);
    // Package
    g.fillStyle(0xFF7128, 1);
    g.fillRect(cx - 8 * s, cy - 4 - 2 * s, 24 * s, 18 * s);
    g.fillStyle(0xFFFFFF, 1);
    g.fillRect(cx - 1 * s, cy - 4 - 2 * s, 3 * s, 18 * s);
    g.fillRect(cx - 8 * s, cy - 4 + 5 * s, 24 * s, 3 * s);
  }

  _drawTree(g, x, y, sc) {
    // Trunk
    g.fillStyle(0x7A5030, 1);
    g.fillRect(x - 4 * sc, y - 26 * sc, 8 * sc, 26 * sc);
    // Shadow canopy
    g.fillStyle(0x2C6E1C, 1);
    g.fillCircle(x - 9 * sc, y - 28 * sc, 14 * sc);
    g.fillCircle(x + 9 * sc, y - 28 * sc, 14 * sc);
    // Main canopy
    g.fillStyle(0x3E8C28, 1);
    g.fillCircle(x, y - 36 * sc, 17 * sc);
    // Highlight
    g.fillStyle(0x5CB840, 0.4);
    g.fillCircle(x - 3 * sc, y - 40 * sc, 9 * sc);
  }

  _drawBus(g, x, y) {
    const BL = 74, BH = 28;

    // Shadow
    g.fillStyle(0x000000, 0.08);
    g.fillEllipse(x + BL / 2, y + 3, BL * 0.75, 8);

    // Body
    g.fillStyle(0x3A88D4, 1);
    g.fillRoundedRect(x, y - BH, BL, BH, 4);

    // Lower stripe
    g.fillStyle(0x2A78C4, 1);
    g.fillRect(x, y - 10, BL, 10);

    // Accent stripe (orange — delivery brand)
    g.fillStyle(0xFF7128, 1);
    g.fillRect(x + 2, y - 14, BL - 4, 3);

    // Windows
    g.fillStyle(0xCCEEFF, 1);
    g.fillRect(x + 8, y - BH + 4, BL - 12, 11);

    // Window dividers
    g.fillStyle(0x3A88D4, 0.7);
    const segW = Math.round((BL - 12) / 4);
    for (let i = 1; i <= 3; i++) g.fillRect(x + 8 + i * segW - 1, y - BH + 4, 2, 11);

    // Wheels
    g.fillStyle(0x2A2A2A, 1);
    g.fillCircle(x + 14, y + 2, 7);
    g.fillCircle(x + BL - 14, y + 2, 7);
    g.fillStyle(0x888888, 1);
    g.fillCircle(x + 14, y + 2, 4);
    g.fillCircle(x + BL - 14, y + 2, 4);
    g.fillStyle(0xCCCCCC, 1);
    g.fillCircle(x + 14, y + 2, 2);
    g.fillCircle(x + BL - 14, y + 2, 2);
  }
}

export function createIsoConfig(containerId) {
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
    scene: IsometricScene,
    audio: { noAudio: true },
  };
}
