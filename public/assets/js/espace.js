// RÉCUPÉRATION DES ÉLÉMENTS HTML

const chargement = document.querySelector("#space-loading");
const erreur = document.querySelector("#space-error");
const contenu = document.querySelector("#space-content");

const breadcrumbVille = document.querySelector("#breadcrumb-city");
const breadcrumbNom = document.querySelector("#breadcrumb-name");

const nomEspace = document.querySelector("#space-name");
const adresseEspace = document.querySelector("#space-address");
const noteEspace = document.querySelector("#space-rating");
const avisEspace = document.querySelector("#space-reviews");
const etoilesEspace = document.querySelector("#space-stars");

const imagePrincipale = document.querySelector("#space-main-image");
const imageDeux = document.querySelector("#space-second-image");
const imageTrois = document.querySelector("#space-third-image");

const descriptionEspace = document.querySelector("#space-description");
const listeEquipements = document.querySelector("#equipment-list");
const capaciteEspace = document.querySelector("#space-capacity");
const configurationEspace = document.querySelector("#space-configuration");

const prixHeure = document.querySelector("#price-hour");
const prixDemiJournee = document.querySelector("#price-half-day");
const prixJournee = document.querySelector("#price-day");

const boutonFavori = document.querySelector("#favorite-button");
const texteBoutonFavori = document.querySelector("#favorite-button-text");
const iconeFavori = document.querySelector("#favorite-icon");
const compteurFavoris = document.querySelector("#favorites-count");

// Contient l'espace actuellement affiché
// Il est récupéré dans le JSON grâce à l'id présent dans l'URL
let espaceActuel = null;

// CHARGEMENT DE L'ESPACE

async function chargerEspace() {
    try {
        // URLSearchParams permet de récupérer les paramètres présents dans l'URL
        const parametres = new URLSearchParams(window.location.search);
        const idEspace = Number(parametres.get("id"));

        if (!idEspace) {
            throw new Error("Aucun identifiant d'espace dans l'URL");
        }

        const reponse = await fetch("../data/espaces.json");

        if (!reponse.ok) {
            throw new Error("Erreur lors du chargement des espaces");
        }

        const espaces = await reponse.json();

        // find() cherche dans le tableau le premier espace dont l'id correspond à celui récupéré dans l'URL
        espaceActuel = espaces.find(function(espace) {
            return espace.id === idEspace;
        });

        if (!espaceActuel) {
            throw new Error("Espace introuvable");
        }

        afficherEspace(espaceActuel);
        mettreAJourBoutonFavori();
        mettreAJourCompteurFavoris();

        chargement.hidden = true;
        contenu.hidden = false;
    } catch (erreurChargement) {
        console.error(erreurChargement);

        chargement.hidden = true;
        erreur.hidden = false;
    }
}

// AFFICHAGE DE L'ESPACE

function afficherEspace(espace) {
    // Fil d'Ariane
    breadcrumbVille.textContent = espace.localisation;
    breadcrumbNom.textContent = espace.nom;

    // Informations principales
    nomEspace.textContent = espace.nom;
    adresseEspace.textContent = espace.adresse;
    noteEspace.textContent = espace.note;
    avisEspace.textContent = espace.avis + " avis vérifiés";
    etoilesEspace.textContent = "★★★★★";

    // Galerie
    imagePrincipale.src = "../" + espace.images[0];
    imageDeux.src = "../" + espace.images[1];
    imageTrois.src = "../" + espace.images[2];

    // Les textes alternatifs sont ajoutés selon l'espace affiché
    imagePrincipale.alt = "Vue principale de " + espace.nom;
    imageDeux.alt = "Deuxième vue de " + espace.nom;
    imageTrois.alt = "Troisième vue de " + espace.nom;

    // Description
    descriptionEspace.textContent = espace.description;

    // Les équipements sont générés à partir du tableau présent dans le JSON
    listeEquipements.innerHTML = "";

    for (let i = 0; i < espace.equipements.length; i++) {
        listeEquipements.innerHTML += `
            <li>
                <img src="../images/icons/validation.svg" alt="" aria-hidden="true">
                ${espace.equipements[i]}
            </li>
        `;
    }

    // Capacité et configuration
    capaciteEspace.textContent = espace.capacite + " personnes";
    configurationEspace.textContent = espace.configuration;

    // Tarifs
    prixHeure.textContent = espace.tarifs.heure + " €";
    prixDemiJournee.textContent = espace.tarifs.demiJournee + " €";
    prixJournee.textContent = espace.tarifs.journee + " €";

    // Le titre et la description de la page sont adaptés à chaque espace pour avoir des informations SEO plus précises
    document.title =
        espace.nom +
        " - Salle de réunion " +
        espace.capacite +
        "p - " +
        espace.ville +
        " | ProSpace Solutions";

    const metaDescription = document.querySelector('meta[name="description"]');

    if (metaDescription) {
        metaDescription.setAttribute(
            "content",
            "Découvrez " +
            espace.nom +
            ", un espace professionnel à " +
            espace.ville +
            " pouvant accueillir jusqu'à " +
            espace.capacite +
            " personnes."
        );
    }
}

// FAVORIS

// Récupère les ids enregistrés dans le localStorage
// Si aucun favori n'existe, retourne un tableau vide
function recupererFavoris() {
    const favorisEnregistres = localStorage.getItem("favoris");

    if (favorisEnregistres) {
        return JSON.parse(favorisEnregistres);
    }

    return [];
}

// Enregistre le tableau des favoris dans le navigateur
function enregistrerFavoris(favoris) {
    localStorage.setItem("favoris", JSON.stringify(favoris));
}

// Ajoute ou retire l'espace actuellement affiché
function modifierFavori() {
    let favoris = recupererFavoris();

    // indexOf() retourne la position de l'id dans le tableau
    const indexFavori = favoris.indexOf(espaceActuel.id);

    if (indexFavori === -1) {
        favoris.push(espaceActuel.id);
    } else {
        favoris.splice(indexFavori, 1);
    }

    enregistrerFavoris(favoris);
    mettreAJourBoutonFavori();
    mettreAJourCompteurFavoris();
}

// Met à jour le texte, l'icône et l'état accessible du bouton
function mettreAJourBoutonFavori() {
    const favoris = recupererFavoris();
    const estFavori = favoris.includes(espaceActuel.id);

    if (estFavori) {
        texteBoutonFavori.textContent = "Retirer des favoris";
        iconeFavori.src = "../images/icons/favori-actif.svg";
        boutonFavori.setAttribute("aria-pressed", "true");
        boutonFavori.setAttribute(
            "aria-label",
            "Retirer " + espaceActuel.nom + " des favoris"
        );
    } else {
        texteBoutonFavori.textContent = "Sauvegarder en Favoris";
        iconeFavori.src = "../images/icons/favori-vide.svg";
        boutonFavori.setAttribute("aria-pressed", "false");
        boutonFavori.setAttribute(
            "aria-label",
            "Ajouter " + espaceActuel.nom + " aux favoris"
        );
    }
}

// Met à jour le compteur affiché dans le header
function mettreAJourCompteurFavoris() {
    const favoris = recupererFavoris();
    compteurFavoris.textContent = favoris.length;
}

// ÉVÉNEMENTS

boutonFavori.addEventListener("click", modifierFavori);

// CHARGEMENT DE LA PAGE

chargerEspace();