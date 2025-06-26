import {
  Extension,
  GeometryType,
  IViewer,
  ObjectLayers,
  SelectionEvent,
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

    const sketchIdsAndSketchProfilesIds: any[] = [];
    const sketchIdsAndDimensionsProfilesIds: any[] = [];
    
    for (const sketch of topSolidSketches) {
      //console.log(sketch)

      const profiles = sketch.raw.Profiles;
      
      const sketchProfiles = profiles.filter(
        (item: any) => item.IsSketch === "yes"
      );
      for (const profile of sketchProfiles) {
        sketchIdsAndSketchProfilesIds.push([sketch.id, profile.id]);
      }

      const dimensionsLinesProfiles = profiles.filter(
        (item: any) => !item.IsSketch && !item.position
      );
      for (const profile of dimensionsLinesProfiles) {
        //console.log(profile.id)
        filtering.hideObjects([profile.id]); //filtering semble ne pas fonctionner pour des parties d'objets mais que sur l'objet entier
        sketchIdsAndDimensionsProfilesIds.push([sketch.id, profile.id]);
      }

      const dimensionsTextsIds: string[] = [];
      const dimensionsTextsProfiles = profiles.filter(
        (item: any) => !item.IsSketch && "position" in item
      );
      for (const profile of dimensionsTextsProfiles) {
        dimensionsTextsIds.push(profile.id);
        const pos = new Vector3(
          profile.position.x,
          profile.position.y,
          profile.position.z
        );
        const id = sketch.id;
        this.addDimensionText(profile.value.replace(/\s*mm$/, ""), pos, id);
      }
      //filtering.hideObjects(dimensionsTextsIds);
    }

    this.viewer.on(
      ViewerEvent.ObjectDoubleClicked,
      (event: SelectionEvent | null) => {
        if (!event) return;
        const doubleClickedNode = event.hits[0].node;
        const sketchProfileId = doubleClickedNode.model.id
        const sketchId = sketchIdsAndSketchProfilesIds.find(([_, second]) => second === sketchProfileId);
        //console.log(sketchId?.[0])
      }
    );
  }

  private addDimensionText(value: string, pos: Vector3, id: string) {
    const dimensionTextDiv = document.createElement("div");
    dimensionTextDiv.textContent = value;
    dimensionTextDiv.classList.add("dimension-text");
    dimensionTextDiv.classList.add("dimension-text-id-" + id);
    const dimensionTextLabel = new CSS2DObject(dimensionTextDiv);
    dimensionTextLabel.position.copy(pos);
    dimensionTextLabel.layers.set(ObjectLayers.OVERLAY);
    this.viewer.getRenderer().scene.add(dimensionTextLabel);
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
