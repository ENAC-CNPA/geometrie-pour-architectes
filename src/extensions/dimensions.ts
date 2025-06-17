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

export class Dimensions extends Extension {
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

  public addDimensions(ViewerEvent: any, filtering: any) {

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
        
        console.log(profiles)
        const sketchProfiles = profiles.filter(
            (item: any) =>
                item.IsSketch === "yes"
        );
        const dimensionsProfiles = profiles.filter(
            (item: any) =>
                !item.IsSketch
        );
        const dimensionsIds: string[] = [];
        for (const profile of dimensionsProfiles) {
            dimensionsIds.push(profile.id)
        }
        filtering.hideObjects(dimensionsIds);

        console.log('Sketch type:', sketch.constructor.name)

        /* error = Uncaught (in promise) TypeError: sketch.on is not a function
        sketch.on(ViewerEvent.ObjectDoubleClicked, async () => {
            console.log("hello")
        });
        */
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
