import { AmbientLight, BoxGeometry, BufferGeometry, Material, Texture, Color, DirectionalLight, Light, Mesh, MeshBasicMaterial, Object3D, PerspectiveCamera, Scene, Vector3, WebGLRenderer, PointLight, CatmullRomCurve3, AnimationMixer } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";

const NUM_BOATS = 10;
class Boat extends Object3D {
    path: CatmullRomCurve3;
    time: number;
    mixer: AnimationMixer;
    constructor(model: Object3D, mixer: AnimationMixer, startPosition: Vector3) {
        super();
        this.add(model);
        this.mixer = mixer;


        let points = [startPosition];
        for (let i = 0; i < 20; i++) {
            points.push(this.getRandomPointAround(points[i]));
        }
    

        this.path = new CatmullRomCurve3(points, true);
        this.time = 0;
        this.position.copy(startPosition);
    }
    
    
    getRandomPointAround(pos: Vector3) {
        var direction = new Vector3(Math.random() * 20 - 5, Math.random() * 0.1 - 0.1, Math.random() * 20 - 20);
        direction.add(pos);
       

        if (direction.x > 400) {
            direction.x = 399.5;
        }
        else if (direction.x < -400) {
            direction.x = -399.5;
        }

        if (direction.z > 400) {
            direction.z = 399;
        }
        else if (direction.z < -400) {
            direction.z = -399.5;
        }

        return direction;
    }
    update(delta: number) {

        this.time += delta * 0.01;

        const newPos = this.path.getPoint(this.time);
        this.lookAt(newPos);
        this.position.copy(newPos);

        
    }
}

export default class BoatManager extends Object3D {


    constructor() {
        super();

        new GLTFLoader().load("models/boat.glb", gltf => {

            const model = gltf.scene;
            SkeletonUtils.clone(model);
            const animations = gltf.animations;

            for (let i = 0; i < NUM_BOATS; i++) {
                const cloned = SkeletonUtils.clone(model);
                const mixer = new AnimationMixer(model);

                this.add(new Boat(cloned, mixer, new Vector3(Math.random() * 600 - 600, 0, Math.random() * 600 - 600)))

            }

        });

    }
    update(delta: number) {
        this.children.forEach(child => {
            if (child instanceof Boat) {
                child.update(delta);
            }

        })
            }
}
            







