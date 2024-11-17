/**INTRODUCTION */
/**Let's call an object = a sketch, a plan, an axe, a form etc.
 * A set can contain objects, or subsets.
 * Let's call an item = an object or a set, so items of a set are both its objects or subsets.
 * An object may belong to one sets, to multiple sets or to none.
 * The set doesn't store directly an object, but a reference, which has a different speckle id.
 * The correspondence is done via an application id.
 */

/**What we receive from TopSolid is an array of all objects and of the main sets.
 * The first step is to traverse these main sets to list all objects, via their reference, belonging to at least one set, and to find subsets.
 * Objects are found in three places :
 * The real speckle object is inside the main array of the World Tree
 * A reference is found in set.children only for the first set to which belongs the object, with its name and other interesting attributes.
 * A reference is found in set.raw.elements in all sets to which belongs the object, only as a number attribute.
 */

/**An item received from TopSolid is structured that way :*/
/* interface TopSolidItem {
      raw: {
        TopSolid_Name?: string; //name if object
        id: number; //equal to referencedId inside sets.raw.elements
        "referenced obj id"?: string; //equal to the real object
        isSet: boolean;
        name?: string; //name if set
        elements: any[];
      };
      children: any[];
    } */

import { Extension, IViewer } from "@speckle/viewer";

export class Sets extends Extension {
  public constructor(viewer: IViewer) {
    super(viewer);
    this.viewer.getRenderer();
  }

  /**List items directly transfered by TopSolid = objects (plan, sketch, etc) and main sets */
  private receiveTopSolidItems(): any[] {
    const topSolidReceivedItems =
      this.viewer.getWorldTree().root.model.children[0].children[0].children;
    return topSolidReceivedItems;
  }

  /**Isolate TopSolid main sets*/
  private isolateTopSolidMainSets(): any[] {
    const topSolidReceivedItems = this.receiveTopSolidItems();
    const topSolidMainSets = topSolidReceivedItems.filter(
      (item: any) => item.raw.isSet === true
    );
    return topSolidMainSets;
  }

  private sortMainsSetsByName(): any[] {
    const topSolidMainSets = this.isolateTopSolidMainSets();
    const sortedMainSets = [...topSolidMainSets].sort((a, b) => {
      if (a.raw.name < b.raw.name) return -1;
      if (a.raw.name > b.raw.name) return 1;
      return 0;
    });
    return sortedMainSets;
  }

  /**Store in an array whithout hierarchy, each item belonging to the set tree with its main attributes*/
  private arrayInSetItems(): any[] {
    const sortedMainSets = this.sortMainsSetsByName();
    /** Simulate a parent set array to store the main sets as its children,
     * in order to create loop function afterwards starting from it  */
    interface parentSet {
      raw: {
        elements: any[];
      };
      children: any[];
    }
    let parentSet: parentSet = {
      raw: { elements: [] },
      children: [],
    };
    parentSet.children.push(...sortedMainSets);

    /**Function to create the array, to be looped on the parentSet*/
    let inSetsItems: any[] = [];
    function pushItems(set: any) {
      for (const item of set.children) {
        const attributes: any[] = [];
        attributes.push(
          item.raw.TopSolid_Name,
          item.raw.id, //This id is the one of the reference of the object inside the sets tree, not directly the id of the object in the 3d scene
          item.raw["referenced obj id"],
          item.raw.isSet,
          item.raw.name,
          item.raw.elements //again, these are ids of reference
        );
        inSetsItems.push(attributes);
        /**if set, loop the same function inside it to get its own children too */
        if (item.raw.isSet) {
          pushItems(item);
        }
      }
    }
    pushItems(parentSet);
    return inSetsItems;
  }

  public findInSetsItemsAppIds() {
    const inSetsItems = this.arrayInSetItems();
    let inSetItemsAppIds: number[] = [];
    for (const item of inSetsItems) {
      if (item[3] !== true) {
        inSetItemsAppIds.push(item[2]);
      }
    }
    return inSetItemsAppIds;
  }

  public hideOutSetsItems(filtering: any) {
    const inSetItemsAppIds = this.findInSetsItemsAppIds();
    const topSolidReceivedItems = this.receiveTopSolidItems();
    for (const item of topSolidReceivedItems) {
      const applicationId = Number(item.raw.applicationId);
      const speckleId = item.id;
      if (!inSetItemsAppIds.includes(applicationId)) {
        filtering.hideObjects([speckleId]);
      }
    }
  }

