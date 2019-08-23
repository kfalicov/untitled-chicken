import { MainMenu } from './scenes/MainMenu.js';
import {World} from './scenes/World.js';
import {Loader} from './scenes/Loader.js';
import {Map} from './scenes/Map.js';
let gameScale=2;

let config = {
    type: Phaser.WEBGL,
    canvas: document.getElementById('game'),
    width: 320, //(320+80)*gameScale,
    height: 240, //(240+80)*gameScale,
    scale: {
        zoom: Phaser.Scale.MAX_ZOOM,
    },
    render: {
        pixelArt:true,
    },
    plugins: {
        
    },
    title: 'chicken',
    physics: {
        default: 'arcade',
        arcade: {
            fps:60,
            //debug:true
        }
    },
    //transparent: true,
    scene: [Loader, World, Map] //use this to test specific scenes directly
    //scene: [MainMenu, World]
};

window.addEventListener('resize', function (event) {
    game.scale.setMaxZoom();
}, false);

let game = new Phaser.Game(config);