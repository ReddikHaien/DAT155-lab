import { BoxGeometry, BufferGeometry, Color, LinearEncoding, LinearFilter, Loader, Material, Mesh, MeshBasicMaterial, MeshPhongMaterial, MeshStandardMaterial, Object3D, PlaneGeometry, PointLight, RGBAFormat, Texture, Vector3, VideoTexture } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import ParticleSystem from "./ParticleSystem";


export default class CampFire extends Object3D{
    static IS_STARTED: boolean = false;
    static CAMP_FIRE_GEOMETRY: BufferGeometry = new BoxGeometry(1,1,1);
    static CAMP_FIRE_MATERIAL: MeshStandardMaterial = new MeshStandardMaterial({
        
    }); 
    particleSystem: ParticleSystem;
    constructor(){
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
        this.particleSystem = new ParticleSystem(this,{
            particleCount: 200,
            movement_direction: new Vector3(0,0.7,0),
            spawnChance: 0.01,
            coloring: [new Color(1,1,0), new Color(1,0,0)],
            scale: [10.0, 1.0],
            spawnRadius: 0.5,
            baseLifeTime: 6.0
        });
    }

    update(delta: number, playerPos: Vector3){
        if (playerPos.distanceToSquared(this.position) <= (30*30)){
            this.particleSystem.spawn_particles(50);
            this.particleSystem.update(delta);
        }
    }
}