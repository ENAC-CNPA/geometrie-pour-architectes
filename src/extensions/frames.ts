import { Extension, ObjectLayers, TreeNode } from "@speckle/viewer";
import {
  Vector3,
  ArrowHelper,
  Object3D,
  Group,
  ColorRepresentation,
  BufferGeometry,
  LineBasicMaterial,
  Line,
} from "three";
import { ConstantScale } from "./constantScale.ts";
import { Sets } from "./sets.ts";

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

    const localDir = new Vector3(dirX, dirY, dirZ);

    const arrow = new ArrowHelper(
      localDir,
      new Vector3(0, 0, 0),
      1,
      color,
      0.2,
      0.1
    );
    return [arrow, localDir];
  }
  private createSquare(dirX: Vector3, dirY: Vector3){
    const sideLength = 0.4;
    const dir1 = dirX.clone().normalize().multiplyScalar(sideLength);
    const dir2 = dirY.clone().normalize().multiplyScalar(sideLength);

    const p1 = new Vector3(0, 0, 0);
    const p2 = p1.clone().add(dir1);
    const p3 = p2.clone().add(dir2);
    const p4 = p1.clone().add(dir2);

    const points = [p2, p3, p4];
    const geometry = new BufferGeometry().setFromPoints(points);
    const material = new LineBasicMaterial({ color: 0xcccccc });
    const square = new Line(geometry, material);

    return square;
  }

  private setLayerRecursive(obj: Object3D, layer: number) {
    obj.layers.set(layer);
    obj.children.forEach((child) => this.setLayerRecursive(child, layer));
  }

  public addFrames(filtering: any) {
    const allFrames = this.viewer.getWorldTree().findAll((node: TreeNode) => {
      return node.model.raw.IsFrame === true;
    });
    const sets = this.viewer.createExtension(Sets);
    const inSetItemsAppIds = sets.findInSetsItemsAppIds();
    const frames = allFrames.filter((item: any) =>
      inSetItemsAppIds.includes(Number(item.model.raw.applicationId))
    );

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
      let dirX = new Vector3();
      let dirY = new Vector3();
      let dirZ = new Vector3();

      for (const plane of frame.children) {
        filtering.hideObjects([plane.model.id]);

        if (plane.model.raw.FrameDir === "XY") {
          const frameVX = plane.model.raw.FrameVX;
          const [arrowX, dir] = this.createArrow(frameVX, 0xff0000) as [
            ArrowHelper,
            Vector3
          ];
          frameObject.add(arrowX);
          dirX = dir;
        } else if (plane.model.raw.FrameDir === "YZ") {
          const frameVY = plane.model.raw.FrameVY;
          const [arrowY, dir] = this.createArrow(frameVY, 0x00ff00) as [
            ArrowHelper,
            Vector3
          ];
          frameObject.add(arrowY);
          dirY = dir;
        } else if (plane.model.raw.FrameDir === "XZ") {
          const frameVZ = plane.model.raw.FrameVZ;
          const [arrowZ, dir] = this.createArrow(frameVZ, 0x0000ff) as [
            ArrowHelper,
            Vector3
          ];
          frameObject.add(arrowZ);
          dirZ = dir;
        }
      }
      const squareXY = this.createSquare(dirX, dirY)
      const squareXZ = this.createSquare(dirX, dirZ)
      const squareYZ = this.createSquare(dirY, dirZ)
      frameObject.add(squareXY, squareXZ, squareYZ);

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

/*
Exemples :
1 repère : ee4426fb20
2 repères : c27e6330d7
*/
