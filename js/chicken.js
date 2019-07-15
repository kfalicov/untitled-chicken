export class Chicken extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, key){
        super(scene, x, y, 'key');
        this.scene=scene;
        this.scene.add.existing(this);
        this.scene.physics.world.enable(this);
        
        this.head=scene.add.sprite(x,y,'pecksheet_head',0).setDepth(4);

        scene.sys.updateList.remove(this.head);
        /**
         * this enables the head to move with the body, without being attached to the body
         */
        this.body.postUpdate = ()=>{
            this.body.__proto__.postUpdate.call(this.body);
            this.head.setPosition(this.x, this.y);
        }

        this.body.useDamping = true;
        this.body.setMaxSpeed(100);
        this.body.drag.set(0.9, 0.9);
        this.body.setSize(26, 16);
        this.body.setOffset(3, 14);

        /**
         * initialize player animations
         */
        let standframes_body = scene.anims.generateFrameNumbers('standsheet_body', {start:0, end: 4});
        let walkframes_headless = scene.anims.generateFrameNumbers('walksheet_headless', {frames: [0,1,0,2]});
        let peckframes_body = scene.anims.generateFrameNumbers('pecksheet_body', {start:0, end: 4});
        let walkframes_body = scene.anims.generateFrameNumbers('walksheet_body', {frames: [0,1,2,1]});
        let peckframes_head = scene.anims.generateFrameNumbers('pecksheet_head', {start:0, end: 4});
        walkframes_headless[1].duration = 50;
        walkframes_headless[3].duration = 50;
        walkframes_body[1].duration = 50;
        walkframes_body[3].duration = 50;
        peckframes_body[1].duration = 10;
        peckframes_body[4].duration = 30;
        peckframes_head[1].duration = 10;
        peckframes_head[4].duration = 30;

        this.scene.anims.create({
            key: 'stand_body',
            frames: standframes_body,
            frameRate: 12,
            repeat:-1
        });
        this.scene.anims.create({
            key: 'walk_headless',
            frames: walkframes_headless,
            frameRate: 15,
        }).skipMissedFrames=true;
        this.scene.anims.create({
            key: 'walk_body',
            frames: walkframes_body,
            frameRate: 15,
        }).skipMissedFrames=true;
        this.scene.anims.create({
            key: 'peck_body',
            frames: peckframes_body,
            frameRate: 30,
        });
        this.scene.anims.create({
            key: 'peck_head',
            frames: peckframes_head,
            frameRate: 30,
        });
        
        this.play('stand_body');

        this.peckheadanim=false;
        this.peckbodyanim=false;
        this.walkanim=false;
        this.standanim=true;

        this.head.on('animationcomplete', (animation, frame)=>{
            if(animation.key ==="peck_head"){
                this.peckheadanim=false;
                console.log('stopped headbangin')
            }
        }, this);
        this.on('animationcomplete', (animation, frame)=>{
            if(animation.key ==="walk_body"){
                this.walkanim=false;
            }else if(animation.key ==="peck_body"){
                this.peckbodyanim=false;
            }else if(animation.key ==="stand_body"){
                this.standanim=false;
            }
        });
    }
    preUpdate(time,delta){
        if(!this.peckheadanim){
            this.head.setVisible(false);
        }else{
            this.head.setVisible(true);
        }
        super.preUpdate(time,delta);
        if(this.body.speed>=40){
            if(this.peckheadanim){
                this.head.play('peck_head', true);
                this.play('walk_headless', true);
            }else{
                this.play('walk_body', true);
            }
        }else{
            if(this.peckheadanim){
                this.play('peck_body');
            }
            this.play('stand_body', true);
        }
    }
    setFlip(x,y){
        super.setFlip(x,y);
        this.head.setFlip(x,y);
    }
    peck(){
        this.peckheadanim=true;
        this.head.setVisible(true);
        this.head.play('peck_head');
    }
}