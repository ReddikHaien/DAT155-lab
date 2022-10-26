import { WebGLRenderer } from "three";

export default class App{

    renderer: WebGLRenderer;

    constructor(){
        this.renderer = new WebGLRenderer({
            canvas: document.createElement("canvas")
        });

        this.renderer.setSize(window.innerWidth,window.innerHeight);

        document.body.appendChild(this.renderer.domElement);

        window.onresize = this.resize.bind(this);
    }

    resize(){
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}