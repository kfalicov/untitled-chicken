import { Tree } from "./objects/tree";

export class Chunk{
    constructor(scene, x, y){
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.background = this.scene.add.group();
        this.collision = this.scene.physics.add.staticGroup();
        this.foreground = this.scene.add.group();
        this.collider = null;
        this.isLoaded = false;
        this.arr = [];
        this.dirty=false; //should this chunk be saved?
    }
    getTile(x, y){
        let newx = ((x%this.scene.chunkSize)+8)%8;
        let newy = ((y%this.scene.chunkSize)+8)%8;
        //console.log(this.arr[newy][newx]);
        return this.arr[newy][newx];
    }
    unload(){
        if(this.isLoaded){
            this.background.clear(true, true);
            this.collision.clear(true,true);
            this.foreground.clear(true,true);
            if(this.collider!==null){
                this.collider.destroy();
            }
            this.isLoaded = false;
        }
    }
    load(chicken){
        if(!this.isLoaded){
            for (var y = 0; y < this.scene.chunkSize; y++) {
                let row = [];
                for (var x = 0; x < this.scene.chunkSize; x++) {
                    var tileX = (this.x * (this.scene.chunkSize * this.scene.tileSize)) + (x * this.scene.tileSize);
                    var tileY = (this.y * (this.scene.chunkSize * this.scene.tileSize)) + (y * this.scene.tileSize);
                    
                    
                    var forest= noise.perlin2((tileX-4900)/-2000,tileY/2000);
                    var misctrees= noise.perlin2(tileX/-900,tileY/-900);
                    var scatter=noise.perlin2(tileX/10,tileY/10);

                    var rock = noise.perlin2(tileX/5000, tileY/5000);

                    //var river = noise.simplex3(tileX/(rock*10),tileY/(rock*10), 2000);
                    //var ridge = 1-Math.abs(river);
                    
                    var key="";
                    var animationKey = "";
                    let index=1;

                    //var forestbiome= noise.perlin2(tileX/650,tileY/650);
                    //var treespread=noise.simplex2(tileX/10,tileY/10);
                    //forestbiome>0.1 && treespread<=-.48
                    
                    let isMountain=false;
                    let isTree=false;
                    let isRiver=false;
                    if(forest>0.45 && scatter>0.15){
                        isTree=true;
                    }else if(forest>0.38 && scatter>.25){
                        isTree=true;
                    }else if(forest>0.33 && scatter>.35){
                        isTree=true;
                    }

                    if(misctrees>0.25 && scatter>.25){
                        isTree=true;
                    }else if(misctrees>-0.45 && scatter>.60){//"anywhere" trees
                        isTree=true;
                    }
                    
                    if(rock>0.58){
                        isMountain=true;
                    }else if(rock>0.56 && scatter>=-.2){
                        isMountain=true;
                    }else if(rock>0.54 && scatter>=0){
                        isMountain=true;
                    }else if(rock>0.52 && scatter>=.25){
                        isMountain=true;
                    }

                    /* if(ridge<-0.9 || ridge>0.9){
                        isRiver=true;
                    } */

                    if(isMountain){
                        index=6;
                    }
                    if(isRiver){
                        index=0;
                    }
                    if(index==1){
                        var terrainvariation = noise.perlin2(tileX/100, tileY/200);
                        if(terrainvariation > 0 && terrainvariation<=0.005){
                            key="grass_04";
                            index+=4;
                        }else if(terrainvariation > 0.25 && terrainvariation <= 0.3){
                            key = "grass_02";
                            index+=2;
                        }else if(terrainvariation > 0.3 && terrainvariation <= 0.35){
                            key= "grass_01";
                            index+=1;
                        }
                        else if(terrainvariation > 0.005 && terrainvariation<0.015){
                            key="grass_03";
                            index+=3;
                        }else{
                            key="grass_00";
                            index=1;
                        }
                    }
                    //var tile = new Tile(this.scene, tileX, tileY, key);
                    var floor = this.scene.add.image(tileX, tileY, 'tiles', index).setOrigin(0);
                    this.background.add(floor);
                    if(isTree){
                        var treeoffsetx=noise.perlin2(tileX/-20, (tileY+800)/20);
                        var treeoffsety=noise.perlin2((tileX-800)/-20, (tileY)/-20);
                        let treeHeight=1;
                        //treeoffsetx=1-Math.abs(treeoffsetx);
                        let offX = Math.min(Math.max(Math.round(treeoffsetx*8)*2, -8), 8);
                        let offY = Math.min(Math.max(Math.round(treeoffsety*8)*2, -8), 8);
                        var stump = this.scene.add.image(tileX+16+offX, tileY+16+offY, 'tiles_16',1);
                        this.collision.add(stump);
                        let i;
                        for(i=0;i<treeHeight;i++){
                            let trunk = this.scene.add.image(tileX+16+offX, tileY-(i*16)+offY, 'tiles_16',2);
                            this.foreground.add(trunk);
                        }
                        let top = this.scene.add.image(tileX+16+offX, tileY-(i*16)+offY, 'treetop');
                        this.foreground.add(top);
                    }
                    //tile.setTint(terrainvariation*0xffffff);

                    row.push(floor);
                }
                this.arr.push(row);
            }
            this.isLoaded=true;
            this.dirty=false;
        }
        if(chicken && this.collider===null){
            this.scene.physics.add.collider(chicken, this.collision);
        }
    }
}

