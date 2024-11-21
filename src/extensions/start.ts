export class Start {
  public static start(): void {

    // Sort sets
    function clickCheckbox(text: string): void {
      const li = Array.from(
        document.querySelectorAll<HTMLLIElement>("li")
      ).find((li) => {
        const directText = Array.from(li.childNodes)
          .filter((node) => node.nodeType === Node.TEXT_NODE)
          .map((node) => node.textContent?.trim())
          .join("");
        return directText === text;
      });

      if (!li) {
        console.warn(`No <li> found with direct text: "${text}"`);
        return; // Exit if the <li> was not found
      }

      const checkbox = li.querySelector<HTMLInputElement>(
        'input[type="checkbox"]'
      );
      if (!checkbox) {
        console.warn(`No checkbox found in <li> with direct text: "${text}"`);
        return; // Exit if the checkbox was not found
      }

      checkbox.click();
      console.log(`Checkbox in <li> with direct text "${text}" clicked.`);
    }

    clickCheckbox("Ensembles");
    clickCheckbox("E1 = EPURE")

    // Set top view
    function clickButton(text: string): void {
        const bu = Array.from(
          document.querySelectorAll<HTMLButtonElement>("button")
        ).find((bu) => {
          const directText = Array.from(bu.childNodes)
            .filter((node) => node.nodeType === Node.TEXT_NODE)
            .map((node) => node.textContent?.trim())
            .join("");
          return directText === text;
        });
  
        if (!bu) {
          console.warn(`No <li> found with direct text: "${text}"`);
          return; // Exit if the <li> was not found
        }
        bu.click();
      }
    clickButton("Dessus");
  }
}
