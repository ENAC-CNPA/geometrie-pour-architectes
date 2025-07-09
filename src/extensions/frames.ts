import { Extension, ObjectLayers } from "@speckle/viewer";
import { Vector3, ArrowHelper, Object3D, Group } from "three";
import { ConstantScale } from "./constantScale.ts";

export class Frames extends Extension {
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

    const frame = new Group();
    frame.add(arrowX);
    frame.add(arrowY);
    frame.add(arrowZ);

    function setLayerRecursive(obj: Object3D, layer: number) {
      obj.layers.set(layer);
      obj.children.forEach((child) => setLayerRecursive(child, layer));
    }
    setLayerRecursive(arrowX, ObjectLayers.OVERLAY);
    setLayerRecursive(arrowY, ObjectLayers.OVERLAY);
    setLayerRecursive(arrowZ, ObjectLayers.OVERLAY);

    frame.name = "frame";

    this.viewer.getRenderer().scene.add(frame);
  }

  public onEarlyUpdate() {
    const constantScale = this.viewer.createExtension(ConstantScale);
    const frame = this.viewer
      .getRenderer()
      .scene.getObjectByName("frame") as Object3D;

    if (typeof frame !== "undefined") {
      constantScale.constantScale(frame, 50);
    }
  }
}
