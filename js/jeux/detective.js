// Micro-jeu "Détective" — boucle 1 (ancrage), sections 2.1, 3, 7.2 de SPECIFICATION.md
// Ne fait que construire l'écran dans le DOM : aucune logique de routage, d'état ou de score ici.
//
// afficherDetective(notion, item, conteneur, callbacks) attend un objet "item" fourni par
// l'appelant (moteur), car la situation concrète et les options de réponse ne font pas partie
// du modèle Notion (section 1.2) : { situation: Array<string>, question?: string,
// options: Array<{texte: string, correcte: boolean}> }

/**
 * Transforme un code de scénario (ex: "mairie") en cadre situationnel lisible (ex: "À la mairie").
 * Ne doit JAMAIS afficher l'étiquette conceptuelle de la notion (sections 2.1 et 10).
 * @param {string} scenario - Le code de scénario (notion.scenarios[0]).
 * @returns {string} Le cadre situationnel à afficher.
 */
function texteCadreSituationnel(scenario) {
  const cadresConnus = {
    mairie: "À la mairie",
    ecole: "À l'école",
    hopital: "À l'hôpital",
  };

  if (cadresConnus[scenario]) {
    return cadresConnus[scenario];
  }

  // Repli pour un scénario non répertorié : on évite de deviner l'article et l'élision exacts.
  return `Situation : ${scenario.replace(/_/g, " ")}`;
}

/**
 * Construit le bouton "← Quitter" (item 1 du gabarit, section 7.2).
 * @param {Object} callbacks - Les callbacks fournis par l'appelant.
 * @returns {HTMLButtonElement}
 */
function creerBoutonQuitter(callbacks) {
  const bouton = document.createElement("button");
  bouton.type = "button";
  bouton.className = "detective-bouton-quitter";
  bouton.textContent = "← Quitter";
  bouton.addEventListener("click", () => {
    if (callbacks && typeof callbacks.onQuitter === "function") {
      callbacks.onQuitter();
    }
  });
  return bouton;
}

/**
 * Construit le cadre situationnel affiché en haut de l'écran (item 2, sections 2.1 et 7.2).
 * @param {string} scenario - notion.scenarios[0]
 * @returns {HTMLElement}
 */
function creerCadreSituationnel(scenario) {
  const cadre = document.createElement("p");
  cadre.className = "detective-cadre-situationnel";
  cadre.textContent = texteCadreSituationnel(scenario);
  return cadre;
}

/**
 * Construit l'emplacement d'image (item 3, section 7.2). L'image réelle sera ajoutée plus
 * tard : pour l'instant, un simple rectangle réservé (le style gris est défini en CSS).
 * @returns {HTMLElement}
 */
function creerEmplacementImage() {
  const emplacement = document.createElement("div");
  emplacement.className = "detective-emplacement-image";

  const texte = document.createElement("span");
  texte.textContent = "Image à venir";
  emplacement.appendChild(texte);

  return emplacement;
}

/**
 * Construit la situation concrète, une phrase courte par idée (item 4, sections 3.1 et 7.2).
 * @param {Array<string>} phrases - Les phrases de la situation (item.situation).
 * @returns {HTMLElement}
 */
function creerSituationConcrete(phrases) {
  const situation = document.createElement("div");
  situation.className = "detective-situation-concrete";

  phrases.forEach((phrase) => {
    const paragraphe = document.createElement("p");
    paragraphe.className = "detective-phrase-situation";
    paragraphe.textContent = phrase;
    situation.appendChild(paragraphe);
  });

  return situation;
}

/**
 * Construit la question (item 5), tirée de notion.formulations_examen (sections 7.2 et 10).
 * @param {string} texteQuestion
 * @returns {HTMLElement}
 */
function creerQuestion(texteQuestion) {
  const question = document.createElement("p");
  question.className = "detective-question";
  question.textContent = texteQuestion;
  return question;
}

/**
 * Construit les options de réponse (item 6) : les options fournies par item.options,
 * plus "Je ne sais pas" toujours en dernier, non pénalisante (sections 2.1 et 7.2).
 * niveau_etayage vaut "maximal" au premier lancement, donc 3 options maximum au total
 * (section 4.4) : au plus 2 options réelles sont conservées.
 * @param {Array<{texte: string, correcte: boolean}>} optionsFournies
 * @param {Function} auClic - Appelée avec (option) quand une option est choisie.
 * @returns {HTMLElement}
 */
