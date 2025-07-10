import { Extension, ObjectLayers, TreeNode } from "@speckle/viewer";
import {
  Vector3,
  ArrowHelper,
  Object3D,
  Group,
  ColorRepresentation,
} from "three";
import { ConstantScale } from "./constantScale.ts";

export class Frames extends Extension {
  private createArrow(frameV: any, color: ColorRepresentation) {
    const dirAsString = frameV.substring(
      frameV.indexOf("unitvector") + 11,
      frameV.lastIndexOf(");")
    );
    const dirAsArray = dirAsString.split("; ");
    const dirX = parseFloat(dirAsArray[0].replace(",", "."));
    const dirY = parseFloat(dirAsArray[1].replace(",", "."));
    const dirZ = parseFloat(dirAsArray[2].replace(",", "."));

    const arrow = new ArrowHelper(
      new Vector3(dirX, dirY, dirZ),
      new Vector3(0, 0, 0),
      1,
      color,
      0.2,
      0.1
    );
    return arrow;
  }

  private setLayerRecursive(obj: Object3D, layer: number) {
    obj.layers.set(layer);
    obj.children.forEach((child) => this.setLayerRecursive(child, layer));
  }

  public addFrames(filtering: any) {
    const frames = this.viewer.getWorldTree().findAll((node: TreeNode) => {
      return node.model.raw.IsFrame === true;
    });
    for (const frame of frames) {
      const frameObject = new Group();

      const frameVX = frame.children[0].model.raw.FrameVX;

      const originAsString = frameVX.substring(
        frameVX.indexOf("point") + 6,
        frameVX.indexOf(");")
      );
      const originAsArray = originAsString.split("; ");
      const originX = parseFloat(originAsArray[0].replace(",", "."));
      const originY = parseFloat(originAsArray[1].replace(",", "."));
      const originZ = parseFloat(originAsArray[2].replace(",", "."));

      frameObject.position.set(originX, originY, originZ);

      for (const child of frame.children) {
        filtering.hideObjects([child.model.id]);
        if (child.model.raw.FrameDir === "XY") {
          const frameVX = child.model.raw.FrameVX;
          const arrowX = this.createArrow(frameVX, 0xff0000);
          frameObject.add(arrowX);
        } else if (child.model.raw.FrameDir === "YZ") {
          const frameVY = child.model.raw.FrameVY;
          const arrowY = this.createArrow(frameVY, 0x00ff00);
          frameObject.add(arrowY);
        } else if (child.model.raw.FrameDir === "XZ") {
          const frameVZ = child.model.raw.FrameVZ;
          const arrowZ = this.createArrow(frameVZ, 0x0000ff);
          frameObject.add(arrowZ);
        }
      }

      frameObject.name = "frame-" + frame.model.id;
      this.setLayerRecursive(frameObject, ObjectLayers.OVERLAY);

      this.viewer.getRenderer().scene.add(frameObject);
    }
  }

  public onEarlyUpdate() {
    const constantScale = this.viewer.createExtension(ConstantScale);

    const framesNames: string[] = [];
    const frames = this.viewer.getWorldTree().findAll((node: TreeNode) => {
      return node.model.raw.IsFrame === true;
    });
    for (const frame of frames) {
      framesNames.push("frame-" + frame.model.id);
    }
    this.viewer.getRenderer().scene.traverse((object) => {
      if (framesNames.includes(object.name)) {
        constantScale.constantScale(object, 50);
      }
    });
  }
}
