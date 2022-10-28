import { Color, Material, Mesh, MeshBasicMaterial, MeshPhongMaterial, Object3D, PlaneGeometry, RepeatWrapping, TextureLoader, Vector2, Vector3, Wrapping } from "three";
import { Water } from "three/examples/jsm/objects/Water";
export default class WaterModel{
    
    mesh: Water;
    shader: Material;
    constructor(parent: Object3D, camera_pos: Vector3){
        
        const geometry = new PlaneGeometry(10000,10000);

        geometry.rotateX(-Math.PI/2);

        const texture = new TextureLoader().load("textures/waternormals.jpg");
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;

        this.mesh = new Water(geometry,{
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: texture,
            sunDirection: new Vector3(-10,10,-10).normalize(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            eye: camera_pos,
            fog: false,
        });
        this.mesh.position.set(-10,0,-10);
        parent.add(this.mesh);
    }

    update(delta: number){
        this.mesh.material.uniforms["time"].value += delta;
    }
}