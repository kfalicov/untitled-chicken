import { DropSplash } from "./particle.js";

export class WeatherSystem{
    constructor(scene){
        this.particles = scene.add.particles('particles');
        let screenRect=new Phaser.Geom.Rectangle(0,0,scene.sys.canvas.width+128, scene.sys.canvas.height+128);
        this.splashEmitter = this.particles.createEmitter({
            //frame:0,
            x:0, y:0,
            speed: 0,
            lifespan: 600,
            quantity:3,
            frequency:10,
            alpha: {start:0.2,end:0.0},
            scale: 1,
            on:true,
            emitZone: {type: 'random', source:screenRect},
            particleClass: DropSplash,
            blendMode: 'ADD',
        });
        let stepEmitter = this.particles.createEmitter({
            frame:2,
            x:0, y:0,
            speed:0,
            lifespan: 800,
            quantity:1,
            alpha: {start:0.5, end:0.0},
            scale:{start:1, end:2},
            on:false,
            particleClass: DropSplash,
            blendMode: 'ADD',
        });
    }
    getBackground(){
        return this.particles;
    }
    getForeground(){
        return null;
    }
    getClouds(){
        return null;
    }
    setPosition(x, y){
        this.splashEmitter.setPosition(x,y);
    }
}