import Phaser from 'phaser';

const D  = 28;
const DX = D * 0.55;
const DY = D * -0.28;

const FAC_IDS = ['packing', 'bag', 'belt', 'scooter', 'battery', 'snackbar'];
const FLOOR_H = 62;

export class IsometricScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IsometricScene' });
    this._t     = 0;
    this._busX  = 0;
    this._coins = [];
    this.onTap    = null;
    this.getState = null;
  }

  preload() {
    this.load.svg('worker', 'sprites/worker.svg', { width: 48, height: 36 });
    this.load.svg('tree',   'sprites/tree.svg',   { width: 52, height: 70 });
    this.load.svg('bus',    'sprites/bus.svg',    { width: 88, height: 46 });
  }

  create() {
    const { width } = this.scale;
    this._busX = width + 80;

    // Depth layers:
    //  0 = background (sky/ground/road)
    //  1 = building back walls + window glass
    //  2 = worker sprites (inside windows)
    //  3 = building fg (window dividers, outlines, roof, side)
    //  4 = bus sprite
    //  5 = tree sprites
    // 10 = coin particles
    this.bgGfx    = this.add.graphics().setDepth(0);
    this.bldBgGfx = this.add.graphics().setDepth(1);
    this.bldFgGfx = this.add.graphics().setDepth(3);
    this.coinGfx  = this.add.graphics().setDepth(10);

    this._workerSprites = FAC_IDS.map(() =>
      this.add.image(0, 0, 'worker')
        .setOrigin(0.45, 0.85)
        .setDepth(2)
        .setVisible(false)
    );

    this._treeLeft  = this.add.image(0, 0, 'tree').setOrigin(0.5, 65 / 70).setDepth(5);
    this._treeRight = this.add.image(0, 0, 'tree').setOrigin(0.5, 65 / 70).setDepth(5);
    this._busSprite = this.add.image(0, 0, 'bus').setOrigin(0, 44 / 46).setDepth(4);

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

    const { width: W, height: H } = this.scale;
    this._drawBg(W, H);
    this._drawBuildingBg(W, H);
    this._updateWorkerSprites(W, H);
    this._drawBuildingFg(W, H);
    this._updateTreeSprites(W, H);
    this._updateBus(H);
    this._drawCoins();
  }

  _drawBg(W, H) {
    const g = this.bgGfx;
    g.clear();

    g.fillStyle(0xC8E4F5, 1);
    g.fillRect(0, 0, W, H);
    g.fillStyle(0xD8EEFA, 0.45);
    g.fillRect(0, 0, W, H * 0.5);

    g.fillStyle(0x7CBD5A, 1);
    g.fillRect(0, H - 56, W, 56);

    g.fillStyle(0xD0C4B0, 1);
    g.fillRect(0, H - 56, W, 14);
    g.lineStyle(1, 0xBBB0A0, 0.4);
    for (let x = 0; x < W; x += 28) g.lineBetween(x, H - 56, x, H - 42);

    g.fillStyle(0x5A5A5A, 1);
    g.fillRect(0, H - 42, W, 42);

    g.fillStyle(0xFFFFFF, 0.35);
    const dashOff = (this._t * 40) % 66;
    for (let x = -dashOff; x < W + 66; x += 66) {
      g.fillRect(x, H - 22, 40, 4);
    }
  }

  _drawBuildingBg(W, H) {
    const g = this.bldBgGfx;
    g.clear();

    const st        = this.getState ? this.getState() : {};
    const facLevels = st.facLevels || {};
    const facReady  = st.facReady  || {};

    const ROOM_W  = Math.min(74, Math.floor((W * 0.62) / 3));
    const BW      = ROOM_W * 3;
    const groundY = H - 56;
    const topY    = groundY - FLOOR_H * 2;
    const bx      = Math.round((W - BW - DX) / 2);

    g.fillStyle(0xC4B4A4, 1);
    g.fillPoints([
      { x: bx + DX,      y: topY + DY },
      { x: bx + BW + DX, y: topY + DY },
      { x: bx + BW + DX, y: groundY + DY },
      { x: bx + DX,      y: groundY + DY },
    ], true);

    const WALL_COLS = [0xF6EDE0, 0xF8EEE0, 0xFBF0E2];

    for (let fl = 0; fl < 2; fl++) {
      const fy_top    = topY + fl * FLOOR_H;
      const facOffset = (1 - fl) * 3;

      for (let room = 0; room < 3; room++) {
        const facIdx = facOffset + room;
        const facId  = FAC_IDS[facIdx];
        const lv     = facLevels[facId] || 0;
        const ready  = facReady[facId]  || false;
        const rx     = bx + room * ROOM_W;

        g.fillStyle(lv > 0 ? WALL_COLS[room] : 0xD8CECC, 1);
        g.fillRect(rx, fy_top, ROOM_W, FLOOR_H);

        const wx = rx + 9, wy = fy_top + 9;
        const ww = ROOM_W - 18, wh = FLOOR_H - 20;

        g.fillStyle(0xAA9888, 1);
        g.fillRect(wx - 2, wy - 2, ww + 4, wh + 4);

        g.fillStyle(lv > 0 ? (ready ? 0xFFE87C : 0xBEDDF8) : 0x9AA0A8, 1);
        g.fillRect(wx, wy, ww, wh);

        if (ready) {
          g.fillStyle(0xFFCC00, 0.22);
          g.fillRect(rx, fy_top, ROOM_W, FLOOR_H);
        }
      }
    }
  }

  _updateWorkerSprites(W, H) {
    const st        = this.getState ? this.getState() : {};
    const facLevels = st.facLevels || {};

    const ROOM_W  = Math.min(74, Math.floor((W * 0.62) / 3));
    const BW      = ROOM_W * 3;
    const groundY = H - 56;
    const topY    = groundY - FLOOR_H * 2;
    const bx      = Math.round((W - BW - DX) / 2);

    const ww = ROOM_W - 18;
    const wh = FLOOR_H - 20;
    const workerScale = Math.min(ww * 0.85 / 48, wh * 0.85 / 36);

    for (let fl = 0; fl < 2; fl++) {
      const fy_top    = topY + fl * FLOOR_H;
      const facOffset = (1 - fl) * 3;

      for (let room = 0; room < 3; room++) {
        const facIdx = facOffset + room;
        const facId  = FAC_IDS[facIdx];
        const lv     = facLevels[facId] || 0;
        const sprite = this._workerSprites[facIdx];

        if (lv > 0) {
          const rx = bx + room * ROOM_W;
          const wx = rx + 9, wy = fy_top + 9;
          const wkX = wx + ww * 0.42;
          const wkY = wy + wh - 4 + Math.sin(this._t * 1.3 + facIdx * 1.05) * 1.8;
          sprite.setPosition(wkX, wkY).setScale(workerScale).setVisible(true);
        } else {
          sprite.setVisible(false);
        }
      }
    }
  }

  _drawBuildingFg(W, H) {
    const g = this.bldFgGfx;
    g.clear();

    const ROOM_W  = Math.min(74, Math.floor((W * 0.62) / 3));
    const BW      = ROOM_W * 3;
    const BH      = FLOOR_H * 2;
    const groundY = H - 56;
    const topY    = groundY - BH;
    const bx      = Math.round((W - BW - DX) / 2);

    for (let fl = 0; fl < 2; fl++) {
      const fy_top = topY + fl * FLOOR_H;
      const fy_bot = fy_top + FLOOR_H;

      for (let room = 0; room < 3; room++) {
        const rx = bx + room * ROOM_W;
        const wx = rx + 9, wy = fy_top + 9;
        const ww = ROOM_W - 18, wh = FLOOR_H - 20;

        g.fillStyle(0xAA9888, 0.55);
        g.fillRect(wx + Math.round(ww / 2) - 1, wy, 2, wh);
        g.fillRect(wx, wy + Math.round(wh / 2) - 1, ww, 2);
      }

      if (fl === 0) {
        g.lineStyle(2, 0xAA9888, 0.75);
        g.lineBetween(bx, fy_bot, bx + BW, fy_bot);
      }

      for (let r = 1; r < 3; r++) {
        g.lineStyle(1.5, 0xBAAA99, 0.65);
        g.lineBetween(bx + r * ROOM_W, fy_top, bx + r * ROOM_W, fy_top + FLOOR_H);
      }
    }

    g.lineStyle(2.5, 0x8A7A68, 1);
    g.strokeRect(bx, topY, BW, BH);

    g.fillStyle(0xBEAE9E, 1);
    g.fillPoints([
      { x: bx + BW,      y: topY },
      { x: bx + BW + DX, y: topY + DY },
      { x: bx + BW + DX, y: groundY + DY },
      { x: bx + BW,      y: groundY },
    ], true);

    g.lineStyle(1, 0xA89888, 0.5);
    g.lineBetween(bx + BW, topY + FLOOR_H, bx + BW + DX, topY + FLOOR_H + DY);

    g.lineStyle(2, 0x8A7A68, 1);
    g.strokePoints([
      { x: bx + BW,      y: topY },
      { x: bx + BW + DX, y: topY + DY },
      { x: bx + BW + DX, y: groundY + DY },
      { x: bx + BW,      y: groundY },
    ], true);

    g.fillStyle(0xE2D4C4, 1);
    g.fillPoints([
      { x: bx,           y: topY },
      { x: bx + BW,      y: topY },
      { x: bx + BW + DX, y: topY + DY },
      { x: bx + DX,      y: topY + DY },
    ], true);

    for (let r = 1; r < 3; r++) {
      const rx1 = bx + r * ROOM_W;
      g.lineStyle(1, 0xC0B0A0, 0.6);
      g.lineBetween(rx1, topY, rx1 + DX, topY + DY);
    }

    g.lineStyle(2, 0x8A7A68, 1);
    g.strokePoints([
      { x: bx,           y: topY },
      { x: bx + BW,      y: topY },
      { x: bx + BW + DX, y: topY + DY },
      { x: bx + DX,      y: topY + DY },
    ], true);

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

    const acX = bx + BW * 0.68 + DX * 0.68;
    const acY = topY + DY * 0.68 - 5;
    g.fillStyle(0xD0C4B4, 1);
    g.fillRect(acX, acY - 5, 14, 9);
    g.fillStyle(0xBCACAC, 1);
    g.fillRect(acX + 1, acY - 4, 12, 7);
    g.lineStyle(1, 0xA8A0A0, 1);
    g.strokeRect(acX, acY - 5, 14, 9);
  }

  _updateTreeSprites(W, H) {
    const groundY   = H - 56;
    const baseScale = 0.8;
    this._treeLeft.setPosition(W * 0.08, groundY).setScale(baseScale * 0.9);
    this._treeRight.setPosition(W * 0.87, groundY).setScale(baseScale * 0.82);
  }

  _updateBus(H) {
    this._busSprite.setPosition(this._busX, H - 33).setScale(0.78);
  }

  _drawCoins() {
    const g = this.coinGfx;
    g.clear();
    for (const p of this._coins) {
      g.fillStyle(p.col, p.life);
      g.fillCircle(p.x, p.y, p.r * p.life);
    }
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
