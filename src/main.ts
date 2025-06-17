import {
  Viewer,
  SpeckleLoader,
  CameraController,
  UrlHelper,
  ViewerEvent,
  FilteringExtension,
} from "@speckle/viewer";
import {
  createLoadingIcon,
  showLoadingIcon,
  hideLoadingIcon,
} from "./extensions/loading.ts";
import { createHeader } from "./extensions/header.ts";
import { createFooter } from "./extensions/footer.ts";
import { Menu } from "./extensions/menu.ts";
import { Sets } from "./extensions/sets.ts";
import { PointsIconsAndNominations } from "./extensions/pointsIconsAndNominations.ts";
import { Navigation } from "./extensions/navigation.ts";
import { Styles } from "./extensions/styles.ts";

async function main() {
  createHeader();
  createFooter();

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
  //const styles = viewer.createExtension(Styles);
  const menu = viewer.createExtension(Menu);
  const sets = viewer.createExtension(Sets);
  const pointsIconsAndNominations = viewer.createExtension(PointsIconsAndNominations);
  const navigation = viewer.createExtension(Navigation);
  const styles = viewer.createExtension(Styles);

  /**Run custom extensions */
  viewer.on(ViewerEvent.LoadComplete, async () => {
    menu.addMenu();
    pointsIconsAndNominations.addPointsIconsAndNominations();
    sets.addSets(filtering);
    navigation.addNavigation(cameraController, filtering);
    styles.addDashedLines();
  });

  /** Create a loader for the speckle stream */
  const versionsUrls: string[] = [
    "5626cd6127@e6fcbc18ba",
  ];
  const urls = await UrlHelper.getResourceUrls( /*Need to set the speckle project on public*/
    "https://app.speckle.systems/projects/400bc84669/models/" +
      versionsUrls.join(",")
  );

  const loader = new SpeckleLoader(viewer.getWorldTree(), urls[0], "");
  await viewer.loadObject(loader, true);
}

async function start() {
  createLoadingIcon();
  showLoadingIcon();
  await main();
  hideLoadingIcon();
}
start();
