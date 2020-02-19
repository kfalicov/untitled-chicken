
export class Reaper{
    constructor(x, y, scene){        
        let cloak = scene.add.shader('Cloth', 0, 90, 256,256);
        cloak.setChannel0('cloak');
        let ribs = scene.add.image(0,32,'reaper', 'ribs');
        let head = scene.add.image(0,0,'reaper','head');
        scene.physics.world.on('worldstep', ()=>{
            this.update();
        })
        
        let scythe = scene.add.image(40,40,'reaper', 'scythe').setOrigin(0.92, 0.65);

        let hand_left = scene.add.image(40,40,'reaper', 'hand_fist');
        let hand_right = scene.add.image(-40,40,'reaper', 'hand_point');
        hand_right.flipX=true;
        hand_right.angle=90;


        let idle = scene.tweens.add({
            targets: [scythe, hand_left],
            props: {
                x: {value: '+=10', duration: 1000, yoyo: true, ease: 'Sine.easeInOut'},
                y: {value: '+=10', duration: 1000, yoyo: true, delay: 500, ease: 'Sine.easeInOut'},
                angle: {value:'+=10', yoyo: true, duration: 1000},
            },
            //yoyo: true,
            //duration: 1000,
            repeat: -1
        });
        scene.tweens.add({
            targets: [hand_right],
            props: {
                x: {value: '-=10', duration: 1000, yoyo: true, delay: 500, ease: 'Sine.easeInOut'},
                y: {value: '+=10', duration: 1000, yoyo: true, delay: 1000, ease: 'Sine.easeInOut'},
                angle: {value:'-=10', yoyo: true, duration: 1000},
            },
            //yoyo: true,
            duration: 1000,
            repeat: -1
        });
        this.scene = scene;
        
        this.shadow = scene.add.image(x,y+180,'shadow');
        this.container = scene.add.container(x,y,[cloak,ribs, head, scythe, hand_left, hand_right]);
        this.container.setSize(64,64);
        scene.physics.world.enable(this.container);
    }
    update(){
        let target = this.scene.player.body.center;
        target.y-=64;
        let rotation=Phaser.Math.Angle.BetweenPoints(this.container.body.center,
            target);
         this.scene.physics.velocityFromRotation(rotation, 10, this.container.body.velocity)
         this.shadow.x = this.container.body.center.x;
         this.shadow.y = this.container.body.center.y+180;
    }
}