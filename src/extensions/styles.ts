import {
  Extension,
  IViewer,
  TreeNode,
  GeometryType,
  LineBatch
} from "@speckle/viewer";
import { Vector2 } from "three";

export class Styles extends Extension {
  public constructor(viewer: IViewer) {
    super(viewer);
    this.viewer.getRenderer();
  }

  public setLinesStyle() {
    const batches = this.viewer
      .getRenderer()
      .batcher.getBatches(undefined, GeometryType.LINE);
    console.log("batches", batches);

    const allRenderViews: [any, LineBatch][] = []; //store renderView with its batch

    for (const batch of batches) {
      const renderViews = batch.renderViews;
      for (const renderView of renderViews) {
        allRenderViews.push([renderView, batch]);
      }
    }

    console.log("allRenderViews", allRenderViews);

    const sketches = this.viewer.getWorldTree().findAll((node: TreeNode) => {
      return node.model.raw.isSketch === true;
    });
    for (const sketch of sketches) {
      const profiles = sketch.model.raw.Profiles;
      console.log("Profiles:", profiles);
      for (const profile of profiles) {
        const match = allRenderViews.find(
          (renderView: any) => renderView[0]._renderData.id === profile.id
        );
        if (match) {
          console.log("match", match);
          const material = match[1].batchMaterial;
          console.log("material", material);
          console.log("style", profile.displayStyle.linetype); // this is currently not correctly sent from TopSolid  

          material.linewidth = profile.displayStyle.lineweight * 1.5;
          material.worldUnits = false;
          material.vertexColors = true;
          material.pixelThreshold = 0.5;
          material.resolution = new Vector2();
          material.dashed = true;
          material.dashScale = 200; // to do: adapt to the scale of the model
          material.dashSize = 1;
          material.gapSize = 1;

          this.viewer.getRenderer().setMaterial([match[0]], material);

          match[1].resetDrawRanges();
        }
      }
    }
  }
}
