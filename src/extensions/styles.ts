import {
  Extension,
  IViewer,
  NodeRenderView,
  TreeNode,
  GeometryType,
} from "@speckle/viewer";

import { LineDashedMaterial, Vector3, BufferGeometry, Line } from "three";

export class Styles extends Extension {
  public constructor(viewer: IViewer) {
    super(viewer);
    this.viewer.getRenderer();
  }
  //not used: points icons replaced in pointsAndNominations
  public editPointColor() {
    
    const materialData: any = {
      id: "1",
      color: 0x047efb,
      opacity: 1,
      roughness: 1,
      metalness: 0,
      vertexColors: true,
      pointSize: 2,
    };
    
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
    this.viewer.getRenderer().setMaterial(pointRvs, materialData);
  }

  public addDashedLines() {

    // https://threejs.org/docs/#api/en/materials/LineDashedMaterial

    // Geometry (line with multiple points)
    const points = [];
    points.push(new Vector3(-10000, 0, 0));
    points.push(new Vector3(0, 10000, 0));
    points.push(new Vector3(10000, 0, 0));

    const geometry = new BufferGeometry().setFromPoints(points);

    // Dashed line material
    const material = new LineDashedMaterial({
      color: 0xffffff,
      linewidth: 1,
      scale: 1,
      dashSize: 3,
      gapSize: 1,
    });

    // Line
    const line = new Line(geometry, material);
    line.computeLineDistances();

    this.viewer.getRenderer().scene.add(line);

  }
}
