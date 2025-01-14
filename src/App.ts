import { AmbientLight, BoxGeometry, Color, DirectionalLight, Euler, Light, Mesh, MeshPhongMaterial, Object3D, PerspectiveCamera, Scene, Vector3, WebGLRenderer} from "three";
import {VRButton} from "three/examples/jsm/webxr/VRButton";
import { SkyBox } from "./elements/Skybox";
import WaterModel from "./elements/WaterModel";
import BoatManager from "./elements/BoatManager";
import Rain from "./elements/Rain";
import SeagullManager from "./elements/SeagullManager";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"
import Torch from "./elements/Torch";
import { Terrain } from "./elements/Terrain";
import CampFire from "./elements/CampFire";
import Trees from "./elements/Trees";
import WaterFall from "./elements/WateFall";
import VRManager from "./elements/VrManager";
import {FirstPersonControls} from "three/examples/jsm/controls/FirstPersonControls";


const WORLD_POSITION = new Vector3();
export default class App{

    renderer: WebGLRenderer;
    scene: Scene;
    water: WaterModel;
    boats: BoatManager
    rain: Rain;
    camera: PerspectiveCamera;
    sun: Light;
    old: number;
    skybox: SkyBox;
    controls: FirstPersonControls;
    Terrain: Terrain;
    torches: Torch[];
    campFires: CampFire[];
    ambient: AmbientLight;
    seagulls: SeagullManager;
    Trees: Trees;
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
        


        //Trær
        //Ved å instansiere loaderen til GLTF

        this.scene = new Scene();
        const treesUrl = "models/kenny_nature_kit/Trees/tree_palmDetailedTall.glb";
        
        this.worldRoot = new Object3D();
        this.scene.add(this.worldRoot);
        const trees = new Trees(this.worldRoot, treesUrl, this.Terrain);
        
        const box = new BoxGeometry(1,1,1);
        const boxMaterial = new MeshPhongMaterial({
            color: new Color(1,0,0)
        });
        const boxMesh = new Mesh(box,boxMaterial);
        this.worldRoot.add(boxMesh);
        boxMesh.position.y = 2;
        boxMesh.position.x = 4;
        boxMesh.castShadow = true;
        
        this.campFires = [];
        this.torches = [];

        this.Terrain = new Terrain(this.worldRoot, trees, this.onTerrainLoaded.bind(this));
        

        this.camera = new PerspectiveCamera(60,window.innerWidth / window.innerHeight,0.1, 1000);
        this.camera.position.z = 12;
        this.camera.position.y = 3;
        this.controls = new FirstPersonControls(this.camera, this.renderer.domElement);
        this.controls.enabled = true;
        this.controls.movementSpeed = 15;
        this.controls.lookSpeed = 0.15;



        this.water = new WaterModel(this.worldRoot);
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

        this.waterFall = new WaterFall(new Vector3(21.5,6.5,68), new Euler((Math.PI/180)*44,Math.PI,0));
        this.Terrain.add(this.waterFall);
        this.boats = new BoatManager();
        this.worldRoot.add(this.boats)

        this.old = 0;

        this.vrManager = new VRManager(this.renderer,this.scene, this.worldRoot, this.Terrain);
    }

    onTerrainLoaded(terrain: Terrain){
        const campfires = [
            new Vector3(4,0,82),
        ]

        const torches = [
            new Vector3(0,0,0),
            new Vector3(39,0,44),
            new Vector3(-58,0,31),
            new Vector3(-45,56),
        ];

        for (const campfirePosition of campfires){
            const tx = ((campfirePosition.x + 200) / 400) * 256;
            const tz = ((campfirePosition.z + 200) / 400) * 256;
            campfirePosition.y = terrain.geometry.getHeightInterpolated(tx,tz)- 1.0;
            this.addCampFire(campfirePosition);
        }

        for(const torchPosition of torches){
            const tx = ((torchPosition.x + 200) / 400) * 256;
            const tz = ((torchPosition.z + 200) / 400) * 256;
            torchPosition.y = terrain.geometry.getHeightInterpolated(tx,tz) - 1.0;
            this.addTorch(torchPosition);
        }
    }

    addTorch(position: Vector3){
        const torch = new Torch();
        torch.position.copy(position);
        this.Terrain.add(torch);
        this.torches.push(torch);
    }

    addCampFire(position: Vector3){
        const campFire = new CampFire();
        campFire.position.copy(position);
        this.campFires.push(campFire);
        this.Terrain.add(campFire);

    }

    update(elapsed: number){
        const delta = Math.min(elapsed - this.old,20) / 1000;
        this.old = elapsed;
        
        this.controls.update(delta);

        this.water.update(delta);

        WORLD_POSITION.copy(this.worldRoot.position);
        WORLD_POSITION.negate();

        this.torches.forEach(x => x.update(delta,WORLD_POSITION));
        this.campFires.forEach(x => x.update(delta,WORLD_POSITION));
        this.waterFall.update(delta,WORLD_POSITION);
        this.seagulls.update(delta);
        this.boats.update(delta);
        this.renderer.render(this.scene,this.camera);
    }   

    resize(){
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth/window.innerHeight;
        this.camera.updateProjectionMatrix();
    }
}
