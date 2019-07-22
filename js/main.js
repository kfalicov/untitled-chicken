import {Scene} from './scenes/start.js';

let gameScale=2;

let config = {
    type: Phaser.WEBGL,
    width: 320, //(320+80)*gameScale,
    height: 240, //(240+80)*gameScale,
    parent: gamediv,
    pixelArt: true,
    antialias:false,
    roundPixels: true,
    zoom: 2,
    physics: {
        default: 'arcade',
        arcade: {
            fps:60,
            //debug:true
        }
    },
    transparent: true,
    //scene: ClassicMode //use this to test specific scenes directly
    scene: [Scene]
};

let game = new Phaser.Game(config);