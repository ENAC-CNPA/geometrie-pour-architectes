import { Extension, IViewer } from "@speckle/viewer";

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

  /**Toggle camera between ortho and perspective */
  private addPerspectiveButton(cameraController: any) {
    const perspectiveButton = document.createElement("button");
    perspectiveButton.id = "perspective-button";
    this.addButton(perspectiveButton, "./icons/Perspective.html");
    perspectiveButton.onclick = () => {
      cameraController.toggleCameras();
    };
  }

  /**fit view on visible objects, used in multiple functions */
  private fitView(cameraController: any, filtering: any) {
    const topSolidReceivedItems: any[] =
      this.viewer.getWorldTree().root.model.children[1].children[0].children;
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

  /**Toggle camera to specific views like top */
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

  public addNavigation(cameraController: any, filtering: any) {
    this.addNavigationPane();
    this.addDisplayMenuButton();
    this.addPerspectiveButton(cameraController);
    this.addNavViewsButton(cameraController, filtering);
    this.addFitButton(cameraController, filtering);
  }
}
