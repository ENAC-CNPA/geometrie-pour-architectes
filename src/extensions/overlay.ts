import { Extension, IViewer } from "@speckle/viewer";

export class Overlay extends Extension {
  public constructor(viewer: IViewer) {
    super(viewer);
    this.viewer.getRenderer();
  }

  public addOverlay(filtering: any) {
    const secondModel = this.viewer.getWorldTree().root.model.children[1];
    if (secondModel) {
      const secondModelId = secondModel.raw.id;
      const menu = document.getElementById("menu");
      const button = document.createElement("button");
      button.textContent = "Montrer/Cacher Voûte";
      button.id = "button-vault"
      menu?.prepend(button);
      let displayed = true;
      button.onclick = () => {
        if (displayed) {
          filtering.hideObjects([secondModelId]);
        } else {
          filtering.showObjects([secondModelId]);
        }
        displayed = !displayed;
      };
    }
  }
}
