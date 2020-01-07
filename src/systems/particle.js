export class AnimatedParticle extends Phaser.GameObjects.Particles.Particle
{
    constructor (emitter, anim)
    {
        super(emitter);

        this.t = 0;
        this.i = 0;
        this.anim = anim;

    }

    update (delta, step, processors)
    {
        var result = super.update(delta, step, processors);

        this.t += delta;

        if (this.t >= this.life/this.anim.frames.length)
        {
            this.i++;

            if (this.i > this.anim.frames.length-1)
            {
                this.i = 0;
                if(this.anim.repeat != -1){
                    return true;
                }
            }
            this.frame = this.anim.frames[this.i].frame;

            this.t -= this.life/this.anim.frames.length;
        }

        return result;
    }
}

export class DropSplash extends AnimatedParticle{
    constructor(emitter){
        let scene = emitter.manager.scene;
        var rainsplat = scene.anims.get('rainsplat');
        if(rainsplat === undefined){
            rainsplat = scene.anims.create({
                key:'splat',
                frames: scene.anims.generateFrameNumbers('particles', {start:1, end: 4}),
                frameRate: 24,
                repeat:0
            });
        }
        super(emitter, rainsplat);
    }
}