import { BackSide, BoxGeometry, BufferGeometry, Color, FrontSide, LinearEncoding, Material, Mesh, MeshBasicMaterial, MeshPhongMaterial, MeshStandardMaterial, NearestFilter, Object3D, PointLight, Side, sRGBEncoding, Texture, TextureLoader, TOUCH, Vector3 } from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import ParticleSystem from "./ParticleSystem";

export default class Torch extends Object3D{

    static IS_STARTED: boolean = false;
    static TORCH_GEOMETRY: BufferGeometry = new BoxGeometry(1,1,1);
    static TORCH_MATERIAL: MeshStandardMaterial = new MeshStandardMaterial({
        
    });

    static PARTICLE_OFFSET = new Vector3(0,2,0);

    particleSystem: ParticleSystem;
    particlePosition: Vector3;
    constructor(particleSystem: ParticleSystem){
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

        this.particleSystem = particleSystem;
        const light = new PointLight(new Color(1,1,1),1.0, 5.0);
        light.position.y = 2;
        this.particlePosition = new Vector3();
        const mesh = new Mesh(Torch.TORCH_GEOMETRY,Torch.TORCH_MATERIAL);
        this.add(mesh, light);
    }

    update(){
        this.particlePosition.addVectors(this.position,Torch.PARTICLE_OFFSET);
        this.particleSystem.spawn_particles(this.particlePosition,10);
    }
}