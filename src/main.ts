import {
  Viewer,
  SpeckleLoader,
  CameraController,
  UrlHelper,
  ViewerEvent,
  FilteringExtension,
} from "@speckle/viewer";
import { Menu } from "./extensions/menu.ts";
import { Sets } from "./extensions/sets.ts";
import { Nominations } from "./extensions/nominations.ts";
import { Navigation } from "./extensions/navigation.ts";

async function main() {
  /** Create the HTML container */
  const speckleContainer = document.createElement("div");
  speckleContainer.id = "speckle-container";
  document.body.appendChild(speckleContainer);

  /** Create Viewer instance */
  const viewer = new Viewer(speckleContainer);
  await viewer.init();

  /**Add stock extensions */
  const cameraController = viewer.createExtension(CameraController);
  cameraController.toggleCameras();
  const filtering = viewer.createExtension(FilteringExtension);

  /**Add custom extensions */
  const menu = viewer.createExtension(Menu);
  const sets = viewer.createExtension(Sets);
  const nominations = viewer.createExtension(Nominations);
  const navigation = viewer.createExtension(Navigation);

  /**Run custom extensions */
  viewer.on(ViewerEvent.LoadComplete, async () => {
    menu.addMenu();
    sets.addSets(filtering);
    nominations.addNominations();
    navigation.addNavigation(cameraController, filtering);
  });

  /** Create a loader for the speckle stream */
  const versionsUrls: string[] = [
    "75e4788d3e@58fb90f03e",
    //"75e4788d3e@a815b298c9",
    //"75e4788d3e@e4414e9ea1",
  ];
  const urls = await UrlHelper.getResourceUrls(
    "https://app.speckle.systems/projects/d5b671524f/models/" +
      versionsUrls.join(",")
  );
  for (const url of urls) {
    const loader = new SpeckleLoader(viewer.getWorldTree(), url, "");
    await viewer.loadObject(loader, true);
  }
}

main();
