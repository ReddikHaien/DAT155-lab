import { AmbientLight, BoxGeometry, Color, DirectionalLight, Light, Mesh, MeshBasicMaterial, MeshPhongMaterial, PerspectiveCamera, Scene, Vector3, WebGLRenderer} from "three";
import { SkyBox } from "./elements/Skybox";
import WaterModel from "./elements/WaterModel";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"
import {VRButton} from "three/examples/jsm/webxr/VRButton";
import ParticleSystem from "./elements/ParticleSystem";
import Torch from "./elements/Torch";
import SeagullManager from "./elements/SeagullManager";

export default class App{

    renderer: WebGLRenderer;
    scene: Scene;
    skyBoxScene: Scene;
    water: WaterModel;
    camera: PerspectiveCamera;
    sun: Light;
    old: number;
    skybox: SkyBox;
    controls: OrbitControls;
    particles: ParticleSystem;

    torches: Torch[];
    ambient: AmbientLight;
    seagulls: SeagullManager;

    constructor(){
        this.renderer = new WebGLRenderer({
            canvas: document.createElement("canvas")
        });
        this.renderer.setSize(window.innerWidth,window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);
        window.onresize = this.resize.bind(this);
    
        this.renderer.xr.enabled = true;
        this.renderer.setClearColor(new Color(0.0,0.0,0.0));
        this.renderer.setAnimationLoop(this.update.bind(this));
        const button = VRButton.createButton(this.renderer);
        document.body.appendChild(button);
        

        this.scene = new Scene();
        
        const box = new BoxGeometry(1,1,1);
        const boxMaterial = new MeshPhongMaterial({
            color: new Color(1,0,0)
        });
        const boxMesh = new Mesh(box,boxMaterial);
        this.scene.add(boxMesh);
        boxMesh.position.y = 2;
        boxMesh.position.x = 4;
        boxMesh.castShadow = true;
        
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

        this.camera = new PerspectiveCamera(60,window.innerWidth / window.innerHeight,0.1, 1000);
        this.camera.position.z = 12;
        this.camera.position.y = 3;
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        this.water = new WaterModel(this.scene, this.camera.position);
        this.skybox = new SkyBox(this.scene);

        this.sun = new DirectionalLight(Color.NAMES.white);
        this.sun.position.set(-10,10,-10);
        this.sun.castShadow = true;
        this.sun.shadow.mapSize.height = this.sun.shadow.mapSize.width = 1024;
        this.scene.add(this.sun);

        this.ambient = new AmbientLight(new Color(1,1,1),0.2);
        this.scene.add(this.ambient);

        this.seagulls = new SeagullManager();
        this.scene.add(this.seagulls)

        this.old = 0;
    }

    update(elapsed: number){
        const delta = Math.min(elapsed - this.old,20) / 1000;
        this.old = elapsed;

        this.water.update(delta, this.renderer, this.scene);
        this.particles.update(delta);

        this.torches.forEach(x => x.update());
        this.seagulls.update(delta);
        this.renderer.render(this.scene,this.camera);
    }   

    resize(){
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth/window.innerHeight;
        this.camera.updateProjectionMatrix();
    }
}