class ImprovedChunk extends Phaser.GameObjects.RenderTexture{
    constructor(scene, x, y){
        super(scene, x*16*8, y*16*8, 16*8, 16*8);
        scene.add.existing(this);
        //console.log(scene)
        let chunkSize = 16;
        let tileSize = 8;
        
        /* let originy = (y*tileSize*chunkSize);
        let originx = (x*tileSize*chunkSize);

        let verts = new Uint8Array((chunkSize+1)*(chunkSize+1));
        let tiles = new Uint8Array(chunkSize*chunkSize);
        for(let i=0;i<17*17;i++){
            let col=i%17;
            let row=Math.floor(i/17);
            let value = noise.perlin2((originx+col*tileSize)/100, (originy+row*tileSize)/100)>-0.25? true:false;
            verts[i]=value;
            if(row>0&&col>0){
                let top=((row-1)*17)+col;
                let bottom=((row)*17)+col;
                scene.add.image(originx+(col-1)*8, originy+(row-1)*8, 'tiles_8', 2)
                if(verts[top-1]===1 && verts[bottom-1]===1 && verts[top]===1 && verts[bottom]===1){
                    //this.drawFrame('tiles_8', 2, (col-1)*8, (row-1)*8);
                    tiles[(row-1)*chunkSize+(col-1)]=2;
                }
            }
        } */
        //console.log(tiles)
        // let j = 0;
        // while(j<tiles.length){
        //     this.drawFrame('tiles_8', tiles[j++], j, j);
        // }
        //console.log(verts);

        let vertices = [];
        for(let i=0;i<=chunkSize; i++){
            let tileY = (y*tileSize*chunkSize)+(i*tileSize);
            for(let j=0;j<=chunkSize;j++){
                let tileX = (x*tileSize*chunkSize)+(j*tileSize);
                var forest= noise.perlin2(tileX/100, tileY/100);
                //console.log(forest);
                let isForest = forest>-0.25? true : false;
                vertices.push(isForest);
            }
        }
        for(let i=0;i<16;i++){
            for(let j=0;j<16;j++){
                let top = (i*17)+j;
                let bottom = ((i+1)*17)+j;
                let bool = (vertices[top]<<3)|(vertices[top+1]<<2)|(vertices[bottom]<<1)|vertices[bottom+1];
                //let topLeft = vertices[top];
                //let topRight = vertices[top+1];
                //let bottomLeft = vertices[bottom];
                //let bottomRight = vertices[bottom+1];
                switch(bool){
                    case 0b0001:
                    case 0b0010:
                    case 0b0100:
                    case 0b1000:
                    case 0b1001:
                    case 0b0110:
                    case 0b0000:
                        this.drawFrame('tiles_8', 1, j*8, i*8);
                        break;
                    case 0b1100:
                        var image = scene.make.image({x:0,y:0, key:'tiles_8', frame: [3,4,5,6]}).setOrigin(0);
                        this.draw(image, j*8, i*8);
                        image.destroy();
                        break;
                    case 0b0011:
                        var image = scene.make.image({x:0,y:0, key:'tiles_8', frame: [15,16,17,18]}).setOrigin(0);
                        this.draw(image, j*8, i*8);
                        image.destroy();
                        break;
                    case 0b1101:
                        var image = scene.make.image({x:0,y:0, key:'tiles_8', frame: [19,20]}).setOrigin(0);
                        this.draw(image, j*8, i*8);
                        image.destroy();
                        break;
                    case 0b1110:
                        var image = scene.make.image({x:0,y:0, key:'tiles_8', frame: [19,20], flipX: true}).setOrigin(0);
                        this.draw(image, j*8, i*8);
                        image.destroy();
                        break;
                    case 0b0101:
                        var image = scene.make.image({x:0,y:0, key:'tiles_8', frame: [7,8,9,10,11,12,13,14]}).setOrigin(0);
                        this.draw(image, j*8, i*8);
                        image.destroy();
                        break;
                    case 0b1010:
                        var image = scene.make.image({x:0,y:0, key:'tiles_8', frame: [7,8,9,10,11,12,13,14], flipX:true}).setOrigin(0);
                        this.draw(image, j*8, i*8);
                        image.destroy();
                        break;
                    case 0b0111:
                        var image = scene.make.image({x:0,y:0, key:'tiles_8', frame: [21,22]}).setOrigin(0);
                        this.draw(image, j*8, i*8);
                        image.destroy();
                        break;
                    case 0b1011:
                        var image = scene.make.image({x:0,y:0, key:'tiles_8', frame: [21,22], flipX: true}).setOrigin(0);
                        this.draw(image, j*8, i*8);
                        image.destroy();
                        break;
                    case 0b1111:
                    default:
                        this.drawFrame('tiles_8', 2, j*8, i*8);
                        break;
                }
            }
        }
    }
}

