import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { Camera, Object3D, Vector3, WebGLRenderer, XRGripSpace, XRTargetRaySpace } from "three";


const TEMP = new Vector3(0,0,0);

export default class VRManager{
    renderer: WebGLRenderer;

    selects: number ;
    controller1: XRTargetRaySpace;
    controller0: XRTargetRaySpace;

    constructor(renderer: WebGLRenderer, scene: Object3D){
        this.renderer = renderer;
        const factory = new XRControllerModelFactory();

        const controller0 = renderer.xr.getController(0);
        const controller1 = renderer.xr.getController(1);

        const controllerGrip0 = renderer.xr.getControllerGrip(0);
        const controllerGrip1 = renderer.xr.getControllerGrip(1);
        const model0 = this.addModel(controllerGrip0, factory);
        const model1 = this.addModel(controllerGrip1, factory);
        scene.add(controllerGrip0, controllerGrip1);
        this.selects = 0;
        controller0.addEventListener("selectstart",() => {
            this.selects+=1;
        });

        controller0.addEventListener("selectend", () => {
            this.selects-=1;
        });
        
        controller1.addEventListener("selectstart",() => {
            this.selects+=1;
        });

        controller1.addEventListener("selectend", () => {
            this.selects-=1;
        });

        this.controller0 = controller0;
        this.controller1 = controller1;
    }

    update(delta: number){
        if (this.selects > 0){
            const direction = this.renderer.xr.getCamera()
            .getWorldDirection(TEMP);


            const v0 = this.controller0.linearVelocity.normalize();
            const v1 = this.controller1.linearVelocity.normalize();

            const m0 = direction.dot(v0);
            const m1 = direction.dot(v1);
            
            if (v0.lengthSq() > 0 || v1.lengthSq() > 0){
                console.log(v0, v1);
            }

            const m = Math.max(0,m0) + Math.max(0,m1);

            this.renderer.xr
            .getCamera()
            .translateOnAxis(direction,m);
        }
    }

    movePlayer(newPos: Vector3){
        const temp = new Vector3(0,0,0);
        const feet = this.renderer.xr
        .getCamera()
        .getWorldPosition(temp);
        feet.y = 0;
    }

    addModel(controllerGrip: XRGripSpace, factory: XRControllerModelFactory){
        const model = factory.createControllerModel(controllerGrip);
        controllerGrip.add(model);
        return model;
    }
}