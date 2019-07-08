export class testScene extends Phaser.Scene{
    constructor()
    {
        super('Test');
    }
    preload(){
        this.load.spritesheet('standsheet', 'assets/chicken_spritesheet-stand.png', { frameWidth: 32, frameHeight: 32, endFrame: 4 });
        this.load.spritesheet('walksheet', 'assets/chicken_spritesheet-walk.png', { frameWidth: 32, frameHeight: 32, endFrame: 3 });
        this.load.spritesheet('pecksheet', 'assets/chicken_spritesheet-peck.png', { frameWidth: 32, frameHeight: 32, endFrame: 4 });
    }
    create(){
        let standframes = this.anims.generateFrameNumbers('standsheet', {start:0, end: 4});
        let walkframes = this.anims.generateFrameNumbers('walksheet', {frames: [0,1,0,3]});
        let peckframes = this.anims.generateFrameNumbers('pecksheet', {start:0, end: 4});
        walkframes[1].duration = 50;
        walkframes[3].duration = 50;
        console.log(standframes)
        peckframes[1].duration = 10;
        peckframes[4].duration = 30;
        let standconfig = {
            key: 'stand',
            frames: standframes,
            frameRate: 12,
        }
        let walkconfig = {
            key: 'walk',
            frames: walkframes,
            frameRate: 15,
        }
        let peckconfig = {
            key: 'peck',
            frames: peckframes,
            frameRate: 30,
        }
        this.cameras.main.setBackgroundColor('#7fde7c');
        this.anims.create(standconfig);
        this.anims.create(walkconfig);
        this.anims.create(peckconfig);
        
        let chicken = this.physics.add.sprite(32,32, 'standsheet').play('walk');
        chicken.setDamping(true);
        chicken.body.setMaxSpeed(100);
        chicken.setDrag(.9);

        this.movement = this.input.keyboard.addKeys({
            up: 'W',
            left: 'A',
            down: 'S',
            right: 'D'
        })
        this.input.on('pointerdown', function(pointer){
            chicken.play('peck');
            this.isPecking = true;
        }, this);
        
        chicken.on('animationcomplete', (animation, frame)=>{
            if(animation.key ==="peck"){
                this.isPecking = false;
            }
        }, this);
        this.autoPeck = true;
        
        
        this.chicken = chicken;
    }

    update(time, delta){
        let accelval = 1500;
        let forcex = 0;
        let forcey = 0;
        if(this.movement.up.isDown){
            forcey-=accelval;
        }
        if(this.movement.down.isDown){
            forcey+=accelval;
        }
        if(this.movement.left.isDown){
            forcex-=accelval;
        }
        if(this.movement.right.isDown){
            forcex+=accelval;
        }
        this.chicken.body.setAcceleration(forcex, forcey);
        this.chicken.flipX = Math.max(this.chicken.x-this.input.activePointer.x, 0);
        if(this.isPecking){
            //allow the peck to play through
        }else if(this.autoPeck && this.input.activePointer.isDown){
            this.chicken.play('peck', true);
            this.isPecking = true;
        }else if(this.chicken.body.speed<20){
            this.chicken.play('stand', true);
        }else{
            this.chicken.play('walk', true);
        }
    }
}