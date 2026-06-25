import Phaser from 'phaser';

export default class HedgehogScene extends Phaser.Scene {
  constructor() {
    super('HedgehogScene');
    this.hog = null;
    this.shadow = null;
    this.particles = [];
  }

  create() {
    this.cameras.main.setBackgroundColor('#FFF3DA');
    this.shadow = this.add.ellipse(0, 0, 220, 34, 0x3e2b20, 0.12);
    this.hog = this.add.container(0, 0);
    this.drawHedgehog();
    this.scale.on('resize', this.layout, this);
    this.layout();
  }

  layout() {
    const { width, height } = this.scale;
    this.hog.setPosition(width * 0.5, height * 0.55);
    this.hog.setScale(Math.min(width / 620, height / 290));
    this.shadow.setPosition(width * 0.5, height * 0.78);
    this.shadow.setScale(Math.max(0.7, Math.min(width / 720, 1.2)));
  }

  drawHedgehog() {
    const g = this.add.graphics();
    this.hog.add(g);

    g.fillStyle(0x5a4030, 1);
    g.fillEllipse(-20, 20, 260, 170);

    g.lineStyle(14, 0x3e2b20, 1);
    const spikes = [
      [-130, -8, -110, -80, -82, -4],
      [-90, -30, -62, -100, -36, -16],
      [-45, -42, -18, -116, 8, -24],
      [2, -38, 32, -108, 56, -14],
      [48, -18, 78, -84, 100, 2],
    ];
    spikes.forEach((points) => {
      g.beginPath();
      g.moveTo(points[0], points[1]);
      g.lineTo(points[2], points[3]);
      g.lineTo(points[4], points[5]);
      g.strokePath();
    });

    g.fillStyle(0xe8c890, 1);
    g.fillEllipse(20, 35, 150, 104);
    g.fillStyle(0xffc107, 1);
    g.fillRoundedRect(-28, -4, 72, 78, 10);
    g.lineStyle(8, 0xffffff, 1);
    g.lineBetween(8, -4, 8, 74);
    g.lineBetween(-28, 32, 44, 32);

    g.fillStyle(0x5a4030, 1);
    g.fillEllipse(118, -2, 88, 76);
    g.fillStyle(0xe8c890, 1);
    g.fillEllipse(140, 12, 54, 34);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(104, -16, 12);
    g.fillStyle(0x1a0800, 1);
    g.fillCircle(108, -16, 6);
    g.fillCircle(166, 4, 8);
    g.fillStyle(0xff9090, 1);
    g.fillCircle(142, 24, 7);

    g.lineStyle(10, 0x3e2b20, 1);
    g.lineBetween(-84, 92, -104, 124);
    g.lineBetween(-8, 100, -18, 132);
    g.lineBetween(60, 92, 78, 124);
    g.lineBetween(128, 54, 146, 78);

    this.add.tween({
      targets: this.hog,
      y: '+=10',
      duration: 720,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
  }

  burst() {
    if (!this.hog) return;
    const { x, y } = this.hog;
    this.tweens.add({
      targets: this.hog,
      scaleX: this.hog.scaleX * 1.08,
      scaleY: this.hog.scaleY * 0.94,
      angle: Phaser.Math.Between(-3, 3),
      duration: 80,
      yoyo: true,
      ease: 'Quad.out',
      onComplete: () => this.hog.setAngle(0),
    });

    for (let i = 0; i < 8; i += 1) {
      const text = this.add.text(x + Phaser.Math.Between(-80, 90), y + Phaser.Math.Between(-80, 20), i % 2 ? '+코인' : '📦', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        fontStyle: '700',
        color: i % 2 ? '#FF7128' : '#1A0800',
        stroke: '#FFFFFF',
        strokeThickness: 5,
      }).setOrigin(0.5);
      this.tweens.add({
        targets: text,
        y: text.y - Phaser.Math.Between(48, 92),
        alpha: 0,
        scale: 1.25,
        duration: 720,
        ease: 'Cubic.out',
        onComplete: () => text.destroy(),
      });
    }
  }
}
