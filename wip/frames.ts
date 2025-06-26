import { IViewer, Extension, ObjectLayers } from "@speckle/viewer";
import { Vector3, ArrowHelper, Object3D } from "three";

export class Frames extends Extension {
  public constructor(viewer: IViewer) {
    super(viewer);
    this.viewer.getRenderer();
  }

  /**Add navigation pane to host buttons */
  public addFrames() {
    const arrowX = new ArrowHelper(
      new Vector3(1, 0, 0),
      new Vector3(0, 0, 0),
      1,
      0xff0000
    );
    const arrowY = new ArrowHelper(
      new Vector3(0, 1, 0),
      new Vector3(0, 0, 0),
      1,
      0x00ff00
    );
    const arrowZ = new ArrowHelper(
      new Vector3(0, 0, 1),
      new Vector3(0, 0, 0),
      1,
      0x0000ff
    );

    function setLayerRecursive(obj: Object3D, layer: number) {
      obj.layers.set(layer);
      obj.children.forEach((child) => setLayerRecursive(child, layer));
    }
    setLayerRecursive(arrowX, ObjectLayers.OVERLAY);
    setLayerRecursive(arrowY, ObjectLayers.OVERLAY);
    setLayerRecursive(arrowZ, ObjectLayers.OVERLAY);

    this.viewer.getRenderer().scene.add(arrowX, arrowY, arrowZ);
  }
}
