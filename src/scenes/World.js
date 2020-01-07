import Phaser from 'phaser';
import { Ground } from '../terrain.js';
import { Chicken } from '../objects/chicken.js';
import { EnvironmentSystem } from '../systems/EnvironmentSystem.js';
import { Tree } from '../objects/tree.js';

export class World extends Phaser.Scene {
  constructor() {
    super('World')
  }

  preload() {
    this.load.image('crystal', 'assets/crystal_7.png');
    this.load.image('crystal_o', 'assets/crystal_overlay.png');
    this.load.image('crystal_core', 'assets/crystal_core.png');
    this.load.image('crystal_c', 'assets/crystal_cosmetic.png');

    this.load.atlas('ship', 'assets/ship.png', 'assets/ship.json');
    this.load.spritesheet('smoke', 'assets/smoke.png', { frameWidth: 16, frameHeight: 16 });
  }

  create(data) {
    /**
         * initialize world
         */

    // this.ground = new Ground(this, {x:0, y:0}, {x: 2, y:2});

    const weather = new EnvironmentSystem(this);
    this.weather = weather;

    this.groundEffects = this.add.container();
    const screenshadow = this.add.tileSprite(0, 0, this.sys.canvas.width, this.sys.canvas.height, 'black').setOrigin(0);
    this.weatherlayer = this.add.container();

    this.collisionlayer = this.add.container();
    // console.log(data);
    const player = new Chicken(this, 0, 0, data.chickenColor, data.chickenType);
    this.foreground = this.add.container();
    this.overlay = this.add.container();
    // player.emitter = stepEmitter;
    // player.setDepth(2);
    this.player = player;

    // let coffin = new Coffin(-40, -10, this);
    this.input.keyboard.on('keydown-Y', () => {
      //    coffin.open();
      // c.update();
    });

    // this.ship = new Ship(0,0,this);

    this.shadows = this.add.container().setVisible(false);
    this.shadows.add([player.shadow]);// , reaper.shadow]);

    const tree = new Tree(-30, -50, 0, this);
    // let fire = this.add.shader('Fire', -40, 0, 64, 64);
    this.tweens.addCounter({
      from: -180,
      to: 180,
      duration: 10000,
      // yoyo: true,
      repeat: -1,
      onUpdate: (twen) => {
        fire.setUniform('angle.value', twen.getValue());
        console.log(fire.getUniform('angle').value);
      },
      delay: 2500,
      paused: true,
    });
    // this.tweens.add({
    //     targets: fire,
    //     props: {
    //         x: {value: '+=100', duration: 5000, yoyo: true, ease: 'Sine.easeInOut'},
    //         y: {value: '+=100', duration: 5000, yoyo: true, delay: 2500, ease: 'Sine.easeInOut'},
    //     },
    //     repeat: -1,
    // })
    this.input.keyboard.on('keydown-O', () => {
      // fire.getUniform('angle').value+=90;
      tree.knock(10);
    });

    // this.weatherlayer.add(player.reflection);

    screenshadow.alpha = 0.25;
    // screenshadow.setBlendMode(Phaser.BlendModes.MULTIPLY);
    screenshadow.setScrollFactor(0);

    const shadowmask = new Phaser.Display.Masks.BitmapMask(this, this.shadows);
    screenshadow.setMask(shadowmask);

    this.weatherlayer.add(weather.getBackground());
    const clouds = this.add.tileSprite(0, 0, this.sys.canvas.width, this.sys.canvas.height, 'clouds');
    clouds.setScrollFactor(0);
    clouds.tileScaleX = 2;
    clouds.tileScaleY = 2;

    clouds.setOrigin(0);
    this.scrollX = 0;
    this.scrollY = 0;
    this.shadows.add(clouds);

    this.clouds = clouds;

    /**
         * initialize player animations
         */

    this.cameras.main.setBackgroundColor('#15AB49');

    this.cameras.main.setSize(320, 240);

    // this.cameras.main.zoom=0.5;
    this.tweens.add({
      targets: this.cameras.main,
      zoom: 0.5,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      paused: true,
    });
    this.cameras.main.startFollow(player, true, 0.1, 0.1);

    this.movement = this.input.keyboard.addKeys({
      up: 'W',
      left: 'A',
      down: 'S',
      right: 'D',
    });

    this.walking = false;
    const q = this.input.keyboard.addKey('Q');
    let intensity = 0;
    q.on('down', () => {
      intensity = (intensity + 1) % 2;
      this.distortPipeline.setFloat1('intensity', intensity);
      console.log(intensity);
      this.cameras.main.zoom = 1 - (0.5 * intensity);
      // this.cameras.main.shake();
    }, this);

    this.input.on('pointermove', (pointer) => {
      // console.log(pointer.x-160, pointer.y-120);
      this.cameras.main.setFollowOffset((-pointer.x + this.sys.canvas.width / 2) / 6, (-pointer.y + this.sys.canvas.height / 2) / 6);
    }, this);

    this.input.on('pointerdown', (pointer) => {
      // this.pecking=true;
      player.isPecking = true;
      player.clicked = true;
    }, this);
    this.input.on('pointerup', (pointer) => {
      // this.pecking=true;
      player.isPecking = false;
    }, this);
    this.input.on('gameout', () => {
      player.isPecking = false;
    }, this);

    this.activeTile = null;
    this.pointerXY = { x: 0, y: 0 };
    let selecting = true;

    const tools = ['pick', 'axe', 'sword', 'pick_xl', 'axe_xl'];
    let equip = 0;
    this.input.on('wheel', () => {
      selecting = !selecting;
      equip = (equip + 1) % tools.length;
      this.player.equip(tools[equip]);
    });

    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.pause();
      this.scene.run('Map');
    });

    // let crystal_core = this.add.image(20,20,'crystal_core').setAlpha(0.9);
    // crystal_core.setBlendMode(Phaser.BlendModes.SCREEN);
    // let crystal_cosmetic = this.add.image(20,20,'crystal_c').setAlpha(0.6);
    // let crystal_overlay = this.add.image(20,20,'crystal_o');
    // let crystal = this.add.shader('Crystal', 20, 20, 64,64);
    // crystal.setChannel0('crystal');
    // crystal.setChannel1('chickenTex');
    // this.crystal = crystal;
    // console.log(this.crystal.uniforms);

    // this.player.outline.setMask(new Phaser.Display.Masks.BitmapMask(this, this.foreground));
    // this.overlay.add(this.player.outline);
  }


  update(time, delta) {
    this.updateChicken(time, delta);
    // this.distortPipeline.setFloat1('time', time/10);
    // this.distortPipeline2.setFloat1('time', time/10);
    // this.marblePipeline.setFloat1('time', time/1000);
    this.scrollX -= 0.15;
    this.scrollY -= 0.02;
    this.clouds.tilePositionX = this.cameras.main.scrollX / 2 + this.scrollX;
    this.clouds.tilePositionY = this.cameras.main.scrollY / 2 + this.scrollY;
    this.weather.setPosition(this.cameras.main.worldView.x - 64, this.cameras.main.worldView.y - 64);

    if (this.player.isPecking) {
      if (this.activeTile !== null) {
        this.activeTile.setFrame(9);
      }
    }

    // this.drawnRect.x+=(this.ship.x-this.drawnRect.x)*.05;
    // this.updateBoosters(this.boosters, this.ship, this.drawnRect);
    // this.updateEmitters(this.emitters);

    // this.crystal.setUniform('distance.value.x',this.player.x-this.crystal.x);
    // this.crystal.setUniform('distance.value.y',this.player.y-this.crystal.y);

    const chunkSize = { x: 12, y: 9 };
    const tileSize = 16;
    const snappedChunkX = Math.floor(this.player.x / (chunkSize.x * tileSize));
    const snappedChunkY = Math.floor(this.player.y / (chunkSize.y * tileSize));
    // this.ground.fetch({x: snappedChunkX, y: snappedChunkY});
  }

  updateChicken(time, delta) {
    const accelval = 1500;
    let forcex = 0;
    let forcey = 0;
    if (this.movement.up.isDown) {
      forcey -= accelval;
    }
    if (this.movement.down.isDown) {
      forcey += accelval;
    }
    if (this.movement.left.isDown) {
      forcex -= accelval;
    }
    if (this.movement.right.isDown) {
      forcex += accelval;
    }
    this.player.body.setAcceleration(forcex, forcey);
    // let flip = Math.max(this.chicken.x-this.input.activePointer.x, 0);
    // let flip = Math.max(this.chicken.x-this.cameras.main.midPoint.x, 0);
    const chickenXreltoCenter = this.player.x - this.cameras.main.midPoint.x;
    const mouseXreltoCenter = this.input.activePointer.x - 160;

    const flip = Math.sign(mouseXreltoCenter - chickenXreltoCenter);
    this.player.setFlip(flip - 1, false);

    if (this.player.body.speed >= 40) {
      this.walking = true;
      this.player.isMoving = true;
    } else {
      this.walking = false;
      this.player.isMoving = false;
    }
  }
}
