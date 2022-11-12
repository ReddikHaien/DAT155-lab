import { AmbientLight, BoxGeometry, BufferGeometry, Material, Texture, Color, DirectionalLight, Light, Mesh, MeshBasicMaterial, Object3D, PerspectiveCamera, Scene, Vector3, WebGLRenderer, PointLight, CatmullRomCurve3, AnimationMixer } from "three";
import * as THREE from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { MeshStandardMaterial } from "three/src/materials/MeshStandardMaterial";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";


export default class Rain extends Object3D {
    
    constructor() {
        super();
        const geometry = new THREE.BufferGeometry();
        const vertices = [];

        const raincount = 100
        for (let i = 0; i < 1000; i++) {
            vertices.push(
                Math.random() * 120 - 60,
                Math.random() * 180 - 80,
                Math.random() * 130 - 60
            );
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const material = new THREE.PointsMaterial({ color: '#ffffff' });
        let rain = new THREE.Points(geometry, material);
        
    }
    update(delta: number) {
        

        

        
    }
}







