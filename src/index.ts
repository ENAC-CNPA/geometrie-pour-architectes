import { models } from "./extensions/models.ts";

const modelsList = document.getElementById("models-list") as HTMLUListElement;

const baseURL = `./viewer.html`;
for (const model of models) {
  const speckleUrl = model.speckleUrl;

  const modelListItem = document.createElement("li");
  modelListItem.textContent = model.name;

  const modelSubList = document.createElement("ul");

  const modelOriginalListItem = document.createElement("li");
  const modelOriginalUrl = document.createElement("a");
  modelOriginalUrl.textContent = "Open in Speckle standard viewer";
  modelOriginalUrl.href = "https://app.speckle.systems/projects/400bc84669/models/" + speckleUrl;
  modelOriginalUrl.target = "_blank";
  modelOriginalListItem.appendChild(modelOriginalUrl)
  modelSubList.appendChild(modelOriginalListItem);

  const modelCustomListItem = document.createElement("li");
  const modelCustomUrl = document.createElement("a");
  modelCustomUrl.textContent = "Open in Custom viewer";
  modelCustomUrl.href = baseURL + `?id=${speckleUrl}`;
  modelCustomUrl.target = "_blank";
  modelCustomListItem.appendChild(modelCustomUrl)
  modelSubList.appendChild(modelCustomListItem);

  modelListItem.appendChild(modelSubList);
  modelsList.appendChild(modelListItem);
}