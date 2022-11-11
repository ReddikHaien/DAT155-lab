import { Color, Euler, Mesh, MeshPhongMaterial, Object3D, PlaneGeometry, Quaternion, RepeatWrapping, ShaderLib, ShaderMaterial, Texture, TextureLoader, UniformsUtils, Vector3 } from "three";
import ParticleSystem from "./ParticleSystem";

export default class WaterFall extends Object3D{
    material: TestMaterial;
    particleSystem: ParticleSystem;
    spawnPosition: Vector3;
    constructor(position: Vector3, rotation: Euler){
        super();
        this.position.copy(position);
        this.rotation.copy(rotation);
        const geometry = new PlaneGeometry(10,25);

        const uvs = geometry.getAttribute("uv");
        const arr = uvs.array as Float32Array;

        for (let i = 0; i < arr.length; i+=2){
            arr[i] *= 10;
            arr[i+1] *= 25;
        }

        const texture = new TextureLoader().load("textures/water_flowing.jpg", e => {
            e.wrapS = e.wrapT = RepeatWrapping;
        });

        this.material = new TestMaterial(texture);
        this.particleSystem = new ParticleSystem(this,{
            baseLifeTime: 0.1,
            coloring: new Color(0.8,1.0,1.0),
            particleCount: 1000,
            movement_direction: new Vector3(0.0,-0.01,0.0),
            spawnChance: 1.1,
            spawnRadius: 4.0,
        });
        this.spawnPosition = new Vector3(0,-10,0);
        this.add(new Mesh(geometry,this.material));
    }

    update(delta: number){
        this.material.update(delta);
        this.particleSystem.spawn_particles(this.spawnPosition,100);
        this.particleSystem.update(delta);
    }
}

class TestMaterial extends ShaderMaterial{
    constructor(map: Texture){
        const vertexShader = `
        out vec2 vUv1;
        out vec2 vUv2;

        uniform float time;

        void main(){
            vUv1 = uv + vec2(0,time*5.0);
            vUv2 = uv + vec2(0,time*2.0);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    
    `;

    const fragmentShader = `
            uniform sampler2D textureInShader;
            
            in vec2 vUv1;
            in vec2 vUv2;
            
            void main(){
                vec4 c2 = texture(textureInShader, vUv2 / 8.0);
                vec4 c3 = texture(textureInShader, vUv1 / 2.0);

                gl_FragColor = vec4(mix(c3,c2,0.5).xyz, 1.0);
            }
        `;

    
        super({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {

                textureInShader: {
                    value: map
                },

                time: {
                    value: 0.0
                }
            }
        });

    }

    update(delta: number){
        this.uniforms.time.value += delta;
    }
}
