import Phaser from 'phaser';
import server from '../server';
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

  /**
   * initialize world
   */
  create(data) {
    

    // this.ground = new Ground(this, {x:0, y:0}, {x: 2, y:2});
    //let lava = this.add.shader('Lava', 0, 0, this.sys.canvas.width, this.sys.canvas.height).setOrigin(0);
    //lava.setScrollFactor(0);
   
    //this is the solid cover over the ground that gets masked to make each shadow a uniform color
    const screenshadow = this.add.tileSprite(0, 0, this.sys.canvas.width, this.sys.canvas.height, 'black').setOrigin(0);
    
    //effects on the ground, such as raindrop splashes
    const groundEffects = this.add.container();

    this.collisionlayer = this.add.container();

    const player = new Chicken(this, 0, 0, data.chickenColor, data.chickenType);

    //effects in the foreground, such as rain particles
    const foreground = this.add.container();

    //tint and lighting over everything
    const lighting = this.add.container();

    //the player
    this.player = player;

    //these are the objects that mask over the shadow on the ground
    const shadows = this.add.container().setVisible(false);
    shadows.add([player.shadow]);

    const weather = new EnvironmentSystem(this, screenshadow, shadows, groundEffects, foreground, lighting);

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
    /** multiplayer */
    this.input.keyboard.on('keydown-P', () => {
      console.log("hosted server");
      //server('this');
    });

    screenshadow.alpha = 0.25;
    // screenshadow.setBlendMode(Phaser.BlendModes.MULTIPLY);
    screenshadow.setScrollFactor(0);

    const shadowmask = new Phaser.Display.Masks.BitmapMask(this, shadows);
    screenshadow.setMask(shadowmask);

    /**
         * initialize player animations
         */

    this.cameras.main.setBackgroundColor('#15AB49');
    this.cameras.main.setSize(320, 240);

    // this.cameras.main.zoom=0.5;
    // this.tweens.add({
    //   targets: this.cameras.main,
    //   zoom: 0.5,
    //   yoyo: true,
    //   repeat: -1,
    //   ease: 'Sine.easeInOut',
    //   paused: true,
    // });
    this.cameras.main.startFollow(player, true, 0.1, 0.1);
    this.cameras.main.setRenderToTexture();
    this.cameras.main.on('prerender', (cam)=>{
      if(typeof lava !== 'undefined')
        lava.uniforms.scroll.value=cam.midPoint;
      weather.clouds.uniforms.scroll.value=cam.midPoint;
    })

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
    if (this.player.isPecking) {
      if (this.activeTile !== null) {
        this.activeTile.setFrame(9);
      }
    }
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
