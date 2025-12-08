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
      const profiles = sketch.model.raw.Profiles;

      const sketchProfiles = profiles.filter(
        (item: any) => item.IsSketch === "yes"
      );

      for (const profile of sketchProfiles) {
        if ("segmentName" in profile) {
          const fontSize =
            Number(profile.segmentNameSize.replace(",", ".")) * 2500;
          const threeDNominationContainer = document.createElement("div");
          threeDNominationContainer.style.paddingBottom = fontSize.toString() + "px";
          threeDNominationContainer.style.paddingTop = "0px";
          if (profile.segmentNameDirectionInverted === true) {
            threeDNominationContainer.style.paddingBottom = "0px";
            threeDNominationContainer.style.paddingTop = fontSize.toString() + "px";
          }
          const threeDNomination = document.createElement("p");
          threeDNomination.className = "three-d-nomination";
          threeDNomination.innerHTML = profile.segmentName;
          threeDNomination.style.color = `#${(
            (profile.segmentNameColor >>> 0) &
            0xffffff
          )
            .toString(16)
            .padStart(6, "0")}`;
          threeDNomination.style.fontFamily = profile.segmentNameFont;
          threeDNomination.style.fontSize = fontSize.toString() + "px";
          if (profile.segmentNameStyle.includes("Bold")) {
            threeDNomination.style.fontWeight = "bold";
          }
          if (profile.segmentNameStyle.includes("Regular")) {
            threeDNomination.style.fontStyle = "normal";
          } else if (profile.segmentNameStyle.includes("Italic")) {
            threeDNomination.style.fontStyle = "italic";
          }
          threeDNominationContainer.appendChild(threeDNomination);
          
          const type = profile.segments[0].speckle_type.split(".")[2]
          let reverseCSS: number = 1
          if (type === "Arc" || type === "Circle" || type === "Curve"){
            reverseCSS = -1
          }
          const inverted = profile.segmentNameDirectionInverted
          if (inverted === "Yes"){
            reverseCSS = reverseCSS * -1
          }

          const origin = new Vector3(
            profile.namePosPointSegment.x,
            profile.namePosPointSegment.y,
            profile.namePosPointSegment.z
          );

          const objectCSS = new CSS3DObject(threeDNominationContainer);
          objectCSS.scale.set(1, 1, 1);
          objectCSS.position.copy(origin);

          const direction = new Vector3(
            profile.namePosDirSegment.x * reverseCSS,
            profile.namePosDirSegment.y * reverseCSS,
            profile.namePosDirSegment.z * reverseCSS
          );

          let target = new Vector3().addVectors(origin, direction);
          objectCSS.lookAt(target);
          objectCSS.rotateY(-Math.PI / 2);
          if (profile.segmentNameDirectionInverted === true) {
            objectCSS.rotateX(-Math.PI);
            objectCSS.rotateZ(-Math.PI);
          }

          objectCSS.name = "object-css-" + profile.id;
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
