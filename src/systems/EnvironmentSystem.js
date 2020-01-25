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
    constructor(scene, shadowlayer, shadowcasters, groundeffects, foreground, lighting){
        this.particles = scene.add.particles('particles');
        let screenRect=new Phaser.Geom.Rectangle(0,0,scene.sys.canvas.width+128, scene.sys.canvas.height+128);
        this.splashEmitter = this.particles.createEmitter({
            lifespan: 600,
            quantity:3,
            frequency:10,
            alpha: {start:0.2,end:0.0},
            scaleX:{start:1, end:2},
            scaleY:{start:0.3,end:0.6},
            emitZone: {type: 'random', source:screenRect},
            particleClass: DropSplash,
            blendMode: 'ADD',
        });

        let clouds = scene.add.shader('Perlin', 0, 0, scene.sys.canvas.width, scene.sys.canvas.height).setOrigin(0);
        clouds.setScrollFactor(0);
        shadowcasters.add(clouds);
        
        var rainslider = this.createSlider(0,100,100,"rain")
        rainslider.oninput=({target:{value}})=>{
            this.splashEmitter.setQuantity(Math.ceil(3 * value/100));
            this.splashEmitter.setFrequency(110 - value)

            clouds.setUniform('density.value', value/100);
        }

        // const clouds = scene.add.tileSprite(0, 0, scene.sys.canvas.width, scene.sys.canvas.height, 'clouds');

        // clouds.setOrigin(0);
        // shadows.add(clouds);

        const sun = scene.add.tileSprite(0, 0, scene.sys.canvas.width, scene.sys.canvas.height, 'white').setOrigin(0);
        sun.setScrollFactor(0);
        sun.setBlendMode(Phaser.BlendModes.MULTIPLY);
        sun.alpha=0.7;
        lighting.add(sun);


        var sunslider = this.createSlider(0, 100, 100, "day")
        sunslider.oninput = ({ target: { value } }) => {
            shadowlayer.alpha=value/100*0.25;
            sun.setTintFill(this.getDaylight(value/100))
        }
        this.clouds=clouds;
    }
    getDaylight(t){
        const colors = [Phaser.Display.Color.HexStringToColor('#000333'),
            Phaser.Display.Color.HexStringToColor('#E63A3C'),
            Phaser.Display.Color.HexStringToColor('#E63A3A'),
            Phaser.Display.Color.HexStringToColor('#ffffff')];
        let i=t>0.5?2:0;
        let val=t>0.5?t-0.5:t;
        let h = Phaser.Math.Interpolation.SmoothStep(val * 2, colors[i].h, colors[i + 1].h);
        let s = Phaser.Math.Interpolation.SmoothStep(val * 2, colors[i].s, colors[i + 1].s);
        let v = Phaser.Math.Interpolation.SmoothStep(val * 2, colors[i].v, colors[i + 1].v);
        let col = Phaser.Display.Color.HSVToRGB(h, s, v);
        return Phaser.Display.Color.GetColor(col.r, col.g, col.b);
    }
    createSlider(min, max, current, text){
        let slider = document.createElement("input");

        slider.setAttribute("type", "range");
        slider.setAttribute("min", min);
        slider.setAttribute("max", max);
        slider.setAttribute("value", current);

        let label = document.createElement("label");
        label.innerHTML=text;
        label.appendChild(slider);
        document.getElementById('debug').appendChild(label);

        return slider;
    }
}