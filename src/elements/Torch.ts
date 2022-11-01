import { BackSide, BoxGeometry, BufferGeometry, Color, FrontSide, LinearEncoding, Material, Mesh, MeshBasicMaterial, MeshPhongMaterial, MeshStandardMaterial, NearestFilter, Object3D, PointLight, Side, sRGBEncoding, Texture, TextureLoader } from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import ParticleSystem from "./ParticleSystem";

export default class Torch extends Object3D{

    static IS_STARTED: boolean = false;
    static TORCH_GEOMETRY: BufferGeometry = new BoxGeometry(1,1,1);
    static TORCH_MATERIAL: MeshBasicMaterial = new MeshBasicMaterial({
        
    });
    mesh: Mesh<BufferGeometry, Material>;
    light: PointLight;
    particleSystem: ParticleSystem;

    constructor(particleSystem: ParticleSystem){
        super();
        const is_started = Torch.IS_STARTED;
        Torch.IS_STARTED = true;

        if (!is_started){
            new GLTFLoader().load("models/torch.glb",(gltf) => {
                gltf.scene.children.forEach(model => {
                    if (model instanceof Mesh){
                        const mat = new MeshBasicMaterial({
                            map: (model.material as MeshStandardMaterial).map as Texture,
                        });

                        (mat.map as Texture).encoding = LinearEncoding;
                        model.material = mat;
                        this.add(model);
                    }
                });
            });
        }

        this.particleSystem = particleSystem;
        this.light = new PointLight(new Color(1,1,1),10,5.0);
        this.light.position.y = 2;
        this.add(this.light);
    }

    update(){
        this.particleSystem.spawn_particles(this.light.position,10);
    }
}