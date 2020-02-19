
var id = 0;

export const createEntity = () => {
    return id++;
}

export const Entities = new Map();

export class followSystem {
    constructor(){
        this.controls=[];
    }
    subscribe(id){
        this.controls.push(id);
        Entities.set(id, {
            position: {x:0, y:0},
            ...Entities.get(id)
        });
        console.log(Entities)
    }
}