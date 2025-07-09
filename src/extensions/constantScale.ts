import { Extension } from "@speckle/viewer";
import {
  Object3D,
  PerspectiveCamera,
  OrthographicCamera,
  Vector2,
} from "three";

export class ConstantScale extends Extension {
  public constantScale(object: Object3D, pixelSize: number) {
    const camera = this.viewer.getRenderer().renderingCamera as
      | OrthographicCamera
      | PerspectiveCamera;
      
    const threeRenderer = this.viewer.getRenderer().renderer;
    const rendererSize = new Vector2();
    threeRenderer.getSize(rendererSize);

    if (camera.type === "PerspectiveCamera") {
    } else if (camera.type === "OrthographicCamera") {
      const orthographicCamera = camera as OrthographicCamera;
      const worldHeight = orthographicCamera.top - orthographicCamera.bottom;
      const worldUnitsPerPixel = worldHeight / rendererSize.y;
      const scale = pixelSize * worldUnitsPerPixel;
      object.scale.set(scale, scale, scale);
    }
  }
}
