export class Chicken{
    constructor(scene, x=0, y=0, skin=undefined, combindex=0){

        this.scene=scene;
        
        let legs = scene.add.sprite(0, 16, 'chicken_body')
        let head = scene.add.sprite(4, 16, 'key');
        let comb = scene.add.image(x + 4, y, 'combs', 0);
        this.head = head;
        this.legs = legs;
        this.loadAnimations();
        let container = scene.add.container(0, 0, [legs, head, comb]).setVisible(false);
        
        let texture = scene.add.renderTexture(-32,-32,64,64);

        this.flipX = (flip)=>{
            container.scaleX = Math.sign(flip);
        }
        texture.draw(container);
        
        scene.physics.world.enable(texture);
        
        this.reflection = scene.add.shader('Reflect', x, y + 64, 64, 64).setOrigin(0.5, 0);
        this.reflection.setChannel0(texture);

        this.body = texture.body;
        this.body.useDamping = true;
        this.body.setMaxSpeed(100);
        this.body.drag.set(0.9, 0.9);
        this.body.setSize(26, 16);
        this.body.setOffset(19, 49);
        
        this.body.postUpdate = () => {
            this.body.__proto__.postUpdate.call(this.body);
            // this.shadow.setPosition(this.x, this.y);
            //this.outline.setPosition(this.x-1, this.y+1);
            this.reflection.setPosition(this.body.x+13, this.body.y+15);
            //this.emitter.setPosition(this.x, this.y+13)
        }

        // legs.preUpdate = (time, delta)=>{
        //     if (this.isMoving) {
        //         if (this.isPecking) {
        //             this.legs.play('walk_body_' + skin, true);
        //             if (this.clicked) {
        //                 this.clicked = false;
        //                 this.head.play('peck_head_' + skin);
        //             }
        //             this.head.play('peck_head_' + skin, true);
        //         } else {

        //             this.legs.play('walk_body_' + skin, true);
        //             //sync walking head with walking body when head stops pecking
        //             if (this.head.anims.getCurrentKey() === 'peck_head_' + skin) {
        //                 if (this.head.anims.getProgress() < 1 || (this.legs.anims.currentFrame.index % 2 == 0)) {
        //                     //do nothing, wait for headbanging to finish and for sync frame
        //                 } else {
        //                     this.head.play('walk_head_' + skin);
        //                     this.legs.play('walk_body_' + skin);
        //                 }
        //             } else {
        //                 this.head.play('walk_head_' + skin, true);
        //             }
        //         }

        //     } else {
        //         if (this.isPecking) {
        //             if (this.clicked) {
        //                 this.clicked = false;
        //                 this.head.play('peck_head_' + skin);
        //                 this.legs.play('peck_body_' + skin);
        //             }
        //             this.head.play('peck_head_' + skin, true);
        //             //sync pecking body with pecking head when stop walking
        //             if (this.legs.anims.getCurrentKey() !== 'peck_body_' + skin) {
        //                 if (this.head.anims.getProgress() < 1 || this.head.anims.accumulator + delta < this.head.anims.nextTick) {
        //                     //do nothing, wait for headbanging to finish and for sync frame
        //                     this.legs.play('walk_body_' + skin);
        //                 } else {
        //                     this.legs.play('peck_body_' + skin);
        //                     this.head.play('peck_head_' + skin);
        //                 }
        //             } else {
        //                 this.legs.play('peck_body_' + skin, true);
        //             }
        //         } else {
        //             if (this.head.anims.getCurrentKey() === 'peck_head_' + skin) {
        //                 if (this.head.anims.getProgress() < 1 || this.head.anims.accumulator + delta < this.head.anims.nextTick) {
        //                     //do nothing, wait for headbanging to finish and for sync frame
        //                 } else {
        //                     this.legs.play('stand_body_' + skin);
        //                     this.head.play('stand_head_' + skin);
        //                 }
        //             } else {
        //                 this.legs.play('stand_body_' + skin, true);
        //                 this.head.play('stand_head_' + skin, true);
        //             }
        //         }
        //     }

        //     this.legs.anims.update(time, delta);

        //     //if the frame has changed
        //     if (true) {
        //         texture.clear();
        //         texture.draw(container, 32,32);
        //     }
        //     if (this.emitter !== null && this.emitter !== undefined) {
        //         if (!this.stepped) {
        //             if (this.legs.anims.getCurrentKey() === 'walk_body_' + skin) {
        //                 if (this.legs.anims.currentFrame.index == 1) {
        //                     this.emitter.setPosition(this.x + 4 + this.body.deltaX(), this.y + 13 + this.body.deltaY());
        //                     this.emitter.explode();
        //                     this.stepped = true;
        //                 } else if (this.legs.anims.currentFrame.index == 3) {
        //                     this.emitter.setPosition(this.x - 4 + this.body.deltaX(), this.y + 13 + this.body.deltaY());
        //                     this.emitter.explode();
        //                     this.stepped = true;
        //                 }
        //             } else if (this.legs.anims.getCurrentKey() === 'stand_body_' + skin) {
        //                 this.emitter.explode();
        //                 this.stepped = true;
        //             }
        //         } else {
        //             if (this.legs.anims.getCurrentKey() === 'walk_body_' + skin && this.legs.anims.currentFrame.index % 2 != 1) {
        //                 this.stepped = false;
        //             }
        //         }
        //     }
        // }
        this.click = ()=>{
            head.play('peck_head');
            this.isPecking = true;
        }
        legs.preUpdate = (time, delta)=>{
            legs.anims.update(time, delta);
            if (this.isMoving) {
                legs.play('walk_body', true);
            } else {
                if (this.isPecking) {
                    legs.play('peck_body', true);
                } else { //standing
                    legs.play('stand_body', true);
                }
            }
        }
        head.preUpdate = (time, delta) => {
            head.anims.update(time, delta);
            if (this.isMoving) {
                head.play('walk_head', true);
            } else {
                if (this.isPecking) {
                    head.play('peck_head', true);
                } else { //standing
                    head.play('stand_head', true);
                }
            }
        }

        let coords = this.scene.cache.json.get('chicken_coords');
        legs.on('animationstart', (animation, frame)=>{
            head.y = 19 + coords[animation.key][frame.index-1].y
            texture.clear();
            texture.draw(container, 32, 32);
        })
        legs.on('animationupdate', (animation, frame)=>{
            head.y = 19 + coords[animation.key][frame.index-1].y
            texture.clear();
            texture.draw(container, 32, 32);
        })
        head.on('animationstart', (animation, frame)=>{
            texture.clear();
            texture.draw(container, 32, 32);
        })
        head.on('animationupdate', (animation, frame)=>{
            texture.clear();
            texture.draw(container, 32, 32);
        })

        legs.play('stand_body');
        head.play('stand_head');
    }

