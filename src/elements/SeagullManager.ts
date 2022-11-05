import { AnimationMixer, Bone, BufferGeometry, CubicBezierCurve, CubicBezierCurve3, LinearEncoding, Mesh, MeshPhongMaterial, MeshStandardMaterial, Object3D, QuadraticBezierCurve, SkeletonHelper, SkinnedMesh, Texture, Vector3 } from "three";
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

    path: CubicBezierCurve3;
    time: number;
    mixer: AnimationMixer;
    constructor(model: Object3D, mixer: AnimationMixer, startPosition: Vector3){
        super();
        this.add(model);
        model.scale.set(0.1,0.1,0.1);
        this.mixer = mixer;
        const v0 = startPosition;
        const v1 = this.getRandomPointAround(v0);
        const v2 = this.getRandomPointAround(v1);
        const v3 = this.getRandomPointAround(v2);
        this.path = new CubicBezierCurve3(v0,v1,v2,v3);
        this.time = 0;
        this.position.copy(startPosition);
    }

    getRandomPointAround(pos: Vector3){
        var direction = new Vector3(Math.random()*2-1, Math.random()*2-1, Math.random()*2-1).multiplyScalar(50 + Math.random()*20);
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

    recalculatePath(){
        const v0 = this.path.v3;
        Seagull.helperVector.set(0,0,1);
        Seagull.helperVector.applyQuaternion(this.quaternion);
        const v1 = v0.clone().add(Seagull.helperVector.multiplyScalar(Math.random()*4 + 1));
        const v2 = this.getRandomPointAround(v1);
        const v3 = this.getRandomPointAround(v2);

        this.path = new CubicBezierCurve3(v0,v1,v2,v3);
        this.time = 0;
        this.mixer.update(Math.random()*0.1);
    }

    update(delta: number){

        this.time += delta*0.04;

        if (this.time > 1.0){
            this.recalculatePath();
        }

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