function creerOptions(optionsFournies, auClic) {
  const conteneurOptions = document.createElement("div");
  conteneurOptions.className = "detective-options";

  const optionsReelles = optionsFournies.slice(0, 2);
  const toutesLesOptions = optionsReelles.concat([{ texte: "Je ne sais pas", correcte: false }]);

  toutesLesOptions.forEach((option) => {
    const bouton = document.createElement("button");
    bouton.type = "button";
    bouton.className = "detective-option";
    bouton.textContent = option.texte;
    bouton.addEventListener("click", () => auClic(option));
    conteneurOptions.appendChild(bouton);
  });

  return conteneurOptions;
}

/**
 * Construit le bouton "Je ne comprends pas la question" (item 7), toujours visible (section 5.1).
 * @param {Object} callbacks
 * @returns {HTMLButtonElement}
 */
function creerBoutonIncomprehension(callbacks) {
  const bouton = document.createElement("button");
  bouton.type = "button";
  bouton.className = "detective-bouton-incomprehension";
  bouton.textContent = "Je ne comprends pas la question";
  bouton.addEventListener("click", () => {
    callbacks.onIncomprehension();
  });
  return bouton;
}

/**
 * Construit le message affiché avant toute réponse (item 8, section 2.1).
 * @returns {HTMLElement}
 */
function creerMessageAvantReponse() {
  const message = document.createElement("p");
  message.className = "detective-message-avant-reponse";
  message.textContent = "Personne ne connaît encore la réponse. C'est normal.";
  return message;
}

/**
 * Affiche l'écran du micro-jeu "Détective" (boucle 1 — ancrage) dans le conteneur fourni.
 * Respecte EXACTEMENT le gabarit de la section 7.2 et les interdits de la section 10 :
 * aucun nom de notion, aucun score ni compteur ni chronomètre visible, aucun champ de
 * saisie libre, aucun encouragement automatique, aucun badge ni barre de progression.
 *
 * @param {Object} notion - La notion au format de la section 1.2.
 * @param {Object} item - Le contenu concret de cet exercice, fourni par l'appelant :
 *   { situation: Array<string>, question?: string, options: Array<{texte: string, correcte: boolean}> }
 *   (situation et options ne font pas partie du modèle Notion, section 1.2).
 * @param {HTMLElement} conteneur - L'élément DOM dans lequel construire l'écran.
 * @param {Object} callbacks - { onReponse(porte, reussite, temps), onIncomprehension() }
 */
function afficherDetective(notion, item, conteneur, callbacks) {
  // Horodatage de départ pour mesurer le temps de réponse — jamais affiché (section 10).
  const debut = Date.now();

  // Le Détective correspond à l'opération "situation → principe" (section 3) : sa porte
  // d'entrée est toujours "situation", celle du cadre situationnel affiché à l'écran.
  const porte = "situation";

  conteneur.textContent = "";
  conteneur.classList.add("ecran-microjeu", "detective");

  conteneur.appendChild(creerBoutonQuitter(callbacks));
  conteneur.appendChild(creerCadreSituationnel(notion.scenarios[0]));
  conteneur.appendChild(creerEmplacementImage());
  conteneur.appendChild(creerSituationConcrete(item.situation));

  const texteQuestion = item.question || notion.formulations_examen[0];
  conteneur.appendChild(creerQuestion(texteQuestion));

  const messageAvantReponse = creerMessageAvantReponse();

  const conteneurOptions = creerOptions(item.options, (option) => {
    // Une seule réponse possible par écran : on désactive les options après le premier clic.
    conteneurOptions.querySelectorAll("button").forEach((bouton) => {
      bouton.disabled = true;
    });

    // Le message "avant réponse" ne doit plus apparaître une fois la réponse donnée (section 2.1).
    messageAvantReponse.classList.add("detective-cachee");

    const temps = Date.now() - debut;
    callbacks.onReponse(porte, option.correcte === true, temps);
  });
  conteneur.appendChild(conteneurOptions);

  conteneur.appendChild(creerBoutonIncomprehension(callbacks));
  conteneur.appendChild(messageAvantReponse);
}
