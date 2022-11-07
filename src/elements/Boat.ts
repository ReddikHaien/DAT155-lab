import { AmbientLight, BoxGeometry, Texture, Color, DirectionalLight, Light, Mesh, MeshBasicMaterial, Object3D, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three";
import * as THREE from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { MeshStandardMaterial } from "three/src/materials/MeshStandardMaterial";
export default class Boat {
    texture: Texture;
    mesh: Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
    add: any;
    constructor(scene: Scene) {


        const loader = new GLTFLoader()
        loader.load("models/boat.glb", function (glb) {
            console.log(glb)
            const root = glb.scene;
            root.scale.set(0.01, 0.01, 0.01);
            this.add(root);



        }, function (xhr) {
            console.log(xhr.loaded / xhr.total * 100) + "% loaded"
        }, function (error) {
            console.log('an error occured')


        });
    }


}



    











