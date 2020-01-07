export class Tree{
    constructor(x, y, variant, scene){
        
        let trunk = scene.add.renderTexture(x, y+4, 32,48).setOrigin(0.5,0.75);
        trunk.drawFrame('oak_trunk', 0, 0,32);
        trunk.drawFrame('oak_trunk', 1, 16,32);
        let section = scene.add.image(0,0,'oak_trunk', 3).setOrigin(0).setVisible(false);
        trunk.draw(section, 8,16);
        trunk.drawFrame('oak_trunk', 2, 8,0);
        //trunk.create(0, 0, 1);
        //trunk.create(-8,-16, 2)

        var top = scene.add.image(x, y-48, 'oak_treetop');

        const elastic = function (t) { 
            let val = (-Math.sin(6.28 * t)*(1-t)) + 1;
            return val;
        }
        let sway = scene.tweens.add({
            targets: trunk,
            angle: {from: 8, to: 0},
            paused: true,
            duration: 200,
            ease: elastic,
        });
        let rustle = scene.tweens.add({
            targets: top,
            props: {
                x: {
                    value: {from: x+5, to: x},
                    duration: 240,
                },
                angle:{
                    value: {from:-5, to: 0},
                    duration: 800,
                }
            },
            ease: elastic,
            paused: true,
        });
        const maxHealth = 40;
        let health = maxHealth;
        const noop = ()=>{};
        const chop = (damage)=>{
            health-=damage;
            let frame = Math.min(Math.floor(4*(1-health/maxHealth)), 4);
            //console.log(frame);
            sway.play();
            sway.restart();
            rustle.play();
            rustle.restart();
            trunk.erase(section, 8,16);
            trunk.drawFrame('oak_trunk', frame+3, 8, 16);
            if(health<=0){
                trunk.erase(section, 8, 0);
                top.destroy();
                this.knock=noop;
            }
        }
        this.knock = chop;
    }
    
}