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


        const startRadian = (Math.PI * 2) * Math.random();
        const numPoints = 20;

        let points: Vector3[] = []
        for (let i = 0; i < numPoints-1; i++){
            const radian = startRadian + ((Math.PI*2) / numPoints) * i;

            const s = Math.sin(radian);
            const c = Math.cos(radian);

            points.push(new Vector3(s,0,c).multiplyScalar(250 + Math.random()*50));
        }

        this.path = new CatmullRomCurve3(points, true);
        this.time = 0;
        this.position.copy(startPosition);
    }

    update(delta: number) {

        this.time += delta * 0.005;

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
            







