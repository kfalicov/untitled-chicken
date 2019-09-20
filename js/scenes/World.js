import { Chunk } from "../terrain.js";
import {AnimatedParticle} from "../particle.js";
import { GrayscalePipeline, DistortPipeline, BloomPipeline, DistortPipeline2 } from "../shader/pipelines.js";
import { Chicken } from "../chicken.js";
import Cursor from "../cursor.js";
import {WeatherSystem} from "../WeatherSystem.js";

let gameScale=2;

export class World extends Phaser.Scene{
    constructor()
    {
        super('World');
    }
    preload(){     
        this.load.image('crystal', 'assets/crystal_7.png');  
        this.load.image('crystal_o', 'assets/crystal_overlay.png');  
        this.load.image('crystal_core', 'assets/crystal_core.png');  
        this.load.image('crystal_c', 'assets/crystal_cosmetic.png');  

        this.load.atlas('ship', 'assets/ship.png', 'assets/ship.json');
        this.load.spritesheet('smoke', 'assets/smoke.png',{frameWidth:16, frameHeight:16});
    }
    create(data){
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

        let weather = new WeatherSystem(this);
        this.weather=weather;

        this.background = this.add.container();
        let screenshadow = this.add.tileSprite(0,0,this.sys.canvas.width, this.sys.canvas.height,'black').setOrigin(0);
        this.weatherlayer = this.add.container();
        this.collisionlayer = this.add.container();
        //console.log(data);
        let player = new Chicken(this, 0,0,data.chickenColor, data.chickenType);
        this.foreground = this.add.container();
        this.overlay = this.add.container();
        //player.emitter = stepEmitter;
        //player.setDepth(2);
        this.player=player;

        /**
         * ship stuff
         */
        let shipBase = this.add.image(0,0,'ship','ship_base');
        let drawnRect = this.add.rectangle(shipBase.x-28, shipBase.y+8, 56, 16);
        let points = Phaser.Geom.Rectangle.Decompose(drawnRect.getBounds());

        drawnRect.isStroked = true;
        
        let particles = this.add.particles('smoke');
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
            let booster= this.add.image(points[i].x-drawnRect.getCenter().x, points[i].y+drawnRect.getCenter().y,'ship', tex).setOrigin(0.5,0.6);
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
        let ship = this.add.container(0,0,boosters);
        ship.setSize(shipBase.width, shipBase.height);
        ship.addAt(shipBase, 2);
        ship.setPosition(0,-180);

        ship.setInteractive();
        this.input.setDraggable(ship);

        drawnRect.setInteractive();
        this.input.setDraggable(drawnRect);
        
        this.input.on('drag', function (pointer, gameObject, dragX, dragY) {

            gameObject.x = dragX;
            gameObject.y = dragY;
            this.updateBoosters(boosters, ship, drawnRect);
            this.updateEmitters(emitters);
        }, this);

        this.boosters = boosters;
        this.emitters = emitters;
        this.drawnRect = drawnRect;
        this.ship = ship;
        /**
         * end ship stuff
         */
        this.shadows = this.add.container().setVisible(false);
        this.shadows.add(player.shadow);

        this.weatherlayer.add(player.reflection);

        screenshadow.alpha=0.25;
        //screenshadow.setBlendMode(Phaser.BlendModes.MULTIPLY);
        screenshadow.setScrollFactor(0);

        var shadowmask = new Phaser.Display.Masks.BitmapMask(this, this.shadows);
        screenshadow.setMask(shadowmask);

        this.weatherlayer.add(weather.getBackground());
        let clouds = this.add.tileSprite(0,0,this.sys.canvas.width, this.sys.canvas.height, 'clouds');
        clouds.setScrollFactor(0);
        clouds.tileScaleX = 2;
        clouds.tileScaleY = 2;

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
                
                this.background.add(newChunk.background.getChildren());
                this.collisionlayer.add(newChunk.collision.getChildren());
            }
        }

        /**
         * initialize player animations
         */

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
        this.input.on('gameout', function(){
            player.isPecking=false;
        }, this);
        
        this.activeTile=null;
        this.pointerXY = {x:0, y:0};
        let selecting = true;
        
        this.cursor = new Cursor(this, 0,0);
        this.cursor.setSelecting(selecting);
        this.input.on('wheel', ()=>{
            selecting = !selecting;
            this.cursor.setSelecting(selecting);
        })

        this.input.keyboard.on('keydown-ESC', ()=>{
            this.scene.pause();
            this.scene.run("Map");
        });

        let crystal_core = this.add.image(20,20,'crystal_core').setAlpha(0.9);
        crystal_core.setBlendMode(Phaser.BlendModes.SCREEN);
        let crystal_cosmetic = this.add.image(20,20,'crystal_c').setAlpha(0.6);
        let crystal_overlay = this.add.image(20,20,'crystal_o');
        let crystal = this.add.shader('Crystal', 20, 20, 64,64);
        crystal.setChannel0('crystal');
        crystal.setChannel1('chickenTex');
        this.crystal = crystal;
        //console.log(this.crystal.uniforms);

        this.player.outline.setMask(new Phaser.Display.Masks.BitmapMask(this, this.foreground));
        this.overlay.add(this.player.outline);
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
            emitter.setPosition(this.ship.x, this.ship.y);
        }
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

    lineCast(){
        let {x, y} = this.cameras.main.getWorldPoint(this.input.activePointer.x, this.input.activePointer.y);
        this.cursor.setMousePos({x,y});
        //console.log(this.hoverTween.data[0]);
        let chunkx = Math.floor(x/(this.tileSize*this.chunkSize));
        let chunky = Math.floor(y/(this.tileSize*this.chunkSize));
        let tilex = Math.floor(x/this.tileSize);
        let tiley = Math.floor(y/this.tileSize);
        if(tilex != this.pointerXY.x || tiley != this.pointerXY.y){
            this.pointerXY = {x:tilex, y:tiley};
            let activeChunk = this.getChunk(chunkx, chunky);
            if(activeChunk){
                this.activeTile = activeChunk.getTile(tilex, tiley);
            }
        }
    }

    getChunk(x, y){
        let newx = x-this.currentChunk.x+this.chunkRadius;
        let newy = y-this.currentChunk.y+this.chunkRadius;
        let chunkDiam = (this.chunkRadius * 2) +1;
        return this.chunks[newy*chunkDiam+newx];
    }

    update(time, delta){
        this.updateChicken(time, delta);
        this.updateChunks(time, delta);
        this.distortPipeline.setFloat1('time', time/10);
        this.distortPipeline2.setFloat1('time', time/10);
        this.marblePipeline.setFloat1('time', time/1000);
        this.scrollX-=0.15;
        this.scrollY-=0.02;
        this.clouds.tilePositionX=this.cameras.main.scrollX/2+this.scrollX;
        this.clouds.tilePositionY=this.cameras.main.scrollY/2+this.scrollY;
        this.weather.setPosition(this.cameras.main.worldView.x-64, this.cameras.main.worldView.y-64);
        this.lineCast();
        if(this.player.isPecking){
            if(this.activeTile!==null){
                this.activeTile.setFrame(9);
            }
        }
        this.cursor.update(time);
        
        this.drawnRect.x+=(this.ship.x-this.drawnRect.x)*.05;
        this.updateBoosters(this.boosters, this.ship, this.drawnRect);
        this.updateEmitters(this.emitters);
        
        this.crystal.setUniform('distance.value.x',this.player.x-this.crystal.x);
        this.crystal.setUniform('distance.value.y',this.player.y-this.crystal.y);
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
            this.background.removeAll();
            this.collisionlayer.removeAll();
            this.foreground.removeAll();
            for(let i=0;i<chunkDiameter;i++){
                for(let j=0;j<chunkDiameter;j++){
                    this.background.add(this.chunks[(i*chunkDiameter)+j].background.getChildren());
                    this.collisionlayer.add(this.chunks[(i*chunkDiameter)+j].collision.getChildren());
                    this.foreground.add(this.chunks[(i*chunkDiameter)+j].foreground.getChildren());
                }
            }
            this.player.outline.setMask(new Phaser.Display.Masks.BitmapMask(this, this.foreground));
            this.currentChunk = {x: snappedChunkX, y: snappedChunkY};
        }
    }
}
