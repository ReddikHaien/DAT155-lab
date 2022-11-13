import * as THREE from "three";
import { getHeightmapData } from "./utils.js";
import TextureSplattingMaterial from "./TextureSplattingMaterial.js";
import { Object3D } from "three";

export class Terrain{
    root: Object3D;
    geometry: TerrainGeometry;

    constructor(scene: Object3D) {
        this.root = new Object3D();
        scene.add(this.root);
        const terrainImage = new Image();
        terrainImage.onload = () => {

            const size = 400;

            const geometry = new TerrainGeometry(400, 256, 60, terrainImage);

            const grass = new THREE.TextureLoader().load('textures/grass.png');
            const rock = new THREE.TextureLoader().load('textures/rock.png');
            const sand = new THREE.TextureLoader().load('textures/sand.png');
            const alphaMap = new THREE.TextureLoader().load('textures/test-splatmap.png');

            grass.wrapS = THREE.RepeatWrapping;
            grass.wrapT = THREE.RepeatWrapping;

            grass.repeat.multiplyScalar(size / 16);

            rock.wrapS = THREE.RepeatWrapping;
            rock.wrapT = THREE.RepeatWrapping;

            rock.repeat.multiplyScalar(size / 28);

            const material = new TextureSplattingMaterial({
                color: 0xffffff,
                emissive: 0x000000,
                roughness: 4.0,
                metalness: 0.0,
                colorMaps: [grass, rock, sand],
                alphaMaps: [alphaMap]
            });

            geometry.computeVertexNormals();
            this.geometry = geometry;

            scene.position.y = -geometry.getHeight(256/2,256/2);
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.position.setY(-1);

            this.root.add(mesh);
            mesh.position.y = -1;
        };
        terrainImage.src = 'textures/heightmap.png';
    }


    add(...objects: Object3D[]){
        this.root.add(...objects);
    }
}
class TerrainGeometry extends THREE.PlaneGeometry {
    width: number;
    constructor(size, resolution, height, image) {
        super(size, size, resolution - 1, resolution - 1);

        this.rotateX((Math.PI / 180) * -90);

        const data = getHeightmapData(image, resolution);

        for (let i = 0; i < data.length; i++) {
            this.attributes.position.setY(i, data[i] * height);
        }
        this.width = resolution;
    }

    getHeight(x: number, y: number){   
        
        x = Math.max(0,Math.min(255,x));
        y = Math.max(0,Math.min(255,y));
        
        return this.attributes.position.getY((~~y)*this.width + (~~x));
    }

    getHeightInterpolated(x: number, y: number){
        

        //We first need to define the box sorounding the point
        //                d1             
        //(minx, maxy) ------- (maxx, maxy)
        //      |         |          |
        //      |         |          |
        //      |         X          | d2
        //      |         |          |
        // (minx, miny) ------ (maxx, miny)
        //                d0
        //This will allow us to find the interpolated height between the 4 points

        const minx = Math.floor(x);
        const maxx = minx+1;
        const miny = Math.floor(y);
        const maxy = miny+1;
        const deltax = 1 - (maxx-x);
        const deltay = 1 - (maxy-y);

        //We first interpolate along the x axis

        const d0 = interpolate(this.getHeight(minx,miny),this.getHeight(maxx,miny),deltax);
        const d1 = interpolate(this.getHeight(minx,maxy),this.getHeight(maxx,maxy), deltax);

        console.log(d0, d1, deltax, deltay);

        //We can now return the interpolated value along the y axis, given the deltas along the x axis
        return interpolate(d0,d1,deltay);
    }
}



/**
 * simple linear interpolation between two values
 * @param min minimum value
 * @param max maximum valur
 * @param delta delta between 0 and 1
 * @returns the interpolated value
 */
function interpolate(min: number, max: number, delta: number){
    return (max - min)*delta + min
}