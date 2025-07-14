import { Extension } from "@speckle/viewer";
import {
  Object3D,
  PerspectiveCamera,
  OrthographicCamera,
  Vector2,
  MathUtils
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
      const perspectiveCamera = camera as PerspectiveCamera;
      const distance = perspectiveCamera.position.distanceTo(object.position);
      const fov = MathUtils.degToRad(perspectiveCamera.fov);
      const screenHeightWorld = 2 * distance * Math.tan(fov / 2)
      const worldUnitsPerPixel = screenHeightWorld / rendererSize.y
      const scale = pixelSize * worldUnitsPerPixel;
      object.scale.set(scale, scale, scale);

    } else if (camera.type === "OrthographicCamera") {
      const orthographicCamera = camera as OrthographicCamera;
      const worldHeight = orthographicCamera.top - orthographicCamera.bottom;
      const worldUnitsPerPixel = worldHeight / rendererSize.y;
      const scale = pixelSize * worldUnitsPerPixel;
      object.scale.set(scale, scale, scale);
    }
  }
}
