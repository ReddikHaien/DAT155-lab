import { Color, IUniform, Material, Mesh, MeshBasicMaterial, MeshPhongMaterial, MeshPhongMaterialParameters, Object3D, PerspectiveCamera, PlaneGeometry, RepeatWrapping, Scene, ShaderLib, ShaderMaterial, TextureLoader, UniformsUtils, Vector2, Vector3, WebGLRenderer, WebGLRenderTarget, Wrapping } from "three";
import { Water } from "three/examples/jsm/objects/Water";
export default class WaterModel{
    
    mesh: Water;
    shader: Material;
    constructor(parent: Object3D, camera_pos: Vector3){
        
        const geometry = new PlaneGeometry(4000,4000);

        geometry.rotateX(-Math.PI/2);

        const texture = new TextureLoader().load("textures/waternormals.jpg",e => {
        });
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
        this.mesh.position.set(0,0,0);
        parent.add(this.mesh);
    }

    update(delta: number, renderer: WebGLRenderer, scene: Scene){
        this.mesh.material.uniforms.time.value += delta;
    }
}
