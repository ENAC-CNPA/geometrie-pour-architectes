import { models } from "./extensions/models.ts";

const modelsList = document.getElementById("models-list") as HTMLUListElement;

const baseURL = `./viewer.html`;

for (const model of models) {
  const modelListItem = document.createElement("li");
  const modelUrl = document.createElement("a");
  modelUrl.textContent = model.name;
  const speckleUrl = model.speckleUrl;
  modelUrl.href = baseURL + `?id=${speckleUrl}`;
  modelUrl.target = "_blank";
  modelListItem.appendChild(modelUrl)
  modelsList.appendChild(modelListItem);
}