import { BoxGeometry, Color, DirectionalLight, Light, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, Vector3, WebGLRenderer} from "three";
import { TempSkyBox } from "./elements/Skybox";
import WaterModel from "./elements/WaterModel";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"
import {VRButton} from "three/examples/jsm/webxr/VRButton";
import ParticleSystem from "./elements/ParticleSystem";

export default class App{

    renderer: WebGLRenderer;
    scene: Scene;
    skyBoxScene: Scene;
    water: WaterModel;
    camera: PerspectiveCamera;
    sun: Light;
    old: number;
    skybox: TempSkyBox;
    controls: OrbitControls;
    particles: ParticleSystem;

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
        
        const box = new BoxGeometry(1,1,1);
        console.log(box);
        const boxMaterial = new MeshBasicMaterial({
            color: new Color(1,0,0)
        });

        console.log(boxMaterial);

        const boxMesh = new Mesh(box,boxMaterial);
        this.scene.add(boxMesh);
        
        this.camera = new PerspectiveCamera(60,window.innerWidth / window.innerHeight,0.1, 1000);
        this.camera.position.z = 12;
        this.camera.position.y = 3;
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        this.water = new WaterModel(this.scene, this.camera.position);
        this.skybox = new TempSkyBox(this.scene);
        
        this.particles = new ParticleSystem(this.scene,{
            movement_direction: new Vector3(0,0.4,0),
            spawnChance: 0.01,
            gradient: [new Color(1,1,0), new Color(1,0,0)]
        });

        this.sun = new DirectionalLight(Color.NAMES.ivory);
        this.sun.position.set(-10,10,-10);

        this.scene.add(this.sun);
        this.old = 0;
    }

    update(elapsed: number){
        const delta = Math.min(elapsed - this.old,20) / 1000;
        this.old = elapsed;

        this.water.update(delta);
        this.particles.spawn_particles(new Vector3(),10);
        this.particles.update(delta);

        this.renderer.render(this.scene,this.camera);
    }   

    resize(){
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth/window.innerHeight;
        this.camera.updateProjectionMatrix();
    }
}