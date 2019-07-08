export class testScene extends Phaser.Scene{
    constructor()
    {
        super('Test');
    }
    preload(){
        this.load.spritesheet('standsheet', 'assets/chicken_spritesheet-stand.png', { frameWidth: 32, frameHeight: 32, endFrame: 5 });
        this.load.spritesheet('walksheet', 'assets/chicken_spritesheet-walk.png', { frameWidth: 32, frameHeight: 32, endFrame: 3 });
    }
    create(){
        let standframes = this.anims.generateFrameNumbers('standsheet', {start:0, end: 4});
        let walkframes = this.anims.generateFrameNumbers('walksheet', {frames: [0,1,0,3]});
        walkframes[1].duration = 60;
        walkframes[3].duration = 60;
        let standconfig = {
            key: 'stand',
            frames: standframes,
            frameRate: 12,
            repeat: -1
        }
        let walkconfig = {
            key: 'walk',
            frames: walkframes,
            frameRate: 12,
            repeat: -1
        }
        this.cameras.main.setBackgroundColor('#7fde7c');
        this.anims.create(standconfig);
        this.anims.create(walkconfig);
        let physic = this.physics;
        let chicken = this.physics.add.sprite(32,32, 'standsheet').play('stand');
        chicken.setDamping(true);
        let coordinates = {x: this.input.activePointer.x, y: this.input.activePointer.y}
        let moving = false;
        this.input.on('pointermove', function(pointer){
            coordinates.x = pointer.x;
            coordinates.y = pointer.y;
            if(moving){
                physic.moveToObject(chicken, coordinates, 60);
            }
            chicken.flipX = Math.max(chicken.x-pointer.x, 0);
        })
        this.input.on('pointerdown', function(pointer){
            chicken.play('walk');
            physic.moveToObject(chicken, coordinates, 60);
            moving=true;
            chicken.setDrag(0.0);
        });
        this.input.on('pointerup', function(pointer){
            chicken.play('stand');
            moving=false;
            chicken.setDrag(0.92);
        });
    }

    update(time, delta){

    }
}