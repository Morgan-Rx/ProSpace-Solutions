// RÉCUPÉRATION DES ÉLÉMENTS HTML

const listeEspaces = document.querySelector("#spaces-list");
const chargement = document.querySelector("#loading");
const nombreEspaces = document.querySelector("#spaces-count");
const aucunResultat = document.querySelector("#no-results");
const compteurFavoris = document.querySelector("#favorites-count");

const filtreVille = document.querySelector("#filter-city");
const filtreCapacite = document.querySelector("#filter-capacity");
const filtreFibre = document.querySelector("#filter-fiber");
const filtreVideo = document.querySelector("#filter-video");
const filtrePmr = document.querySelector("#filter-pmr");
const filtreCafe = document.querySelector("#filter-coffee");

// Contient tous les espaces récupérés dans le fichier JSON
// Ce tableau sert ensuite de base aux différents filtres
let tousLesEspaces = [];

// CHARGEMENT DES ESPACES

async function chargerEspaces() {
    try {
        const reponse = await fetch("./public/data/espaces.json");

        // Vérifie que le fichier JSON a bien été récupéré
        if (!reponse.ok) {
            throw new Error("Erreur lors du chargement des espaces");
        }

        tousLesEspaces = await reponse.json();

        afficherEspaces(tousLesEspaces);
        chargement.hidden = true;
    } catch (erreur) {
        console.error(erreur);
        chargement.textContent = "Impossible de charger les espaces.";
    }
}

// FAVORIS

// Récupère les ids des favoris enregistrés dans le localStorage
// Si aucun favori n'existe encore, retourne un tableau vide
function recupererFavoris() {
    const favorisEnregistres = localStorage.getItem("favoris");

    if (favorisEnregistres) {
        return JSON.parse(favorisEnregistres);
    }

    return [];
}

// Transforme le tableau en JSON avant de l'enregistrer dans le navigateur
function enregistrerFavoris(favoris) {
    localStorage.setItem("favoris", JSON.stringify(favoris));
}

// Ajoute ou retire un espace selon son état actuel
function modifierFavori(idEspace) {
    let favoris = recupererFavoris();

    if (favoris.includes(idEspace)) {
        // L'espace est déjà enregistré : on le retire
        favoris = favoris.filter(function(id) {
            return id !== idEspace;
        });
    } else {
        // L'espace n'est pas encore enregistré : on l'ajoute
        favoris.push(idEspace);
    }

    enregistrerFavoris(favoris);
    mettreAJourCompteurFavoris();

    // Réaffiche les cartes pour mettre à jour le coeur, tout en conservant les filtres sélectionnés
    filtrerEspaces();
}

// Met à jour le nombre de favoris affiché dans le header
function mettreAJourCompteurFavoris() {
    const favoris = recupererFavoris();
    compteurFavoris.textContent = favoris.length;
}

// AFFICHAGE DES CARTES

// Retourne l'icône correspondant au badge reçu
function obtenirIconeBadge(badge) {
    if (badge === "Fibre") {
        return "./public/images/icons/fibre.svg";
    }

    if (badge === "PMR") {
        return "./public/images/icons/pmr.svg";
    }

    if (badge === "4K") {
        return "./public/images/icons/ecran-4k.svg";
    }

    return "";
}

