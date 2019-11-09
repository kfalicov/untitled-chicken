export class Loader extends Phaser.Scene{
    constructor(){
        super('Loader');
    }
    preload(){
        //for(let i=0;i<5;i++){
            this.load.atlas('chicken_body', 'assets/chicken/body_'+0+'.png', 'assets/chicken/body.json');
            this.load.atlas('chicken_head', 'assets/chicken/head_'+0+'.png', 'assets/chicken/head.json');
        //}
        this.load.atlas('combs', 'assets/chicken/combs.png', 'assets/chicken/combs.json');
        
        this.load.atlas('map_icons', 'assets/map_icons.png', 'assets/map_icons.json');
        this.load.json('chicken_coords', 'assets/chicken_coords.json');
        this.load.image('shadow', 'assets/chicken/shadow.png');
        this.load.image('black', 'assets/black.png');
        this.load.image('treetop', 'assets/terrain/treetop.png');
        this.load.atlas('grass', 'assets/grass_tiles.png', 'assets/grass_tiles.json');
        //this.load.image('tiles', 'assets/grass_tiles.png');
        this.load.spritesheet('tiles_16', 'assets/terrain/16_terrain.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('tiles', 'assets/tiles.png', { frameWidth: 32, frameHeight: 32 });
        this.load.glsl('distort', 'js/shader/distort.frag', 'fragment');
        this.load.glsl('reflect', 'js/shader/reflect.frag', 'fragment');
        this.load.glsl('marblefrag', 'js/shader/marble.frag', 'fragment');
        this.load.glsl('pad', 'js/shader/pad.vs', 'vertex');
        this.load.glsl('paletteswap', 'js/shader/paletteswap.fs', 'fragment');
        this.load.glsl('outline', 'js/shader/outline.fs', 'fragment');
        this.load.image('clouds', 'assets/clouds2.png');
        this.load.spritesheet('arrow', 'assets/arrow.png',{frameWidth:8, frameHeight:9});
        this.load.spritesheet('particles', 'assets/particle.png',{frameWidth:16, frameHeight:16});
    
        this.load.glsl('shaders', 'js/shader/shaders.glsl'); 
        
        this.load.atlas('tools', 'assets/tools.png', 'assets/tools.json');
        this.load.atlas('coffin', 'assets/coffin.png', 'assets/coffin.json');
        this.load.image('leaf', 'assets/terrain/leaf.png');
        this.load.image('bush', 'assets/terrain/bush.png');
        this.load.atlas('centipede', 'assets/enemy/centipede/centipede.png', 'assets/enemy/centipede/centipede.json');
        this.load.atlas('reaper', 'assets/enemy/reaper/reaper.png', 'assets/enemy/reaper/reaper.json');
        this.load.image('cloak', 'assets/parts/enemy/reaper/cloak2.png');
        
        this.load.spritesheet('tiles_8', 'assets/terrain/tiles_8.png', {frameWidth: 8, frameHeight: 8});
    }
    create(){

        

        this.scene.manager.scenes[1].scene.start();
    }
}