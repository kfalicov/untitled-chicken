export class Chicken extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, skin){
        super(scene, x, y, 'key');

        this.scene=scene;
        this.scene.add.existing(this);
        this.scene.physics.world.enable(this);

        this.skin = skin;
        this.head=scene.add.sprite(x+4,y,'pecksheet_head',0);
        this.comb=scene.add.image(x+4, y, 'combs', 'comb_1');
        this.head.preUpdate=()=>{};
        this.loadAnimations(skin);

        this.shadow = scene.add.image(x,y,'shadow');

        this.chickenTex = this.scene.add.renderTexture(0,0,64,64).setVisible(false);
        this.chickenTex.saveTexture('chickenTex');

        this.reflection = scene.add.shader('reflect', x-1, y-5, 64,64).setOrigin(0.5,0);
        this.reflection.setChannel0('chickenTex');

        this.outline = scene.add.shader('outline', x, y, 64,64);
        this.outline.setChannel0('chickenTex');

        this.headX;
        this.headY;
        this.faceX;
        this.faceY;

        this.emitter=null;

        /**
         * this enables the head to move with the body, without being attached to the body
         */
        this.body.postUpdate = ()=>{
            this.body.__proto__.postUpdate.call(this.body);
            this.head.x=this.x+this.headX;
            this.head.y=this.y+this.headY;
            this.comb.x=this.x+this.faceX;
            this.comb.y=this.y+this.faceY;
            this.shadow.setPosition(this.x,this.y);
            this.outline.setPosition(this.x-1, this.y+1);
            this.reflection.setPosition(this.x-1, this.y-5);
            //this.emitter.setPosition(this.x, this.y+13);
        }

        this.body.useDamping = true;
        this.body.setMaxSpeed(100);
        this.body.drag.set(0.9, 0.9);
        this.body.setSize(26, 16);
        this.body.setOffset(3, 14);

        this.isMoving=false;
        this.isPecking=false;
        this.clicked=false;
        this.play('stand_body_'+skin);
        this.head.play('stand_head_'+skin);
        this.stepped=false;
    }

    loadAnimations(skin){
        //contains data about the locations of the neck and face
        let coords = this.scene.cache.json.get('chicken_coords');
        /**
         * standing animations
         */
        let sbody = this.scene.anims.create({
            key: 'stand_body_'+skin,
            frames: this.scene.anims.generateFrameNames('chicken_body_'+skin, {prefix: 'stand_', start:0, end:4}),
            frameRate: 12,
        });
        let shead = this.scene.anims.create({
            key: 'stand_head_'+skin,
            frames: this.scene.anims.generateFrameNames('chicken_head_'+skin, {prefix: 'stand_', start:0, end:4}),
            frameRate: 12,
        });
        for(let i=0;i<sbody.frames.length;i++){
            sbody.frames[i].offset=coords.stand_neck[i];
            shead.frames[i].offset=coords.stand_face[i];
        }
        /**
         * pecking animations
         */
        let pbody = this.scene.anims.create({
            key: 'peck_body_'+skin,
            frames: this.scene.anims.generateFrameNames('chicken_body_'+skin, {prefix: 'peck_', start:0, end:4}),
            frameRate: 30,
        });
        let phead = this.scene.anims.create({
            key: 'peck_head_'+skin,
            frames: this.scene.anims.generateFrameNames('chicken_head_'+skin, {prefix: 'peck_', start:0, end:4}),
            frameRate: 30,
        });
        for(let i=0;i<pbody.frames.length;i++){
            pbody.frames[i].offset=coords.peck_neck[i];
            phead.frames[i].offset=coords.peck_face[i];
        }
        pbody.frames[1].duration=10;
        pbody.frames[4].duration=30;
        phead.frames[1].duration=10;
        phead.frames[4].duration=30;
        /**
         * walking animations
         */
        let wbody = this.scene.anims.create({
            key: 'walk_body_'+skin,
            frames: this.scene.anims.generateFrameNames('chicken_body_'+skin, {prefix: 'walk_', frames:[0,1,0,2]}),
            frameRate: 15,
        });
        let whead = this.scene.anims.create({
            key: 'walk_head_'+skin,
            frames: this.scene.anims.generateFrameNames('chicken_head_'+skin, {prefix: 'walk_', frames:[0,1,0,1]}),
            frameRate: 15,
        });
        for(let i=0;i<wbody.frames.length;i++){
            wbody.frames[i].offset=coords.walk_neck[i%2];
            whead.frames[i].offset=coords.walk_face[i%2];
            if(i%2!==0){
                wbody.frames[i].duration=50;   
                whead.frames[i].duration=50;
            }
        }
        this.headoffset = {x:0,y:0};
        this.faceoffset = {x:0,y:0};
        function update(time, delta)
        {
            if (!this.currentAnim || !this.isPlaying || this.currentAnim.paused)
            {
                return;
            }
    
            this.accumulator += delta * this._timeScale;
    
            if (this._pendingStop === 1)
            {
                this._pendingStopValue -= delta;
    
                if (this._pendingStopValue <= 0)
                {
                    return this.currentAnim.completeAnimation(this);
                }
            }
    
            if (this.accumulator >= this.nextTick)
            {
                this.currentAnim.setFrame(this);
                this.dirty=true;
            }else{
                this.dirty=false;
            }
        };
        this.anims.update=update;
        this.head.anims.update=update;
    }

    preUpdate(time, delta){
        let skin = this.skin;
        if(this.isMoving){
            if(this.isPecking){
                this.play('walk_body_'+skin, true);
                if(this.clicked){
                    this.clicked=false;
                    this.head.play('peck_head_'+skin);
                }
                this.head.play('peck_head_'+skin, true);
            }else{
                
                this.play('walk_body_'+skin, true); 
                //sync walking head with walking body when head stops pecking
                if(this.head.anims.getCurrentKey()==='peck_head_'+skin){
                    if(this.head.anims.getProgress()<1 || (this.anims.currentFrame.index%2==0)){
                        //do nothing, wait for headbanging to finish and for sync frame
                    }else{
                        this.head.play('walk_head_'+skin);
                        this.play('walk_body_'+skin);
                    }
                }else{
                    this.head.play('walk_head_'+skin, true); 
                }
            }
            
        }else{
            if(this.isPecking){
                if(this.clicked){
                    this.clicked=false;
                    this.head.play('peck_head_'+skin);
                    this.play('peck_body_'+skin);
                }
                this.head.play('peck_head_'+skin,true);
                //sync pecking body with pecking head when stop walking
                if(this.anims.getCurrentKey()!=='peck_body_'+skin){
                    if(this.head.anims.getProgress()<1 || this.head.anims.accumulator+delta<this.head.anims.nextTick){
                        //do nothing, wait for headbanging to finish and for sync frame
                        this.play('walk_body_'+skin);
                    }else{
                        this.play('peck_body_'+skin);
                        this.head.play('peck_head_'+skin);
                    }
                }else{
                    this.play('peck_body_'+skin,true);
                }
            }else{
                if(this.head.anims.getCurrentKey()==='peck_head_'+skin){
                    if(this.head.anims.getProgress()<1 || this.head.anims.accumulator+delta<this.head.anims.nextTick){
                        //do nothing, wait for headbanging to finish and for sync frame
                    }else{
                        this.play('stand_body_'+skin);
                        this.head.play('stand_head_'+skin);
                    }
                }else{
                    this.play('stand_body_'+skin,true);
                    this.head.play('stand_head_'+skin,true);
                }
            }
        }
        
        this.anims.update(time,delta);
        this.head.anims.update(time,delta);

        //if the frame has changed
        if(true){
            this.headoffset=this.anims.currentFrame.offset;
            this.headX=(this.flipX+1)*this.headoffset.x;
            this.headY=this.headoffset.y;
            this.faceoffset=this.head.anims.currentFrame.offset;
            this.faceX =(this.flipX+1)*(this.headoffset.x+this.faceoffset.x);
            this.faceY=this.headoffset.y+this.faceoffset.y;
            
            this.chickenTex.clear();
            this.chickenTex.draw(this,32,32);
            this.chickenTex.draw(this.head, 32+this.headX, 32+this.headY);
            if(this.head.anims.getCurrentKey()!=='peck_head_'+skin){
                this.comb.visible=true;
                this.chickenTex.draw(this.comb, 32+this.faceX, 32+this.faceY)
            }else{
                this.comb.visible=false;
            }
        }
        if(this.emitter !== null){
            if(!this.stepped){
                if(this.anims.getCurrentKey()==='walk_body_'+skin){
                    if(this.anims.currentFrame.index==1){
                        this.emitter.setPosition(this.x+4+this.body.deltaX(), this.y+13+this.body.deltaY());
                        this.emitter.explode();
                        this.stepped=true;
                    }else if(this.anims.currentFrame.index==3){
                        this.emitter.setPosition(this.x-4+this.body.deltaX(), this.y+13+this.body.deltaY());
                        this.emitter.explode();
                        this.stepped=true; 
                    }
                }else if(this.anims.getCurrentKey()==='stand_body_'+skin){
                    this.emitter.explode();
                    this.stepped=true;
                }
            }else{
                if(this.anims.getCurrentKey()==='walk_body_'+skin && this.anims.currentFrame.index%2!=1){
                    this.stepped=false;
                }
            }
        }
    }
    setFlip(flipX, flipY){
        super.setFlip(flipX, flipY);
        this.head.setFlip(flipX, flipY);
        this.comb.setFlip(flipX, flipY);
        
        this.headX=(this.flipX+1)*this.headoffset.x;
        this.faceX=(this.flipX+1)*(this.headoffset.x+this.faceoffset.x);
        this.shadow.setFlip(flipX, flipY);
    }
    setMask(mask){
        super.setMask(mask);
        this.head.setMask(mask);
    }
    setDepth(depth){
        super.setDepth(depth);
        this.head.setDepth(depth);
        this.comb.setDepth(depth);
    }
    setAppearance(combindex){
        this.comb.setFrame('comb_'+combindex);
    }
    setPipeline(){

    }
}