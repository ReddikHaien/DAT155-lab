import { BufferGeometry, Color, Float32BufferAttribute, Material, Mesh, Points, PointsMaterial, Scene, Shader, ShaderMaterial, Vector3 } from "three";


const particleGeo = new BufferGeometry();


export default class ParticleSystem extends Points{
   
    elapsed: number;
    particleCount: number;
    spawnChance: number;

    constructor(scene: Scene, {
        particleCount = 100,
        movement_direction = new Vector3(),
        spawnChance = 0.4
        
    } = {}){
        const buffer = new BufferGeometry();
        const verts: number[] = [];
        const info: number[] = [];
        for (let i = 0; i < particleCount; i++){
            verts.push(Math.random()*2,Math.random()*2 + 1,Math.random()*2);
            info.push(-1,0,-1);
        }
        buffer.setAttribute("position",new Float32BufferAttribute(verts,3));
        buffer.setAttribute("info",new Float32BufferAttribute(info,3));
        

        super(buffer, new ShaderMaterial({
            uniforms: {
                size: {
                    value: 10.0
                },
                scale: {
                    value: 1.0
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
        }));

        this.elapsed = 0;
        this.spawnChance = spawnChance;
        this.particleCount = particleCount;


        scene.add(this);
    }

    spawn_particles(position: Vector3, max_count: number){
        const info_b = this.geometry.getAttribute("info");
        const position_b = this.geometry.getAttribute("position");
        const info_array = info_b.array as Float32Array;
        const position_array = position_b.array as Float32Array;

        let updated = false;
        for(let i = 0; i < max_count; i++){
            if (Math.random() < this.spawnChance){
                for (let i = 0;  i < info_array.length; i+=3){
                    if (info_array[i] < this.elapsed){
                        console.log("updating! ",i,position);
                        info_array[i] = this.elapsed + 10;
                        info_array[i+1] = this.elapsed;

                        position_array[i] = position.x + Math.random();
                        position_array[i+1] = position.y + Math.random();
                        position_array[i+2] = position.z + Math.random();
                        updated = true;
                        break;
                    }
                    
                }

                if (!updated){
                    //No particles available    
                    break;
                }
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

void main() {
    
	#include <color_vertex>
	#include <morphcolor_vertex>

    float lifetime = info.x - time;
    float spawnTime = info.y;
    vec3 transformed = vec3( position.xyz ) + movement_direction * (time - info.y);


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

void main() {

	#include <clipping_planes_fragment>

	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );

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