import { Chunk } from "../terrain.js";
import {AnimatedParticle} from "../particle.js";
import { GrayscalePipeline, DistortPipeline, BloomPipeline, DistortPipeline2 } from "../shader/pipelines.js";
import { Chicken } from "../chicken.js";

let gameScale=2;

export class Scene extends Phaser.Scene{
    constructor()
    {
        super('Scene');
    }
    preload(){
        this.load.image('shadow', 'assets/chicken/shadow.png');
        this.load.image('black', 'assets/black.png');
        this.load.image('treetop', 'assets/terrain/treetop.png');
        this.load.spritesheet('standsheet_body', 'assets/chicken/stand_body.png', { frameWidth: 32, frameHeight: 32, endFrame: 4 });
        this.load.spritesheet('standsheet_head', 'assets/chicken/stand_head.png', { frameWidth: 32, frameHeight: 32, endFrame: 4 });
        //this.load.spritesheet('walksheet_body', 'assets/chicken/walk_headless.png', { frameWidth: 32, frameHeight: 32, endFrame: 2 });
        this.load.spritesheet('walksheet_body', 'assets/chicken/walk_body.png', { frameWidth: 32, frameHeight: 32, endFrame: 2 });
        this.load.spritesheet('walksheet_head', 'assets/chicken/walk_head.png', { frameWidth: 32, frameHeight: 32, endFrame: 1 });
        this.load.spritesheet('pecksheet_body', 'assets/chicken/peck_body.png', { frameWidth: 32, frameHeight: 32, endFrame: 4 });
        this.load.spritesheet('pecksheet_head', 'assets/chicken/peck_head.png', { frameWidth: 32, frameHeight: 32, endFrame: 4 });
        this.load.atlas('grass', 'assets/grass_tiles.png', 'assets/grass_tiles.json');
        //this.load.image('tiles', 'assets/grass_tiles.png');
        this.load.spritesheet('tiles_16', 'assets/terrain/16_terrain.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('tiles', 'assets/tiles.png', { frameWidth: 32, frameHeight: 32 });
        this.load.glsl('distort', 'js/shader/distort.frag', 'fragment');
        this.load.glsl('reflect', 'js/shader/reflect.frag', 'fragment');
        this.load.glsl('marblefrag', 'js/shader/marble.frag', 'fragment');
        this.load.glsl('pad', 'js/shader/pad.vs', 'vertex');
        this.load.image('clouds', 'assets/clouds2.png');
        this.load.spritesheet('particles', 'assets/particle.png',{frameWidth:16, frameHeight:16});
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

        var rainsplat = this.anims.get('rainsplat');
        if(rainsplat === undefined){
            rainsplat = this.anims.create({
                key:'splat',
                frames: this.anims.generateFrameNumbers('particles', {start:0, end: 4}),
                frameRate: 24,
                repeat:0
            });
        }
        class DropPart extends AnimatedParticle{
            constructor(emitter){
                super(emitter, rainsplat);
            }
        }
        let particles = this.add.particles('particles');
        let screenRect=new Phaser.Geom.Rectangle(0,0,this.sys.canvas.width+128, this.sys.canvas.height+128);
        this.rainEmitter = particles.createEmitter({
            //frame:0,
            x:0, y:0,
            speed: 0,
            lifespan: 600,
            quantity:2,
            frequency:1,
            alpha: {start:0.2,end:0.0},
            scale: 1,
            on:true,
            emitZone: {type: 'random', source:screenRect},
            particleClass: DropPart,
            blendMode: 'ADD',
        });
        particles.setDepth(1);
        let stepEmitter = particles.createEmitter({
            x:0, y:0,
            speed:0,
            lifespan: 600,
            quantity:1,
            alpha: {start:0.5, end:0.0},
            scale:2,
            on:false,
            particleClass: DropPart,
            blendMode: 'ADD',
        });

        let player = new Chicken(this, 0,0);
        player.emitter = stepEmitter;
        player.setDepth(2);
        this.player=player;

        this.shadows = this.add.container(0,0);
        this.shadows.add(player.shadow);

        let screenshadow = this.add.tileSprite(0,0,this.sys.canvas.width, this.sys.canvas.height,'black').setDepth(0.1).setOrigin(0);
        screenshadow.alpha=0.25;
        //screenshadow.setBlendMode(Phaser.BlendModes.MULTIPLY);
        screenshadow.setScrollFactor(0);

        var shadowmask = new Phaser.Display.Masks.BitmapMask(this, this.shadows);
        screenshadow.setMask(shadowmask);

        let clouds = this.add.tileSprite(0,0,this.sys.canvas.width, this.sys.canvas.height, 'clouds');
        clouds.setScrollFactor(0);
        clouds.setOrigin(0);
        this.scrollX=0;
        this.scrollY=0;
        this.shadows.add(clouds);
        
        this.clouds=clouds;

        //this.map = this.make.tilemap({tileWidth:32, tileHeight:32, width: tilesdiam, height: tilesdiam});
        //this.tileset = this.map.addTilesetImage('tiles');
        //this.groundlayer = this.map.createBlankDynamicLayer('ground',this.tileset, -this.chunkRadius*this.chunkSize*this.tileSize, -this.chunkRadius*this.chunkSize*this.tileSize );

        //console.log(this.cache.shader.get('pad'))
        //let reflection = this.add.shader('reflect', 0,0,32,32);
        //reflection.setChannel0(this.player.texture.key);

        this.marblePipeline = this.game.renderer.addPipeline('Marble', 
            new Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline({
                game: this.game, 
                renderer: this.game.renderer,
                vertShader: this.cache.shader.get('pad').vertexSrc,
                fragShader: this.cache.shader.get('marblefrag').fragmentSrc
            })
        );
        this.marblePipeline.setFloat2('resolution', 320, 240);

        this.distortPipeline = this.game.renderer.addPipeline('Distort', 
            new Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline({
                game: this.game, 
                renderer: this.game.renderer,
                vertShader: this.cache.shader.get('pad').vertexSrc,
                fragShader: this.cache.shader.get('distort').fragmentSrc
            })
        );
        this.distortPipeline2 = this.sys.game.renderer.pipelines['Distort2'];
        if(!this.distortPipeline2){
            this.distortPipeline2 = this.game.renderer.addPipeline('Distort2', new DistortPipeline2(this.game));
        }
        this.bloomPipeline = this.sys.game.renderer.pipelines['Bloom'];
        if(!this.bloomPipeline){
            this.bloomPipeline = this.game.renderer.addPipeline('Bloom', new BloomPipeline(this.game));
        }
       // this.cameras.main.setRenderToTexture('Distort');
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
        let walkframes_headless = this.anims.generateFrameNumbers('walksheet_body', {frames: [0,1,0,2]});
        let peckframes_body = this.anims.generateFrameNumbers('pecksheet_body', {start:0, end: 4});
        let walkframes_body = this.anims.generateFrameNumbers('walksheet_body', {frames: [0,1,0,2]});
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

        this.cameras.main.setSize(320,240);
        
        this.cameras.main.zoom=1;
        this.cameras.main.startFollow(player, true, 0.1, 0.1);
        //this.cameras.main.setRenderToTexture('Marble');
        
        //this.cameras.main.zoom=2;
        
        for(let i=0;i<this.chunks.length;i++){
            this.chunks[i].collider = this.physics.add.collider(player, this.chunks[i].collision);
        }
        this.movement = this.input.keyboard.addKeys({
            up: 'W',
            left: 'A',
            down: 'S',
            right: 'D'
        })

        this.walking=false;

        let q = this.input.keyboard.addKey('Q');
        let intensity = 0;
        q.on('down',()=>{
            intensity=(intensity+1)%2;
            this.distortPipeline.setFloat1('intensity',intensity);
            console.log(intensity);
            //this.cameras.main.shake();
        }, this);

        this.input.on('pointermove', (pointer)=>{
            //console.log(pointer.x-160, pointer.y-120);
            this.cameras.main.setFollowOffset((-pointer.x+this.sys.canvas.width/2)/6, (-pointer.y+this.sys.canvas.height/2)/6);
        }, this);

        this.input.on('pointerdown', function(pointer){
           //this.pecking=true;
           player.isPecking=true;
           player.clicked=true;
        }, this);
        this.input.on('pointerup', function(pointer){
            //this.pecking=true;
            player.isPecking=false;
         }, this);
        
        this.autoPeck = true;
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
        this.distortPipeline.setFloat1('time', time/10);
        this.distortPipeline2.setFloat1('time', time/10);
        this.marblePipeline.setFloat1('time', time/1000);
        this.scrollX-=0.15;
        this.clouds.tilePositionX=this.cameras.main.scrollX;
        this.clouds.tilePositionY=this.cameras.main.scrollY;
        this.rainEmitter.setPosition(this.cameras.main.worldView.x-64, this.cameras.main.worldView.y-64);
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
        this.player.body.setAcceleration(forcex, forcey);
        //let flip = Math.max(this.chicken.x-this.input.activePointer.x, 0);
        //let flip = Math.max(this.chicken.x-this.cameras.main.midPoint.x, 0);
        let chickenXreltoCenter = this.player.x-this.cameras.main.midPoint.x;
        let mouseXreltoCenter = this.input.activePointer.x-160;
        
        let flip = Math.sign(mouseXreltoCenter-chickenXreltoCenter);
        this.player.setFlip(flip-1, false);

        if(this.player.body.speed>=40){
            this.walking = true;
            this.player.isMoving=true;
        }else{
            this.walking = false;
            this.player.isMoving=false;
        }
        
        
    }
    updateChunks(time, delta){
        var snappedChunkX = Math.floor(this.player.x/(this.chunkSize*this.tileSize));
        var snappedChunkY = Math.floor(this.player.y/(this.chunkSize*this.tileSize));
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
                topLeftChunk.load(this.player);
                this.chunks.unshift(topLeftChunk);
                for(let i=1;i<chunkDiameter;i++){
                    this.chunks[i*chunkDiameter].unload();
                    var newChunk = new Chunk(this, snappedChunkX-this.chunkRadius, snappedChunkY-this.chunkRadius+i);
                    this.chunks[i*chunkDiameter] = newChunk;
                    newChunk.load(this.player);
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
                    newChunk.load(this.player);
                }
                let bottomRightChunk = new Chunk(this, snappedChunkX+this.chunkRadius, 
                snappedChunkY+this.chunkRadius);
                bottomRightChunk.load(this.player);
                this.chunks.push(bottomRightChunk);
                this.chunks.shift().unload();
            }
            if(snappedChunkY < this.currentChunk.y){
                console.log('moved up');
                for(let i=0;i<chunkDiameter;i++){
                    var newChunk = new Chunk(this, (snappedChunkX+this.chunkRadius)-i, snappedChunkY-this.chunkRadius);
                    newChunk.load(this.player);
                    this.chunks.unshift(newChunk);
                    this.chunks.pop().unload();
                }
            }else if(snappedChunkY > this.currentChunk.y){
                console.log('moved down');
                for(let i=0;i<chunkDiameter;i++){
                    var newChunk = new Chunk(this, (snappedChunkX-this.chunkRadius)+i, snappedChunkY+this.chunkRadius);
                    newChunk.load(this.player);
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
