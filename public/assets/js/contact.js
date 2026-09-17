// RÉCUPÉRATION DES ÉLÉMENTS HTML

const formulaire = document.querySelector("#contact-form");

const nom = document.querySelector("#fullname");
const email = document.querySelector("#email");
const entreprise = document.querySelector("#company");
const typeDemande = document.querySelector("#request-type");
const consentement = document.querySelector("#consent");

const erreurNom = document.querySelector("#fullname-error");
const erreurEmail = document.querySelector("#email-error");
const erreurEntreprise = document.querySelector("#company-error");
const erreurTypeDemande = document.querySelector("#request-type-error");
const messageFormulaire = document.querySelector("#form-message");

const membresEquipe = document.querySelectorAll(".team-member");
const boutonPrecedent = document.querySelector("#team-previous");
const boutonSuivant = document.querySelector("#team-next");
const indicateurs = document.querySelector("#carousel-indicators");

const compteurFavoris = document.querySelector("#favorites-count");

// Nombre de membres affichés en même temps dans le carrousel
let nombreMembresVisibles = 4;

// Index du premier membre actuellement affiché
let premierMembre = 0;

// Désactive les messages automatiques du navigateur
// La validation et les messages sont gérés directement en JavaScript
formulaire.noValidate = true;

// VALIDATION DU FORMULAIRE

// Affiche un message d'erreur et indique que le champ est invalide
function afficherErreur(champ, elementErreur, message) {
    elementErreur.textContent = message;
    elementErreur.hidden = false;
    champ.setAttribute("aria-invalid", "true");
}

// Supprime le message d'erreur lorsque le champ devient valide
function enleverErreur(champ, elementErreur) {
    elementErreur.textContent = "";
    elementErreur.hidden = true;
    champ.setAttribute("aria-invalid", "false");
}

function validerNom() {
    if (nom.value.trim() === "") {
        afficherErreur(nom, erreurNom, "Veuillez saisir votre nom complet.");
        return false;
    }

    enleverErreur(nom, erreurNom);
    return true;
}

function validerEmail() {
    if (email.value.trim() === "") {
        afficherErreur(email, erreurEmail, "Veuillez saisir votre adresse email.");
        return false;
    }

    // validity.valid utilise la vérification du type="email" déjà présente dans le champ HTML
    if (!email.validity.valid) {
        afficherErreur(email, erreurEmail, "Veuillez saisir une adresse email valide.");
        return false;
    }

    enleverErreur(email, erreurEmail);
    return true;
}

function validerEntreprise() {
    if (entreprise.value.trim() === "") {
        afficherErreur(
            entreprise,
            erreurEntreprise,
            "Veuillez saisir le nom de votre entreprise."
        );
        return false;
    }

    enleverErreur(entreprise, erreurEntreprise);
    return true;
}

function validerTypeDemande() {
    if (typeDemande.value === "") {
        afficherErreur(
            typeDemande,
            erreurTypeDemande,
            "Veuillez sélectionner un type de demande."
        );
        return false;
    }

    enleverErreur(typeDemande, erreurTypeDemande);
    return true;
}

function validerConsentement() {
    if (!consentement.checked) {
        consentement.setAttribute("aria-invalid", "true");
        return false;
    }

    consentement.setAttribute("aria-invalid", "false");
    return true;
}

// Validation au fur et à mesure de la saisie
nom.addEventListener("input", validerNom);
email.addEventListener("input", validerEmail);
entreprise.addEventListener("input", validerEntreprise);
typeDemande.addEventListener("change", validerTypeDemande);
consentement.addEventListener("change", validerConsentement);

