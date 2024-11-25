
export function createHeader() {

    const header = document.createElement('header');
    header.id = 'header';
    header.style.width = '100vw';

    const logosContainer = document.createElement('div');
    logosContainer.id = 'logos-container';
    header.appendChild(logosContainer);

    const epflLogo = document.createElement('img');
    epflLogo.id = 'logo-epfl';
    epflLogo.src = 'https://www.epfl.ch/wp/5.5/wp-content/themes/wp-theme-2018/assets/svg/epfl-logo.svg?refresh=now';
    epflLogo.alt = 'Logo EPFL, École polytechnique fédérale de Lausanne';
    logosContainer.appendChild(epflLogo);

    const enacLogo = document.createElement('img');
    enacLogo.classList.add('logos-unites');
    enacLogo.src = './epfl/EPFL_Unités_ENAC.png';
    enacLogo.alt = 'Logo ENAC, Faculté de l’environnement naturel, architectural et construit';
    logosContainer.appendChild(enacLogo);

    const cnpaLogo = document.createElement('img');
    cnpaLogo.classList.add('logos-unites');
    cnpaLogo.src = './epfl/EPFL_Unités_CNPA.png';
    cnpaLogo.alt = 'Logo CNPA, Laboratoire des cultures numériques du projet architectural';
    logosContainer.appendChild(cnpaLogo);

    document.body.appendChild(header);

}
