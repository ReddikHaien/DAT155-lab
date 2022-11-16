import { BackSide, BoxGeometry, BufferGeometry, Color, FrontSide, LinearEncoding, Material, Mesh, MeshBasicMaterial, MeshPhongMaterial, MeshStandardMaterial, NearestFilter, Object3D, PointLight, Side, sRGBEncoding, Texture, TextureLoader, TOUCH, Vector3 } from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import ParticleSystem from "./ParticleSystem";

export default class Torch extends Object3D{

    static IS_STARTED: boolean = false;
    static TORCH_GEOMETRY: BufferGeometry = new BoxGeometry(1,1,1);
    static TORCH_MATERIAL: MeshStandardMaterial = new MeshStandardMaterial({
        
    });
    particleSystem: ParticleSystem;
    constructor(){
        super();
        const is_started = Torch.IS_STARTED;
        Torch.IS_STARTED = true;

        if (!is_started){
            new GLTFLoader().load("models/torch.glb",(gltf) => {
                gltf.scene.children.forEach(model => {
                    gltf.scene.children.forEach(model => {
                        if (model instanceof Mesh){
                            Torch.TORCH_GEOMETRY.copy(model.geometry);
                            Torch.TORCH_MATERIAL.copy(model.material);
                            Torch.TORCH_MATERIAL.emissive = new Color(1.0,1.0,1.0);
                            Torch.TORCH_MATERIAL.emissiveIntensity = 4.0;
                            Torch.TORCH_MATERIAL.emissiveMap = Torch.TORCH_MATERIAL.map;
                        }
                    });
                });
            });
        }

        this.particleSystem = new ParticleSystem(this,{
            particleCount: 30,
            movement_direction: new Vector3(0,0.7,0),
            spawnChance: 0.01,
            coloring: [new Color(1,1,0), new Color(1,0,0)],
            scale: [10.0, 1.0],
            spawnRadius: 0.2,
            baseLifeTime: 5.0
        });

        this.particleSystem.position.y = 2;

        const light = new PointLight(new Color(1,1,1),1.0, 5.0);
        light.position.y = 2;
        const mesh = new Mesh(Torch.TORCH_GEOMETRY,Torch.TORCH_MATERIAL);
        this.add(mesh, light);
    }

    update(delta: number, playerPos: Vector3){
        if (playerPos.distanceToSquared(this.position) <= (30*30)){
            this.particleSystem.spawn_particles(10);
            this.particleSystem.update(delta);
        }
    }
}