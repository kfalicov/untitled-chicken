const GRAVITY = 40;

export class Map extends Phaser.Scene{
    constructor(){
        super('Map');
    }
    preload(){
        this.load.atlas('pointer', 'assets/pointer.png', 'assets/pointer.json');
    }
    create(){
        this.sys.canvas.style.cursor = "none";
        
        let draggable = this.physics.add.sprite(40,40,'key').setInteractive().setOrigin(0.5,0.05);

        let cursor = this.add.image(this.input.activePointer.x, this.input.activePointer.y, 'pointer', 'hand_point').setOrigin(0.3);
        this.input.on('pointermove', (event)=>{cursor.setPosition(event.x, event.y)});
        this.input.setDraggable(draggable);
        draggable.on('pointerover', ()=>{
            cursor.setFrame('hand_open');
        });
        draggable.on('pointerout', ()=>{cursor.setFrame('hand_point')});
        this.input.on('dragstart', (e)=>{
            cursor.setFrame('hand_closed');
            draggable.setPosition(e.x, e.y);
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
                if(lastDist<300){
                    //console.log('small enough');
                    combo++;
                    if(combo>3){
                        console.log("pet");
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
            if(Phaser.Math.Distance.Between(pointer.x, pointer.y, draggable.x, draggable.y)>30){
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
        this.input.on('dragend', ()=>{cursor.setFrame('hand_open')});
        this.draggable = draggable;
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