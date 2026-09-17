// RÉCUPÉRATION DES ÉLÉMENTS HTML

const listeFavoris = document.querySelector("#favorites-list");
const messageVide = document.querySelector("#favorites-empty");
const boutonVider = document.querySelector("#clear-favorites");
const compteurFavoris = document.querySelector("#favorites-count");
const sousTitreFavoris = document.querySelector("#favorites-subtitle");

// Contient tous les espaces récupérés dans le fichier JSON
let tousLesEspaces = [];

// CHARGEMENT DES ESPACES

async function chargerFavoris() {
    try {
        const reponse = await fetch("../data/espaces.json");

        if (!reponse.ok) {
            throw new Error("Erreur lors du chargement des espaces");
        }

        tousLesEspaces = await reponse.json();

        afficherFavoris();
        mettreAJourCompteurFavoris();
    } catch (erreur) {
        console.error(erreur);
        listeFavoris.innerHTML = "<p>Impossible de charger les espaces enregistrés.</p>";
    }
}

// LOCALSTORAGE

// Récupère les ids enregistrés dans le localStorage
// Si aucun favori n'existe encore, retourne un tableau vide
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

// AFFICHAGE DES FAVORIS

// Adapte le sous-titre au nombre d'espaces enregistrés
function mettreAJourSousTitreFavoris(nombre) {
    if (nombre === 1) {
        sousTitreFavoris.textContent = "1 espace dans votre sélection";
    } else {
        sousTitreFavoris.textContent = nombre + " espaces dans votre sélection";
    }
}

function afficherFavoris() {
    const favoris = recupererFavoris();

    listeFavoris.innerHTML = "";

    // Aucun favori enregistré dans le localStorage
    if (favoris.length === 0) {
        mettreAJourSousTitreFavoris(0);
        messageVide.hidden = false;
        boutonVider.hidden = true;
        return;
    }

    // filter() garde uniquement les espaces dont l'id est présent dans le tableau des favoris
    const espacesFavoris = tousLesEspaces.filter(function(espace) {
        return favoris.includes(espace.id);
    });

    // Le sous-titre utilise le nombre réel d'espaces retrouvés
    mettreAJourSousTitreFavoris(espacesFavoris.length);

    // Sécurité si un ancien favori n'existe plus dans le JSON
    if (espacesFavoris.length === 0) {
        messageVide.hidden = false;
        boutonVider.hidden = true;
        return;
    }

    messageVide.hidden = true;
    boutonVider.hidden = false;

    // Création d'une carte pour chaque espace enregistré
    for (let i = 0; i < espacesFavoris.length; i++) {
        const espace = espacesFavoris[i];

        // mes-espaces.html est dans public/pages/
        // On remonte donc d'un niveau pour accéder au dossier images
        const imagePrincipale = "../" + espace.images[0];

        listeFavoris.innerHTML += `
            <article class="favorite-card">
                <a
                    href="./espace.html?id=${espace.id}"
                    class="favorite-card-image-link"
                    aria-label="Voir les détails de ${espace.nom}"
                >
                    <img
                        src="${imagePrincipale}"
                        alt="${espace.nom}"
                        class="favorite-card-image"
                        loading="lazy"
                    >
                </a>

                <div class="favorite-card-content">
                    <h2>${espace.nom}</h2>

                    <p class="favorite-card-location">
                        <img src="../images/icons/localisation.svg" alt="" aria-hidden="true">
                        ${espace.localisation}
                    </p>

                    <div class="favorite-card-info">
                        <p>
                            <img src="../images/icons/personne-gris.svg" alt="" aria-hidden="true">
                            ${espace.capacite} pers.
                        </p>

                        <p class="favorite-card-price">
                            <strong>${espace.tarifs.heure}€</strong>
                            <span>/h</span>
                        </p>

                        <div class="favorite-card-rating">
                            <span class="stars" aria-hidden="true">★★★★★</span>
                            <span>(${espace.avis})</span>
                        </div>
                    </div>
                </div>

                <div class="favorite-card-actions">
                    <a href="./espace.html?id=${espace.id}" class="button button-primary">
                        Voir Fiche
                    </a>

                    <button
                        type="button"
                        class="button remove-favorite"
                        data-id="${espace.id}"
                        aria-label="Retirer ${espace.nom} des favoris"
                    >
                        <img src="../images/icons/supprimer-gris.svg" alt="" aria-hidden="true">
                        Retirer
                    </button>
                </div>
            </article>
        `;
    }

    // Les boutons sont créés dynamiquement avec les cartes
    // Les événements sont ajoutés après leur création
    ajouterEvenementsSuppression();
}

// SUPPRESSION DES FAVORIS

function ajouterEvenementsSuppression() {
    const boutonsSupprimer = document.querySelectorAll(".remove-favorite");

    for (let i = 0; i < boutonsSupprimer.length; i++) {
        boutonsSupprimer[i].addEventListener("click", function() {
            // dataset permet de récupérer la valeur de data-id
            const idEspace = Number(this.dataset.id);

            supprimerFavori(idEspace);
        });
    }
}

// Supprime un seul espace du tableau des favoris.
function supprimerFavori(idEspace) {
    let favoris = recupererFavoris();

    // Crée un nouveau tableau contenant tous les id sauf celui que l'utilisateur souhaite retirer
    favoris = favoris.filter(function(id) {
        return id !== idEspace;
    });

    enregistrerFavoris(favoris);

    afficherFavoris();
    mettreAJourCompteurFavoris();
}

// VIDER TOUS LES FAVORIS

// Supprime directement la clé "favoris" du localStorage
function viderFavoris() {
    localStorage.removeItem("favoris");

    afficherFavoris();
    mettreAJourCompteurFavoris();
}

// COMPTEUR DU HEADER

function mettreAJourCompteurFavoris() {
    const favoris = recupererFavoris();
    compteurFavoris.textContent = favoris.length;
}

// ÉVÉNEMENTS

boutonVider.addEventListener("click", viderFavoris);

// CHARGEMENT DE LA PAGE

chargerFavoris();