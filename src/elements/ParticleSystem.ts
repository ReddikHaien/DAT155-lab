import { BufferGeometry, Color, Float32BufferAttribute, Material, Mesh, Points, PointsMaterial, Scene, Shader, ShaderMaterial, Vector3 } from "three";


const particleGeo = new BufferGeometry();

export interface ParticleSystemOptions{
    
    particleCount: number,
    movement_direction: Vector3,
    spawnChance: number,
    gradient: [Color,Color] | null,
    baseLifeTime: number,
}

export default class ParticleSystem extends Points{
   
    elapsed: number;
    particleCount: number;
    spawnChance: number;
    ready: number[];
    nextDeadParticle: number;
    baseLifeTime: number;

    constructor(scene: Scene, {
        particleCount = 100,
        movement_direction = new Vector3(),
        spawnChance = 0.4,
        gradient = null,
        baseLifeTime = 10.0,
    }: Partial<ParticleSystemOptions> = {}){
        const buffer = new BufferGeometry();
        const verts: number[] = [];
        const info: number[] = [];
        for (let i = 0; i < particleCount; i++){
            verts.push(Math.random()*2,Math.random()*2 + 1,Math.random()*2);
            info.push(-1,0,-1);
        }
        buffer.setAttribute("position",new Float32BufferAttribute(verts,3));
        buffer.setAttribute("info",new Float32BufferAttribute(info,3));

        const defines: Record<string, string | number> = {};
        defines["USE_SIZEATTENUATION"] = 1;
        defines["BASE_LIFETIME"] = `float(${baseLifeTime})`;
        if (gradient){
            defines["USE_GRADIENT"] = 1;
            defines["GRADIENT_COLOR"] = `mix(vec3(float(${gradient[0].r}),float(${gradient[0].g}),float(${gradient[0].b})), vec3(float(${gradient[1].r}),float(${gradient[1].g}),float(${gradient[1].b})), 1.0 - time_left / BASE_LIFETIME)`;
        }

        super(buffer, new ShaderMaterial({
            uniforms: {
                size: {
                    value: 10.0
                },
                scale: {
                    value: 10.0
                },
                diffuse: {
                    value: [1.0,1.0,0.0]
                },
                opacity: {
                    value: 1.0
                },
                movement_direction: {
                    value: movement_direction
                },
                time: {
                    value: 0.0
                }
            },
            vertexShader: vertex,
            fragmentShader: fragment,
            defines
        }));

        this.elapsed = 0;
        this.spawnChance = spawnChance;
        this.particleCount = particleCount;
        this.nextDeadParticle = -1;
        this.baseLifeTime = baseLifeTime;
        this.ready = [];

        scene.add(this);
    }

    spawn_particles(position: Vector3, max_count: number){
    
        const info_b = this.geometry.getAttribute("info");
        const position_b = this.geometry.getAttribute("position");
        const info_array = info_b.array as Float32Array;
        const position_array = position_b.array as Float32Array;

        let updated = false;
        
        let dead: number[] = [];

        for (let i = 0; i < info_array.length; i+=3){
            if (info_array[i] < this.elapsed){
                dead.push(i);
            }
        }

        if (dead.length == 0){
            return;
        }
    
        for(let i = 0; i < max_count; i++){
            if (Math.random() < this.spawnChance){
                let index = dead.pop();
                if (!index){
                    break;
                }
                info_array[index] = this.elapsed + this.baseLifeTime;
                info_array[index+1] = this.elapsed;

                let r = Math.random()*2*Math.PI;
                let t = Math.random()*2*Math.PI;
                let d = Math.random();

                position_array[index] = position.x + d;
                position_array[index+1] = position.y + Math.random();
                position_array[index+2] = position.z + Math.random();
                updated = true;
            }
        }

        if (updated){
            info_b.needsUpdate = true;
            position_b.needsUpdate = true;
        }
    }

    update(delta: number){
        (this.material as ShaderMaterial).uniforms["time"].value += delta;
        this.elapsed += delta;
    }
}

export const vertex = /* glsl */`
uniform float size;
uniform float scale;
uniform float time;
uniform vec3 movement_direction;

in vec3 info;

#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

out float time_left;

void main() {
    
	#include <color_vertex>
	#include <morphcolor_vertex>

    float lifetime = info.x - time;
    float spawnTime = info.y;
    vec3 transformed = vec3( position.xyz ) + movement_direction * (time - info.y);

    time_left = lifetime;

    #include <morphtarget_vertex>
	#include <project_vertex>

	gl_PointSize = size;

	#ifdef USE_SIZEATTENUATION

		bool isPerspective = isPerspectiveMatrix( projectionMatrix );

		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
    gl_Position *= float(lifetime > 0.0);
    gl_PointSize *= float(lifetime > 0.0);

	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>

}
`;

export const fragment = /* glsl */`
uniform vec3 diffuse;
uniform float opacity;

#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

in float time_left;

void main() {

	#include <clipping_planes_fragment>

	vec3 outgoingLight = vec3( 0.0 );

    #ifdef USE_GRADIENT
    vec4 diffuseColor = vec4( GRADIENT_COLOR, opacity );
    #else
	vec4 diffuseColor = vec4( diffuse, opacity );

    #endif

	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>

	outgoingLight = diffuseColor.rgb;

	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>

}
`;