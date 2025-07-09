import { Extension, IViewer, ObjectLayers, TreeNode } from "@speckle/viewer";
import { Vector3 } from "three";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { ConstantScale } from "./constantScale.ts";

export class ThreeDNominations extends Extension {
  private labelRenderer: CSS3DRenderer;
  public constructor(viewer: IViewer) {
    super(viewer);
    this.labelRenderer = new CSS3DRenderer();
    this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
    this.labelRenderer.domElement.style.position = "absolute";
    this.labelRenderer.domElement.style.top = "0px";
    this.labelRenderer.domElement.style.pointerEvents = "none";
    const speckleContainer = document.getElementById(
      "speckle-container"
    ) as HTMLElement;
    speckleContainer.append(this.labelRenderer.domElement);
  }

  public add3DNominations() {
    const sketches = this.viewer.getWorldTree().findAll((node: TreeNode) => {
      return node.model.raw.isSketch === true;
    });
    for (const sketch of sketches) {
      console.log(sketch)
      const profiles = sketch.model.raw.Profiles;

      const sketchProfiles = profiles.filter(
        (item: any) => item.IsSketch === "yes"
      );

      for (const profile of sketchProfiles) {
        if ("segmentName" in profile) {
          /*
          console.log(profile.namePosDirSegment);
          console.log(profile.namePosPointSegment);
          console.log(profile.segmentName);
          console.log(profile.segmentNameColor);
          console.log(profile.segmentNameDirectionInverted);
          */

          const threeDNomination = document.createElement("div");
          threeDNomination.className = "three-d-nomination";
          threeDNomination.innerHTML = profile.segmentName;

          const origin = new Vector3(
            profile.namePosPointSegment.x,
            profile.namePosPointSegment.y,
            profile.namePosPointSegment.z
          );

          const objectCSS = new CSS3DObject(threeDNomination);
          objectCSS.scale.set(1, 1, 1);
          objectCSS.position.copy(origin);

          const direction = new Vector3(
            profile.namePosDirSegment.x,
            profile.namePosDirSegment.y,
            profile.namePosDirSegment.z
          );

          const target = new Vector3().addVectors(origin, direction);

          objectCSS.lookAt(target);
          objectCSS.rotateY(-Math.PI / 2);

          objectCSS.layers.set(ObjectLayers.OVERLAY);
          this.viewer.getRenderer().scene.add(objectCSS);
        }
      }
    }
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

  public onEarlyUpdate() {
    const constantScale = this.viewer.createExtension(ConstantScale);
    this.viewer.getRenderer().scene.traverse((obj) => {
      if (obj instanceof CSS3DObject) {
        constantScale.constantScale(obj, 2);
      }
    });
  }
}
