import { Tree } from "./objects/tree";

var chunkIndex=0;
function createNewChunk(scene,x,y){
    let chunkSize = {x:12, y:9};
    let tileSize = 16;
    let originy = (y*tileSize*chunkSize.y);
    let originx = (x*tileSize*chunkSize.x);
    var blitter = scene.add.blitter(originx, originy, 'tiles_16');
    blitter.index=chunkIndex++;
    
    let verts = new Uint8Array((chunkSize.x+1)*(chunkSize.y+1));

    for(let i=0;i<(chunkSize.x+1)*(chunkSize.y+1);i++){
        let col=i%(chunkSize.x+1);
        let row=Math.floor(i/(chunkSize.x+1));
        let value = noise.perlin2((originx+col*tileSize)/140, (originy+row*tileSize)/100)>-0.25? true:false;
        verts[i]=value;
        if(row>0&&col>0){
            let top=((row-1)*(chunkSize.x+1))+col;
            let bottom=((row)*(chunkSize.x+1))+col;
            let num;
            let bool = (verts[top-1]<<3)|(verts[top]<<2)|(verts[bottom-1]<<1)|verts[bottom];
            let flip=false;
            switch(bool){
                case 0b0010:flip=true;
                case 0b0001:
                    num=8;
                    break;
                case 0b1000:flip=true;
                case 0b0100:
                    num=2;
                    break;
                case 0b1001:flip=true;
                case 0b0110:
                    num=9;
                    break;
                case 0b0000:
                    num=1;
                    break;
                case 0b1100:
                    num=3;
                    break;
                case 0b1110: flip=true;
                case 0b1101:
                    num=4;
                    break;
                case 0b1010: flip=true;
                case 0b0101:
                    num=5;
                    break;
                case 0b1011: flip=true;
                case 0b0111:
                    num=6;
                    break;
                case 0b0011:
                    num=7;
                    break;
                case 0b1111:
                default:
                    num=0;
                    break;
            }
            let bob = blitter.create((col-1)*tileSize, (row-1)*tileSize, num);
            bob.flipX = flip;
        }
    }
    blitter.verts = verts;
    return blitter;
}
function createChunkFromExisting(x, y, existing){
    let chunkSize = {x:12, y:9};
    let tileSize = 16;
    let originy = (y*tileSize*chunkSize.y);
    let originx = (x*tileSize*chunkSize.x);

    existing.setPosition(originx, originy);
    
    let verts = new Uint8Array((chunkSize.x+1)*(chunkSize.y+1));
    //let tiles = new Uint8Array(chunkSize*chunkSize);

    for(let i=0;i<(chunkSize.x+1)*(chunkSize.y+1);i++){
        let col=i%(chunkSize.x+1);
        let row=Math.floor(i/(chunkSize.x+1));
        let value = noise.perlin2((originx+col*tileSize)/140, (originy+row*tileSize)/100)>-0.25? true:false;
        verts[i]=value;
        if(row>0&&col>0){
            let top=((row-1)*(chunkSize.x+1))+col;
            let bottom=((row)*(chunkSize.x+1))+col;
            let num;
            let bool = (verts[top-1]<<3)|(verts[top]<<2)|(verts[bottom-1]<<1)|verts[bottom];
            let flip=false;
            switch(bool){
                case 0b0010:flip=true;
                case 0b0001:
                    num=8;
                    break;
                case 0b1000:flip=true;
                case 0b0100:
                    num=2;
                    break;
                case 0b1001:flip=true;
                case 0b0110:
                    num=9;
                    break;
                case 0b0000:
                    num=1;
                    break;
                case 0b1100:
                    num=3;
                    break;
                case 0b1110: flip=true;
                case 0b1101:
                    num=4;
                    break;
                case 0b1010: flip=true;
                case 0b0101:
                    num=5;
                    break;
                case 0b1011: flip=true;
                case 0b0111:
                    num=6;
                    break;
                case 0b0011:
                    num=7;
                    break;
                case 0b1111:
                default:
                    num=0;
                    break;
            }
            let i = (row-1)*chunkSize.x+(col-1);
            let bob=existing.children.getAt(i);
            bob.setFrame(num);
            bob.flipX = flip;
        }
    }
    existing.verts = verts;
    return existing;
}

