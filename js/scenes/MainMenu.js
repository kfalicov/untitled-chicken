

export class MainMenu extends Phaser.Scene{
    constructor(){
        super('MainMenu');
    }
    preload(){
        for(let i=0;i<5;i++){
            this.load.atlas('chicken_body_'+i, 'assets/chicken/body_'+i+'.png', 'assets/chicken/body.json');
            this.load.atlas('chicken_head_'+i, 'assets/chicken/head_'+i+'.png', 'assets/chicken/head.json');
        }
        this.load.atlas('combs', 'assets/chicken/combs.png', 'assets/chicken/combs.json');
        
    }
    selectChicken = function(chicken){
        this.chickenGroup.remove(chicken);
        chicken.disableInteractive();
        this.tweens.add({
            targets:chicken,
            x:this.targetCircle.x,
            y:this.targetCircle.y,
            duration:180
        })
        this.tweens.add({
            targets:this.targetCircle,
            radius:100,
            duration:200
        });
        this.tweens.add({
            targets:this.chickenGroup.getChildren(),
            alpha:0,
            duration:190
        });
    }
    createWheel(chicken){
        console.log('create wheel')
        let group = this.add.group();
        let timeline=this.tweens.createTimeline();
        for(let i=0;i<5;i++){
            let newchicken = this.add.renderTexture(0,0,32,32).setOrigin(0.5).setInteractive();
            newchicken.alpha=0;
            newchicken.setTintFill(0xffffff);
            newchicken.on('pointerover', function(pointer){
                this.setScale(2);
            });
            newchicken.on('pointerout', function(pointer){
                this.setScale(1);
            });
            timeline.add({
                targets:newchicken,
                alpha:1,
                ease:'Linear',
                duration:300,
                repeat:0,
                yoyo:true,
                offset:'-=540'
            });
            if(chicken){
                newchicken.draw(chicken, 16,16);
                newchicken.draw(this.textures.list.combs.frames['comb_'+i],17,2);
                let index=i;
                newchicken.on('pointerdown',()=>{
                    //console.log(index)
                    let data = {
                        chickenColor: chicken.index,
                        chickenType: index,
                    }
                    this.scene.start('World', data);
                })
            }else{
                newchicken.index=i;
                newchicken.on('pointerdown', ()=>{
                    newchicken.setScale(1);
                    this.selectChicken(newchicken)
                    this.chickenGroup = this.createWheel(newchicken)
                    let centerX = this.sys.canvas.width/2;
                    let centerY = this.sys.canvas.height/2;
                    
                    let newcircle = new Phaser.Geom.Circle(centerX, centerY,50);
                    
                    Phaser.Actions.PlaceOnCircle(this.chickenGroup.getChildren(), newcircle);
                    this.targetCircle = newcircle;
                });
                newchicken.draw(this.textures.list['chicken_body_'+i].frames.stand_4,0,0);
                newchicken.draw(this.textures.list['chicken_head_'+i].frames.stand_4,4,-2);
            }
            
            group.add(newchicken);
        }
        
        timeline.once('complete',()=>this.makeWheelVisible(group), this)
        timeline.play();
        return group;
    }
    makeWheelVisible(group){
        group.getChildren().forEach(element => {
            element.clearTint();
        });
        this.tweens.add({
            targets:group.getChildren(),
            alpha:1,
            duration:200
        })
    }
    create(){
        
        this.add.tileSprite(0,0,320,240,'key').setOrigin(0).setAlpha(0.5);
        let centerX = this.sys.canvas.width/2;
        let centerY = this.sys.canvas.height/2;
        let initialCircle = new Phaser.Geom.Circle(centerX, centerY,50);
        
        let chickenGroup = this.createWheel();
        
        Phaser.Actions.PlaceOnCircle(chickenGroup.getChildren(), initialCircle);
        this.currentAng = 0;
        this.targetAng = 0;
        this.input.on('pointermove',(event)=>{
            this.targetAng = Phaser.Math.Angle.Between(centerX, centerY, event.x, event.y);
        });
        let data = {
            chickenColor: 0,
            chickenType: 1,
        }
        this.chickenGroup = chickenGroup;
        this.targetCircle = initialCircle;
        
    }
    update(time, delta){
        let chickenGroup = this.chickenGroup;
        let circle1 = this.targetCircle;
        let deltaAng = Phaser.Math.Angle.Wrap(this.targetAng-this.currentAng)/8;
        this.currentAng +=deltaAng/3;
        //console.log(this.currentAng);
        Phaser.Actions.RotateAroundDistance(chickenGroup.getChildren(), circle1, -deltaAng/2, circle1.radius);
    }
}