function afficherEspaces(espaces) {
    listeEspaces.innerHTML = "";

    // Adapte le texte au nombre de résultats
    if (espaces.length === 1) {
        nombreEspaces.textContent = "1 espace disponible";
    } else {
        nombreEspaces.textContent = espaces.length + " espaces disponibles";
    }

    // Affiche un message si aucun espace ne correspond aux filtres
    if (espaces.length === 0) {
        aucunResultat.hidden = false;
        return;
    }

    aucunResultat.hidden = true;

    // Les favoris sont récupérés une seule fois avant de créer les cartes
    const favoris = recupererFavoris();

    for (let i = 0; i < espaces.length; i++) {
        const espace = espaces[i];
        let badgesHTML = "";

        // Création des badges Fibre, PMR et 4K
        for (let j = 0; j < espace.badges.length; j++) {
            const badge = espace.badges[j];
            const iconeBadge = obtenirIconeBadge(badge);

            badgesHTML += `
                <span class="space-badge">
                    <img src="${iconeBadge}" alt="" aria-hidden="true">
                    ${badge}
                </span>
            `;
        }

        // Vérifie si cet espace est présent dans le localStorage
        const estFavori = favoris.includes(espace.id);

        let iconeFavori = "./public/images/icons/favori-vide.svg";
        let texteFavori = "Ajouter " + espace.nom + " aux favoris";

        if (estFavori) {
            iconeFavori = "./public/images/icons/favori-actif.svg";
            texteFavori = "Retirer " + espace.nom + " des favoris";
        }

        // Le chemin enregistré dans le JSON commence par images/...
        // index.html étant à la racine, on ajoute ./public/
        const imagePrincipale = "./public/" + espace.images[0];

        // Création de la carte avec les données de l'espace.
        listeEspaces.innerHTML += `
            <article class="space-card">
                <button
                    type="button"
                    class="card-favorite-button"
                    data-id="${espace.id}"
                    aria-label="${texteFavori}"
                    aria-pressed="${estFavori}"
                >
                    <img src="${iconeFavori}" alt="" aria-hidden="true">
                </button>

                <img src="${imagePrincipale}" alt="${espace.nom}" class="space-card-image" loading="lazy">

                <div class="space-card-content">
                    <h3>${espace.nom}</h3>

                    <p class="space-card-location">
                        <img src="./public/images/icons/localisation.svg" alt="" aria-hidden="true">
                        ${espace.localisation}
                    </p>

                    <div class="space-card-rating">
                        <span class="stars" aria-hidden="true">★★★★★</span>
                        <strong>${espace.note}</strong>
                        <span class="reviews">(${espace.avis} avis)</span>
                    </div>

                    <div class="space-card-info">
                        <p class="space-card-capacity">
                            <img src="./public/images/icons/personne-gris.svg" alt="" aria-hidden="true">
                            ${espace.capacite} pers.
                        </p>

                        <div class="space-card-badges">
                            ${badgesHTML}
                        </div>
                    </div>

                    <div class="space-card-bottom">
                        <p class="space-card-price">
                            <strong>${espace.tarifs.heure}€</strong>
                            <span>/heure</span>
                        </p>

                        <a href="./public/pages/espace.html?id=${espace.id}" class="button button-primary">
                            Voir la fiche
                        </a>
                    </div>
                </div>
            </article>
        `;
    }

    // Les boutons coeur sont créés dynamiquement avec les cartes
    // On ajoute leurs événements seulement après leur création
    const boutonsFavoris = document.querySelectorAll(".card-favorite-button");

    for (let i = 0; i < boutonsFavoris.length; i++) {
        boutonsFavoris[i].addEventListener("click", function() {
            const idEspace = Number(this.dataset.id);
            modifierFavori(idEspace);
        });
    }
}

// FILTRES

function filtrerEspaces() {
    // Récupère l'état actuel de tous les filtres
    const villeChoisie = filtreVille.value;
    const capaciteChoisie = filtreCapacite.value;
    const fibreChoisie = filtreFibre.checked;
    const videoChoisie = filtreVideo.checked;
    const pmrChoisi = filtrePmr.checked;
    const cafeChoisi = filtreCafe.checked;

    // filter() crée un nouveau tableau contenant uniquement les espaces qui respectent tous les critères sélectionnés.
    const espacesFiltres = tousLesEspaces.filter(function(espace) {
        // Ville
        if (villeChoisie !== "" && espace.ville !== villeChoisie) {
            return false;
        }

        // Capacité
        if (capaciteChoisie === "1-5" && (espace.capacite < 1 || espace.capacite > 5)) {
            return false;
        }

        if (capaciteChoisie === "6-10" && (espace.capacite < 6 || espace.capacite > 10)) {
            return false;
        }

        if (capaciteChoisie === "11-20" && (espace.capacite < 11 || espace.capacite > 20)) {
            return false;
        }

        if (capaciteChoisie === "20+" && espace.capacite < 20) {
            return false;
        }

        // Équipements
        if (fibreChoisie && !espace.filtres.fibre) {
            return false;
        }

        if (videoChoisie && !espace.filtres.visioconference) {
            return false;
        }

        if (pmrChoisi && !espace.filtres.pmr) {
            return false;
        }

        if (cafeChoisi && !espace.filtres.cafe) {
            return false;
        }

        // Si aucun critère ne l'exclut, l'espace est conservé
        return true;
    });

    afficherEspaces(espacesFiltres);
}

// ÉVÉNEMENTS DES FILTRES

// Chaque changement relance le filtrage avec l'état actuel de tous les filtres
filtreVille.addEventListener("change", filtrerEspaces);
filtreCapacite.addEventListener("change", filtrerEspaces);
filtreFibre.addEventListener("change", filtrerEspaces);
filtreVideo.addEventListener("change", filtrerEspaces);
filtrePmr.addEventListener("change", filtrerEspaces);
filtreCafe.addEventListener("change", filtrerEspaces);

// CHARGEMENT DE LA PAGE

// Charge les espaces puis récupère le nombre de favoris déjà enregistrés
chargerEspaces();
mettreAJourCompteurFavoris();