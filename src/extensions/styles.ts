//WIP. Not yet implemented.

import {
  Extension,
  IViewer,
  NodeRenderView,
  TreeNode,
  GeometryType,
} from "@speckle/viewer";

export class Styles extends Extension {
  public constructor(viewer: IViewer) {
    super(viewer);
    this.viewer.getRenderer();
  }
  public editStyles() {
    const pointRvs: NodeRenderView[] = [];
    this.viewer
      .getWorldTree()
      .findAll((node: TreeNode) => {
        return (
          node.model.renderView &&
          node.model.renderView.geometryType === GeometryType.POINT
        );
      })
      .map((value: TreeNode) => {
        pointRvs.push(
          ...this.viewer
            .getWorldTree()
            .getRenderTree()
            .getRenderViewsForNode(value)
        );
      });
    console.log(pointRvs)
    const materialData: any = {
      id: "1",
      color: 0x047efb,
      opacity: 1,
      roughness: 1,
      metalness: 0,
      vertexColors: false,
      pointSize: 4,
    };
    this.viewer.getRenderer().setMaterial(pointRvs, materialData);
  }
}
