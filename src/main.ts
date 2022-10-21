import { BoxGeometry, Color, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, TextureLoader, WebGLRenderer } from "three";


const renderer = new WebGLRenderer({
    canvas: document.createElement("canvas")
});

renderer.setSize(window.innerWidth,window.innerHeight);

document.body.appendChild(renderer.domElement);

const cubePrim = new BoxGeometry(1,1,1);

const texture = new TextureLoader().load("./test.png");

const cubeMat = new MeshBasicMaterial({
    map: texture,
});

const m = new Mesh(cubePrim,cubeMat);

const perspective = new PerspectiveCamera(60,window.innerWidth / window.innerHeight,0.1, 1000);

const scene = new Scene()
scene.add(m,perspective);
m.position.z = -5;

renderer.domElement.onresize = () => {
    perspective.aspect = window.innerWidth / window.innerHeight;
    perspective.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

renderer.setAnimationLoop(() => {
    m.rotateZ(0.01);
    m.rotateX(-0.01);
    renderer.render(scene,perspective);
});

