import { Box3, BufferGeometry, Color, Float32BufferAttribute, IUniform, Material, Mesh, Object3D, Points, PointsMaterial, Scene, Shader, ShaderMaterial, Texture, Vector3 } from "three";

export interface ParticleSystemOptions{
    
    particleCount: number,
    movement_direction: Vector3,
    spawnChance: number,
    coloring: Color | [Color,Color] | null,
    baseLifeTime: number,
    scale: number | [number, number],
    spawnRadius: number,
}

const POS_P = new Vector3(0,0,0);

export default class ParticleSystem extends Points{
   
    elapsed: number;
    particleCount: number;
    spawnChance: number;
    baseLifeTime: number;
    spawnRadius: number;

    constructor(scene: Object3D, {
        particleCount = 100,
        movement_direction = new Vector3(),
        spawnChance = 0.4,
        coloring = null,
        baseLifeTime = 10.0,
        scale = 10,
        spawnRadius = 1.0,
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
        const uniforms: Record<string,IUniform<any>> = {
            movement_direction: {
                value: movement_direction
            },
            time: {
                value: 0.0
            }
        };

        defines["USE_SIZEATTENUATION"] = 1;
        defines["BASE_LIFETIME"] = `float(${baseLifeTime})`;
        if (Array.isArray(coloring)){
            defines["USE_GRADIENT"] = 1;
            defines["GRADIENT_COLOR"] = `mix(vec3(float(${coloring[0].r}),float(${coloring[0].g}),float(${coloring[0].b})), vec3(float(${coloring[1].r}),float(${coloring[1].g}),float(${coloring[1].b})), 1.0 - time_left / BASE_LIFETIME)`;
        }
        else if (coloring){
            defines["CONST_COLOR"] = `vec4(float(${coloring.r}), float(${coloring.g}), float(${coloring.b}), 1.0);`
        }

        if(typeof scale == "number"){
            defines["CONST_SCALE"] = scale;
        }
        else{
            defines["USE_GRADIENT_SCALE"] = 1;
            defines["GRADIENT_SCALE"] = `mix(float(${scale[0]}), float(${scale[1]}), 1.0 - time_left / BASE_LIFETIME)`
        }

        super(buffer, new ShaderMaterial({
            uniforms,
            vertexShader: vertex,
            fragmentShader: fragment,
            defines
        }));

        this.elapsed = 0;
        this.spawnChance = spawnChance;
        this.particleCount = particleCount;
        this.spawnRadius = spawnRadius;
        this.baseLifeTime = baseLifeTime;

        this.geometry.boundingBox = new Box3(new Vector3(-spawnRadius,-spawnRadius,-spawnRadius), new Vector3(spawnRadius,spawnRadius,spawnRadius))

        scene.add(this);
    }

    spawn_particles(max_count: number, position?: Vector3,){
        POS_P.set(position?.x ?? 0, position?.y ?? 0, position?.z ?? 0);
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
                let d = Math.random() * this.spawnRadius;

                position_array[index] = POS_P.x + (Math.sin(r)*Math.cos(t)*d);
                position_array[index+1] = POS_P.y + (Math.cos(r)*Math.sin(t)*d);
                position_array[index+2] = POS_P.z + (Math.cos(r)*d);
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

#ifndef USE_GRADIENT_SCALE
const float scale = float(CONST_SCALE);
#endif

void main() {
    
	#include <color_vertex>
	#include <morphcolor_vertex>

    float lifetime = info.x - time;
    float spawnTime = info.y;
    vec3 transformed = vec3( position.xyz ) + movement_direction * (time - info.y);

    time_left = lifetime;

    #ifdef USE_GRADIENT_SCALE
    float scale = GRADIENT_SCALE;
    #endif

    #include <morphtarget_vertex>
	#include <project_vertex>

	gl_PointSize = 10.0;

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
    vec4 diffuseColor = vec4(GRADIENT_COLOR, 1.0);
    #else
	vec4 diffuseColor = CONST_COLOR;
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