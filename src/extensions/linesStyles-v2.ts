//README: ce fichier à partir de l'algorithme de Alex fonctionne presque.
//Problème il pollue les fonctions montrer/cacher les cotes et les ensembles,
//en changeant l'id de l'objet parent des lignes modifiées
// 
import {
  Extension,
  IViewer,
  TreeNode,
  GeometryType,
  LineBatch,
  SpeckleLineMaterial,
  NodeRenderView,
  type Batch,
} from "@speckle/viewer";

export class Styles extends Extension {
  public constructor(viewer: IViewer) {
    super(viewer);
    this.viewer.getRenderer();
  }

  public async separateLines(ids: string[], material: SpeckleLineMaterial) {
    const rvs: Array<NodeRenderView> = []; // The rv of the lines
    const batches: Array<Batch> = []; // The batches we're extracting the lines from
    for (let k = 0; k < ids.length; k++) {
      const rv = (this.viewer
        .getWorldTree()
        .getRenderTree()
        .getRenderViewsForNodeId(ids[k]) ?? [])[0];
      rvs.push(rv);

      const batch = this.viewer.getRenderer().batcher.getBatch(rv);
      if (!batch) continue;
      if (!batches.includes(batch)) batches.push(batch); // just push batches once

      /** Remove the render view from the original batch's render view list */
      batch.renderViews.splice(batch.renderViews.indexOf(rv), 1);
    }

    /** Go over each batch and rebuild the geometries after we've extracted the lines */
    for (let k = 0; k < batches.length; k++) {
      const batch = batches[k];
      /** Remove batch renderable from scene, as we'll make a new one */
      const sceneParent = batch.renderObject.parent;
      sceneParent?.remove(batch.renderObject);
      /** Rebuild the batch and set it's material */
      await batch.buildBatch();
      batch.setBatchMaterial(batch.batchMaterial);
      /** Add it's new renderable to the scene (rebuilding created a new renderable) */
      sceneParent?.add(batch.renderObject);
    }

    /** Create a new line batch with onyl the rvs we've extracted*/
    const newBatch = new LineBatch(
      "myId",
      this.viewer.getWorldTree().getRenderTree().id,
      rvs
    );

    /** Build and set material */
    newBatch.setBatchMaterial(material);
    await newBatch.buildBatch();
    /** Update Batcher's batch table */
    this.viewer.getRenderer().batcher.batches[newBatch.id] = newBatch;

    /** Add batch to the scene */
    const parent = this.viewer.getRenderer().allObjects;
    parent?.add(newBatch.renderObject);
  }

  public async editLineBatch(profile: any) {
    const profileId = profile.id;
    const profileMaterialId =
      profileId.toString().slice(28, 32) + profileId.toString().slice(0, 28);
    const profileDisplayId =
      profileId.toString().slice(24, 32) + profileId.toString().slice(0, 24);

    const displayStyle = {
      id: profileDisplayId,
      lineWeight: profile.displayStyle.lineweight * 0.0005,
      color: profile.displayStyle.color,
    };

    const [dashScale, dashSize, gapSize] = this.defineDash(profile);

    const material = this.viewer
      .getRenderer()
      .batcher.materials.getMaterial(
        profileMaterialId,
        displayStyle,
        GeometryType.LINE
      ) as any;
    material.dashed = true;
    material.dashScale = dashScale;
    material.dashSize = dashSize;
    material.gapSize = gapSize;

    this.separateLines([profileId], material);
  }

  public defineDash(profile: any) {
    const lineType = profile.displayStyle.linetype;
    let dashScale = 100;
    let dashSize = 1;
    let gapSize = 1;
    if (lineType === "Dash") {
      dashSize = 1;
      gapSize = 1;
    } else if (lineType === "Dot") {
      dashSize = 0.2;
      gapSize = 0.2;
    } else if (lineType === "DashDot") {
      dashSize = 2;
      gapSize = 0.4;
    } else if (lineType === "DashDotDot") {
      dashSize = 1.5;
      gapSize = 0.6;
    } else if (lineType === "Continuous") {
      dashSize = 0.5;
      gapSize = 0.5;
    }
    return [dashScale, dashSize, gapSize];
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
          // refaire la méthode d'origine
        } else {
          if (profile.displayStyle.linetype !== "Solid") {
            this.editLineBatch(profile);
          }
        }
      }
    }
  }
}
