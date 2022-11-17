import { Color, Euler, Mesh, MeshPhongMaterial, Object3D, PlaneGeometry, Quaternion, RepeatWrapping, ShaderLib, ShaderMaterial, Texture, TextureLoader, UniformsUtils, Vector3 } from "three";
import ParticleSystem from "./ParticleSystem";

export default class WaterFall extends Object3D{
    material: WaterFallMaterial;
    particleSystem: ParticleSystem;
    water: Mesh;
    constructor(position: Vector3, rotation: Euler){
        super();
        this.position.copy(position);

        const waterMirror = new PlaneGeometry(20,21);

        const pondMaterial = new MeshPhongMaterial({
            color: 0x001e0f,
            shininess: 0.1
        });

        this.water = new Mesh(waterMirror,pondMaterial);
        
        this.water.rotateX(-Math.PI/2);
        this.water.position.set(-1.8,8.8,19.3);


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

        this.material = new WaterFallMaterial(texture);
        this.particleSystem = new ParticleSystem(this,{
            baseLifeTime: 0.1,
            coloring: new Color(0.8,1.0,1.0),
            particleCount: 1000,
            movement_direction: new Vector3(0.0,-0.01,0.0),
            spawnChance: 1.1,
            spawnRadius: 4.0,
        });
        this.particleSystem.position.copy(new Vector3(0,-7,-3.5));

        const mesh = new Mesh(geometry,this.material);
        mesh.rotation.copy(rotation);
        mesh.position.set(-1.0,0,0)
        this.add(mesh);
        this.add(this.water);
    }

    update(delta: number, playerPos: Vector3){
        this.material.update(delta);
        if (playerPos.distanceToSquared(this.position) <= (40*40)){
            this.particleSystem.spawn_particles(300);
            this.particleSystem.update(delta);
        }

    }
}

class WaterFallMaterial extends ShaderMaterial{
    constructor(map: Texture){
        const vertexShader = `
        out vec2 vUv1;
        out vec2 vUv2;

        uniform float time;

        void main(){
            vUv1 = uv + vec2(0,time*3.0);
            vUv2 = uv + vec2(0,time);
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