  /**Build the sets tree as an array of arrays with hierarchy */
  /**The array set.raw.elements contains only referencedId, we have to find the correspondence in allItems */
  private buildSetsTree(): any[] {
    const topSolidMainSets = this.isolateTopSolidMainSets();
    const allItems = this.arrayInSetItems();
    let mainSetTree: any[] = [];
    /**Simulate a parent set with the same structure, to start the loop. */
    interface elementsObject {
      referencedId: string;
    }
    let parentSetElements: any[] = [];
    for (const topSolidMainSet of topSolidMainSets) {
      let elementsObject: elementsObject = {
        referencedId: topSolidMainSet.id,
      };
      parentSetElements.push(elementsObject);
    }
    mainSetTree[4] = "Ensembles";
    mainSetTree[5] = parentSetElements;

    /**Find the correspondence between referencedIds and items in allItems */
    function buildSetTree(item: any, allItems: any[]) {
      let setTree: any[] = [];
      let elements = item[5];
      for (const element of elements) {
        const relatedItem = allItems.find(
          (subarray: any) => subarray[1] === element.referencedId
        );
        setTree.push(relatedItem);
        /**if set, loop the same function inside it to get its own elements too */
        if (relatedItem[3]) {
          //3 = isSet
          buildSetTree(relatedItem, allItems);
        }
      }
      item.push(setTree);
    }
    buildSetTree(mainSetTree, allItems);
    return mainSetTree;
  }

  /**Store correspondence between id (speckle id) and applicationId (topsolid id) */
  private storeCorrespondences() {
    const topSolidReceivedItems = this.receiveTopSolidItems();
    let correspondences: any[] = [];
    for (const item of Array.from(topSolidReceivedItems)) {
      const correspondence: any[] = [];
      correspondence.push(item.id);
      correspondence.push(item.raw.applicationId);
      correspondences.push(correspondence);
    }
    return correspondences;
  }

  /**Create a HTML list to be added to the menu */
  private createList() {
    const correspondences = this.storeCorrespondences();
    const mainSetTree = this.buildSetsTree();
    /**Get Menu and create html structure*/
    const menu = document.getElementById("menu") as HTMLElement;
    const setsContainer = document.createElement("div");
    setsContainer.id = "sets-container";
    menu.appendChild(setsContainer);
    const setsList = document.createElement("ul");
    setsList.id = "sets-list";
    setsContainer.appendChild(setsList);
    const firstListItem = document.createElement("li");
    firstListItem.textContent = "Ensembles";
    firstListItem.classList.add("set", "list-item", "list-item-level-1");
    setsList.appendChild(firstListItem);
    /**Loop mainSetTree to populate the list */
    function populateList(
      set: any[], //topSolidItem[],
      listParent: HTMLUListElement | HTMLLIElement,
      listLevel: number
    ) {
      const items = set[6];
      for (const item of items) {
        /**Create the html content of list elements*/
        const newListItem = document.createElement("li");
        newListItem.classList.add("list-item");
        newListItem.classList.add("list-item-level-" + listLevel);
        /**Some content depends on whether the item is a set or an object*/
        if (item[3]) {
          //3 = if isSet
          newListItem.textContent = item[4];
          newListItem.classList.add("set");
          /**Iterate on children*/
          populateList(item, newListItem, listLevel + 1);
        } else {
          //if is Object
          newListItem.textContent = item[0];
          newListItem.classList.add("object");
          /**Store the id finding the correspondence between applicationId (topsolid) and speckleid (or id)*/
          const applicationId = item[2].toString();
          const correspondencePair = correspondences.find(
            (pair) => pair[1] === applicationId
          );
          if (correspondencePair) {
            const speckleId = correspondencePair[0];
            newListItem.dataset.speckleid = speckleId;
          }
        }
        listParent.appendChild(newListItem);
      }
    }
    populateList(mainSetTree, firstListItem, 2);
    return setsContainer;
  }

