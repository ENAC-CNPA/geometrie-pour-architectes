import {
  Extension,
  IViewer,
  TreeNode,
  GeometryType,
  LineBatch,
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

    const allRenderViews: [any, LineBatch][] = []; //store renderView with its batch

    for (const batch of batches) {
      const renderViews = batch.renderViews;
      for (const renderView of renderViews) {
        allRenderViews.push([renderView, batch]);
      }
    }

    const sketches = this.viewer.getWorldTree().findAll((node: TreeNode) => {
      return node.model.raw.isSketch === true;
    });
    for (const sketch of sketches) {
      const profiles = sketch.model.raw.Profiles;
      for (const profile of profiles) {
        const match = allRenderViews.find(
          (renderView: any) => renderView[0]._renderData.id === profile.id
        );
        if (match) {
          const material = match[1].batchMaterial;

          material.linewidth = profile.displayStyle.lineweight * 1.5;
          material.worldUnits = false;
          material.vertexColors = true;
          material.pixelThreshold = 0.5;
          material.resolution = new Vector2();

          if (profile.displayStyle.linetype === "Dash") {
            material.dashed = true;
            material.dashScale = 200; // to do: adapt to the scale of the model
            material.dashSize = 1;
            material.gapSize = 1;
          }

          if (profile.displayStyle.linetype === "Dot") {
            material.dashed = true;
            material.dashScale = 200; // to do: adapt to the scale of the model
            material.dashSize = 0.2;
            material.gapSize = 0.2;
          }

          if (profile.displayStyle.linetype === "DashDot") {
            material.dashed = true;
            material.dashScale = 200; // to do: adapt to the scale of the model
            material.dashSize = 2;
            material.gapSize = 0.4;
          }

          if (profile.displayStyle.linetype === "DashDotDot") {
            material.dashed = true;
            material.dashScale = 200; // to do: adapt to the scale of the model
            material.dashSize = 1.5;
            material.gapSize = 0.6;
          }

          if (profile.displayStyle.linetype === "Continuous") {
            material.dashed = true;
            material.dashScale = 200; // to do: adapt to the scale of the model
            material.dashSize = 0.5;
            material.gapSize = 0.5;
          }

          this.viewer.getRenderer().setMaterial([match[0]], material);

          match[1].resetDrawRanges();
        }
      }
    }

    const allAxis = this.viewer.getWorldTree().findAll((node: TreeNode) => {
      return node.model.raw.IsAxis === true;
    });
    for (const axis of allAxis) {
      const match = allRenderViews.find(
        (renderView: any) => renderView[0]._renderData.id === axis.model.id
      );
      if (match) {
        const material = match[1].batchMaterial;

        material.linewidth = 3;
        material.worldUnits = false;
        material.vertexColors = true;
        material.pixelThreshold = 0.5;
        material.resolution = new Vector2();
        material.dashed = true;
        material.dashScale = 200; // to do: adapt to the scale of the model
        material.dashSize = 2;
        material.gapSize = 0.4;

        this.viewer.getRenderer().setMaterial([match[0]], material);

        match[1].resetDrawRanges();
      }
    }
  }
}
