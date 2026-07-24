// Module ordonnanceur — détermine l'ordre de passage des items d'une session (section 4.2 de
// SPECIFICATION.md, à la lumière des sections 2.2 et 4.1). Applique O3 (prérequis), O1
// (interleaving) et O4 (découverte avant réactivation), dans cet ordre de priorité.
// N'implémente PAS O2 (espacement piloté par la performance) : cette règle demande des
// données de progression sur plusieurs jours que le prototype n'a pas encore.
// Ne fait qu'ordonnancer des données déjà présentes : aucun code d'interface ici.

/**
 * Résout l'EtatNotion d'une notion : utilise en priorité l'objet "etats" fourni en
 * paramètre (utile pour les tests, ou quand l'appelant a déjà chargé les états en bloc),
 * et retombe sur chargerEtat (section 1.6) quand la notion n'y figure pas — notamment pour
 * les prérequis d'une notion qui ne fait pas elle-même partie de la session.
 * @param {string} notion_id - Identifiant de la notion.
 * @param {Object} etats - Objet { notion_id: EtatNotion } déjà connu, éventuellement vide.
 * @returns {Object} L'EtatNotion correspondant.
 */
function obtenirEtat(notion_id, etats) {
  if (etats && etats[notion_id]) {
    return etats[notion_id];
  }
  return chargerEtat(notion_id);
}

/**
 * Indique si une notion n'a encore jamais été présentée à l'apprenant (aucun moment
 * enregistré dans son historique), au sens de la règle O4.
 * @param {Object} etatNotion - L'EtatNotion de la notion.
 * @returns {boolean} Vrai si la notion est jamais vue.
 */
function estJamaisVue(etatNotion) {
  return !Array.isArray(etatNotion.moments_espaces) || etatNotion.moments_espaces.length === 0;
}

/**
 * Applique la règle O3 : une notion n'est servable que si toutes les notions de son champ
 * prerequis sont au moins en état "en_construction" (c'est-à-dire "en_construction" ou
 * "solide" — les deux seules valeurs valides de l'état).
 * @param {Object} notion - La notion à vérifier.
 * @param {Object} etats - Objet { notion_id: EtatNotion } déjà connu, éventuellement vide.
 * @returns {boolean} Vrai si tous les prérequis sont remplis.
 */
function prerequisRemplis(notion, etats) {
  const prerequis = Array.isArray(notion.prerequis) ? notion.prerequis : [];

  return prerequis.every((prerequis_id) => {
    const etatPrerequis = obtenirEtat(prerequis_id, etats);
    return etatPrerequis.etat === "en_construction" || etatPrerequis.etat === "solide";
  });
}

/**
 * Retourne la thématique interdite pour le prochain item, au sens de la règle O1 : si les
 * deux derniers items placés partagent déjà la même thématique, un troisième consécutif
 * n'est pas autorisé.
 * @param {Array<string>} historiqueThematiques - Les thématiques déjà placées, dans l'ordre.
 * @returns {string|null} La thématique interdite, ou null si aucune restriction ne s'applique.
 */
function thematiqueInterdite(historiqueThematiques) {
  const n = historiqueThematiques.length;
  if (n < 2) return null;
  const derniere = historiqueThematiques[n - 1];
  const avantDerniere = historiqueThematiques[n - 2];
  return derniere === avantDerniere ? derniere : null;
}

/**
 * Choisit le prochain candidat à placer dans la session, en respectant O1 (interleaving)
 * en priorité, puis O4 (les files "nouvelles" sont essayées avant "reactivation") comme
 * ordre par défaut. Retire et retourne le candidat choisi de la file dans laquelle il se
 * trouve.
 * @param {Array<Object>} nouvelles - File des candidats jamais vus, dans l'ordre à respecter.
 * @param {Array<Object>} reactivation - File des candidats déjà vus, dans l'ordre à respecter.
 * @param {Array<string>} historiqueThematiques - Les thématiques déjà placées, dans l'ordre.
 * @returns {Object} Le candidat choisi ({ notion, angle }).
 */
function choisirProchainCandidat(nouvelles, reactivation, historiqueThematiques) {
  const interdite = thematiqueInterdite(historiqueThematiques);

  for (const file of [nouvelles, reactivation]) {
    const index = file.findIndex((candidat) => candidat.notion.thematique !== interdite);
    if (index !== -1) {
      return file.splice(index, 1)[0];
    }
  }

  // Aucune alternative : toutes les notions restantes partagent la thématique interdite.
  // On ne peut pas faire mieux — on répète la thématique plutôt que de bloquer la session.
  const file = nouvelles.length > 0 ? nouvelles : reactivation;
  return file.shift();
}

/**
 * Construit la suite ordonnée des items d'une session, en appliquant O3, O1 et O4
 * (section 4.2). N'implémente pas O2 (espacement) : voir l'en-tête du fichier.
 * @param {Array<Object>} notions - Les notions candidates (format section 1.2).
 * @param {Array<Object>} angles - Les angles disponibles (format section 1.4).
 * @param {Object} etats - Objet { notion_id: EtatNotion } déjà connu, éventuellement vide ou absent.
 * @returns {Array<{notion: Object, angle: Object}>} La suite ordonnée des items de la session.
 */
function construireSession(notions, angles, etats) {
  const candidats = [];

  for (const notion of notions) {
    // O3 — une notion dont les prérequis ne sont pas remplis est écartée de la session.
    if (!prerequisRemplis(notion, etats)) {
      continue;
    }

    const angle = angles.find((angle) => angle.notion === notion.id);
    if (!angle) {
      console.error(`Aucun angle disponible pour la notion "${notion.id}" : notion écartée de la session.`);
      continue;
    }

    const etatNotion = obtenirEtat(notion.id, etats);
    candidats.push({ notion, angle, jamaisVue: estJamaisVue(etatNotion) });
  }

  // O4 — les notions jamais vues passent avant les notions à réactiver.
  const nouvelles = candidats.filter((candidat) => candidat.jamaisVue);
  const reactivation = candidats.filter((candidat) => !candidat.jamaisVue);

  const session = [];
  const historiqueThematiques = [];

  while (nouvelles.length > 0 || reactivation.length > 0) {
    const candidat = choisirProchainCandidat(nouvelles, reactivation, historiqueThematiques);
    session.push({ notion: candidat.notion, angle: candidat.angle });
    historiqueThematiques.push(candidat.notion.thematique);
  }

  return session;
}
