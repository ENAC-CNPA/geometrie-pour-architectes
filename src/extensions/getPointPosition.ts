import {
  Extension,
  GeometryType,
  IViewer
} from "@speckle/viewer";
import { Points, Vector3 } from "three";

export class GetPointPosition extends Extension {
  public constructor(viewer: IViewer) {
    super(viewer);
    this.viewer.getRenderer();
  }

  public getPointPosition(id: string): Vector3 | undefined {
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
}
