import {
  Extension,
  IViewer,
  ObjectLayers,
  SelectionEvent,
  TreeNode
} from "@speckle/viewer";
import { Vector3 } from "three";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { GetPointPosition } from "./getPointPosition.ts";

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
    const sketches = this.viewer.getWorldTree().findAll((node: TreeNode) => {
      return node.model.raw.isSketch === true;
    });

    const getPointPosition = this.viewer.createExtension(GetPointPosition);

    for (const sketch of sketches) {
      const dimensionsProfiles = sketch.model.raw.Profiles.filter(
        (item: any) => !item.IsSketch
      );
      for (const profile of dimensionsProfiles) {
        const pos = getPointPosition.getPointPosition(profile.textPosition.id);
        /*
        const pos = new Vector3(
          profile.position.x,
          profile.position.y,
          profile.position.z
        )
        */
        if (pos) {
          this.addDimensionText(
            profile.value.replace(/\s*mm$/, ""),
            profile.id,
            pos
          );
        }
        filtering.hideObjects([profile.id]);
      }

      /*
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
      */
    }

    this.viewer.on(
      ViewerEvent.ObjectDoubleClicked,
      (event: SelectionEvent | null) => {
        if (!event) return;
        const doubleClickedNode = event.hits[0].node;
        if (doubleClickedNode.parent.model.raw.isSketch === true) {
          const parentCollection = doubleClickedNode.parent;
          const dimensionsProfiles = parentCollection.model.raw.Profiles.filter(
            (item: any) => !item.IsSketch
          );
          for (const profile of dimensionsProfiles) {
            const filteringState = filtering.filteringState;
            let shouldTextVisible = false;
            if (filteringState.hiddenObjects.includes(profile.id)) {
              filtering.showObjects([profile.id]);
              shouldTextVisible = true;
            } else {
              filtering.hideObjects([profile.id]);
              shouldTextVisible = false;
            }

            const dimensionsTexts = document.getElementsByClassName(
              "dimension-text-id-" + profile.id
            );
            for (const dimensionText of dimensionsTexts) {
              (dimensionText as HTMLElement).style.visibility =
                shouldTextVisible ? "visible" : "hidden";
            }
          }
        }
      }
    );
  }

  private addDimensionText(value: string, id: string, pos: Vector3) {
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
