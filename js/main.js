import {testScene} from './scenes/start.js';
let config = {
    type: Phaser.WEBGL,
    width: 320,
    height: 240,
    parent: gamediv,
    pixelArt: true,
    zoom: 2,
    physics: {
        default: 'arcade',
        arcade: {
            fps:60,
            //debug:true
        }
    },
    //scene: ClassicMode //use this to test specific scenes directly
    scene: [testScene]
};

let game = new Phaser.Game(config);