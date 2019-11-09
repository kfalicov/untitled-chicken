export class Tree{
    constructor(x, y, scene){
        this.rng = Phaser.Math.RND;
        
        let sections = [];
        //let lengths = [3,5,5,3];
        
        var stump = scene.add.image(x, y, 'tiles_16',1);
        for(let i=0;i<5;i++){
            let trunk = scene.add.image(x, y-(i*16)-16, 'tiles_16',2);
        }
        for(let i=0;i<16; i++){
           // let cols = lengths[i];
            //for(let j=0;j<cols;j++){
                let location=this.randInCircle(x, y-64, 32);
                //let section = this.generateCluster(scene, this.rng, i, location);
                let section = scene.add.quad(location.x, location.y, 'bush');
                section.bottomLeftX-=2;
                section.bottomRightX-=2;
                section.topLeftX+=2;
                section.topRightX+=2;
                sections.push(section);
                if(location.x>x){
                    section.flipX;
                }
            //}
        }
        let wavyTween = scene.tweens.add({
            targets: sections,
            props:  {
                bottomLeftX: {
                    yoyo: true,
                    repeat:-1,
                    value: '+=4',
                    duration: 1000,
                    ease: 'Quad.easeInOut',
                    delay: scene.tweens.stagger([0, 500]),
                },
                bottomRightX: {
                    yoyo: true,
                    repeat:-1,
                    value: '+=4',
                    duration: 1000,
                    ease: 'Quad.easeInOut',
                    delay: scene.tweens.stagger([300,800]),
                },
                topLeftX: {
                    yoyo: true,
                    repeat:-1,
                    value: '-=4',
                    duration: 1000,
                    ease: 'Quad.easeInOut',
                    delay: scene.tweens.stagger([0, 500]),
                },
                topRightX: {
                    yoyo: true,
                    repeat:-1,
                    value: '-=4',
                    duration: 1000,
                    ease: 'Quad.easeInOut',
                    delay: scene.tweens.stagger([100,600]),
                },
                bottomLeftY:{
                    yoyo: true,
                    repeat:-1,
                    value: '-=3',
                    duration: 800,
                    ease: 'Quad.easeInOut',
                    delay: scene.tweens.stagger(100),
                },
                bottomRightY:{
                    yoyo: true,
                    repeat:-1,
                    value: '-=3',
                    duration: 800,
                    ease: 'Quad.easeInOut',
                    delay: scene.tweens.stagger(100),
                }
            },
        });
    }
    generateCluster(scene, rng, number, location){
        let leafGroup = scene.add.renderTexture();
        for(let i=0;i<20;i++){
            let point = this.randInCircle(16,16,10);
            let leaf = scene.add.image(point.x+4, point.y, 'leaf').setOrigin(1,0.5);
            leaf.angle=rng.between(-20,10);
            leaf.flipY=rng.between(0,1);
            leafGroup.draw(leaf);
            leaf.destroy();
        }
        leafGroup.saveTexture('cluster_'+number);
        let tex = scene.add.quad(location.x, location.y, 'cluster_'+number);
        leafGroup.destroy();
        return tex;
    }
    // randInCircle(x, y, radius){
    //     let nx = this.rng.normal();
    //     let ny = this.rng.normal();
    //     var mag = Math.sqrt(nx*nx + ny*ny);
    //     nx/=mag;
    //     ny/=mag;
    //     var c=Math.cbrt(this.rng.frac());
    //     return {
    //         x: x+radius*Math.cos(nx*mag)*2,
    //         y: y+radius*Math.sin(ny*mag)
    //     }
    // }
    randInCircle(x, y, radius){
        let a = this.rng.frac()*2*Math.PI;
        let r = radius*Math.sqrt(this.rng.frac());
        let point={
            x: x+(r*Math.cos(a)),
            y: y+(r*Math.sin(a))
        }
        return point;
    }
}