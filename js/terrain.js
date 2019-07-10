export class Chunk{
    constructor(scene, x, y){
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.tiles = this.scene.add.group();
        this.isLoaded = false;
    }
    unload(){
        if(this.isLoaded){
            this.tiles.clear(true,true);
            this.isLoaded = false;
        }
    }
    load(){
        if(!this.isLoaded){
            for (var x = 0; x < this.scene.chunkSize; x++) {
                for (var y = 0; y < this.scene.chunkSize; y++) {
                    var tileX = (this.x * (this.scene.chunkSize * this.scene.tileSize)) + (x * this.scene.tileSize);
                    var tileY = (this.y * (this.scene.chunkSize * this.scene.tileSize)) + (y * this.scene.tileSize);
                    var perlinValue = noise.perlin2(tileX/100, tileY/200);
                    var key="";
                    var animationKey = "";
                    
                    if(perlinValue > 0 && perlinValue<=0.005){
                        key="grass_04";
                    }else if(perlinValue > 0.25 && perlinValue <= 0.3){
                        key = "grass_02";
                    }else if(perlinValue > 0.3 && perlinValue <= 0.35){
                        key= "grass_01";
                    }
                    else if(perlinValue > 0.005 && perlinValue<0.015){
                        key="grass_03";
                    }else{
                        key="grass_00";
                    }
                    var tile = new Tile(this.scene, tileX, tileY, key);
                    //tile.setTint(perlinValue*0xffffff);
                    this.tiles.add(tile);
                }
            }
            this.isLoaded=true;
        }
    }
}
class Tile extends Phaser.GameObjects.Sprite{
    constructor(scene, x, y, key){
        super(scene, x, y, 'grass', key);
        this.scene = scene;
        this.scene.add.existing(this);
        this.setOrigin(0);
    }
}