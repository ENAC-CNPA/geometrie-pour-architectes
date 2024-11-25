import { Extension, IViewer } from "@speckle/viewer";

export class Overlay extends Extension {
  public constructor(viewer: IViewer) {
    super(viewer);
    this.viewer.getRenderer();
  }

  public addOverlay(filtering: any) {
    const versions = this.viewer.getWorldTree().root.model.children;
    let versionsIds: string[] = [];
    for (const version of versions) {
      versionsIds.push(version.id);
    }
    console.log(versionsIds);
    const nonFirstVersionIdss = versionsIds.filter(
      (item) =>
        item !==
        "https://app.speckle.systems/streams/d8a062602c/objects/5d8c279660b3993f397d28bbff85453b"
    );
    if (versionsIds.length > 1) {
      const menu = document.getElementById("menu");
      const button = document.createElement("button");
      button.textContent = "Montrer/Cacher Voûte";
      button.id = "button-vault";
      menu?.prepend(button);
      let displayed = true;
      button.onclick = () => {
        if (displayed) {
          filtering.hideObjects(nonFirstVersionIdss);
        } else {
          filtering.showObjects(nonFirstVersionIdss);
        }
        displayed = !displayed;
      };
    }
  }
}
