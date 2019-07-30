export default class Cursor{
    constructor(scene, x,y){
        this.x=x;
        this.y=y;
        this.scene=scene;
        this.sw = scene.add.image(0,0,'arrow',1).setDepth(10);
        this.se = scene.add.image(0,0,'arrow',1).setFlipX(true).setDepth(10);
        this.nw = scene.add.image(0,0,'arrow',0).setDepth(10);
        this.ne = scene.add.image(0,0,'arrow',0).setFlipX(true).setDepth(10);
        
        this.corners=[this.nw, this.ne, this.sw, this.se];
        this.mouseScreenPos = {x:0,y:0};
        this.selecting=false;
        this.offset=0;
    }
    setMousePos(pos){
        this.mouseScreenPos = pos;
        let {x,y} = pos;
        if(!this.selecting){
            for(let i=0;i<this.corners.length;i++){
                this.corners[i].setPosition(i%2===0?x+7:x-7, i<2?y+8:y-5);
                this.corners[i].setFrame(i<2?2:3);
            }
        }else{
            for(let i=0;i<this.corners.length;i++){
                let boxX = i%2===0? Math.floor(x/this.scene.tileSize)*this.scene.tileSize+2 : (Math.floor(x/this.scene.tileSize)+1)*this.scene.tileSize-2;

                let boxY = i<2? Math.floor(y/this.scene.tileSize)*this.scene.tileSize +1 : (Math.floor(y/this.scene.tileSize)+1)*this.scene.tileSize-3;

                this.corners[i].setPosition(boxX, boxY);
                
                this.corners[i].setFrame(i<2?0:1);
            }
        }
        for(let i=0;i<this.corners.length;i++){
            this.corners[i].x-=i%2===0?this.offset:-this.offset;
            this.corners[i].y-=i<2?this.offset:-this.offset;
        }
    }
    setSelecting(sel){
        this.selecting=sel;
    }
    update(time){
        this.offset=Math.abs(Math.sin(time/100))*3;
    }
}