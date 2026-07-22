// Module de suivi de progression (entité EtatNotion, section 1.4, critère d'acquisition section 1.5, bouton "Je ne comprends pas" section 5.1)
// Ne fait que lire, calculer et sauvegarder l'état de progression : aucun code d'interface ici.

const CLE_STOCKAGE = "civique_etats_notions";

/**
 * Lit l'ensemble des états stockés dans localStorage.
 * Retourne un objet vide si localStorage est indisponible, vide, ou corrompu.
 * @returns {Object} Un objet { notion_id: EtatNotion, ... }
 */
function litTousLesEtats() {
  try {
    const brut = localStorage.getItem(CLE_STOCKAGE);
    if (!brut) return {};
    return JSON.parse(brut);
  } catch (erreur) {
    console.error(`Impossible de lire les états de progression : ${erreur.message}`);
    return {};
  }
}

/**
 * Sauvegarde l'ensemble des états dans localStorage.
 * @param {Object} tousLesEtats - Objet { notion_id: EtatNotion, ... } à sauvegarder.
 */
function ecritTousLesEtats(tousLesEtats) {
  try {
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(tousLesEtats));
  } catch (erreur) {
    console.error(`Impossible de sauvegarder les états de progression : ${erreur.message}`);
  }
}

/**
 * Construit l'état initial d'une notion jamais vue (tous les compteurs à zéro).
 * @param {string} notion_id - Identifiant de la notion.
 * @returns {Object} Un EtatNotion initial au format de la section 1.4.
 */
function etatInitial(notion_id) {
  return {
    notion_id: notion_id,
    portes_reussies: [],
    situation_inedite_ok: false,
    contre_exemple_ok: false,
    moments_espaces: [],
    echecs_consecutifs: 0,
    temps_reponse_moyen: 0,
    incomprehensions: 0,
    etat: "en_construction",
    prochaine_revision: null,
    niveau_etayage: "maximal",
  };
}

/**
 * Retourne l'horodatage courant au format utilisé dans moments_espaces (ex: "2026-07-20T10:00:00").
 * @returns {string} L'horodatage courant en UTC, sans millisecondes.
 */
function horodatageActuel() {
  return new Date().toISOString().slice(0, 19);
}

/**
 * Charge l'état de progression d'une notion depuis localStorage.
 * Si la notion n'a jamais été vue, retourne un état initial (section 1.4) sans le sauvegarder.
 * @param {string} notion_id - Identifiant de la notion.
 * @returns {Object} L'EtatNotion correspondant.
 */
function chargerEtat(notion_id) {
  const tousLesEtats = litTousLesEtats();
  return tousLesEtats[notion_id] || etatInitial(notion_id);
}

/**
 * Enregistre la réponse de l'apprenant à une porte d'entrée donnée et sauvegarde l'état mis à jour.
 * @param {string} notion_id - Identifiant de la notion concernée.
 * @param {string} porte - La porte d'entrée utilisée (ex: "situation", "contraste"...).
 * @param {boolean} reussite - Vrai si la réponse est correcte.
 * @param {number} temps - Temps de réponse en secondes.
 * @returns {Object} L'EtatNotion mis à jour.
 */
function enregistrerReponse(notion_id, porte, reussite, temps) {
  const tousLesEtats = litTousLesEtats();
  const etat = tousLesEtats[notion_id] || etatInitial(notion_id);

  if (reussite && !etat.portes_reussies.includes(porte)) {
    etat.portes_reussies.push(porte);
  }

  etat.echecs_consecutifs = reussite ? 0 : etat.echecs_consecutifs + 1;

  // Moyenne recalculée à partir du nombre de réponses déjà enregistrées
  // (un horodatage est ajouté à moments_espaces à chaque réponse, ce nombre sert donc de compteur de réponses).
  const nombreReponsesPrecedentes = etat.moments_espaces.length;
  etat.temps_reponse_moyen =
    (etat.temps_reponse_moyen * nombreReponsesPrecedentes + temps) / (nombreReponsesPrecedentes + 1);

  etat.moments_espaces.push(horodatageActuel());

  tousLesEtats[notion_id] = etat;
  ecritTousLesEtats(tousLesEtats);

  return etat;
}

/**
 * Applique EXACTEMENT le critère d'acquisition de la section 1.5 pour déterminer
 * si une notion est "solide" ou "en_construction".
 * @param {Object} etatNotion - L'EtatNotion à évaluer.
 * @param {string} nature - La nature de la notion (ex: "fait_arbitraire", "concept_a_frontieres"...).
 * @returns {string} "solide" ou "en_construction".
 */
function calculerEtat(etatNotion, nature) {
  const portesDistinctes = new Set(etatNotion.portes_reussies).size;

  // contre_exemple_ok n'est pas exigé si la notion est un fait arbitraire
  const conditionContreExemple =
    nature === "fait_arbitraire" ? true : etatNotion.contre_exemple_ok === true;

  // Intervalle vérifié entre les deux moments les plus récents (moments_espaces est chronologique)
  let intervalleSuffisant = false;
  if (etatNotion.moments_espaces.length >= 2) {
    const moments = etatNotion.moments_espaces.map((m) => new Date(m).getTime());
    const dernier = moments[moments.length - 1];
    const avantDernier = moments[moments.length - 2];
    const vingtQuatreHeuresEnMs = 24 * 60 * 60 * 1000;
    intervalleSuffisant = dernier - avantDernier >= vingtQuatreHeuresEnMs;
  }

  const estSolide =
    portesDistinctes >= 3 &&
    etatNotion.situation_inedite_ok === true &&
    conditionContreExemple &&
    etatNotion.moments_espaces.length >= 2 &&
    intervalleSuffisant;

  return estSolide ? "solide" : "en_construction";
}

/**
 * Retourne les identifiants des notions dont la date de prochaine révision est déjà passée.
 * @returns {Array<string>} Les identifiants des notions à revoir.
 */
function notionsARevoir() {
  const tousLesEtats = litTousLesEtats();
  const maintenant = new Date();
  const idsARevoir = [];

  for (const notion_id in tousLesEtats) {
    const etat = tousLesEtats[notion_id];
    if (etat.prochaine_revision && new Date(etat.prochaine_revision) <= maintenant) {
      idsARevoir.push(notion_id);
    }
  }

  return idsARevoir;
}

/**
 * Enregistre un clic sur "Je ne comprends pas la question" (section 5.1).
 * N'affecte jamais etat ni espacement : uniquement incomprehensions et, le cas échéant, niveau_etayage.
 * @param {string} notion_id - Identifiant de la notion concernée.
 * @returns {Object} L'EtatNotion mis à jour.
 */
function enregistrerIncomprehension(notion_id) {
  const tousLesEtats = litTousLesEtats();
  const etat = tousLesEtats[notion_id] || etatInitial(notion_id);

  etat.incomprehensions += 1;
  if (etat.incomprehensions >= 3) {
    etat.niveau_etayage = "maximal";
  }

  tousLesEtats[notion_id] = etat;
  ecritTousLesEtats(tousLesEtats);

  return etat;
}
