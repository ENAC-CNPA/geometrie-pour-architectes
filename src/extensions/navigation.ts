import { Extension, IViewer, SelectionExtension } from "@speckle/viewer";
import { Vector3 } from "three";

export class Navigation extends Extension {
  public constructor(viewer: IViewer) {
    super(viewer);
    this.viewer.getRenderer();
  }

  /**Add navigation pane to host buttons */
  private addNavigationPane() {
    const navigationPane = document.createElement("div");
    navigationPane.id = "nav-pane";
    document.body.prepend(navigationPane);
  }

  /**Create function to add buttons*/
  private addButton(button: HTMLButtonElement, path: string) {
    fetch(path)
      .then((response) => response.text())
      .then((data) => {
        button.innerHTML += data;
      })
      .catch((error) => console.error("Error fetching the HTML file:", error));
    button.classList.add("nav-button");
    const navigationPane = document.getElementById(
      "nav-pane"
    ) as HTMLDivElement;
    navigationPane.appendChild(button);
  }

  /**Display menu (this button is displayed only on smartphones) */
  private addDisplayMenuButton() {
    const displayMenuButton = document.createElement("button");
    displayMenuButton.id = "display-menu-button";
    this.addButton(displayMenuButton, "./icons/FileExplorer.html");
    const menu = document.getElementById("menu");
    let displayedMenu = false;
    displayMenuButton.onclick = () => {
      if (displayedMenu) {
        menu!.style.display = "none";
      } else {
        menu!.style.display = "block";
      }
      displayedMenu = !displayedMenu;
    };
  }

  /**fit view on visible objects, used in multiple functions */
  private fitView(cameraController: any, filtering: any) {
    const topSolidReceivedItems: any[] =
      this.viewer.getWorldTree().root.model.children[0].children[0].children;
    const topSolidReceivedIds: string[] = [];
    for (const topSolidReceivedItem of topSolidReceivedItems) {
      topSolidReceivedIds.push(topSolidReceivedItem.id);
    }
    const filteringState = filtering.filteringState;
    const hiddenObjects: any[] = filteringState.hiddenObjects ?? [];
    const showedObjects = topSolidReceivedIds.filter(
      (item) => !hiddenObjects.includes(item)
    );
    cameraController.setCameraView(showedObjects, true, 1);
  }

  /**Toggle camera between ortho and perspective */
  private addPerspectiveButton(cameraController: any) {
    const perspectiveButton = document.createElement("button");
    perspectiveButton.id = "perspective-button";
    this.addButton(perspectiveButton, "./icons/Perspective.html");
    perspectiveButton.onclick = () => {
      cameraController.toggleCameras();
    };
  }

  /**Toggle camera to specific views like top */
  private createView(
    cameraController: any,
    filtering: any,
    name: string,
    canonicalView: string,
    div: HTMLDivElement
  ) {
    const view = document.createElement("button");
    view.textContent = name;
    view.onclick = () => {
      cameraController.setOrthoCameraOn();
      cameraController.setCameraView(canonicalView, true, 0);
      cameraController.enableRotations();
      this.fitView(cameraController, filtering);
    };
    div.appendChild(view);
  }
  private addNavViewsButton(cameraController: any, filtering: any) {
    const navViewsButton = document.createElement("button");
    this.addButton(navViewsButton, "./icons/Views.html");
    const navViews = document.createElement("div");
    navViews.id = "nav-views";

    this.createView(cameraController, filtering, "Dessus", "top", navViews);
    this.createView(cameraController, filtering, "Dessous", "bottom", navViews);
    this.createView(cameraController, filtering, "Face", "front", navViews);
    this.createView(cameraController, filtering, "Arrière", "back", navViews);
    this.createView(cameraController, filtering, "Gauche", "left", navViews);
    this.createView(cameraController, filtering, "Droite", "right", navViews);

    const navigationPane = document.getElementById(
      "nav-pane"
    ) as HTMLDivElement;
    navigationPane.appendChild(navViews);
    navViewsButton.onclick = () => {
      navViews.style.display = "flex";
    };
    navViews.addEventListener("mouseleave", () => {
      navViews.style.display = "none";
    });
  }

  //*Fit showed objects to screen*/
  private addFitButton(cameraController: any, filtering: any) {
    const fitButton = document.createElement("button");
    this.addButton(fitButton, "./icons/Fit.html");
    fitButton.onclick = () => {
      this.fitView(cameraController, filtering);
    };
  }

  //*Orient view on selected plane*/
  private orientViewOnPlane(selection: any, cameraController: any, filtering: any) {
    const selectedNodes = selection.getSelectedNodes();
    const selectedNode = selectedNodes[0];
    if (
      selectedNode.model.raw.speckle_type === "Objects.Geometry.Polycurve" &&
      selectedNode.model.raw.segments.length === 4
    ) {
      const p1 = new Vector3(
        selectedNode.model.raw.segments[0].start.x,
        selectedNode.model.raw.segments[0].start.y,
        selectedNode.model.raw.segments[0].start.z
      );
      const p2 = new Vector3(
        selectedNode.model.raw.segments[1].start.x,
        selectedNode.model.raw.segments[1].start.y,
        selectedNode.model.raw.segments[1].start.z
      );
      const p3 = new Vector3(
        selectedNode.model.raw.segments[2].start.x,
        selectedNode.model.raw.segments[2].start.y,
        selectedNode.model.raw.segments[2].start.z
      );
      const p4 = new Vector3(
        selectedNode.model.raw.segments[3].start.x,
        selectedNode.model.raw.segments[3].start.y,
        selectedNode.model.raw.segments[3].start.z
      );
      const center = new Vector3()
        .add(p1)
        .add(p2)
        .add(p3)
        .add(p4)
        .divideScalar(4);

      const v1 = new Vector3().subVectors(p2, p1);
      const v2 = new Vector3().subVectors(p4, p1);

      const normal = new Vector3().crossVectors(v1, v2).normalize();

      const cameraPosition = new Vector3()
        .copy(normal)
        .multiplyScalar(10)
        .add(center);

      cameraController.setCameraView(
        { position: cameraPosition, target: center },
        true,
        0
      );

      this.fitView(cameraController, filtering);
    }
  }
  private addOrientButton(cameraController: any, filtering: any) {
    const orientButton = document.createElement("button");
    this.addButton(orientButton, "./icons/Fit.html");
    
    const selection = this.viewer.createExtension(SelectionExtension);
    selection.enabled = true;

    orientButton.onclick = () => {
      this.orientViewOnPlane(selection, cameraController, filtering);
    };
  }

  //*Add all buttons*/
  public addNavigation(cameraController: any, filtering: any) {
    this.addNavigationPane();
    this.addDisplayMenuButton();
    this.addPerspectiveButton(cameraController);
    this.addNavViewsButton(cameraController, filtering);
    this.addFitButton(cameraController, filtering);
    this.addOrientButton(cameraController, filtering);
  }
}
