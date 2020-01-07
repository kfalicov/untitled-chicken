import { DropSplash } from "./particle.js";

/** an all in one system that manages 
 * day/night, 
 * weather, and 
 * atmosphere */
export class EnvironmentSystem{
    /**Environment system needs:
     * the shadow layer, 
     * the ground effect layer, 
     * the foreground effect layer, and
     * the lighting layer */
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
            scaleX:{start:1, end:2},
            scaleY:{start:0.3,end:0.6},
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

        var slider = document.createElement("input");
        slider.setAttribute("type", "range");
        slider.setAttribute("min", "0");
        slider.setAttribute("max", "100");
        slider.setAttribute("value", "0");

        document.body.appendChild(slider);
        slider.onchange=()=>{
            console.log('changed')
        }

        //var element = scene.add.dom(10,10,slider);
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