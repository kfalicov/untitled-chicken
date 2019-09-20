export class MainMenu extends Phaser.Scene{
    constructor(){
        super('MainMenu');
    }
    preload(){
        
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
    createWheel(chicken, choices){
        console.log('create wheel')
        let group = this.add.group();
        let timeline=this.tweens.createTimeline();
        for(let i=0;i<choices;i++){
            let newchicken = this.add.renderTexture(0,0,32,32).setOrigin(0.5).disableInteractive();
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
                    this.chickenGroup = this.createWheel(newchicken, 5);
                    let centerX = this.sys.canvas.width/2;
                    let centerY = this.sys.canvas.height/2;
                    
                    let newcircle = new Phaser.Geom.Circle(centerX, centerY,50);
                    
                    Phaser.Actions.PlaceOnCircle(this.chickenGroup.getChildren(), newcircle);
                    this.targetCircle = newcircle;
                });
                newchicken.drawFrame('chicken_body_'+i, 'stand_4');
                newchicken.drawFrame('chicken_head_'+i, 'stand_4',4,-2);
            }
            
            group.add(newchicken);
        }
        
        timeline.once('complete',()=>this.makeWheelVisible(group), this);
        timeline.play();
        return group;
    }
    makeWheelVisible(group){
        group.getChildren().forEach(element => {
            element.clearTint();
            element.setInteractive();
        });
        this.tweens.add({
            targets:group.getChildren(),
            alpha:1,
            duration:200
        })
    }
    create(){
        this.input.setPollAlways();
        this.input.mouse.disableContextMenu();

        this.add.tileSprite(0,0,320,240,'key').setOrigin(0).setAlpha(0.5);
        let centerX = this.sys.canvas.width/2;
        let centerY = this.sys.canvas.height/2;
        let initialCircle = new Phaser.Geom.Circle(centerX, centerY,50);

        let chicken = this.add.shader('Palette').setVisible(false);
        let colors = [
            {x: 255/255., y: 255/255., z: 255/255.},
            {x: 252/255., y: 193/255., z: 96/255.},
            {x: 138/255., y: 58/255., z: 23/255.},
            {x: 110/255., y: 101/255., z: 98/255.},
            {x: 36/255., y: 25/255., z: 25/255.},
        ]
        let numberOfChickens = 7;
        for(let i = colors.length; i<numberOfChickens; i++){
            colors.push(
                {x: Math.random(), y: Math.random(), z: Math.random()}
            );
        }
        for(let i = 0;i<colors.length;i++){
            chicken.setRenderToTexture('chicken_body_'+i, true);
            chicken.setChannel0('chicken_body');
            let atlas = this.cache.json.get('chicken_body');
            let texture = this.textures.list['chicken_body_'+i];
            Phaser.Textures.Parsers.JSONArray(texture, 0, atlas);
            chicken.getUniform('color').value = colors[i];
            chicken.renderWebGL(chicken.renderer, chicken);

            chicken.renderToTexture = false;

            chicken.setRenderToTexture('chicken_head_'+i, true);
            chicken.setChannel0('chicken_head');
            atlas = this.cache.json.get('chicken_head');
            texture = this.textures.list['chicken_head_'+i];
            Phaser.Textures.Parsers.JSONArray(texture, 0, atlas);
            chicken.getUniform('color').value = colors[i];
            chicken.renderWebGL(chicken.renderer, chicken);

            chicken.renderToTexture = false;
        }
        let chickenGroup = this.createWheel(undefined, colors.length);
        
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
        
        let cursor = this.add.image(this.input.activePointer.x, this.input.activePointer.y, 'map_icons', 'hand_2').setOrigin(0.3).setDepth(2);
        this.input.on('pointermove', (event)=>{cursor.setPosition(event.x, event.y)});
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