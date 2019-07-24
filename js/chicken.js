export class Chicken extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y){
        super(scene, x, y, 'pecksheet_body');

        this.scene=scene;
        this.scene.add.existing(this);
        this.scene.physics.world.enable(this);

        this.loadAnimations();

        this.shadow = scene.add.image(x,y,'shadow');

        this.reflecTex = this.scene.add.renderTexture(0,0,64,64);
        this.reflecTex.saveTexture('reflect');

        this.reflection = scene.add.shader('reflect', x, y-5, 64,64).setDepth(0.5).setOrigin(0.5,0);
        this.reflection.setChannel0('reflect');
        this.reflection.flipY = true;

        this.head=scene.add.sprite(x+4,y,'pecksheet_head',0);
        this.head.preUpdate=()=>{};
        this.headX;
        this.headY;

        this.emitter=null;

        /**
         * this enables the head to move with the body, without being attached to the body
         */
        this.body.postUpdate = ()=>{
            this.body.__proto__.postUpdate.call(this.body);
            this.head.x=this.x+this.headX;
            this.head.y=this.y+this.headY;
            this.shadow.setPosition(this.x,this.y);
            this.reflection.setPosition(this.x-1, this.y-5);
            this.emitter.setPosition(this.x, this.y+13);
        }

        this.body.useDamping = true;
        this.body.setMaxSpeed(100);
        this.body.drag.set(0.9, 0.9);
        this.body.setSize(26, 16);
        this.body.setOffset(3, 14);

        this.isMoving=false;
        this.isPecking=false;
        this.clicked=false;
        this.play('stand_body');
        this.head.play('stand_head');
        this.stepped=false;
    }

    loadAnimations(){
        let standframes_body = this.scene.anims.generateFrameNumbers('standsheet_body', {start:0, end: 4});
        let standframes_head = this.scene.anims.generateFrameNumbers('standsheet_head', {start:0, end: 4});
        this.standoffsets=[
            {x:4, y:1},
            {x:4, y:1},
            {x:4, y:1},
            {x:4, y:-1},
            {x:4, y:-2},
        ];
        let sbody = this.scene.anims.create({
            key: 'stand_body',
            frames: standframes_body,
            frameRate: 12,
        });
        this.scene.anims.create({
            key: 'stand_head',
            frames: standframes_head,
            frameRate: 12,
        });
        for(let i=0;i<sbody.frames.length;i++){
            sbody.frames[i].offset=this.standoffsets[i];
        }

        let peckframes_body = this.scene.anims.generateFrameNumbers('pecksheet_body', {start:0, end: 4});
        let peckframes_head = this.scene.anims.generateFrameNumbers('pecksheet_head', {start:0, end: 4});
        peckframes_body[1].duration = 10;
        peckframes_body[4].duration = 30;
        peckframes_head[1].duration = 10;
        peckframes_head[4].duration = 30;
        this.peckoffsets=[
            {x:4,y:-4},
            {x:4,y:-2},
            {x:4,y:-1},
            {x:4,y:-2},
            {x:4,y:-3}
        ];
        let pbody = this.scene.anims.create({
            key: 'peck_body',
            frames: peckframes_body,
            frameRate: 30,
        });
        this.scene.anims.create({
            key: 'peck_head',
            frames: peckframes_head,
            frameRate: 30,
        });
        for(let i=0;i<pbody.frames.length;i++){
            pbody.frames[i].offset=this.peckoffsets[i];
        }
        
        let walkframes_body = this.scene.anims.generateFrameNumbers('walksheet_body', {frames: [0,1,0,2]});
        let walkframes_head = this.scene.anims.generateFrameNumbers('walksheet_head', {frames: [0,1,0,1]});
        walkframes_body[1].duration = 50;
        walkframes_body[3].duration = 50;
        walkframes_head[1].duration = 50;
        walkframes_head[3].duration = 50;
        this.walkoffsets=[
            {x:4, y:-3},
            {x:4, y:-4},
        ];
        let wbody = this.scene.anims.create({
            key: 'walk_body',
            frames: walkframes_body,
            frameRate: 15,
        });
        this.scene.anims.create({
            key: 'walk_head',
            frames: walkframes_head,
            frameRate: 15,
        });
        for(let i=0;i<wbody.frames.length;i++){
            wbody.frames[i].offset=this.walkoffsets[i%2];
        }

        
    }

    preUpdate(time, delta){
        
        if(this.isMoving){
            if(this.isPecking){
                this.play('walk_body', true);
                if(this.clicked){
                    this.clicked=false;
                    this.head.play('peck_head');
                }
                this.head.play('peck_head', true);
            }else{
                
                this.play('walk_body', true); 
                //sync walking head with walking body when head stops pecking
                if(this.head.anims.getCurrentKey()==='peck_head'){
                    if(this.head.anims.getProgress()<1 || (this.anims.currentFrame.index%2==0)){
                        //do nothing, wait for headbanging to finish and for sync frame
                    }else{
                        this.head.play('walk_head');
                        this.play('walk_body');
                    }
                }else{
                    this.head.play('walk_head', true); 
                }
            }
            
        }else{
            if(this.isPecking){
                if(this.clicked){
                    this.clicked=false;
                    this.head.play('peck_head');
                    this.play('peck_body');
                }
                this.head.play('peck_head',true);
                //sync pecking body with pecking head when stop walking
                if(this.anims.getCurrentKey()!=='peck_body'){
                    if(this.head.anims.getProgress()<1 || this.head.anims.accumulator+delta<this.head.anims.nextTick){
                        //do nothing, wait for headbanging to finish and for sync frame
                        this.play('walk_body');
                    }else{
                        this.play('peck_body');
                        this.head.play('peck_head');
                    }
                }else{
                    this.play('peck_body',true);
                }
            }else{
                if(this.head.anims.getCurrentKey()==='peck_head'){
                    if(this.head.anims.getProgress()<1 || this.head.anims.accumulator+delta<this.head.anims.nextTick){
                        //do nothing, wait for headbanging to finish and for sync frame
                    }else{
                        this.play('stand_body');
                        this.head.play('stand_head');
                    }
                }else{
                    this.play('stand_body',true);
                    this.head.play('stand_head',true);
                }
            }
        }
        
        this.anims.update(time,delta);
        this.head.anims.update(time,delta);
        //if the frame has changed
        if(true){
            this.offset=this.anims.currentFrame.offset;
            this.headX=(this.flipX+1)*this.offset.x;
            this.headY=this.offset.y;
            
            this.reflecTex.clear();
            this.reflecTex.draw(this,32,32);
            this.reflecTex.draw(this.head, 32+this.headX, 32+this.headY);
        }
        if(this.emitter !== null){
            if(!this.stepped){
                if(this.anims.getCurrentKey()==='walk_body'){
                    if(this.anims.currentFrame.index==1){
                        this.emitter.setPosition(this.x+4+this.body.deltaX(), this.y+13+this.body.deltaY());
                        this.emitter.explode();
                        this.stepped=true;
                    }else if(this.anims.currentFrame.index==3){
                        this.emitter.setPosition(this.x-4+this.body.deltaX(), this.y+13+this.body.deltaY());
                        this.emitter.explode();
                        this.stepped=true; 
                    }
                }else if(this.anims.getCurrentKey()==='stand_body'){
                    this.emitter.explode();
                    this.stepped=true;
                }
            }else{
                if(this.anims.getCurrentKey()==='walk_body' && this.anims.currentFrame.index%2!=1){
                    this.stepped=false;
                }
            }
        }
    }
    setFlip(flipX, flipY){
        super.setFlip(flipX, flipY);
        this.head.setFlip(flipX,flipY);
        
        this.headX=(this.flipX+1)*this.offset.x;
        this.shadow.setFlip(flipX, flipY);
    }
    setMask(mask){
        super.setMask(mask);
        this.head.setMask(mask);
    }
    setDepth(depth){
        super.setDepth(depth);
        this.head.setDepth(depth);
    }
    setPipeline(){

    }
}