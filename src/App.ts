import { Color, WebGLRenderer } from "three";

export default class App{

    renderer: WebGLRenderer;

    constructor(){
        this.renderer = new WebGLRenderer({
            canvas: document.createElement("canvas")
        });
        this.renderer.setSize(window.innerWidth,window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        window.onresize = this.resize.bind(this);
    
        this.renderer.setClearColor(new Color(0.0,1.0,0.0));
        this.renderer.setAnimationLoop(this.update.bind(this));
    }

    update(){
        this.renderer.clear();
    }

    resize(){
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}