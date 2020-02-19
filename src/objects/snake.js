class Snake {
    constructor(scene, x = 0, y = 0, segments = 4, key = 'snake') {
        let speed = 160;
        let obj = scene.physics.add.image(x, y, key, 'head');
        obj.body.setAngularVelocity(150);
        this.update=()=>{
            scene.physics.velocityFromAngle(obj.body.rotation, speed, obj.body.velocity);
        }
    }
    
}

export default Snake;