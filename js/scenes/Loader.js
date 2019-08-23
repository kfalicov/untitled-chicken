export class Loader extends Phaser.Scene{
    constructor(){
        super('Loader');
    }
    preload(){
        for(let i=0;i<5;i++){
            this.load.atlas('chicken_body_'+i, 'assets/chicken/body_'+i+'.png', 'assets/chicken/body.json');
            this.load.atlas('chicken_head_'+i, 'assets/chicken/head_'+i+'.png', 'assets/chicken/head.json');
        }
        this.load.atlas('combs', 'assets/chicken/combs.png', 'assets/chicken/combs.json');
    }
    create(){
        this.scene.manager.scenes[1].scene.start();
    }
}