// Module de chargement et de vérification des données (entité Notion, section 1.1 et 1.2 de SPECIFICATION.md)
// Ne fait que charger et contrôler les données : aucun code d'interface ici.

/**
 * Charge un fichier JSON du dossier /data/notions/ et retourne le tableau de notions qu'il contient.
 * @param {string} fichier - Nom du fichier à charger (ex: "01-valeurs.json")
 * @returns {Promise<Array>} Le tableau de notions, ou un tableau vide en cas d'erreur.
 */
async function chargerNotions(fichier) {
  const chemin = `data/notions/${fichier}`;

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
    const notions = await reponse.json();
    return notions;
  } catch (erreur) {
    console.error(`JSON invalide dans "${chemin}" : ${erreur.message}`);
    return [];
  }
}

/**
 * Recherche une notion par son identifiant dans un tableau de notions.
 * @param {Array} notions - Le tableau de notions dans lequel chercher.
 * @param {string} id - L'identifiant de la notion recherchée.
 * @returns {Object|null} La notion trouvée, ou null si aucune ne correspond.
 */
function trouverNotion(notions, id) {
  const notion = notions.find((n) => n.id === id);
  return notion || null;
}

/**
 * Contrôle qu'une notion respecte les règles de validation obligatoires (section 1.2).
 * @param {Object} notion - La notion à vérifier.
 * @returns {Array<string>} La liste des problèmes trouvés (vide si la notion est conforme).
 */
function verifierNotion(notion) {
  const problemes = [];

  // pourquoi_ca_existe doit être présent et non vide
  if (!notion.pourquoi_ca_existe || notion.pourquoi_ca_existe.trim() === "") {
    problemes.push('Le champ "pourquoi_ca_existe" est obligatoire et ne doit pas être vide.');
  }

  // images.situation est obligatoire, quelle que soit la notion
  if (!notion.images || !notion.images.situation) {
    problemes.push('Le champ "images.situation" est obligatoire.');
  }

  // cadrage_factuel devient obligatoire si la charge affective est haute
  if (notion.charge_affective === "haute" && !notion.cadrage_factuel) {
    problemes.push('Le champ "cadrage_factuel" est obligatoire quand "charge_affective" vaut "haute".');
  }

  // au moins 2 contre-exemples sont requis pour les concepts à frontières
  if (notion.nature === "concept_a_frontieres") {
    const nombreContreExemples = Array.isArray(notion.contre_exemples) ? notion.contre_exemples.length : 0;
    if (nombreContreExemples < 2) {
      problemes.push('Au moins 2 "contre_exemples" sont requis quand "nature" vaut "concept_a_frontieres".');
    }
  }

  return problemes;
}
