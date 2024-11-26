export function createIntroduction() {
  const textContainer = document.createElement('div');
  textContainer.id = "introduction-container";

  const text = document.createElement('div');
  text.id = 'introduction';

  const textTitle = document.createElement("p");
  textTitle.textContent = "Leçon d'honneur Prof. Bernard Cache";

  const textCore = document.createElement("p");
  textCore.textContent =
    "Cette page est un prototype de visionneuse web, développée avec la technologie open-source Speckle. Elle permet de diffuser en open access les constructions des enseignements et recherches en géométrie. Le modèle utilisé est la voûte de l'escalier en fer-à-cheval du château Fontainebleau, qui sera abordée lors de cette leçon d'honneur.";

  const textButton = document.createElement("button");
  textButton.textContent = "Ok";
  textButton.id = 'introduction-button';
  textButton.onclick = () => {
    textContainer.style.display = "none";
  };

  text.append(textTitle, textCore, textButton);

  textContainer.appendChild(text);

  document.body.appendChild(textContainer);
}