function createChunk(scene, x, y, existing){
    let chunkSize = 32;
    let tileSize = 8;
    let originy = (y*tileSize*chunkSize);
    let originx = (x*tileSize*chunkSize);
    var hadChildren=false;
    if(existing){
        hadChildren=true;
        //existing.clear();
    }
    var blitter = existing? existing.setPosition(originx, originy) : scene.add.blitter(originx, originy, 'tiles_8');
    
    let verts = new Uint8Array((chunkSize+1)*(chunkSize+1));
    let tiles = new Uint8Array(chunkSize*chunkSize);

    for(let i=0;i<(chunkSize+1)*(chunkSize+1);i++){
        let col=i%(chunkSize+1);
        let row=Math.floor(i/(chunkSize+1));
        let value = noise.perlin2((originx+col*tileSize)/100, (originy+row*tileSize)/100)>-0.25? true:false;
        verts[i]=value;
        if(row>0&&col>0){
            let top=((row-1)*(chunkSize+1))+col;
            let bottom=((row)*(chunkSize+1))+col;
            let num;
            let bool = (verts[top-1]<<3)|(verts[top]<<2)|(verts[bottom-1]<<1)|verts[bottom];
            let flip=false;
            switch(bool){
                case 0b0001:
                case 0b0010:
                case 0b0100:
                case 0b1000:
                case 0b1001:
                case 0b0110:
                case 0b0000:
                    num=1;
                    break;
                case 0b1100:
                    num=Phaser.Math.RND.pick([3,4,5,6]);
                    break;
                case 0b1110: flip=true;
                case 0b1101:
                    num=Phaser.Math.RND.pick([7,8]);
                    break;
                case 0b1010: flip=true;
                case 0b0101:
                    num=Phaser.Math.RND.pick([9,10,11,12,13,14,15,16]);
                    break;
                case 0b1011: flip=true;
                case 0b0111:
                    num=Phaser.Math.RND.pick([17,18]);
                    break;
                case 0b0011:
                    num=Phaser.Math.RND.pick([19,20,21,22]);
                    break;
                case 0b1111:
                default:
                    num=2;
                    break;
            }
            let bob;
            if(hadChildren){
                let i = (row-1)*chunkSize+(col-1);
                bob=blitter.children.getAt(i);
                bob.setFrame(num);
                bob.flipX=flip;
            }else{
                bob=blitter.create((col-1)*tileSize, (row-1)*tileSize, num);
            }
            bob.flipX = flip;
        }
    }
    return blitter;
}

