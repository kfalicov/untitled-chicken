import { MainMenu } from './scenes/MainMenu.js';
import {World} from './scenes/World.js';
let gameScale=2;

let config = {
    type: Phaser.WEBGL,
    width: 320, //(320+80)*gameScale,
    height: 240, //(240+80)*gameScale,
    parent: gamediv,
    //pixelArt: true,
    antialias:false,
    roundPixels: true,
    zoom: 2,
    plugins: {
        
    },
    physics: {
        default: 'arcade',
        arcade: {
            fps:60,
            //debug:true
        }
    },
    transparent: true,
    //scene: ClassicMode //use this to test specific scenes directly
    scene: [MainMenu, World]
};

let game = new Phaser.Game(config);