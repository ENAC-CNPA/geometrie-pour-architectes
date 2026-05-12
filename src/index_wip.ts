import { models } from "./extensions/models.ts";

const body = document.body;

// Header

const header = document.createElement("header");
header.id = "index-header";

const nav = document.createElement("nav");
nav.id = "index-nav";
const navList = document.createElement("ul");
navList.id = "index-nav-list";

const pagesData = [
  { name: "À propos", href: "#" },
  { name: "Open Source", href: "#" },
  { name: "Publications", href: "#" },
  { name: "Contact", href: "#" },
];

for (const page of pagesData) {
  const listItem = document.createElement("li");
  const anchor = document.createElement("a");
  anchor.classList.add("index-nav-anchor");
  anchor.textContent = page.name;
  anchor.href = page.href;
  listItem.appendChild(anchor);
  navList.appendChild(listItem);
}

nav.appendChild(navList);
header.appendChild(nav);

const titleContainer = document.createElement("div");
titleContainer.id = "index-title-container";

const title = document.createElement("h1");
title.id = "index-title";
title.textContent = "Géométrie pour Architectes";
titleContainer.appendChild(title);

/*
const subtitleFirstLine = document.createElement("p");
subtitleFirstLine.classList.add("index-subtitle");
subtitleFirstLine.textContent =
  "Plateforme dédiée à la Diffusion des Commentaires et des Modélisations numériques de Figures géométriques,";
titleContainer.appendChild(subtitleFirstLine);

const subtitleSecondLine = document.createElement("p");
subtitleSecondLine.classList.add("index-subtitle");
subtitleSecondLine.textContent =
  "associées à l'Histoire de l'Architecture, de l'Art et des Sciences"
titleContainer.appendChild(subtitleSecondLine);
*/

const subtitle = document.createElement("p");
subtitle.classList.add("index-subtitle");
subtitle.textContent =
  "Plateforme académique dédiée à la Diffusion des Commentaires et des Modélisations numériques de Figures géométriques, associées à l'Histoire de l'Architecture, de l'Art et des Sciences";
titleContainer.appendChild(subtitle);

header.appendChild(titleContainer);

body.appendChild(header);

// Models List

const modelsList = document.createElement("ul");
modelsList.id = "models-list";
modelsList.textContent = "Models :";

const baseURL = `./viewer.html`;
for (const model of models) {
  const speckleUrl = model.speckleUrl;

  const modelListItem = document.createElement("li");
  modelListItem.textContent = model.name;

  const modelSubList = document.createElement("ul");

  const modelOriginalListItem = document.createElement("li");
  const modelOriginalUrl = document.createElement("a");
  modelOriginalUrl.textContent = "Open in Speckle standard viewer";
  modelOriginalUrl.href =
    "https://app.speckle.systems/projects/400bc84669/models/" + speckleUrl;
  modelOriginalUrl.target = "_blank";
  modelOriginalListItem.appendChild(modelOriginalUrl);
  modelSubList.appendChild(modelOriginalListItem);

  const modelCustomListItem = document.createElement("li");
  const modelCustomUrl = document.createElement("a");
  modelCustomUrl.textContent = "Open in Custom viewer";
  modelCustomUrl.href = baseURL + `?id=${speckleUrl}`;
  modelCustomUrl.target = "_blank";
  modelCustomListItem.appendChild(modelCustomUrl);
  modelSubList.appendChild(modelCustomListItem);

  modelListItem.appendChild(modelSubList);
  modelsList.appendChild(modelListItem);
}

body.appendChild(modelsList);

// FOOTER

const footer = document.createElement("footer");

/**
const logos = document.createElement("div");

const logosData = [{ name: "EPFL" }, { name: "MHA" }, { name: "Speckle" }];

for (const logo of logosData) {
  const logoImg = document.createElement("img");
  logoImg.classList.add("footer-logo");
  logos.appendChild(logo)
}
*/

body.appendChild(footer);
