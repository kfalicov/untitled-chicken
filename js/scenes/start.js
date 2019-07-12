import { Chunk } from "../terrain.js";

export class player extends Phaser.Scene{
    constructor()
    {
        super('Player');
    }
    preload(){
        this.load.image('shadow', 'assets/chicken/shadow.png');
        this.load.image('treetop', 'assets/terrain/treetop.png');
        this.load.spritesheet('standsheet_body', 'assets/chicken/stand_body.png', { frameWidth: 32, frameHeight: 32, endFrame: 4 });
        this.load.spritesheet('walksheet_headless', 'assets/chicken/walk_headless.png', { frameWidth: 32, frameHeight: 32, endFrame: 2 });
        this.load.spritesheet('walksheet_body', 'assets/chicken/walk_body.png', { frameWidth: 32, frameHeight: 32, endFrame: 2 });
        this.load.spritesheet('pecksheet_body', 'assets/chicken/peck_body.png', { frameWidth: 32, frameHeight: 32, endFrame: 4 });
        this.load.spritesheet('pecksheet_head', 'assets/chicken/peck_head.png', { frameWidth: 32, frameHeight: 32, endFrame: 4 });
        this.load.atlas('grass', 'assets/grass_tiles.png', 'assets/grass_tiles.json');
        //this.load.image('tiles', 'assets/grass_tiles.png');
        this.load.spritesheet('tiles_16', 'assets/terrain/16_terrain.png', { frameWidth: 16, frameHeight: 16 })
        this.load.spritesheet('tiles', 'assets/tiles.png', { frameWidth: 32, frameHeight: 32 });
    }
    create(){
        /**
         * initialize world
         */
        this.chunkSize = 8;
        this.tileSize = 32;
        this.chunks = [];
        this.currentChunk = {x:0,y:0};
        this.chunkRadius = 1;

        let chunkdiam = (2*this.chunkRadius)+1;
        let tilesdiam = chunkdiam*this.chunkSize;

        //this.map = this.make.tilemap({tileWidth:32, tileHeight:32, width: tilesdiam, height: tilesdiam});
        //this.tileset = this.map.addTilesetImage('tiles');
        //this.groundlayer = this.map.createBlankDynamicLayer('ground',this.tileset, -this.chunkRadius*this.chunkSize*this.tileSize, -this.chunkRadius*this.chunkSize*this.tileSize );

        
        //groundlayer.putTilesAt(newChunk.arr,4,4);
        //console.log(newChunk.arr);
        let chunkoffset=this.chunkSize*this.chunkRadius;

        for(let y = this.currentChunk.y-this.chunkRadius; y<=this.currentChunk.y+this.chunkRadius; y++){
            for(let x = this.currentChunk.x-this.chunkRadius; x<=this.currentChunk.x+this.chunkRadius; x++){
                var newChunk = new Chunk(this, x, y);
                //newChunk.load();
                //this.groundlayer.putTilesAt(newChunk.arr,chunkoffset+this.chunkSize*x, chunkoffset+this.chunkSize*y);
                this.chunks.push(newChunk);
                newChunk.load();
            }
        }

        /**
         * initialize player animations
         */
        let standframes_body = this.anims.generateFrameNumbers('standsheet_body', {start:0, end: 4});
        let walkframes_headless = this.anims.generateFrameNumbers('walksheet_headless', {frames: [0,1,0,2]});
        let peckframes_body = this.anims.generateFrameNumbers('pecksheet_body', {start:0, end: 4});
        let walkframes_body = this.anims.generateFrameNumbers('walksheet_body', {frames: [0,1,2,1]});
        let peckframes_head = this.anims.generateFrameNumbers('pecksheet_head', {start:0, end: 4});
        walkframes_headless[1].duration = 50;
        walkframes_headless[3].duration = 50;
        walkframes_body[1].duration = 50;
        walkframes_body[3].duration = 50;
        peckframes_body[1].duration = 10;
        peckframes_body[4].duration = 30;
        peckframes_head[1].duration = 10;
        peckframes_head[4].duration = 30;

        this.cameras.main.setBackgroundColor('#aaaaaa');

        this.anims.create({
            key: 'stand_body',
            frames: standframes_body,
            frameRate: 12,
        });
        this.anims.create({
            key: 'walk_headless',
            frames: walkframes_headless,
            frameRate: 15,
        }).skipMissedFrames=true;
        this.anims.create({
            key: 'walk_body',
            frames: walkframes_body,
            frameRate: 15,
        }).skipMissedFrames=true;
        this.anims.create({
            key: 'peck_body',
            frames: peckframes_body,
            frameRate: 30,
        });
        this.anims.create({
            key: 'peck_head',
            frames: peckframes_head,
            frameRate: 30,
        });

        var shadow = this.add.image(0,0,'shadow');
        shadow.alpha=0.5;
        shadow.setBlendMode(Phaser.BlendModes.MULTIPLY);
        var body = this.add.sprite(0,0,'standsheet_body').play('stand_body');
        var head = this.add.sprite(0,0,'standsheet_body').play('peck_head');
        head.setVisible(true);

        let chicken = this.add.container(0,0,[shadow, body, head]);
        chicken.setSize(32,32);
        this.physics.world.enable(chicken);

        
        chicken.depth = 2;

        this.cameras.main.startFollow(chicken);
        this.cameras.main.setLerp(0.1,0.1);
        this.cameras.main.roundPixels=true;
        
        //this.cameras.main.zoom=0.1;
        //let chicken = this.physics.add.sprite(32,32, 'standsheet').play('walk');
        //chicken.setDamping(true);
        chicken.body.useDamping = true;
        chicken.body.setMaxSpeed(100);
        chicken.body.drag.set(0.9, 0.9);
        chicken.body.setSize(26, 16);
        chicken.body.setOffset(3, 14);
        
        for(let i=0;i<this.chunks.length;i++){
            this.chunks[i].collider = this.physics.add.collider(chicken, this.chunks[i].collision);
        }
        this.movement = this.input.keyboard.addKeys({
            up: 'W',
            left: 'A',
            down: 'S',
            right: 'D'
        })

        this.walking=false;

        let zoom = 2;
        let zoomlevels = [0.25, 0.5, 1, 2, 4, 8]
        let q = this.input.keyboard.addKey('Q');
        q.on('down',()=>{
            zoom = (zoom+1)%zoomlevels.length;
            console.log(zoom);
            this.cameras.main.zoom=zoomlevels[zoom];
        }, this);

        this.input.on('pointermove', (pointer)=>{
            //console.log(pointer.x-160, pointer.y-120);
            this.cameras.main.setFollowOffset((-pointer.x+160)/6, (-pointer.y+120)/6);
        }, this);

        this.input.on('pointerdown', function(pointer){
           this.pecking=true;
        }, this);
        
        body.on('animationcomplete', (animation, frame)=>{
            if(animation.key ==="peck_body"){
                this.pecking=false;
            }
        }, this);
        head.on('animationcomplete', (animation, frame)=>{
            if(animation.key ==="peck_head"){
                this.pecking=false;
            }
        }, this);
        
        this.autoPeck = true;
        
        
        this.chicken = chicken;
        //console.log(chicken.list)
    }

