import { AnimationMixer, CatmullRomCurve3, Object3D, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";


/**
 * Number of seagulls to spawn
 */
const NUM_SEAGULLS = 20;

/**
 * the minimum flight height
 */
const MIN_SEAGULL_HEIGHT = 20;
class Seagull extends Object3D{

    static helperVector = new Vector3();

    path: CatmullRomCurve3;
    time: number;
    mixer: AnimationMixer;
    constructor(model: Object3D, mixer: AnimationMixer, startPosition: Vector3){
        super();
        this.add(model);
        model.scale.set(0.1,0.1,0.1);
        this.mixer = mixer;
        let points = [startPosition];
        for (let i = 0; i < 20; i++){
            points.push(this.getRandomPointAround(points[i]));
        }

        this.path = new CatmullRomCurve3(points,true);
        this.time = 0;
        this.position.copy(startPosition);
    }

    getRandomPointAround(pos: Vector3){
        var direction = new Vector3(Math.random()*2-1, Math.random()*2-1, Math.random()*2-1).multiplyScalar(50);
        direction.add(pos);
        direction.y = Math.max(MIN_SEAGULL_HEIGHT,direction.y);
        if (direction.y > 400){
            direction.y = 30;
        }
        if (direction.x > 400){
            direction.x = -400;
        }
        else if (direction.x < -400){
            direction.x = 400;
        }

        if (direction.z > 400){
            direction.z = -400;
        }
        else if (direction.z < -400){
            direction.z = 400;
        }

        return direction;
    }

    update(delta: number){

        this.time += delta*0.01;

        const newPos = this.path.getPoint(this.time);
        this.lookAt(newPos);
        this.position.copy(newPos);
        
        this.mixer.update(delta);
    }
}

/**
 * Spawns and moves seagulls
 */
export default class SeagullManager extends Object3D{

    mixer: AnimationMixer | null;

    constructor(){
        super();
        new GLTFLoader().load("models/seagull.glb",gltf => {
            const model = gltf.scene;

            SkeletonUtils.clone(model);

            const animations = gltf.animations;

            for(let i = 0; i < NUM_SEAGULLS; i++){

                const cloned = SkeletonUtils.clone(model);
                const mixer = new AnimationMixer(cloned);
                mixer.clipAction(animations[0]).play();
                
                this.add(new Seagull(cloned, mixer, new Vector3(Math.random()*20-10,20,Math.random()*20-10)))
            }
        });
    }

    update(delta: number){
        this.children.forEach(child => {
            if (child instanceof Seagull){
                child.update(delta);
            }
        })
    }
}