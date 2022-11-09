import { AmbientLight, BoxGeometry, BufferGeometry, Material, Texture, Color, DirectionalLight, Light, Mesh, MeshBasicMaterial, Object3D, PerspectiveCamera, Scene, Vector3, WebGLRenderer, PointLight } from "three";
import * as THREE from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { MeshStandardMaterial } from "three/src/materials/MeshStandardMaterial";
export default class Boat {
    mesh: Mesh<BufferGeometry, Material>;
    light: PointLight;

    constructor(scene: Scene) {
        

        const loader = new GLTFLoader();
        var mesh: Object3D<THREE.Event> | THREE.Group;
        loader.load("models/boat.glb", function (gltf) {

            mesh = gltf.scene;
            
            gltf.scene.position.x += 10
            scene.add(mesh);
            
            
          
        }, undefined, function (a) {

            

        });
       
    
    }
    
}

    








