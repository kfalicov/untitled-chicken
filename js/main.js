import { MainMenu } from './scenes/MainMenu.js';
import {World} from './scenes/World.js';
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
    //scene: ClassicMode //use this to test specific scenes directly
    scene: [MainMenu, World]
};

window.addEventListener('resize', function (event) {
    let scaleX = Math.floor(window.innerWidth/320);
    let scaleY = Math.floor(window.innerHeight/240);
    this.console.log(scaleX, scaleY);
    let scale=Math.min(scaleX, scaleY);

    game.scale.setMaxZoom();
}, false);

let game = new Phaser.Game(config);