function createNewDetailChunk(scene,x,y){
    let chunkSize = {x:12, y:9};
    let tileSize = 16;
    let originy = (y*tileSize*chunkSize.y);
    let originx = (x*tileSize*chunkSize.x);
    var blitter = scene.add.blitter(originx, originy, 'tiles_16');
    blitter.index=chunkIndex++;
    
    let verts = new Uint8Array((chunkSize.x+1)*(chunkSize.y+1));

    for(let i=0;i<(chunkSize.x+1)*(chunkSize.y+1);i++){
        let col=i%(chunkSize.x+1);
        let row=Math.floor(i/(chunkSize.x+1));
        let value = noise.perlin2((originx+col*tileSize)/70, (originy+row*tileSize)/80)>0.25? true:false;
        verts[i]=value;
        if(row>0&&col>0){
            let top=((row-1)*(chunkSize.x+1))+col;
            let bottom=((row)*(chunkSize.x+1))+col;
            let num;
            let bool = (verts[top-1]<<3)|(verts[top]<<2)|(verts[bottom-1]<<1)|verts[bottom];
            let flipX=false;
            let flipY=false;
            switch(bool){
                case 0b0010: flipX=true;
                case 0b0001: flipY=true;
                    num=11;
                    break;
                case 0b1000: flipX=true;
                case 0b0100:
                    num=11;
                    break;
                case 0b1001: flipX=true;
                case 0b0110:
                    num=15;
                    break;
                case 0b1111:
                    num=10;
                    break;
                case 0b0011: flipY=true;
                case 0b1100:
                    num=12;
                    break;
                case 0b1110: flipX=true;
                case 0b1101:
                    num=13;
                    break;
                case 0b1011: flipX=true;
                case 0b0111: flipY=true;
                    num=13;
                    break;
                case 0b1010: flipX=true;
                case 0b0101:
                    num=14;
                    break;
                case 0b0000:
                default:
                    num=0;
                    break;
            }
            let bob = blitter.create((col-1)*tileSize, (row-1)*tileSize, num);
            bob.flipX = flipX;
            bob.flipY = flipY;
        }
    }
    blitter.verts = verts;
    return blitter;
}
function createDetailChunkFromExisting(x, y, existing){
    let chunkSize = {x:12, y:9};
    let tileSize = 16;
    let originy = (y*tileSize*chunkSize.y);
    let originx = (x*tileSize*chunkSize.x);

    existing.setPosition(originx, originy);
    
    let verts = new Uint8Array((chunkSize.x+1)*(chunkSize.y+1));
    //let tiles = new Uint8Array(chunkSize*chunkSize);

    for(let i=0;i<(chunkSize.x+1)*(chunkSize.y+1);i++){
        let col=i%(chunkSize.x+1);
        let row=Math.floor(i/(chunkSize.x+1));
        let value = noise.perlin2((originx+col*tileSize)/70, (originy+row*tileSize)/80)>0.25? true:false;
        verts[i]=value;
        if(row>0&&col>0){
            let top=((row-1)*(chunkSize.x+1))+col;
            let bottom=((row)*(chunkSize.x+1))+col;
            let num;
            let bool = (verts[top-1]<<3)|(verts[top]<<2)|(verts[bottom-1]<<1)|verts[bottom];
            let flipX=false;
            let flipY=false;
            switch(bool){
                case 0b0010: flipX=true;
                case 0b0001: flipY=true;
                    num=11;
                    break;
                case 0b1000: flipX=true;
                case 0b0100:
                    num=11;
                    break;
                case 0b1001: flipX=true;
                case 0b0110:
                    num=15;
                    break;
                case 0b1111:
                    num=10;
                    break;
                case 0b0011: flipY=true;
                case 0b1100:
                    num=12;
                    break;
                case 0b1110: flipX=true;
                case 0b1101:
                    num=13;
                    break;
                case 0b1011: flipX=true;
                case 0b0111: flipY=true;
                    num=13;
                    break;
                case 0b1010: flipX=true;
                case 0b0101:
                    num=14;
                    break;
                case 0b0000:
                default:
                    num=0;
                    break;
            }
            let i = (row-1)*chunkSize.x+(col-1);
            let bob=existing.children.getAt(i);
            bob.setFrame(num);
            bob.flipX = flipX;
            bob.flipY = flipY;
        }
    }
    existing.verts = verts;
    return existing;
}

