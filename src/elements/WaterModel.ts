import { Color, IUniform, Material, Mesh, MeshBasicMaterial, MeshPhongMaterial, MeshPhongMaterialParameters, Object3D, PerspectiveCamera, PlaneGeometry, RepeatWrapping, Scene, ShaderLib, ShaderMaterial, TextureLoader, UniformsUtils, Vector2, Vector3, WebGLRenderer, WebGLRenderTarget, Wrapping } from "three";
import { Water } from "three/examples/jsm/objects/Water";
export default class WaterModel{
    
    mesh: Water;
    constructor(parent: Object3D, camera_pos: Vector3){
        
        const geometry = new PlaneGeometry(10000,10000);

        const texture = new TextureLoader().load("textures/waternormals.jpg",e => {
            e.wrapS = RepeatWrapping;
            e.wrapT = RepeatWrapping;
        });

        this.mesh = new Water(geometry,{
            alpha: 1.0,
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: texture,
            sunDirection: new Vector3(-10,10,-10).normalize(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: (parent as Scene).fog !== undefined,
        });

        const onBeforeRender = this.mesh.onBeforeRender;

        let tickTime = 0;

        this.mesh.onBeforeRender = (renderer, scene,camera, geometry, material, group) => {
            // tickTime++;
            // if (tickTime >= 6){
            //     onBeforeRender(renderer, scene, camera, geometry, material, group);
            //     tickTime = 0;
            // }
        }

        this.mesh.rotateX(- Math.PI / 2);

        parent.add(this.mesh);
    }

    update(delta: number, renderer: WebGLRenderer, scene: Scene){
        this.mesh.material.uniforms.time.value += delta;
    }
}
