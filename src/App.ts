import { AmbientLight, BoxGeometry, Color, DirectionalLight, Euler, Light, Mesh, MeshPhongMaterial, Object3D, PerspectiveCamera, Scene, Vector3, WebGLRenderer} from "three";
import { SkyBox } from "./elements/Skybox";
import WaterModel from "./elements/WaterModel";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"
import {VRButton} from "three/examples/jsm/webxr/VRButton";
import ParticleSystem from "./elements/ParticleSystem";
import Torch from "./elements/Torch";
import { Terrain } from "./elements/Terrain";
import SeagullManager from "./elements/SeagullManager";
import CampFire from "./elements/CampFire";
import WaterFall from "./elements/WateFall";
import VRManager from "./elements/VrManager";

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
    Terrain: Terrain;
    torches: Torch[];
    torchParticles: ParticleSystem;
    ambient: AmbientLight;
    seagulls: SeagullManager;
    campFireParticles: ParticleSystem;
    campFires: CampFire[];
    waterFall: WaterFall;
    
    //parent used to adjust the entire scene to correspond with the vr player
    worldRoot: Object3D;
    vrManager: VRManager;
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
        
        this.worldRoot = new Object3D();
        this.scene.add(this.worldRoot);

        const box = new BoxGeometry(1,1,1);
        const boxMaterial = new MeshPhongMaterial({
            color: new Color(1,0,0)
        });
        const boxMesh = new Mesh(box,boxMaterial);
        this.worldRoot.add(boxMesh);
        boxMesh.position.y = 2;
        boxMesh.position.x = 4;
        boxMesh.castShadow = true;
        
        this.Terrain = new Terrain(this.worldRoot);

        this.torchParticles = new ParticleSystem(this.Terrain.root,{
            movement_direction: new Vector3(0,0.7,0),
            spawnChance: 0.01,
            coloring: [new Color(1,1,0), new Color(1,0,0)],
            scale: [10.0, 1.0],
            spawnRadius: 0.2,
            baseLifeTime: 5.0
        });

        this.campFireParticles = new ParticleSystem(this.Terrain.root,{
            particleCount: 500,
            movement_direction: new Vector3(0,0.7,0),
            spawnChance: 0.01,
            coloring: [new Color(1,1,0), new Color(1,0,0)],
            scale: [10.0, 1.0],
            spawnRadius: 0.5,
            baseLifeTime: 6.0
        })
        
        this.camera = new PerspectiveCamera(60,window.innerWidth / window.innerHeight,0.1, 20000);
        this.camera.position.z = 12;
        this.camera.position.y = 3;
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        this.water = new WaterModel(this.worldRoot, this.camera.position);
        this.skybox = new SkyBox(this.scene);

        this.sun = new DirectionalLight(Color.NAMES.white);
        this.sun.position.set(-10,10,-10);
        this.sun.castShadow = true;
        this.sun.shadow.mapSize.height = this.sun.shadow.mapSize.width = 1024;
        this.scene.add(this.sun);

        this.ambient = new AmbientLight(new Color(1,1,1),0.2);
        this.scene.add(this.ambient);

        this.seagulls = new SeagullManager();
        this.Terrain.add(this.seagulls)

        this.waterFall = new WaterFall(new Vector3(21.5,6.5,68), new Euler((Math.PI/180)*44,Math.PI,0),this.scene.fog !== undefined);
        this.Terrain.add(this.waterFall);
        
        this.campFires = [];
        this.torches = [];

        this.old = 0;

        this.vrManager = new VRManager(this.renderer,this.scene, this.worldRoot);
    }

    addTorch(position: Vector3){
        const torch = new Torch(this.torchParticles);
        torch.position.copy(position);
        this.Terrain.add(torch);
        this.torches.push(torch);
    }

    addCampFire(position: Vector3){
        const campFire = new CampFire(this.campFireParticles);
        campFire.position.copy(position);
        this.campFires.push(campFire);
        this.Terrain.add(campFire);

    }

    update(elapsed: number){
        const delta = Math.min(elapsed - this.old,20) / 1000;
        this.old = elapsed;

        this.water.update(delta, this.renderer, this.scene);

        this.torchParticles.update(delta);
        this.campFireParticles.update(delta);
        this.seagulls.update(delta);
        this.waterFall.update(delta);

        this.torches.forEach(x => x.update());
        this.campFires.forEach(x => x.update());

        this.vrManager.update(delta);

        this.renderer.render(this.scene,this.camera);
    }   

    resize(){
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth/window.innerHeight;
        this.camera.updateProjectionMatrix();
    }
}