    loadAnimations(skin) {
        /**
         * standing animations
         */
        let string = skin ? '_' + skin : '';
        let sbody = this.scene.anims.create({
            key: 'stand_body',
            frames: this.scene.anims.generateFrameNames('chicken_body' + string, { prefix: 'stand_', start: 0, end: 4 }),
            frameRate: 12,
        });
        let shead = this.scene.anims.create({
            key: 'stand_head',
            frames: this.scene.anims.generateFrameNames('chicken_head' + string, { prefix: 'stand_', start: 0, end: 4 }),
            frameRate: 12,
        });
        /**
         * pecking animations
         */
        let pbody = this.scene.anims.create({
            key: 'peck_body',
            frames: this.scene.anims.generateFrameNames('chicken_body' + string, { prefix: 'peck_', start: 0, end: 4 }),
            frameRate: 30,
        });
        let phead = this.scene.anims.create({
            key: 'peck_head',
            frames: this.scene.anims.generateFrameNames('chicken_head' + string, { prefix: 'peck_', start: 0, end: 4 }),
            frameRate: 30,
        });
        pbody.frames[1].duration = 10;
        pbody.frames[4].duration = 30;
        phead.frames[1].duration = 10;
        phead.frames[4].duration = 30;
        /**
         * walking animations
         */
        let wbody = this.scene.anims.create({
            key: 'walk_body',
            frames: this.scene.anims.generateFrameNames('chicken_body' + string, { prefix: 'walk_', frames: [0, 1, 0, 2] }),
            frameRate: 15,
        });
        let whead = this.scene.anims.create({
            key: 'walk_head',
            frames: this.scene.anims.generateFrameNames('chicken_head' + string, { prefix: 'walk_', frames: [0, 1, 0, 1] }),
            frameRate: 15,
        });
        for (let i = 0; i < wbody.frames.length; i++) {
            if (i % 2 !== 0) {
                wbody.frames[i].duration = 50;
                whead.frames[i].duration = 50;
            }
        }
        function update(time, delta) {
            if (!this.currentAnim || !this.isPlaying || this.currentAnim.paused) {
                return;
            }

            this.accumulator += delta * this._timeScale;

            if (this._pendingStop === 1) {
                this._pendingStopValue -= delta;

                if (this._pendingStopValue <= 0) {
                    return this.currentAnim.completeAnimation(this);
                }
            }

            if (this.accumulator >= this.nextTick) {
                this.currentAnim.setFrame(this);
                this.dirty = true;
            } else {
                this.dirty = false;
            }
        };
        this.legs.anims.update = update;
        this.head.anims.update = update;
    }
}