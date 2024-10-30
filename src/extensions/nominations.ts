import {
  Extension,
  GeometryType,
  IViewer,
  ObjectLayers,
} from "@speckle/viewer";
import { Points, Vector3 } from "three";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { Sets } from "./sets.ts";

export class Nominations extends Extension {
  private labelRenderer: CSS2DRenderer;
  public constructor(viewer: IViewer) {
    super(viewer);
    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
    this.labelRenderer.domElement.style.position = "absolute";
    this.labelRenderer.domElement.style.top = "0px";
    this.labelRenderer.domElement.style.pointerEvents = "none";
    const speckleContainer = document.getElementById(
      "speckle-container"
    ) as HTMLElement;
    speckleContainer.append(this.labelRenderer.domElement);
  }

  public addNominations() {
    const topSolidAllElements =
      this.viewer.getWorldTree().root.model.children[0].children[0].children;

    //Import, from sets.ts, the list of app ids of objects belonging to sets, to create only their nominations
    const sets = this.viewer.createExtension(Sets);
    const inSetItemsAppIds = sets.findInSetsItemsAppIds();

    const topSolidSketches = topSolidAllElements.filter(
      (item: any) =>
        item.raw.isSketch === true &&
        inSetItemsAppIds.includes(Number(item.raw.applicationId))
    );

    for (const sketch of topSolidSketches) {
      const vertices = sketch.raw.Vertices;
      for (const vertex of vertices) {
        if (vertex.vertexName) {
          const id = sketch.id;
          /** Get the position of the point in the 3D space, see function below*/
          const pos = this.getPointPosition(vertex.id);
          /** Get the position of the text relatively to the point on the 2D screen*/
          let pad = [];
          pad.push(vertex.namePosVector.x, vertex.namePosVector.y);
          /** Get the position of the text relatively to the point on the 2D screen*/
          if (pos) this.addLabel(vertex.vertexName, pos, pad, id);
        }
      }
    }
  }

  private getPointPosition(id: string): Vector3 | undefined {
    /** Get the render views associated to this id */
    const rvs = this.viewer
      .getWorldTree()
      .getRenderTree()
      .getRenderViewsForNodeId(id);
    if (!rvs || rvs.length === 0) {
      console.error("No render views found with this id");
      return;
    }
    /** Typically it's going to be just one */
    const rv = rvs[0];
    /** If it's not a point, return  */
    if (rv.geometryType !== GeometryType.POINT) {
      console.error("Provided id is not a point object");
      return;
    }
    /** Get the batch where this point lives */
    const batch = this.viewer.getRenderer().getBatch(rv.batchId);
    /** Get the batch's geometry */
    const batchGeometry = (batch.renderObject as Points).geometry;

    if (rv.batchStart > batchGeometry.attributes.position.count) {
      console.error("Point index out of range");
      return;
    }
    /** Lookup the point position into the batch's geometry by using the render view `batchStart`
     * index and return it
     */
    return new Vector3().fromBufferAttribute(
      batchGeometry.attributes.position,
      rv.batchStart
    );
  }

  public addLabel(title: string, pos: Vector3, pad: number[], id: string) {
    const nominationDiv = document.createElement("div");
    nominationDiv.textContent = title;
    nominationDiv.classList.add("label");
    nominationDiv.classList.add("label-item-id-" + id);
    nominationDiv.style.paddingLeft = (pad[0] * 5).toString() + "px";
    nominationDiv.style.paddingTop = (pad[1] * 5).toString() + "px";
    const nominationLabel = new CSS2DObject(nominationDiv);
    nominationLabel.position.copy(pos);
    nominationLabel.layers.set(ObjectLayers.OVERLAY);
    this.viewer.getRenderer().scene.add(nominationLabel);
  }
  public onRender() {
    this.labelRenderer.render(
      this.viewer.getRenderer().scene,
      this.viewer.getRenderer().renderingCamera!
    );
  }
  public onResize() {
    this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
  }
}