export class Ground{
    chunks=[];
    lastOrigin={x:0,y:0};
    scene;
    constructor(scene, origin, renderDistance){
        this.renderDistance = renderDistance;
        this.scene = scene;
        this.loadAllChunks(origin);
    }
    loadAllChunks(origin){
        this.lastOrigin=origin;
        for(let y = origin.y-this.renderDistance.y; y<=origin.y+this.renderDistance.y; y++){
            for(let x = origin.x-this.renderDistance.x; x<=origin.x+this.renderDistance.x; x++){
                var newChunk = createChunk(this.scene, x, y);
                this.chunks.push(newChunk);
            }
        }
    }
    fetch(origin){
        if(origin.x != this.lastOrigin.x || origin.y != this.lastOrigin.y){
            let renderDiameter = {x: this.renderDistance.x*2+1, y: this.renderDistance.y*2+1}
            if(origin.x < this.lastOrigin.x){
                let topLeftChunk = createChunk(this.scene, origin.x-this.renderDistance.x, origin.y-this.renderDistance.y, this.chunks.pop());
                this.chunks.unshift(topLeftChunk);
                for(let i=1;i<renderDiameter.y;i++){
                    createChunk(this.scene, origin.x-this.renderDistance.x, origin.y-this.renderDistance.y+i, this.chunks[i*renderDiameter.x]);
                }
            }else if(origin.x > this.lastOrigin.x){
                for(let i=0;i<renderDiameter.y-1;i++){
                    createChunk(this.scene, origin.x+this.renderDistance.x, origin.y-this.renderDistance.y+i, this.chunks[(i+1)*renderDiameter.x])
                }
                console.log(this.chunks);
                let bottomRightChunk = createChunk(this.scene, origin.x+this.renderDistance.x, origin.y+this.renderDistance.y, this.chunks.shift());
                this.chunks.push(bottomRightChunk);
            }
            // if(origin.y < this.lastOrigin.y){
            //     for(let i=1;i<renderDiameter.y;i++){
            //         this.chunks[i*renderDiameter.y].destroy();
            //         var newChunk = createChunk(this.scene, origin.x+this.renderDistance.x, origin.y-this.renderDistance.y+i)
            //         //new Chunk(this, snappedChunkX+this.chunkRadius, snappedChunkY-this.chunkRadius+(i-1));
            //         this.chunks[i*renderDiameter.y] = newChunk;
            //     }
            // }
            // }else if(origin.x > this.lastOrigin.x){
            //     console.log('moved right');
            //     /* for(let i=1;i<chunkDiameter;i++){
            //         this.groundlayer.copy(this.chunkSize*i,0,this.chunkSize, this.chunkSize*chunkDiameter, this.chunkSize*(i-1),0);
            //     } */
            //     for(let i=1;i<chunkDiameter;i++){
            //         this.chunks[i*chunkDiameter].unload();
            //         var newChunk = new Chunk(this, snappedChunkX+this.chunkRadius, snappedChunkY-this.chunkRadius+(i-1));
            //         this.chunks[i*chunkDiameter] = newChunk;
            //         newChunk.load(this.player);
            //     }
            //     let bottomRightChunk = new Chunk(this, snappedChunkX+this.chunkRadius, 
            //     snappedChunkY+this.chunkRadius);
            //     bottomRightChunk.load(this.player);
            //     this.chunks.push(bottomRightChunk);
            //     this.chunks.shift().unload();
            // }
            this.lastOrigin = origin;
        }
    }
}