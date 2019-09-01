const GRAVITY = 40;

export class Map extends Phaser.Scene{
    constructor(){
        super('Map');
    }
    preload(){
    }
    create(){        
        this.anims.create({
            key: 'idle',
            frames: [{key:'map_icons', frame:'chicken_0'},{key:'map_icons', frame:'chicken_1'}],
            repeat:-1,
            frameRate:6,
        }); 
        let particles = this.add.particles('map_icons');
        let emitter = particles.createEmitter({
            frame:'heart',
            speedY:{min:-10, max:-15},
            scale:{start:0.5, end:2},
            angle: {start:0, end:360, steps:45},
            lifespan:1600,
            quantity:1,
            on:false
        })
        let well = {
            active:true,
            update:function(particle){
                particle.velocityX = Math.sin(particle.lifeT*3*Math.PI)*-20;
            }
        }
        particles.addGravityWell(well)
        let draggable = this.physics.add.sprite(40,40,'map_icons', 'chicken_0').setInteractive().setOrigin(0.5,-0.5);
        draggable.play('idle');
        this.input.on('pointerdown', (event)=>{
        })

        let cursor = this.add.image(this.input.activePointer.x, this.input.activePointer.y, 'map_icons', 'hand_2').setOrigin(0.3);
        this.input.on('pointermove', (event)=>{cursor.setPosition(event.x, event.y)});
        this.input.setDraggable(draggable);
        draggable.on('pointerover', ()=>{
            cursor.setFrame('hand_0');
        });
        draggable.on('pointerout', ()=>{cursor.setFrame('hand_2')});
        this.input.on('dragstart', (e)=>{
            cursor.setFrame('hand_1');
            draggable.setPosition(e.x, e.y);
            draggable.anims.pause();
            draggable.setFrame('chicken_3')
        });
        let combo=0;
        let lastDist = 0;
        let lastAngle=0;
        let cancelPet = undefined;
        this.input.on('pointermove', (pointer)=>{
            //console.log(pointer.angle, lastAngle);
            //console.log(pointer.distance)
            lastDist+=pointer.distance;
            if((pointer.angle>0&&lastAngle<=0)||(pointer.angle<0&&lastAngle>=0)){
                //console.log(lastDist);
                if(lastDist<200&&lastDist>50){
                    //console.log('small enough');
                    combo++;
                    if(combo>3){
                        draggable.anims.pause();
                        draggable.setFrame('chicken_2');
                        
                        emitter.explode(1, draggable.x+4, draggable.y+8)
                        this.time.delayedCall(1000, ()=>draggable.anims.resume());
                        combo=0;
                    }else{
                        if(cancelPet!==undefined){
                            cancelPet.destroy();
                        }
                        cancelPet = this.time.delayedCall(200, ()=>{combo=0;}, this);
                    }
                }
                lastDist = 0;
            }
            lastAngle = pointer.angle;
            if(Phaser.Math.Distance.Between(pointer.x, pointer.y, draggable.x, draggable.y)>30 || pointer.isDown){
                combo=0;
            }
        }, this);
        this.debug = this.add.graphics({
            lineStyle:{
                color:0xff0000,
                width:2
            }
        });
        this.xvel_accum=0;
        this.input.on('drag', (pointer, object)=>{
            object.x=pointer.x; 
            object.y=pointer.y;
            //let newvelocity = (Math.sin(draggable.rotation)*-100*0.9)+(pointer.velocity.x*10*(Math.cos(draggable.rotation)+Math.cos(draggable.body.angularVelocity)))
            //let f_grav = Math.tan(draggable.rotation)*GRAVITY; 
            let f_grav = Math.sin(draggable.rotation)*GRAVITY; 
            let deltaV_x = (pointer.velocity.x*2*Math.cos(draggable.rotation));
            let deltaV_y = (pointer.velocity.y*3*Math.sin(draggable.rotation));
            //f_grav=Math.abs(draggable.angle)<90?-f_grav:f_grav;
            //let x_influence = (Math.cos(draggable.body.angularVelocity)+
            //    Math.cos(draggable.rotation))*pointer.velocity.x*10;
            //this.xvel_accum+=((Math.cos(draggable.rotation)*pointer.velocity.x)+Math.cos(f_grav));
            //let y_influence = Math.sin(draggable.rotation)*pointer.velocity.y+f_grav;
            //let newVel = Math.sqrt(x_influence*x_influence+y_influence*y_influence);
            //console.log(newVel);
            //draggable.setAngularVelocity(this.xvel_accum);
            draggable.setAngularVelocity(draggable.body.angularVelocity+deltaV_x+deltaV_y-f_grav);
        });
        this.input.on('dragend', ()=>{
            cursor.setFrame('hand_0')
            draggable.anims.resume();
        });
        this.draggable = draggable;

        this.input.keyboard.on('keydown-ESC', ()=>{
            this.scene.sleep();
            this.scene.resume("World");
        });
    }
    update(time, delta){
        // console.log(this.xvel_accum);
        // this.debug.clear();
        // let origin = this.draggable.getBottomCenter();
        // let f_grav = Math.tan(this.draggable.rotation)*GRAVITY; 
        
        // f_grav=Math.abs(this.draggable.angle)<90?-f_grav:f_grav;
        // let line = new Phaser.Geom.Line(origin.x, origin.y, origin.x, origin.y+f_grav);
        // line = Phaser.Geom.Line.RotateAroundPoint(line, origin, this.draggable.rotation+Math.PI/2 );
        // this.debug.strokeLineShape(line);
        // //console.log(f_grav);
        // //this.draggable.setAngularVelocity(50);
        // this.xvel_accum+=(f_grav);
        // this.xvel_accum*=0.9;
        // this.draggable.setAngularVelocity(this.xvel_accum);

        //console.log(vertical);
        let f_grav = Math.sin(this.draggable.rotation)*GRAVITY; 
        this.draggable.setAngularVelocity(this.draggable.body.angularVelocity*0.9-f_grav);
    }

}