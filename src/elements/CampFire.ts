import { BoxGeometry, BufferGeometry, Color, LinearEncoding, LinearFilter, Loader, Material, Mesh, MeshBasicMaterial, MeshPhongMaterial, MeshStandardMaterial, Object3D, PlaneGeometry, PointLight, RGBAFormat, Texture, Vector3, VideoTexture } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import ParticleSystem from "./ParticleSystem";


export default class CampFire extends Object3D{
    static IS_STARTED: boolean = false;
    static CAMP_FIRE_GEOMETRY: BufferGeometry = new BoxGeometry(1,1,1);
    static CAMP_FIRE_MATERIAL: MeshStandardMaterial = new MeshStandardMaterial({
        
    }); 
    particleSystem: ParticleSystem;
    constructor(particles: ParticleSystem){
        super();
        const is_started = CampFire.IS_STARTED;
        CampFire.IS_STARTED = true;

        if (!is_started){
            new GLTFLoader().load("models/Campfire.glb",(gltf) => {
                gltf.scene.children.forEach(model => {
                    if (model instanceof Mesh){
                        CampFire.CAMP_FIRE_GEOMETRY.copy(model.geometry);
                        CampFire.CAMP_FIRE_MATERIAL.copy(model.material);
                    }
                });
            });
        }

        const light = new PointLight(new Color(1,0.5,0),10,5.0);
        light.position.y = 0.3;
        const mesh = new Mesh(CampFire.CAMP_FIRE_GEOMETRY,CampFire.CAMP_FIRE_MATERIAL);
        this.add(mesh);
        this.add(light);
        this.particleSystem = particles;
    }

    update(){
        this.particleSystem.spawn_particles(this.position,100);
    }
}