  /**Add expand buttons to sets*/
  private addExpandButtons() {
    const setsContainer = document.getElementById(
      "sets-container"
    ) as HTMLElement;
    const listSets = setsContainer.getElementsByClassName("set");
    for (const listSet of listSets) {
      const expandButton = document.createElement("input");
      expandButton.type = "button";
      expandButton.value = "+";
      listSet.prepend(expandButton);
      expandButton.onclick = () => {
        const liChildren = Array.from(listSet.children).filter(
          (child) => child.tagName.toLowerCase() === "li"
        ) as HTMLLIElement[];
        const shouldExpand = expandButton.value === "+";
        expandButton.value = shouldExpand ? "-" : "+";
        for (const liChild of liChildren) {
          liChild.style.display = shouldExpand ? "block" : "none";
        }
      };
    }
  }

  /**Add checkboxes to each item */
  private addCheckboxes() {
    this.addExpandButtons();
    const setsContainer = document.getElementById(
      "sets-container"
    ) as HTMLElement;
    const listItems = Array.from(
      setsContainer.getElementsByClassName("list-item")
    ) as HTMLLIElement[];
    for (const listItem of listItems) {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = true;
      const subItems = listItem.querySelector("li");
      if (subItems) {
        listItem.insertBefore(checkbox, subItems);
      } else {
        listItem.appendChild(checkbox);
      }
    }
  }

  /**The functions below will be used inside the function clickCheckboxes */
  /**Update checkboxes of the parent sets, which may be indeterminate. Recursive on the whole chain. */
  private updateParentsCheckboxes(listItem: HTMLLIElement) {
    const parentLi = listItem.parentElement as HTMLLIElement;
    if (parentLi.classList.contains("list-item")) {
      const parentCheckbox = parentLi.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;
      const brothersLi = Array.from(parentLi.children).filter(
        (child) => child.tagName.toLowerCase() === "li"
      );
      const totalLiCount = brothersLi.length;
      let checkedCount = 0;
      let indeterminateChildren = false;
      brothersLi.forEach((li) => {
        const checkbox = li.querySelector(
          'input[type="checkbox"]'
        ) as HTMLInputElement;
        if (checkbox.checked) {
          checkedCount++;
        } else if (checkbox.indeterminate) {
          indeterminateChildren = true;
        }
      });
      if (checkedCount === 0 && indeterminateChildren === false) {
        parentCheckbox.checked = false;
        parentCheckbox.indeterminate = false;
      } else if (
        checkedCount === totalLiCount &&
        indeterminateChildren === false
      ) {
        parentCheckbox.checked = true;
        parentCheckbox.indeterminate = false;
      } else {
        //parentCheckbox.checked = false; //causes trouble, rather desactivate it for now : let indeterminate being either checked or not
        parentCheckbox.indeterminate = true;
      }
      this.updateParentsCheckboxes(parentLi);
    }
  }

  /**Update other checkboxes showing/hiding the same object, if the object is in multiple sets */
  /**Also run on them the function to update parents checkboxes */
  private updateTwinsCheckboxes(
    checkbox: HTMLInputElement,
    listItems: HTMLLIElement[],
    listItem: HTMLLIElement,
    speckleId: string
  ) {
    const isChecked = checkbox.checked;
    const twinListItems = listItems.filter((item) => item !== listItem);
    for (const twinListItem of twinListItems) {
      if (twinListItem.getAttribute("data-speckleid") === speckleId) {
        const twinCheckbox = twinListItem.querySelector(
          'input[type="checkbox"]'
        ) as HTMLInputElement;
        twinCheckbox.checked = isChecked;
        this.updateParentsCheckboxes(twinListItem);
      }
    }
  }

  /**Show/Hide Object */
  private showOrHideObject(
    speckleId: string,
    checkbox: HTMLInputElement,
    filtering: any
  ) {
    if (checkbox.checked) {
      filtering.showObjects([speckleId]);
    } else {
      filtering.hideObjects([speckleId]);
    }
    //this.viewer.getRenderer().shadowcatcher!.shadowcatcherPass.needsUpdate = true;
  }

  /**Show/hide nominations */
  private showOrHideNominations(checkbox: HTMLInputElement, speckleId: string) {
    const shouldVisible = checkbox.checked;
    const nominations = document.getElementsByClassName(
      "label-item-id-" + speckleId
    );
    for (const nomination of nominations) {
      (nomination as HTMLElement).style.visibility = shouldVisible
        ? "visible"
        : "hidden";
    }
  }

