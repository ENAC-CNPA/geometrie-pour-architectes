export function createFooter() {

  const footer = document.createElement("div");
  footer.id = "footer";

  const footerTitle = document.createElement("p");
  footerTitle.id = "footer-title";
  footerTitle.textContent = "Footer";

  const speckleText = document.createElement("p");
  speckleText.id = "speckle-text";
  speckleText.textContent = "Visionneuse développée avec Speckle";

  footer.appendChild(footerTitle);
  footer.appendChild(speckleText);

  document.body.appendChild(footer);
}
