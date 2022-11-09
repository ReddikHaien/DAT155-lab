import * as THREE from "three";
import { getHeightmapData } from "./utils.js";
import TextureSplattingMaterial from "./TextureSplattingMaterial.js";

export class Terrain{

    constructor(scene) {
        const terrainImage = new Image();
        terrainImage.onload = () => {

            const size = 400;

            const geometry = new TerrainGeometry(400, 256, 60, terrainImage);

            const grass = new THREE.TextureLoader().load('textures/grass.png');
            const rock = new THREE.TextureLoader().load('textures/rock.png');
            const alphaMap = new THREE.TextureLoader().load('textures/hm.png');

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
                colorMaps: [grass, rock],
                alphaMaps: [alphaMap]
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.setY(-1);

            scene.add(mesh);
            mesh.position.y = -1;

        };
        terrainImage.src = 'textures/hm.png';
    }
}
class TerrainGeometry extends THREE.PlaneGeometry {
    constructor(size, resolution, height, image) {
        super(size, size, resolution - 1, resolution - 1);

        this.rotateX((Math.PI / 180) * -90);

        const data = getHeightmapData(image, resolution);

        for (let i = 0; i < data.length; i++) {
            this.attributes.position.setY(i, data[i] * height);
        }
    }
}