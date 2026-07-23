// Module moteur — assemblage des items à partir des angles (sections 1.2, 1.3, 1.4 et 3
// de SPECIFICATION.md). L'angle porte la question, la réponse et le feedback : c'est lui
// qui fabrique l'item, jamais la notion (une définition reformulée en option n'est pas une
// question, c'est une définition déguisée). Ne fait qu'assembler des données déjà
// présentes : aucun contenu pédagogique n'est inventé ici.

/**
 * Charge le fichier data/situations/situations.json et retourne le tableau de situations qu'il contient.
 * @returns {Promise<Array>} Le tableau de situations, ou un tableau vide en cas d'erreur.
 */
async function chargerSituations() {
  const chemin = "data/situations/situations.json";

  let reponse;
  try {
    reponse = await fetch(chemin);
  } catch (erreur) {
    console.error(`Impossible de charger le fichier "${chemin}" : ${erreur.message}`);
    return [];
  }

  if (!reponse.ok) {
    console.error(`Fichier introuvable : "${chemin}" (statut ${reponse.status})`);
    return [];
  }

  try {
    const situations = await reponse.json();
    return situations;
  } catch (erreur) {
    console.error(`JSON invalide dans "${chemin}" : ${erreur.message}`);
    return [];
  }
}

/**
 * Charge le fichier data/angles/angles.json et retourne le tableau d'angles qu'il contient.
 * @returns {Promise<Array>} Le tableau d'angles, ou un tableau vide en cas d'erreur.
 */
async function chargerAngles() {
  const chemin = "data/angles/angles.json";

  let reponse;
  try {
    reponse = await fetch(chemin);
  } catch (erreur) {
    console.error(`Impossible de charger le fichier "${chemin}" : ${erreur.message}`);
    return [];
  }

  if (!reponse.ok) {
    console.error(`Fichier introuvable : "${chemin}" (statut ${reponse.status})`);
    return [];
  }

  try {
    const angles = await reponse.json();
    return angles;
  } catch (erreur) {
    console.error(`JSON invalide dans "${chemin}" : ${erreur.message}`);
    return [];
  }
}

/**
 * Recherche tous les angles qui portent sur une notion donnée (section 1.4 : l'angle est
 * l'unique source de vérité du lien entre Situation et Notion).
 * @param {Array} angles - Le tableau d'angles dans lequel chercher.
 * @param {string} notion_id - L'identifiant de la notion recherchée.
 * @returns {Array} Les angles dont le champ notion correspond, éventuellement vide.
 */
function anglesDeLaNotion(angles, notion_id) {
  return angles.filter((angle) => angle.notion === notion_id);
}

/**
 * Mélange aléatoirement l'ordre de deux options, pour que la bonne réponse ne soit pas
 * toujours à la même position.
 * @param {Object} optionCorrecte
 * @param {Object} optionIncorrecte
 * @returns {Array<Object>}
 */
function melangerOptions(optionCorrecte, optionIncorrecte) {
  return Math.random() < 0.5 ? [optionCorrecte, optionIncorrecte] : [optionIncorrecte, optionCorrecte];
}

/**
 * Assemble un angle et une situation en un item destiné à un micro-jeu (section 1.3 :
 * l'item est un produit éphémère du moteur, jamais stocké). Rien n'est inventé : la
 * situation, la question et les deux options viennent intégralement des données. Si les
 * données ne suffisent pas, la fonction retourne null et détaille ce qui manque.
 * @param {Object} angle - L'angle au format de la section 1.4.
 * @param {Object} situation - La situation au format de la section 1.3.
 * @param {string} typeJeu - L'identifiant du micro-jeu visé (ex: "detective").
 * @returns {Object|null} L'item au format attendu par le micro-jeu, ou null.
 */
function fabriquerItem(angle, situation, typeJeu) {
  if (typeJeu !== "detective") {
    console.error(`Type de jeu non pris en charge par le moteur : "${typeJeu}".`);
    return null;
  }

  const manques = [];

  if (angle.situation !== situation.id) {
    manques.push(
      `l'angle "${angle.id}" référence la situation "${angle.situation}", pas "${situation.id}".`
    );
  }

  if (!Array.isArray(situation.recit) || situation.recit.length === 0) {
    manques.push(`situation.recit est vide ou absent pour "${situation.id}".`);
  }

  if (!angle.question || angle.question.trim() === "") {
    manques.push(`angle.question est vide ou absent pour "${angle.id}".`);
  }

  if (!angle.reponse_correcte || angle.reponse_correcte.trim() === "") {
    manques.push(`angle.reponse_correcte est vide ou absent pour "${angle.id}".`);
  }

  if (!angle.reponse_incorrecte || angle.reponse_incorrecte.trim() === "") {
    manques.push(`angle.reponse_incorrecte est vide ou absent pour "${angle.id}".`);
  }

  if (manques.length > 0) {
    console.error("Impossible de fabriquer l'item : données manquantes.");
    manques.forEach((manque) => console.error(`- ${manque}`));
    return null;
  }

  const optionCorrecte = { texte: angle.reponse_correcte, correcte: true };
  const optionIncorrecte = { texte: angle.reponse_incorrecte, correcte: false };

  return {
    situation: situation.recit,
    question: angle.question,
    options: melangerOptions(optionCorrecte, optionIncorrecte),
  };
}

/**
 * Retourne le texte de retour à afficher après la réponse de l'apprenant (section 1.4 :
 * explication_courte confirme le verdict, feedback_erreur traite l'erreur de raisonnement).
 * @param {Object} angle - L'angle au format de la section 1.4.
 * @param {boolean} reussite - true si la réponse était correcte.
 * @returns {string|null} Le texte à afficher, ou null si le champ attendu est absent.
 */
function retourApresReponse(angle, reussite) {
  const champ = reussite ? "explication_courte" : "feedback_erreur";
  const texte = angle[champ];

  if (!texte || texte.trim() === "") {
    console.error(`angle.${champ} est vide ou absent pour "${angle.id}".`);
    return null;
  }

  return texte;
}
