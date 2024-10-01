import { Extension, IViewer } from "@speckle/viewer";

export class Menu extends Extension {
  public constructor(viewer: IViewer) {
    super(viewer);
    this.viewer.getRenderer();
  }
  public addMenu() {
    /** Add HTML Content */
    const menu = document.createElement("div");
    menu.id = "menu";
    const menuResizer = document.createElement("div");
    menuResizer.id = "menu-resizer";
    menu.appendChild(menuResizer);
    document.body.prepend(menu);

    /** Let the user resize the menu */
    // Variables to track the current position and width
    let startX: number;
    let startWidth: number;

    // Mouse down event to start the resize
    menuResizer.addEventListener("mousedown", (e) => {
      startX = e.clientX; // Get the initial mouse X position
      startWidth = parseInt(window.getComputedStyle(menu).width, 10); // Get the current width of the menu div

      // Attach the listeners for mousemove and mouseup to handle resizing
      document.documentElement.addEventListener("mousemove", resize);
      document.documentElement.addEventListener("mouseup", stopResize);
    });

    // Function to resize the div
    function resize(e: MouseEvent) {
      // Calculate the new width
      const newWidth = startWidth + (e.clientX - startX);

      // Set the new width to the menu div
      menu.style.width = `${newWidth}px`;

      // Update the width of child list
      const children = Array.from(menu.children) as HTMLElement[];
      for (const child of children) {
        if (child instanceof HTMLUListElement) {
          child.style.width = `${newWidth}px`;
        }
      }
    }

    // Function to stop resizing
    function stopResize() {
      // Remove the mousemove and mouseup listeners when resizing is done
      document.documentElement.removeEventListener("mousemove", resize);
      document.documentElement.removeEventListener("mouseup", stopResize);
    }
  }
}
