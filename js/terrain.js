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
            this.background.clear(true,true);
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
                        var stump = this.scene.add.image(tileX+16+offX, tileY+16+offY, 'tiles_16',1).setDepth(1);
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