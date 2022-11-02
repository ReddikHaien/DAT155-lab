import { CubeTexture, CubeTextureLoader, Mesh, MeshBasicMaterial, Object3D, PMREMGenerator, Scene, SphereGeometry, sRGBEncoding, Texture, TextureLoader, Vector3, WebGLRenderer } from "three";
import * as THREE from 'three';
export default class Boat {
    texture: Texture;
    mesh: Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
    constructor(scene: Scene) {

        const geometry = new THREE.BoxGeometry(30, 30, 30);
        const material = new THREE.MeshStandardMaterial({ roughness: 0 });
       this.mesh = new THREE.Mesh(geometry, material);

        scene.add(this.mesh);

       
    }
}