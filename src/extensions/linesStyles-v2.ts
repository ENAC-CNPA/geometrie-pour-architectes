import {
  Extension,
  IViewer,
  TreeNode,
  GeometryType,
  LineBatch,
} from "@speckle/viewer";

export class Styles extends Extension {
  public constructor(viewer: IViewer) {
    super(viewer);
    this.viewer.getRenderer();
  }

  public async editLineBatch(profile: any) {
    const id = profile.id;
    const rv = (this.viewer
      .getWorldTree()
      .getRenderTree()
      .getRenderViewsForNodeId(id) ?? [])[0];

    const batch = this.viewer.getRenderer().batcher.getBatch(rv) as any;

    batch.renderViews.splice(batch.renderViews.indexOf(rv), 1);

    const sceneParent = batch.renderObject.parent;
    sceneParent?.remove(batch.renderObject);

    await batch.buildBatch();
    batch.setBatchMaterial(batch.batchMaterial);

    sceneParent?.add(batch.renderObject);

    const material = this.defineMaterial(id);

    const newBatch = new LineBatch(
      "BatchId" + id,
      this.viewer.getWorldTree().getRenderTree().id,
      [rv]
    );

    newBatch.setBatchMaterial(material);
    await newBatch.buildBatch();
    this.viewer.getRenderer().batcher.batches[newBatch.id] = newBatch;

    const parent = this.viewer.getRenderer().allObjects;
    parent?.add(newBatch.renderObject);
  }

  public defineMaterial(id: string) {
    const objs = this.viewer.getWorldTree().findId(id);
    if (objs) {
      const obj = objs[0];
      const displayStyle = obj.model.raw.displayStyle;
      const material = this.viewer
        .getRenderer()
        .batcher.materials.getMaterial(
          0,
          displayStyle,
          GeometryType.LINE
        ) as any;
      const dashProperties = this.defineDash(obj);
      material.dashed = dashProperties[0];
      material.dashScale = dashProperties[1];
      material.dashSize = dashProperties[2];
      material.gapSize = dashProperties[3];
      console.log(material);
      return material;
    }
  }

  public defineDash(obj: any) {
    const lineType = obj.model.raw.displayStyle.linetype;
    let dashed = false;
    let dashScale = 100;
    let dashSize = 1;
    let gapSize = 1;
    if (lineType === "Solid") {
      dashed = false;
    } else if (lineType === "Dash") {
      dashed = true;
      dashSize = 1;
      gapSize = 1;
    } else if (lineType === "Dot") {
      dashed = true;
      dashSize = 0.2;
      gapSize = 0.2;
    } else if (lineType === "DashDot") {
      dashed = true;
      dashSize = 2;
      gapSize = 0.4;
    } else if (lineType === "DashDotDot") {
      dashed = true;
      dashSize = 1.5;
      gapSize = 0.6;
    } else if (lineType === "Continuous") {
      dashed = true;
      dashSize = 0.5;
      gapSize = 0.5;
    }
    return [dashed, dashScale, dashSize, gapSize];
  }

  public setLinesStyle() {
    const sketches = this.viewer.getWorldTree().findAll((node: TreeNode) => {
      return node.model.raw.isSketch === true;
    });
    for (const sketch of sketches) {
      const profiles = sketch.model.raw.Profiles;
      for (const profile of profiles) {
        if (
          profile.speckle_type ===
          "Objects.Other.Dimension:Objects.Other.DistanceDimension"
        ) {
          // I will do it later
        } else {
          this.editLineBatch(profile);
        }
      }
    }
  }
}
