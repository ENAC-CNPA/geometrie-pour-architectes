import {
  Extension,
  GeometryType,
  IViewer,
  ObjectLayers,
} from "@speckle/viewer";
import { Points, Vector3 } from "three";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { Sets } from "./sets.ts";

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
      const profiles = sketch.raw.Profiles;

      const sketchProfiles = profiles.filter(
        (item: any) => item.IsSketch === "yes"
      );

      for (const profile of sketchProfiles) {
        console.log(profile.namePosDirSegment);
        console.log(profile.namePosPointSegment);
        console.log(profile.segmentName);
        console.log(profile.segmentNameColor);
        console.log(profile.segmentNameReversed);

        const threeDNomination = document.createElement("div");
        threeDNomination.className = "three-d-nomination";
        threeDNomination.innerHTML = profile.segmentName;

        const origin = new Vector3(
          profile.namePosPointSegment.x,
          profile.namePosPointSegment.y,
          profile.namePosPointSegment.z
        )

        const objectCSS = new CSS3DObject(threeDNomination);
        objectCSS.scale.set(0.003, 0.003, 0.003);
        objectCSS.position.copy(origin)
        
        const direction = new Vector3(
          profile.namePosDirSegment.x,
          profile.namePosDirSegment.y,
          profile.namePosDirSegment.z
        );

        const target = new Vector3().addVectors(origin, direction);


        objectCSS.lookAt(target);
        objectCSS.rotateY( - Math.PI / 2 );
        

        objectCSS.layers.set(ObjectLayers.OVERLAY);
        this.viewer.getRenderer().scene.add(objectCSS);
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
}
