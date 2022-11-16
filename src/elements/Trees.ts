"use strict";



import { GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import PoissonDiskSampling from "poisson-disk-sampling";
import { Mesh } from "three";

// trees
export default class Trees {
    scene: any;
    textureUrl: any;
    terrainGeometry: any;

    constructor(scene, textureUrl, terrainGeometry) {
        this.scene = scene;
        this.textureUrl = textureUrl;
        this.terrainGeometry = terrainGeometry;
    }

    generateTrees = (grid, minDist, maxDist, minHeight, maxHeight) => {
        console.log(this.terrainGeometry);
        const offset = this.terrainGeometry.geometry.width / 2;
        const loader = new GLTFLoader();
        let pds = new PoissonDiskSampling ({
            shape: grid,
            minDistance: minDist,
            maxDistance: maxDist,
            tries: 10,
        });

        let points = pds.fill();
        console.log(points);

        loader.load(
            this.textureUrl,
            (object) => {
                for (const point of points) {
                    const px = point[0] - offset;
                    const pz = point[1] - offset;


                    const height = this.terrainGeometry.geometry.getHeight(point[0], point[1]);
                    const model = object.scene.children[0].clone();

                    if (height > minHeight && height < maxHeight) {
                        model.traverse((child) => {
                            if ((child as Mesh).isMesh) {
                                child.castShadow = false;
                                child.receiveShadow = false;
                            }
                        });
                        const scale = 400/256;
                        model.position.x = px*scale;
                        model.position.y = height - 0.001;
                        model.position.z = pz*scale;

                        model.rotation.y = Math.random() * (2 * Math.PI);

                        model.scale.multiplyScalar(2 + Math.random() * 2);

                        model.castShadow = true;
                        model.receiveShadow = true;
                        this.scene.add(model);
                        console.log("Added",model.position);
                    }
                    else{
                        console.log("Not added",height)
                    }
                }
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
            },
            (error) => {
                console.error("Error loading model.", error);
            }
        );
    };
}