
export class Centipede{
    constructor(x, y, scene){
        this.scene=scene;

        this.sections = [];
        this.midsections = [];
        this.topsections = [];
        this.path = [];
        
        this.speed = 300;
        for(let i=0;i<20;i++){
            let segment = scene.physics.add.image(x-i*32, y, 'centipede', 'belly');
            segment.scaleY = 1.2;
            segment.scaleX = 1.2;
            this.sections.push(segment);

            let midsegment = scene.physics.add.image(x*i-32, y, 'centipede','center');
            midsegment.scaleY=1.2;
            midsegment.scaleX=0.9;
            this.midsections.push(midsegment);
            
            let topsegment = scene.add.image(x-i*32, y, 'centipede', 'carapace');
            this.topsections.push(topsegment);
        }

        this.head = this.sections[0];
        scene.tweens.add({
            targets: this.head.body,
            angularVelocity: {start: -500, to: 600},
            yoyo: true,
            duration: 600,
            repeat: -1,
        })
        
        var legs = scene.tweens.add({
            targets: this.midsections,
            scaleX: 1.1,
            yoyo: true,
            duration: 200,
            flipX: true,
            delay: scene.tweens.stagger([0,1600]),
            repeat: -1,
        });
        var body = scene.tweens.add({
            targets: this.topsections,
            scaleX: 1.5,
            yoyo: true,
            duration: 400,
            flipX: true,
            delay: scene.tweens.stagger([0,1600]),
            repeat: -1,
        });

        let midContainer = this.scene.add.container(0,-2);
        midContainer.add(this.midsections);
        let topContainer = this.scene.add.container(0,-10);
        topContainer.add(this.topsections);
        
        scene.physics.world.on('worldstep', ()=>{
            this.update();
        })
    }
    update(){
        for(let i=1;i<this.sections.length;i++){
            let current = this.sections[i];
            let target = this.sections[i-1];
            let diffMod = Phaser.Math.Distance.Between(current.body.x, current.body.y, target.body.prevFrame.x, target.body.prevFrame.y) / 32;
            current.rotation=Phaser.Math.Angle.BetweenPoints(current.body,
               target.body.prevFrame);
            this.scene.physics.velocityFromAngle(current.body.rotation, this.speed*diffMod, current.body.velocity)
            this.midsections[i].setPosition(current.x, current.y);
            this.midsections[i].rotation = current.rotation;
            this.topsections[i].setPosition(current.x, current.y);
            this.topsections[i].rotation = current.rotation;
        }
        this.scene.physics.velocityFromAngle(this.head.angle,this.speed, this.head.body.velocity);
        this.midsections[0].setPosition(this.head.x, this.head.y);
        this.midsections[0].rotation = this.head.rotation;
        this.topsections[0].setPosition(this.head.x, this.head.y);
        this.topsections[0].rotation = this.head.rotation;
    }
}