// Validation complète lors de l'envoi du formulaire
formulaire.addEventListener("submit", function(event) {
    // Empêche le rechargement de la page
    event.preventDefault();

    const nomValide = validerNom();
    const emailValide = validerEmail();
    const entrepriseValide = validerEntreprise();
    const typeDemandeValide = validerTypeDemande();
    const consentementValide = validerConsentement();

    if (
        !nomValide ||
        !emailValide ||
        !entrepriseValide ||
        !typeDemandeValide ||
        !consentementValide
    ) {
        messageFormulaire.textContent =
            "Veuillez vérifier les champs obligatoires du formulaire.";
        messageFormulaire.hidden = false;
        return;
    }

    // Aucun envoi réel : le projet ne possède pas de serveur pour traiter le formulaire
    messageFormulaire.textContent =
        "Votre message a bien été envoyé. Notre équipe vous répondra rapidement.";
    messageFormulaire.hidden = false;

    // Vide les champs après une validation réussie
    formulaire.reset();

    enleverErreur(nom, erreurNom);
    enleverErreur(email, erreurEmail);
    enleverErreur(entreprise, erreurEntreprise);
    enleverErreur(typeDemande, erreurTypeDemande);
    consentement.setAttribute("aria-invalid", "false");
});

// CARROUSEL DE L'ÉQUIPE

// Adapte le nombre de membres visibles à la largeur de l'écran
// Sur mobile : 1 membre, sur tablette et ordinateur : 4 membres
function adapterCarrousel() {
    if (window.innerWidth <= 768) {
        nombreMembresVisibles = 1;
    } else {
        nombreMembresVisibles = 4;
    }

    // Repart du premier membre après un changement de taille d'écran
    premierMembre = 0;
    afficherMembres();
}

// Cache tous les membres puis affiche uniquement ceux qui doivent être visibles à partir de premierMembre
function afficherMembres() {
    for (let i = 0; i < membresEquipe.length; i++) {
        membresEquipe[i].hidden = true;
    }

    for (let i = 0; i < nombreMembresVisibles; i++) {
        const index = premierMembre + i;

        if (index < membresEquipe.length) {
            membresEquipe[index].hidden = false;
        }
    }

    mettreAJourIndicateurs();
}

// Décale le carrousel d'un membre vers la droite
function membresSuivants() {
    premierMembre++;

    // Revient au début lorsqu'on dépasse la dernière position possible
    if (premierMembre > membresEquipe.length - nombreMembresVisibles) {
        premierMembre = 0;
    }

    afficherMembres();
}

// Décale le carrousel d'un membre vers la gauche
function membresPrecedents() {
    premierMembre--;

    // Revient à la dernière position lorsqu'on dépasse le début
    if (premierMembre < 0) {
        premierMembre = membresEquipe.length - nombreMembresVisibles;
    }

    afficherMembres();
}

// Génère les points indicateurs sous le carrousel, le rond plein correspond à la position actuelle 
function mettreAJourIndicateurs() {
    indicateurs.innerHTML = "";

    const nombrePositions =
        membresEquipe.length - nombreMembresVisibles + 1;

    for (let i = 0; i < nombrePositions; i++) {
        if (i === premierMembre) {
            indicateurs.innerHTML += "<span>●</span>";
        } else {
            indicateurs.innerHTML += "<span>○</span>";
        }
    }
}

// Navigation du carrousel
boutonSuivant.addEventListener("click", membresSuivants);
boutonPrecedent.addEventListener("click", membresPrecedents);

// Adapte le carrousel au chargement de la page
adapterCarrousel();

// Réadapte le carrousel si la largeur de la fenêtre change
window.addEventListener("resize", adapterCarrousel);

// COMPTEUR DE FAVORIS

// Affiche dans le header le nombre de favoris déjà enregistrés dans le localStorage
function mettreAJourCompteurFavoris() {
    const favorisEnregistres = localStorage.getItem("favoris");

    if (favorisEnregistres) {
        const favoris = JSON.parse(favorisEnregistres);
        compteurFavoris.textContent = favoris.length;
    } else {
        compteurFavoris.textContent = 0;
    }
}

// CHARGEMENT DE LA PAGE

mettreAJourCompteurFavoris();