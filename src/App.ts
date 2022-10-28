import { Color, DirectionalLight, Light, PerspectiveCamera, Scene, WebGLRenderer} from "three";
import { TempSkyBox } from "./elements/Skybox";
import WaterModel from "./elements/WaterModel";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"
import {VRButton} from "three/examples/jsm/webxr/VRButton";

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
        this.skyBoxScene = new Scene();
        
        
        this.camera = new PerspectiveCamera(60,window.innerWidth / window.innerHeight,0.1, 1000);
        this.camera.position.z = 12;
        this.camera.position.y = 3;
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        this.water = new WaterModel(this.scene, this.camera.position);
        this.skybox = new TempSkyBox(this.scene);
        
        this.sun = new DirectionalLight(Color.NAMES.ivory);
        this.sun.position.set(-10,10,-10);

        this.scene.add(this.sun);
        this.old = 0;
    }

    update(elapsed: number){
        const delta = Math.min(elapsed - this.old,20) / 1000;
        this.old = elapsed;

        this.water.update(delta);

        this.renderer.render(this.skyBoxScene,this.camera);
        this.renderer.render(this.scene,this.camera);
    }   

    resize(){
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth/window.innerHeight;
        this.camera.updateProjectionMatrix();
    }
}