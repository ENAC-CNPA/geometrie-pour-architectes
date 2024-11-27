//https://enac-cnpa.github.io/fontainebleau-3d-tiles/

import { Extension, IViewer } from "@speckle/viewer";

export class Photomesh extends Extension {
  public constructor(viewer: IViewer) {
    super(viewer);
    this.viewer.getRenderer();
  }

  public addPhotomesh() {
    const link = document.createElement("a");
    link.style.display = "inline-block";
    link.style.marginBottom = "10px";
    link.textContent = "Ouvrir photomesh dans une autre page"
    link.href = "https://enac-cnpa.github.io/fontainebleau-3d-tiles/";
    link.target = "_blank"

    const menu = document.getElementById("menu");
    menu?.appendChild(link);
    console.log("yes")
  }
}