export class Ground{
    constructor(scene, origin, renderDistance){
        this.renderDistance = renderDistance;
        this.scene = scene;
        this.loadAllChunks(origin);
        this.chunks = [];
        this.detailChunks = [];
        this.lastOrigin = origin;
    }
    loadAllChunks(origin){
        this.lastOrigin=origin;
        for(let y = origin.y-this.renderDistance.y; y<=origin.y+this.renderDistance.y; y++){
            for(let x = origin.x-this.renderDistance.x; x<=origin.x+this.renderDistance.x; x++){
                var newChunk = createNewDetailChunk(this.scene, x, y);
                this.detailChunks.push(newChunk);
            }
        }
        for(let y = origin.y-this.renderDistance.y; y<=origin.y+this.renderDistance.y; y++){
            for(let x = origin.x-this.renderDistance.x; x<=origin.x+this.renderDistance.x; x++){
                var newChunk = createNewChunk(this.scene, x, y);
                this.chunks.push(newChunk);
            }
        }
    }
    fetch(origin){
        if(origin.x != this.lastOrigin.x || origin.y != this.lastOrigin.y){
            let renderDiameter = {x: this.renderDistance.x*2+1, y: this.renderDistance.y*2+1}
            if(origin.x < this.lastOrigin.x){
                let topLeftChunk_d = createDetailChunkFromExisting(origin.x-this.renderDistance.x, origin.y-this.renderDistance.y, this.detailChunks.pop());
                this.detailChunks.unshift(topLeftChunk_d);
                let topLeftChunk = createChunkFromExisting(origin.x-this.renderDistance.x, origin.y-this.renderDistance.y, this.chunks.pop());
                this.chunks.unshift(topLeftChunk);
                for(let i=1;i<renderDiameter.y;i++){
                    createDetailChunkFromExisting(origin.x-this.renderDistance.x, origin.y-this.renderDistance.y+i, this.detailChunks[i*renderDiameter.x]);
                    createChunkFromExisting(origin.x-this.renderDistance.x, origin.y-this.renderDistance.y+i, this.chunks[i*renderDiameter.x]);
                }
            }
            if(origin.x > this.lastOrigin.x){
                for(let i=0;i<renderDiameter.y-1;i++){
                    createDetailChunkFromExisting(origin.x+this.renderDistance.x, origin.y-this.renderDistance.y+i, this.detailChunks[(i+1)*renderDiameter.x])

                    createChunkFromExisting(origin.x+this.renderDistance.x, origin.y-this.renderDistance.y+i, this.chunks[(i+1)*renderDiameter.x])
                }
                let bottomRightChunk_d = createDetailChunkFromExisting(origin.x+this.renderDistance.x, origin.y+this.renderDistance.y, this.detailChunks.shift());
                this.detailChunks.push(bottomRightChunk_d);

                let bottomRightChunk = createChunkFromExisting(origin.x+this.renderDistance.x, origin.y+this.renderDistance.y, this.chunks.shift());
                this.chunks.push(bottomRightChunk);
            }
            if(origin.y<this.lastOrigin.y){
                for(let i=this.renderDistance.x;i>=-this.renderDistance.x;i--){
                    let newChunk_d = createDetailChunkFromExisting(origin.x+i, origin.y-this.renderDistance.y, this.detailChunks.pop());
                    this.detailChunks.unshift(newChunk_d);

                    let newChunk = createChunkFromExisting(origin.x+i, origin.y-this.renderDistance.y, this.chunks.pop());
                    this.chunks.unshift(newChunk);
                }
            }
            if(origin.y>this.lastOrigin.y){
                for(let i=-this.renderDistance.x;i<=this.renderDistance.x;i++){
                    let newChunk_d = createDetailChunkFromExisting(origin.x+i, origin.y+this.renderDistance.y, this.detailChunks.shift());
                    this.detailChunks.push(newChunk_d);

                    let newChunk = createChunkFromExisting(origin.x+i, origin.y+this.renderDistance.y, this.chunks.shift());
                    this.chunks.push(newChunk);
                }
            }
            //printChunks(this.chunks);
            this.lastOrigin = origin;
        }
    }
}
    function printChunks(chunks){
        let rows = [];
        for(let i =0;i<3;i++){
            let row = []
            for(let j=0;j<3;j++){
                let chunk = chunks[i*3+j];
                row.push(chunk.index);
            }
            rows.push(row);
        }
        console.log(rows);
    }