  /**Checkbox behavior */
  private updateItem(
    listItem: HTMLLIElement,
    checkbox: HTMLInputElement,
    listItems: HTMLLIElement[],
    topSolidReceivedItems: any[],
    filtering: any[]
  ) {
    if (listItem.classList.contains("object")) {
      const speckleId = listItem.dataset.speckleid!;
      this.updateTwinsCheckboxes(checkbox, listItems, listItem, speckleId);
      this.showOrHideObject(speckleId, checkbox, filtering);
      this.showOrHideNominations(checkbox, speckleId);
    } else if (listItem.classList.contains("set")) {
      /**If indeterminate, get rid of indeterminate status */
      checkbox.indeterminate = false;
      /**Sets checkbox behavior = iterate the function on its children */
      const subLis = Array.from(listItem.children).filter(
        (child) => child.tagName.toLowerCase() === "li"
      ) as HTMLLIElement[];
      for (const subLi of subLis) {
        const subliCheckbox = subLi.querySelector(
          'input[type="checkbox"]'
        ) as HTMLInputElement;
        /**Propagate the state of the clicked checkboxes to the children */
        subliCheckbox.checked = checkbox.checked;
        /**Loop on children */
        this.updateItem(
          subLi,
          subliCheckbox,
          listItems,
          topSolidReceivedItems,
          filtering
        );
      }
    }
  }

  /**The function below will run the previous functions when a checkbox is clicked */
  private clickCheckbox(filtering: any) {
    this.addCheckboxes();
    const topSolidReceivedItems = this.receiveTopSolidItems();
    const setsContainer = document.getElementById(
      "sets-container"
    ) as HTMLElement;
    const listItems = Array.from(
      setsContainer.getElementsByClassName("list-item")
    ) as HTMLLIElement[];
    for (const listItem of listItems) {
      const checkbox = listItem.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;
      checkbox.addEventListener("change", () => {
        /**updateParentsCheckboxes can be ran directly on the checked list item, we don't need to iterate it on children */
        this.updateParentsCheckboxes(listItem);
        /**the other functions have to be run on the clicked object but also on children, we group them under updateItem */
        this.updateItem(
          listItem,
          checkbox,
          listItems,
          topSolidReceivedItems,
          filtering
        );
      });
    }
  }

  /**Reverse List*/
  private reverseList() {
    function reverseSubListItems(listElement: HTMLLIElement) {
      const subListItems: HTMLLIElement[] = Array.from(
        listElement.children
      ).filter((child): child is HTMLLIElement => child.tagName === "LI");
      for (let i = subListItems.length - 1; i >= 0; i--) {
        listElement.appendChild(subListItems[i]);
      }
      /**Loop on subsets*/
      for (const child of subListItems) {
        if (child.classList.contains("set")) {
          reverseSubListItems(child);
        }
      }
    }
    const firstLi = document.getElementsByClassName(
      "list-item-level-1"
    )[0] as HTMLLIElement;
    reverseSubListItems(firstLi);
  }

  /** Add a button to collapse sets when they are too expanded */
  private addCollapseSetsButton() {
    const collapseButton = document.createElement("button");
    collapseButton.textContent = "Replier Ensembles";
    const setsContainer = document.getElementById(
      "sets-container"
    ) as HTMLDivElement;
    setsContainer.prepend(collapseButton);
    const listItems: HTMLLIElement[] = Array.from(
      setsContainer.getElementsByClassName("list-item")
    ).filter(
      (child): child is HTMLLIElement =>
        !child.classList.contains("list-item-level-1")
    );
    const expandSetButtons: HTMLButtonElement[] = Array.from(
      setsContainer.querySelectorAll('input[type="button"]')
    );
    collapseButton.onclick = () => {
      for (const listItem of listItems) {
        listItem.style.display = "none";
      }
      for (const expandSetButton of expandSetButtons) {
        expandSetButton.value = "+";
      }
    };
  }

  public addSets(filtering: any) {
    this.sortMainsSetsByName();
    this.hideOutSetsItems(filtering);
    this.createList();
    this.clickCheckbox(filtering);
    this.reverseList();
    this.addCollapseSetsButton();
  }
}
