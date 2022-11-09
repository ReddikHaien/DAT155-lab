import { AmbientLight, BoxGeometry, Color, DirectionalLight, Light, Mesh, MeshBasicMaterial, Object3D, PerspectiveCamera, Scene, Vector3, WebGLRenderer} from "three";
import { TempSkyBox } from "./elements/Skybox";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import WaterModel from "./elements/WaterModel";
import Boat from "./elements/Boat";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"
import {VRButton} from "three/examples/jsm/webxr/VRButton";
import ParticleSystem from "./elements/ParticleSystem";
import Torch from "./elements/Torch";
import BoatModel from "./elements/Boat";

export default class App{

    renderer: WebGLRenderer;
    scene: Scene;
    skyBoxScene: Scene;
    water: WaterModel;
    boat: Boat
    camera: PerspectiveCamera;
    sun: Light;
    old: number;
    skybox: TempSkyBox;
    controls: OrbitControls;
    particles: ParticleSystem;

    torches: Torch[];
    ambient: AmbientLight;

    constructor(){
        this.renderer = new WebGLRenderer({
            canvas: document.createElement("canvas")
        });
        this.renderer.setSize(window.innerWidth,window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        window.onresize = this.resize.bind(this);
    
        this.renderer.xr.enabled = true;
        this.renderer.setClearColor(new Color(0.0,0.0,0.0));
        this.renderer.setAnimationLoop(this.update.bind(this));
        const button = VRButton.createButton(this.renderer);
        document.body.appendChild(button);
        

        this.scene = new Scene();

        
        
        
        
        this.particles = new ParticleSystem(this.scene,{
            movement_direction: new Vector3(0,0.7,0),
            spawnChance: 0.01,
            coloring: [new Color(1,1,0), new Color(1,0,0)],
            scale: [10.0, 1.0],
            spawnRadius: 0.2,
            baseLifeTime: 5.0
        });
        
     
        
  
        this.torches = [];
        const torch = new Torch(this.particles);
        this.scene.add(torch);
        this.torches.push(torch);
        const boat = new Boat(this.scene);
        this.camera = new PerspectiveCamera(60,window.innerWidth / window.innerHeight,0.1, 1000);
        this.camera.position.z = 12;
        this.camera.position.y = 3;
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.water = new WaterModel(this.scene, this.camera.position);
        this.skybox = new TempSkyBox(this.scene);

        this.sun = new DirectionalLight(Color.NAMES.white);
        this.sun.position.set(-10,10,-10);
        this.scene.add(this.sun);

        this.ambient = new AmbientLight(new Color(1,1,1),0.2);
        this.scene.add(this.ambient);

        this.old = 0;
    }

    update(elapsed: number) {

        
        const delta = Math.min(elapsed - this.old,20) / 1000;
        this.old = elapsed;
      
        this.water.update(delta);
        this.particles.update(delta);
        
        this.torches.forEach(x => x.update());
        
        this.renderer.render(this.scene, this.camera);
        
    }   

    resize(){
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth/window.innerHeight;
        this.camera.updateProjectionMatrix();
    }
}