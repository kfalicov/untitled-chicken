class Ship{
    constructor(x, y, scene){
        /**
         * ship stuff
         */
        let shipBase = scene.add.image(0,0,'ship','ship_base');
        let drawnRect = scene.add.rectangle(shipBase.x-28, shipBase.y+8, 56, 16);
        let points = Phaser.Geom.Rectangle.Decompose(drawnRect.getBounds());

        drawnRect.isStroked = true;
        
        let particles = scene.add.particles('smoke');
        var well = {
            active: true,
            update: function(particle){

                particle.velocityX = (Math.cos((particle.lifeCurrent/600)*Math.PI*6)*particle.maxVelocityX*1.5)*(1-particle.lifeT); 
            }
        }
        particles.addGravityWell(well);
        let boosters=[];
        let emitters = [];
        for(let i=0;i<4;i++){
            let tex = 'booster_'+(i<2?'back':'front');
            let booster= scene.add.image(points[i].x-drawnRect.getCenter().x, points[i].y+drawnRect.getCenter().y,'ship', tex).setOrigin(0.5,0.6);
            if(i==1||i==2){booster.flipX=true};
            boosters.push(booster);

            let emitter1 = particles.createEmitter({
                frame: 0,
                frequency: 20,
                quantity: {min:1,max:2},
                lifespan: {min:500, max:600},
                speed:{min:120, max:150},
                scale: {start: 1, end: 0.1},
                maxVelocityX: {onEmit: ()=>{return Math.sign(Math.random()-0.5)*100}},
                angle: { onEmit: ()=>{return booster.angle*5+(Math.random()*30)+75}},
                rotate: { onEmit: ()=>{return (Math.random()*360)}},
                timeScale:0.75
            });
            emitter1.startFollow(booster);
            emitters.push(emitter1);
            let emitter2 = particles.createEmitter({
                frame: 1,
                frequency: 50,
                quantity: {min:3,max:4},
                lifespan: {min:200, max:500},
                speed:{min:100, max:200},
                scale: {start: 1, end: 0.1},
                maxVelocityX: {onEmit: ()=>{return Math.sign(Math.random()-0.5)*100}},
                angle: { onEmit: ()=>{return booster.angle*5+(Math.random()*30)+75}},
                rotate: { onEmit: ()=>{return (Math.random()*360)}},
                timeScale:0.75
            });
            emitter2.startFollow(booster);
            emitters.push(emitter2);
            let emitter3 = particles.createEmitter({
                frame: 2,
                frequency: 80,
                quantity: {min:4,max:6},
                lifespan: {min:200, max:300},
                speed:{min:100, max:200},
                scale: {start: 1, end: 0.5},
                maxVelocityX: {onEmit: ()=>{return Math.sign(Math.random()-0.5)*100}},
                angle: { onEmit: ()=>{return booster.angle*5+(Math.random()*30)+75}},
                rotate: { onEmit: ()=>{return (Math.random()*360)}},
                timeScale:0.75
            });
            emitter3.startFollow(booster);
            emitters.push(emitter3);
        }
        let ship = scene.add.container(0,0,boosters);
        ship.setSize(shipBase.width, shipBase.height);
        ship.addAt(shipBase, 2);
        ship.setPosition(0,-180);

        ship.setInteractive();
        scene.input.setDraggable(ship);

        drawnRect.setInteractive();
        scene.input.setDraggable(drawnRect);
        
        scene.input.on('drag', function (pointer, gameObject, dragX, dragY) {

            gameObject.x = dragX;
            gameObject.y = dragY;
            this.updateBoosters(boosters, ship, drawnRect);
            this.updateEmitters(emitters);
        }, this);

        scene.boosters = boosters;
        scene.emitters = emitters;
        scene.drawnRect = drawnRect;
        scene.ship = ship;
        this.x = x, this.y = y;
    }

    normalize(array){
        let max = array.reduce((a,b)=>{return Math.max(a,b)})+10;
        let min = array.reduce((a,b)=>{return Math.min(a,b)})-10;
        let result = [];
        for (let val of array){
            let ans = (val-min)/(max-min);
            result.push(ans);
        }
        return result;
    }
    updateBoosters(boosters, ship, drawnRect){
        let points = Phaser.Geom.Rectangle.Decompose(drawnRect.getBounds());
        let distances=[];
        boosters.forEach((booster, index)=>{
            let b_point = {x:booster.x+ship.x, y:booster.y+ship.y};
            booster.rotation = Phaser.Math.Angle.Wrap(Phaser.Math.Angle.BetweenPoints(b_point, points[index])-Math.PI/2)*0.1;
            //booster.angle=45;
            distances.push(Math.floor(Phaser.Math.Distance.Between(b_point.x, b_point.y/2, drawnRect.x, drawnRect.y)));
        });
        let arr = this.normalize(distances);
        boosters.forEach((booster, index)=>{
            booster.y=arr[index]*10+(points[index].y-(drawnRect.y+drawnRect.height/3)-2)*(0.5+arr[index])+drawnRect.height+3;
        });
    }

    updateEmitters(emitters){
        for(let emitter of emitters){
            emitter.followOffset = {
                x: -Math.tan(emitter.follow.rotation)*50,
                y: Math.cos(emitter.follow.rotation)*9,
            }
            emitter.setPosition(this.x, this.y);
        }
    }
}
export default Ship;