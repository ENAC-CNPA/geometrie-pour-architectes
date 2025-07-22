import { Extension, ObjectLayers } from "@speckle/viewer";
import {
  Raycaster,
  Vector2
} from "three";
export class SelectNonSpeckle extends Extension {
  public selectNonSpeckle() {
    const scene = this.viewer.getRenderer().scene;
    const camera = this.viewer.getRenderer().renderingCamera!;

    const raycaster = new Raycaster();
    raycaster.layers.set(ObjectLayers.OVERLAY);
    const mouse = new Vector2();

    let initialCameraPosition = camera.position.clone();

    window.addEventListener("click", (event: MouseEvent) => {
      if (camera.position.equals(initialCameraPosition)) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
          console.log("Clicked object:", intersects[0].object);
        }
      } else {
        initialCameraPosition = camera.position.clone();
      }
    });
  }
}
