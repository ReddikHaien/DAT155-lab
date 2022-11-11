import { CubeTexture, CubeTextureLoader, Mesh, MeshBasicMaterial, Object3D, PMREMGenerator, Scene, SphereGeometry, sRGBEncoding, TextureLoader, Vector3, WebGLRenderer } from "three";

export class SkyBox{
    texture: CubeTexture;
    constructor(scene: Scene){

        this.texture = new CubeTextureLoader().load([
            "textures/skybox-px.png",
            "textures/skybox-nx.png",
            "textures/skybox-py.png",
            "textures/skybox-ny.png",
            "textures/skybox-pz.png",
            "textures/skybox-nz.png",
        ]);

        this.texture.encoding = sRGBEncoding;

        scene.background = this.texture;
    }
}