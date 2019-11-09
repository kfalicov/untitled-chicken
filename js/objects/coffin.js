
export class Coffin{
    constructor(x, y, scene){
        this.scene=scene;
        this.base = this.scene.add.image(x,y,'coffin', 'base');
        this.lid = this.scene.add.sprite(x,y-9,'coffin', 'lid');
        this.createAnimations();
    }
    createAnimations(){
        this.scene.anims.create({
            key: 'coffin_lid',
            frames: this.scene.anims.generateFrameNames('coffin', {prefix: 'lid_skew', start:0, end:1}),
            frameRate: 18,
            repeat: -1,
        });
        let bounce = this.scene.tweens.timeline({
            paused: true,
            onComplete: ()=>{
                this.lid.anims.stop();
                this.lid.setFrame('lid')
            },
            tweens: [
                {
                    targets: this.lid,
                    y: '-=80',
                    duration: 700,
                    paused: true,
                    yoyo: true,
                    ease: 'Quad.easeOut',
                },
                {
                    targets: this.lid,
                    y: '-=40',
                    duration: 300,
                    paused: true,
                    yoyo: true,
                    ease: 'Quad.easeOut',
                },
                {
                    targets: this.lid,
                    y: '-=10',
                    duration: 100,
                    paused: true,
                    yoyo: true,
                    ease: 'Quad.easeOut',
                },
                {
                    targets: this.lid,
                    x: '-=120',
                    duration: 2000,
                    paused: true,
                    offset: 0
                },
                {
                    targets: this.lid,
                    angle: '-=200',
                    duration: 1400,
                    paused: true,
                    offset: 0
                },
                {
                    targets: this.lid,
                    angle: '-=180',
                    duration: 600,
                    paused: true,
                },
                {
                    targets: this.lid,
                    angle: '+=20',
                    duration: 200,
                    paused: true,
                },
            ]
        });
        this.openAnim = this.scene.tweens.add({
            targets: this.lid,
            y:this.lid.y-2,
            duration: 50,
            yoyo: true,
            paused: true,
            loop:1,
            loopDelay:1000,
            onStart: ()=>{
                this.scene.cameras.main.shake(50, 0.01)
            },
            onYoyo: ()=>{this.lid.angle-=1},
            onLoop: ()=>{
                this.lid.angle-=5;
                this.scene.cameras.main.shake(50, 0.01);
            },
            onComplete:()=>{
                this.lid.setFrame('lid_skew0');
                this.scene.time.addEvent({
                    delay: 1000,
                    callback: ()=>{
                        this.scene.cameras.main.shake(50, 0.01);
                        this.lid.y=this.base.y;
                        this.lid.play('coffin_lid');
                        bounce.play();
                    }
                })
            },
        })
    }
    open(){
        this.openAnim.play();
    }
}