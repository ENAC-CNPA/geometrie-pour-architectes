import {
  Viewer,
  SpeckleLoader,
  CameraController,
  UrlHelper,
  ViewerEvent,
  FilteringExtension,
} from "@speckle/viewer";
import { createLoadingIcon, showLoadingIcon, hideLoadingIcon } from './extensions/loading.ts';
import { Menu } from "./extensions/menu.ts";
import { Sets } from "./extensions/sets.ts";
import { Nominations } from "./extensions/nominations.ts";
import { Navigation } from "./extensions/navigation.ts";
import { Start } from "./extensions/start.ts";
import { Overlay } from "./extensions/overlay.ts";

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
  //const styles = viewer.createExtension(Styles);
  const menu = viewer.createExtension(Menu);
  const sets = viewer.createExtension(Sets);
  const nominations = viewer.createExtension(Nominations);
  const navigation = viewer.createExtension(Navigation);
  const overlay = viewer.createExtension(Overlay);

  /**Run custom extensions */
  viewer.on(ViewerEvent.LoadComplete, async () => {
    if (version === 1) {
      menu.addMenu();
      nominations.addNominations();
      sets.addSets(filtering);
      navigation.addNavigation(cameraController, filtering);
    } else if (version === 3) {
      overlay.addOverlay(filtering);
    }
  });

  /** Create a loader for the speckle stream */
  const versionsUrls: string[] = [
    //"75e4788d3e@e4414e9ea1", //dev model version 1
    //"75e4788d3e@58fb90f03e", //dev model version 2
    "9c958fc6a1@c96d453ebb", // Fontainebleau 1P = EPURE PLANE //load as 1
    "9c958fc6a1@d607ffdf58", // Fontainebleau 2s = EPURE SPATIALE
    "9c958fc6a1@803c865141", // Voussoirs 1 //load as 0
    "9c958fc6a1@dc84d6c51d", // Voussoirs 2
  ];
  const urls = await UrlHelper.getResourceUrls(
    //"https://app.speckle.systems/projects/d5b671524f/models/" + //dev model
    "https://app.speckle.systems/projects/d8a062602c/models/" + // Fontainebleau model
      versionsUrls.join(",")
  );

  let version = 0;

  for (let i = 0; i < urls.length; i++) {
    const loader = new SpeckleLoader(viewer.getWorldTree(), urls[i], "");
    await viewer.loadObject(loader, true);
    console.log("Model loaded:", versionsUrls[i]);
    version++;
  }
}

async function start() {
  createLoadingIcon();
  showLoadingIcon();
  await main();
  Start.start();
  hideLoadingIcon();
}
start();
