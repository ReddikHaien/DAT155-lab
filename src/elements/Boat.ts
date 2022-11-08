import { AmbientLight, BoxGeometry, Texture, Color, DirectionalLight, Light, Mesh, MeshBasicMaterial, Object3D, PerspectiveCamera, Scene, Vector3, WebGLRenderer, PointLight } from "three";
import * as THREE from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { MeshStandardMaterial } from "three/src/materials/MeshStandardMaterial";
export default class Boat {
    texture: Texture;
    mesh: Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
  
    
    light: PointLight;
   
    constructor(scene: Scene) {


        const loader = new GLTFLoader();

        loader.load("models/boat.glb", function (gltf) {

            let model = gltf.scene;
            scene.add(model);
            gltf.scene.position.setX(20)

            this.light = new PointLight(new Color(1, 1, 1), 10, 5.0);
            this.light.position.y = 1,3;
            this.light.position.x = 1,3;
            this.add(this.light);

        }, undefined, function (error) {

            console.error(error);

        });
    }
    update() {
        
      
        
    }
    }