    getChunk(x, y){
        var chunk = null;
        for(var i=0; i<this.chunks.length;i++){
            if (this.chunks[i].x == x && this.chunks[i].y == y){
                chunk = this.chunks[i];
                break;
            }
        }
        return chunk;
    }

    update(time, delta){
        this.updateChicken(time, delta);
        this.updateChunks(time, delta);
    }
    updateChicken(time,delta){
        let accelval = 1500;
        let forcex = 0;
        let forcey = 0;
        if(this.movement.up.isDown){
            forcey-=accelval;
        }
        if(this.movement.down.isDown){
            forcey+=accelval;
        }
        if(this.movement.left.isDown){
            forcex-=accelval;
        }
        if(this.movement.right.isDown){
            forcex+=accelval;
        }
        this.chicken.body.setAcceleration(forcex, forcey);
        //let flip = Math.max(this.chicken.x-this.input.activePointer.x, 0);
        //let flip = Math.max(this.chicken.x-this.cameras.main.midPoint.x, 0);
        let chickenXreltoCenter = this.chicken.x-this.cameras.main.midPoint.x;
        let mouseXreltoCenter = this.input.activePointer.x-160;
        
        let flip = Math.max(chickenXreltoCenter-mouseXreltoCenter, 0);
        this.chicken.each(entity => entity.flipX=flip);
        
        let body = this.chicken.list[1];
        let head = this.chicken.list[2];

        let bodyanims = body.anims;
        let headanims = head.anims;

        if(this.chicken.body.speed>=40){
            this.walking = true;
        }else{
            this.walking = false;
        }
        
        if(this.autoPeck && this.input.activePointer.isDown){
            this.pecking=true;
        }
        if(this.pecking){
            if(bodyanims.currentAnim.key==="peck_body"){
                let progress= bodyanims.getProgress();
                if(this.walking){
                    bodyanims.play("walk_headless");
                    headanims.play("peck_head");
                    headanims.setProgress(progress);
                    head.setVisible(true);
                }else{
                    bodyanims.play("peck_body", true);
                    head.setVisible(false);
                }
            }else if(headanims.currentAnim.key==="peck_head"){
                let progress= headanims.getProgress();
                if(this.walking){
                    headanims.play("peck_head", true);
                    bodyanims.play("walk_headless", true);
                    head.setVisible(true);
                }else{
                    bodyanims.play("peck_body", true);
                    bodyanims.setProgress(progress);
                    head.setVisible(false);
                }
            }else{
                if(this.walking){
                    headanims.play("peck_head", true);
                    bodyanims.play("walk_headless", true);
                    head.setVisible(true);
                }else{
                    bodyanims.play("peck_body", true);
                    head.setVisible(false);
                }
            }
        }else{
            //console.log("not pecking");
            head.setVisible(false);
            if(this.walking){
                let progress=0;
                if(bodyanims.currentAnim.key==="peck_body"){
                    progress=bodyanims.getProgress();
                }
                bodyanims.play("walk_body", true);
                if(progress!==0){
                    bodyanims.setProgress(progress);
                }
            }else{
                bodyanims.play("stand_body", true);
            }
        }
    }
    updateChunks(time, delta){
        var snappedChunkX = Math.floor(this.chicken.x/(this.chunkSize*this.tileSize));
        var snappedChunkY = Math.floor(this.chicken.y/(this.chunkSize*this.tileSize));
        if(snappedChunkX!=this.currentChunk.x || snappedChunkY!=this.currentChunk.y){
            let chunkWorldX = (snappedChunkX-1)*this.chunkSize*this.tileSize;
            let chunkWorldY = (snappedChunkY-1)*this.chunkSize*this.tileSize;
            //this.groundlayer.setPosition(chunkWorldX,chunkWorldY);

            let chunkDiameter = (this.chunkRadius*2)+1;
            //console.log(snappedChunkX, snappedChunkY);
            if(snappedChunkX < this.currentChunk.x){
                console.log('moved left');
                /* for(let i=chunkDiameter-2;i>=0;i--){
                    this.groundlayer.copy(this.chunkSize*i, 0, this.chunkSize, this.chunkSize*chunkDiameter, this.chunkSize*(i+1), 0);
                } */
                let topLeftChunk = new Chunk(this, snappedChunkX-this.chunkRadius, 
                snappedChunkY-this.chunkRadius);
                topLeftChunk.load(this.chicken);
                this.chunks.unshift(topLeftChunk);
                for(let i=1;i<chunkDiameter;i++){
                    this.chunks[i*chunkDiameter].unload();
                    var newChunk = new Chunk(this, snappedChunkX-this.chunkRadius, snappedChunkY-this.chunkRadius+i);
                    this.chunks[i*chunkDiameter] = newChunk;
                    newChunk.load(this.chicken);
                }
                this.chunks.pop().unload();
            }else if(snappedChunkX > this.currentChunk.x){
                console.log('moved right');
                /* for(let i=1;i<chunkDiameter;i++){
                    this.groundlayer.copy(this.chunkSize*i,0,this.chunkSize, this.chunkSize*chunkDiameter, this.chunkSize*(i-1),0);
                } */
                for(let i=1;i<chunkDiameter;i++){
                    this.chunks[i*chunkDiameter].unload();
                    var newChunk = new Chunk(this, snappedChunkX+this.chunkRadius, snappedChunkY-this.chunkRadius+(i-1));
                    this.chunks[i*chunkDiameter] = newChunk;
                    newChunk.load(this.chicken);
                }
                let bottomRightChunk = new Chunk(this, snappedChunkX+this.chunkRadius, 
                snappedChunkY+this.chunkRadius);
                bottomRightChunk.load(this.chicken);
                this.chunks.push(bottomRightChunk);
                this.chunks.shift().unload();
            }
            if(snappedChunkY < this.currentChunk.y){
                console.log('moved up');
                for(let i=0;i<chunkDiameter;i++){
                    var newChunk = new Chunk(this, (snappedChunkX+this.chunkRadius)-i, snappedChunkY-this.chunkRadius);
                    newChunk.load(this.chicken);
                    this.chunks.unshift(newChunk);
                    this.chunks.pop().unload();
                }
            }else if(snappedChunkY > this.currentChunk.y){
                console.log('moved down');
                for(let i=0;i<chunkDiameter;i++){
                    var newChunk = new Chunk(this, (snappedChunkX-this.chunkRadius)+i, snappedChunkY+this.chunkRadius);
                    newChunk.load(this.chicken);
                    this.chunks.push(newChunk);
                    this.chunks.shift().unload();
                }
            }
            
            for(let i=0;i<chunkDiameter;i++){
                for(let j=0;j<chunkDiameter;j++){
                    this.chunks[(i*chunkDiameter)+j].foreground.setDepth(i+2);
                }
            }
            this.currentChunk = {x: snappedChunkX, y: snappedChunkY};
        }
    }
}