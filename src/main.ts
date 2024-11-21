import {
  Viewer,
  SpeckleLoader,
  CameraController,
  UrlHelper,
  ViewerEvent,
  FilteringExtension,
} from "@speckle/viewer";
import { Styles } from "./extensions/styles.ts";
import { Menu } from "./extensions/menu.ts";
import { Sets } from "./extensions/sets.ts";
import { Nominations } from "./extensions/nominations.ts";
import { Navigation } from "./extensions/navigation.ts";
import { Start } from "./extensions/start.ts"

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
  const styles = viewer.createExtension(Styles);
  const menu = viewer.createExtension(Menu);
  const sets = viewer.createExtension(Sets);
  const nominations = viewer.createExtension(Nominations);
  const navigation = viewer.createExtension(Navigation);

  /**Run custom extensions */
  viewer.on(ViewerEvent.LoadComplete, async () => {
    styles.editStyles();
    menu.addMenu();
    nominations.addNominations();
    sets.addSets(filtering);
    navigation.addNavigation(cameraController, filtering);
  });

  /** Create a loader for the speckle stream */
  const versionsUrls: string[] = [
    //"75e4788d3e@58fb90f03e", //dev model version 1
    //"75e4788d3e@a815b298c9", //dev model version 2
    //"75e4788d3e@e4414e9ea1", //dev model version 3
    //"a3ad727b4a@adce166f4a", //bernard model version 1
    //"75e4788d3e@f4f73e94fe" // bernard model on dev model
    //"75e4788d3e@3ec3aaea16" // avec liste des ensembles
    "9c958fc6a1@b2b1462345", // Fontainebleau
  ];
  const urls = await UrlHelper.getResourceUrls(
    //"https://app.speckle.systems/projects/d5b671524f/models/" + //dev model
    //"https://app.speckle.systems/projects/0b4aee874b/models/" + //bernard model
    "https://app.speckle.systems/projects/d8a062602c/models/" + // Fontainebleau model
      versionsUrls.join(",")
  );
  for (const url of urls) {
    const loader = new SpeckleLoader(viewer.getWorldTree(), url, "");
    await viewer.loadObject(loader, true);
  }
  console.log("3D scene loaded")
}

async function start() {
  await main();
  Start.start();
}
start()