# SPÉCIFICATION FONCTIONNELLE
# Section Préparation — Plateforme de préparation au test civique

**Version 2 — révisée**
**Statut :** document de référence pour l'implémentation
**Modifications v2 :** suppression de l'audio · suppression du diagnostic initial · ajout des étapes de structuration et de prototypage · ajout des encadrés d'instruction pour Claude Code

---

## Comment utiliser ce document

Ce document est **le contrat**. Il décrit ce qui doit être construit et ce qui est interdit.

- Il doit être **déposé dans le dépôt GitHub** sous le nom `SPECIFICATION.md`
- Il doit être **référencé dans chaque demande** faite à Claude Code
- Les encadrés `💬 PROMPT` sont des demandes prêtes à copier-coller
- Les encadrés `📝 NOTE` sont des points de vigilance pour toi
- Les encadrés `⚠️ PIÈGE` signalent une erreur fréquente à éviter

---

## 0. Principes non négociables

Toute fonctionnalité violant l'un de ces principes doit être refusée, même si elle semble utile.

| # | Principe | Traduction technique |
|---|---|---|
| 1 | Contenu ≠ interface | La fiche de notion est un fichier de données. Aucun écran ne l'affiche telle quelle. |
| 2 | Le savoir dicte le format | Le champ `nature` détermine le micro-jeu. |
| 3 | On entraîne l'accès, pas le stockage | Chaque notion a plusieurs portes d'entrée. Jamais deux fois la même de suite. |
| 4 | Situation avant concept, mais concept nommé | Boucle 1 = situation sans étiquette. Boucle 2 = nomination explicite. |
| 5 | Aucune formulation inconnue au test | Toute question posée provient de `formulations_examen`. |
| 6 | L'affect par la structure, pas par le ton | Aucun badge, aucune félicitation automatique. |
| 7 | Session complète en soi | 3 minutes doivent produire un acquis nommé. |
| 8 | **Compréhension sans audio** | L'image porte le sens. Le texte est court. Aucun contenu dépendant du son. |

> **📝 NOTE — Principe 8, nouveau en v2**
> L'audio est supprimé du projet. Cela impose une exigence supérieure sur l'image : elle doit permettre de comprendre la situation **sans lire le texte**. Une image décorative est un échec.

---

## 1. Modèle de données

### 1.1 Format des fichiers

Un fichier JSON par thématique. Structure du dépôt :
> **💬 PROMPT — Créer la structure du projet**
>
> ```
> Crée la structure de dossiers d'un projet web statique
> pour GitHub Pages :
> - /data/notions/ (5 fichiers JSON vides)
> - /data/parcours/
> - /data/lexique/
> - /images/situations/ et /images/lieux/
> - /css/, /js/
> - index.html
> - SPECIFICATION.md
> - README.md
>
> Pas de framework, pas de build. HTML/CSS/JS natif uniquement.
> Ajoute un .gitignore adapté.
> ```

### 1.2 Entité `Notion`

```json
{
  "id": "LAICITE_01",
  "thematique": "valeurs",
  "nature": "concept_a_frontieres",

  "pourquoi_ca_existe": "Pour que l'État traite tout le monde de la même façon, quelle que soit sa religion.",

  "definition_simple": "L'État ne favorise aucune religion.",
  "definition_officielle": "La France est une République indivisible, laïque, démocratique et sociale.",

  "lexique": ["neutralité", "service public", "liberté de conscience"],

  "portes_entree": ["situation", "image", "contraste", "mot_declencheur", "definition", "lieu"],

  "erreurs_typiques": [
    { "texte": "La laïcité interdit les religions", "frequence_estimee": 0.7, "frequence_affichee": "eleve" },
    { "texte": "La laïcité = athéisme d'État", "frequence_estimee": 0.4, "frequence_affichee": "moyen" }
  ],

  "notions_voisines": [
    {
      "id": "LIBERTE_RELIGIEUSE_01",
      "frontiere": "La laïcité concerne l'État. La liberté religieuse concerne les personnes."
    }
  ],

  "contre_exemples": [
    "Une personne prie chez elle",
    "Une association religieuse organise une fête privée"
  ],

  "cas_limites": [
    "Un agent de mairie porte un signe religieux pendant son service",
    "Un usager porte un signe religieux dans une mairie"
  ],

  "scenarios": ["mairie", "ecole", "hopital"],
  "ancrage_spatial": ["mairie", "ecole_publique"],
  "parcours_narratifs": ["P_ECOLE"],
  "prerequis": ["REPUBLIQUE_01"],

  "formulations_examen": [
    "Qu'est-ce que la laïcité ?",
    "La France est-elle un pays laïque ?",
    "Un service public peut-il favoriser une religion ?",
    "Quel principe garantit que l'État ne favorise aucune religion ?"
  ],

  "niveau_langue": "A2",
  "formulation_simplifiee": "L'État ne choisit pas de religion.",

  "charge_affective": "haute",
  "cadrage_factuel": "Voici ce que dit la loi française. Chacun garde ses convictions personnelles.",

  "images": {
    "situation": "/images/situations/mairie-guichet.jpg",
    "lieu": "/images/lieux/mairie-facade.jpg"
  }
}
```

**Règles de validation :**

| Champ | Règle |
|---|---|
| `pourquoi_ca_existe` | Obligatoire, non vide. Doit donner la **fonction**, pas reformuler la définition. |
| `frequence_estimee` | Usage interne uniquement. JAMAIS affichée à l'apprenant en v1. Sert au moteur (priorisation, routage). Le champ `frequence_affichee` prend une valeur qualitative : eleve, moyen, faible. |
| `cadrage_factuel` | Obligatoire si `charge_affective = "haute"` |
| `images.situation` | **Obligatoire** — l'image doit permettre de comprendre sans lire |
| `contre_exemples` | Minimum 2 si `nature = "concept_a_frontieres"` |

> **⚠️ PIÈGE — Le champ `pourquoi_ca_existe`**
> C'est le champ pivot de tout le système. L'erreur classique est de le remplir avec une définition déguisée.
> ❌ « La laïcité, c'est la séparation des Églises et de l'État »
> ✅ « Pour que l'État traite tout le monde de la même façon, quelle que soit sa religion »
> Le test : est-ce que ça répond à « à quoi ça sert ? » ou à « qu'est-ce que c'est ? »

### 1.3 Entité `Situation`

Une situation est une **ressource pédagogique autonome de premier rang**. Elle décrit un fait du monde réel, indépendamment des notions qu'il permet de travailler.

**Deux centres, pas un seul :**

| | Unité | Raison |
|---|---|---|
| Conception | La **situation** | Une même situation active plusieurs concepts, comme dans la vie réelle |
| Suivi de progression | La **notion** | Le critère d'acquisition et l'affichage des acquis se calculent par notion |

Une situation peut servir plusieurs notions. Une notion peut être travaillée par plusieurs situations. La relation est **plusieurs à plusieurs**, portée par le champ `notions_mobilisees`.

Fichier : `/data/situations/situations.json`

Exemple :

```json
{
  "id": "SIT_MAIRIE_01",
  "titre": "Retrait d'un acte de naissance",
  "lieu": "mairie",
  "acteurs": ["usagere", "agent_public"],

  "recit": [
    "Une femme arrive à la mairie.",
    "Elle porte un foulard.",
    "Elle demande un acte de naissance."
  ],

  "notions_mobilisees": [
    { "notion": "LAICITE_01", "role": "application" },
    { "notion": "NEUTRALITE_ETAT_01", "role": "illustration" },
    { "notion": "AGENT_USAGER_01", "role": "discrimination" }
  ],

  "image": "/images/situations/mairie-guichet.jpg",
  "charge_affective": "haute"
}
```

**Le champ `role`** indique ce que la situation permet de faire avec la notion :

| Valeur | Sens | Boucle visée |
|---|---|---|
| `application` | La situation est un cas typique de la notion | 1, 4 |
| `illustration` | La situation rend la notion visible sans la tester | 2 |
| `discrimination` | La situation oblige à distinguer deux notions voisines | 3 |

**Aucun poids numérique.** Le routage se fait sur `role`, qui est vérifiable. Un poids serait une estimation déguisée en donnée mesurée — voir la règle appliquée à `frequence_estimee` en section 1.2.

**Règles de validation :**

| Champ | Règle |
|---|---|
| `recit` | Phrases courtes, une idée par phrase. Aucune subordonnée. |
| `notions_mobilisees` | Minimum 1. La même situation peut en porter jusqu'à 5. |
| `role` | Obligatoire pour chaque notion mobilisée |
| `image` | Obligatoire — la situation doit être compréhensible sans lire |
| `charge_affective` | Si "haute", le `cadrage_factuel` de la notion s'affiche avant tout |

**Ce que la situation n'est pas :** elle ne contient ni question, ni options de réponse, ni bonne réponse. Ces éléments appartiennent à l'`Item`, produit éphémère fabriqué par le moteur en combinant une situation, une notion cible et un type de micro-jeu. L'item n'est jamais stocké.

```
Situation + Notion cible + Micro-jeu → Item
```

**Coût de production à assumer :** environ 30 situations sont nécessaires pour couvrir les 43 notions de la thématique 1. Compter 15 à 20 minutes de rédaction par situation. Le ratio s'améliore à mesure que le corpus grandit, puisqu'une situation sert plusieurs notions.

### 1.4 Entité `Parcours`

```json
{
  "id": "P_ECOLE",
  "titre": "Inscrire son enfant à l'école",
  "situation_ouverture": "Vous venez d'arriver en France. Votre fille a 7 ans. Vous voulez l'inscrire à l'école.",
  "notions": ["ECOLE_OBLIGATOIRE_01", "COMMUNE_01", "LAICITE_01", "EGALITE_FG_01", "DEVOIRS_PARENTS_01"],
  "thematiques_couvertes": ["valeurs", "institutions", "droits-devoirs"],
  "duree_estimee": 6
}
```

**Les 7 parcours de lancement :**

| id | Titre | Notions traversées | Thématiques |
|---|---|---|---|
| `P_CITOYEN` | Naître citoyen français | Nationalité, droits attachés, symboles, devise | Valeurs, Droits |
| `P_ECOLE` | Inscrire son enfant à l'école | École gratuite/obligatoire/laïque, commune, égalité, devoirs parentaux | Valeurs, Institutions, Droits |
| `P_LOI` | Le voyage d'une loi | Parlement, Assemblée, Sénat, Gouvernement, Président, Conseil constitutionnel | Institutions |
| `P_VOTE` | Le jour du vote | Suffrage universel, élections, mandats, démocratie représentative | Institutions, Valeurs |
| `P_IMPOT` | Payer ses impôts | Impôt, redistribution, services publics, solidarité, fraternité | Valeurs, Institutions |
| `P_JUSTICE` | Aller devant la justice | Justice indépendante, égalité devant la loi, présomption d'innocence, droits de la défense | Droits, Institutions |
| `P_REPUBLIQUE` | Comment la France est devenue une République | 1789, 1848, 1905, 1944, 1958 reliés causalement | Histoire, Valeurs |

**Règle :** un parcours ouvre toujours sur un **problème concret**, jamais sur une définition. La chronologie n'est jamais une liste : c'est une chaîne causale.

### 1.5 Entité `EtatNotion` (stockée dans le navigateur)

```json
{
  "notion_id": "LAICITE_01",
  "portes_reussies": ["situation", "contraste"],
  "situation_inedite_ok": false,
  "contre_exemple_ok": true,
  "moments_espaces": ["2026-07-20T10:00:00", "2026-07-22T09:00:00"],
  "echecs_consecutifs": 0,
  "temps_reponse_moyen": 8.4,
  "incomprehensions": 1,
  "etat": "en_construction",
  "prochaine_revision": "2026-07-25T00:00:00",
  "niveau_etayage": "moyen"
}
```

> **📝 NOTE — Stockage**
> Les données de progression sont stockées dans le navigateur (`localStorage`). Pas de compte, pas de serveur, pas de base de données. C'est gratuit, immédiat, et respectueux de la vie privée.
> **Limite à assumer :** si l'apprenant change de téléphone, il perd sa progression. Acceptable en v1. Prévoir un bouton « Exporter ma progression » plus tard.

### 1.6 Critère d'acquisition

```
etat = "solide"  SI ET SEULEMENT SI :
    nombre de portes_reussies distinctes >= 3
ET  situation_inedite_ok == true
ET  contre_exemple_ok == true          // sauf si nature = "fait_arbitraire"
ET  nombre de moments_espaces >= 2
ET  intervalle entre 2 moments >= 24 heures
```

> **💬 PROMPT — Coder le moteur d'état**
>
> ```
> Lis SPECIFICATION.md, section 1.5 et 1.6.
>
> Crée /js/etat.js avec :
> - une fonction chargerEtat(notion_id) qui lit localStorage
> - une fonction enregistrerReponse(notion_id, porte, reussite, temps)
> - une fonction calculerEtat(etatNotion) qui applique EXACTEMENT
>   le critère d'acquisition de la section 1.6
> - une fonction notionsARevoir() qui retourne les notions dont
>   prochaine_revision <= maintenant
>
> Contraintes :
> - JavaScript natif, pas de bibliothèque
> - Commente chaque fonction en français
> - Gère le cas où localStorage est vide (premier lancement)
> ```

---

## 2. Le cycle d'apprentissage

Cycle commun, **amplitude variable selon la nature du savoir**.

### 2.1 Les 5 boucles

**Boucle 1 — Ancrage (30–60 s)**
Situation concrète, question posée à froid, avant toute explication.
- **Image obligatoire et porteuse de sens**
- Cadre situationnel affiché (« À la mairie »), **jamais l'étiquette conceptuelle** (« La laïcité »)
- Option « Je ne sais pas » toujours présente, non pénalisante
- Message affiché avant réponse : *« Personne ne connaît encore la réponse. C'est normal. »*

**Boucle 2 — Sens (60–90 s)**
Résolution de la tension créée.
- **`pourquoi_ca_existe` s'affiche AVANT `definition_simple`** — ordre non négociable
- Une seule idée par écran
- `definition_officielle` affichée **à côté** de la version simple, jamais à la place
- **Nomination explicite du concept ici** : c'est le moment où le mot apparaît

**Boucle 3 — Discrimination (60 s)**
La boucle la plus rentable et la plus négligée ailleurs.
- Micro-jeux : Duel, Contre-exemple piégé, Intrus
- Puise dans `notions_voisines`, `contre_exemples`, `cas_limites`
- **Interleaving actif à partir d'ici**

**Boucle 4 — Transfert (60 s)**
Même notion, contexte totalement différent.
- **Contrainte dure : porte d'entrée obligatoirement différente** de celles déjà réussies

**Boucle 5 — Réactivation espacée**
- Intervalle piloté par la **performance**, pas par le calendrier
- **Jamais la même porte que la dernière fois**

### 2.2 Modulation par nature

| Nature | Boucles servies | Règle |
|---|---|---|
| `fait_arbitraire` | 1 → 2 → 5 | Pas de discrimination. Répétition espacée dominante. |
| `concept_a_frontieres` | 1 → 2 → **3 étendue** → 4 → 5 | Duel obligatoire. Boucle 3 servie plusieurs fois. |
| `systeme_relationnel` | Parcours → 3 → 4 → 5 | Le fil narratif remplace la boucle 1. Ancrage spatial requis. |
| `norme` | 1 → 2 → 4 (multiple) → 5 | Transfert répété en contextes variés. |

---

## 3. Les micro-jeux

**Règle absolue :** un micro-jeu = une opération cognitive. On ne choisit jamais un jeu parce qu'il est amusant, mais parce qu'il correspond à l'opération mentale requise.

| Micro-jeu | Opération cognitive | Nature ciblée | Boucle |
|---|---|---|---|
| **Détective** | Situation → principe | concept, norme | 1, 4 |
| **Juge** | Jugement normatif | norme | 1, 4 |
| **Duel** ★ | Discrimination inter-concepts | concepts voisins | 3 |
| **Intrus** | Catégorisation par exclusion | concept, système | 3 |
| **Classement** | Rôle → acteur | système relationnel | 3, 4 |
| **Avant/Après** | Reconstruction causale | chronologie | 3, 4 |
| **Carte mystère** ★ | Récupération par indice partiel | tout | 4, 5 |
| **Contre-exemple piégé** ★ | Rejet de fausse ressemblance | concept | 3 |
| **Reconstruction de chaîne** | Ordonnancement d'un processus | système | 3, 4 |
| **Zoom inverse** | Détail → fonction | ancrage spatial | 4, 5 |

★ Les trois déterminants. **Duel** travaille les frontières (là où se joue l'échec réel). **Carte mystère** entraîne l'accès mémoire. **Contre-exemple piégé** empêche la sur-généralisation.

### 3.1 Contraintes de production

| Contrainte | Règle | Raison |
|---|---|---|
| Aucune production écrite | Zéro champ de saisie libre | On mesurerait l'orthographe, pas la connaissance |
| Effet génératif conservé | « Choisis pourquoi » avec justifications cliquables | Bénéfice de la génération sans la saisie |
| Cartes mentales | Synthèse finale uniquement | Charge cognitive trop élevée en découverte |
| Drag-and-drop | **Fallback tap obligatoire** | La friction motrice consomme du budget cognitif |
| Une idée par écran | Jamais deux concepts simultanés | Mémoire de travail déjà entamée par la langue |
| Image porteuse de sens | Obligatoire en boucle 1 | Compensation de l'absence d'audio |

> **💬 PROMPT — Coder un micro-jeu**
>
> ```
> Lis SPECIFICATION.md, sections 3 et 7.3.
>
> Crée /js/jeux/detective.js et le HTML associé.
>
> Le micro-jeu "Détective" :
> - reçoit une notion (objet JSON, format section 1.2)
> - affiche images.situation en haut
> - affiche le cadre situationnel (scenarios[0]) SANS jamais
>   afficher le nom de la notion
> - pose une question tirée de formulations_examen
> - propose maximum 4 options dont "Je ne sais pas"
> - affiche en permanence le bouton "Je ne comprends pas la question"
>
> INTERDIT dans ce composant :
> - tout score, compteur, chronomètre
> - tout champ de saisie
> - le nom de la notion avant la révélation
>
> Respecte le gabarit exact de la section 7.3.
> ```

---

## 4. Le moteur

### 4.1 Routeur

```
Entrée  : EtatNotion + Notion + contexte de session
Sortie  : { micro_jeu, porte_entree, niveau_etayage }

R1  porte_entree ∉ portes_reussies      // jamais deux fois la même
R2  micro_jeu compatible avec nature    // table §3
R3  micro_jeu compatible avec boucle    // table §3
R4  si niveau_etayage = maximal → illustration obligatoire + A2 strict
R5  si charge_affective = haute → cadrage_factuel affiché avant tout
```

### 4.2 Ordonnanceur

```
O1  Interleaving actif dès la boucle 3
    → jamais plus de 2 items consécutifs de la même thématique
    → jamais plus de 2 items consécutifs du même format de micro-jeu

O2  Espacement piloté par performance
    réussite 1re tentative  → +3j, puis +7j, puis +21j
    réussite après indice   → +2j
    échec                   → +1j

O3  Prérequis respectés
    une notion n'est servie que si tous ses prerequis sont
    au moins en état "en_construction"

O4  Découverte par parcours, réactivation par notion
    notion jamais vue → servie dans son parcours narratif
    notion déjà vue   → servie isolément, en mélange
```

**O4 est le montage central.** L'histoire crée l'ancrage initial ; les notions sont ensuite réactivées séparément et recombinées. Seul assemblage qui fait tenir ensemble le fil narratif et la répétition espacée.

### 4.3 Calibrage initial (remplace le diagnostic)

```
Premier lancement
   ↓
niveau_etayage = "maximal" pour toutes les notions
   ↓
Le premier parcours narratif démarre directement
   ↓
Le moteur observe : réussites, temps de réponse, incompréhensions
   ↓
Ajustement automatique et silencieux, notion par notion
```

**Il n'y a plus de test de diagnostic.** L'apprenant commence à apprendre immédiatement.
**Justification :** un diagnostic est un test avant le test — friction pure pour un public anxieux. L'étayage dynamique apprend en 3 interactions ce que 8 questions mesuraient mal. Et commencer au maximum d'étayage puis alléger produit un sentiment de progression ; l'inverse produit un sentiment d'échec.

### 4.4 Étayage dynamique

```
maximal
  → illustration obligatoire
  → formulation_simplifiee utilisée
  → 1 idée par écran, 3 options maximum
  → lexique surligné avec définition au tap

moyen
  → illustration si disponible
  → definition_simple + terme officiel à côté
  → 4 options

minimal
  → pas d'illustration
  → langue de l'examen (definition_officielle, formulations_examen brutes)
  → 4 options
```

Pas de mode figé. Un `niveau_etayage` **par notion**, ajusté en continu.
**Le double fondu** est conservé mais piloté par la **performance sur chaque notion**, pas par l'avancée globale. L'apprenant ne « change pas de niveau » : le décor s'épure notion par notion. Il ne doit presque pas le remarquer.

**Règles de transition :**

| Condition | Effet |
|---|---|
| 2 réussites consécutives sur une notion | `maximal → moyen` |
| 2 réussites consécutives en `moyen` | `moyen → minimal` |
| 1 échec | recul d'un cran |
| `incomprehensions >= 3` | retour à `maximal` |

### 4.5 Suivi affectif — bascules automatiques

| Signal | Interprétation | Action |
|---|---|---|
| 3 échecs consécutifs | Fragilité de confiance | Bascule sur 2 notions déjà `solide`, puis reprise |
| Temps > 2,5× médiane de l'apprenant | Obstacle lexical probable | Propose `formulation_simplifiee` sans attendre le clic |
| Abandon 2× au même item | Notion mal découpée | Signalement conception |
| `incomprehensions >= 3` sur une notion | Problème de langue, pas de savoir | Bascule couche lexicale, `niveau_etayage = maximal` |
| Session > 8 min | Fatigue cognitive | Propose une clôture propre avec bilan |

> **⚠️ PIÈGE — Les bascules sont silencieuses**
> Ces mécanismes **ne déclenchent aucun message d'encouragement**. Ils modifient le routage sans rien dire. Un adulte qui joue sa naturalisation n'a pas besoin qu'on le félicite d'avoir cliqué.

---

## 5. La couche affective

Quatre peurs, quatre réponses **structurelles** — jamais verbales.

| Peur | Réponse | Section |
|---|---|---|
| Échouer | Progression en capacités, jamais en pourcentage | 5.2 |
| Perdre son temps | Session de 3 min complète en soi | 5.3 |
| Ne pas comprendre le français | Bouton permanent « Je ne comprends pas » | 5.1 |
| L'administratif | Module hors-moteur sur le test lui-même | 5.5 |

### 5.1 Le bouton « Je ne comprends pas la question »

```
Présence         : permanente, sur tout écran comportant une question
Position         : sous les options, visible sans scroll
Libellé          : "Je ne comprends pas la question"
Comptabilisation : JAMAIS un échec. N'affecte ni etat ni espacement.

Effet immédiat :
  1. Affiche formulation_simplifiee
  2. Surligne les termes de lexique avec définition au tap
  3. Affiche l'image en plus grand si disponible

Effet différé :
  incomprehensions += 1
  si incomprehensions >= 3 sur une notion
     → niveau_etayage = "maximal"
     → routage vers la couche lexicale
```

**Le meilleur rapport coût/effet du système entier.** Sans audio, il devient encore plus critique.
Sans ce bouton, le moteur confond obstacle lexical et lacune civique, et fait réviser la mauvaise chose.

### 5.2 Progression en capacités

**Interdit :** `██████░░░░ 6/10`, « 12 % du programme », tout pourcentage de volume.

**Affiché à la place :**

```
┌─────────────────────────────────────────┐
│  La laïcité                             │
│                                         │
│  ✓ Vous la reconnaissez en situation    │
│  ✓ Vous savez la nommer                 │
│  ✓ Vous la distinguez de la liberté     │
│     religieuse                          │
│  ⏳ À revoir dans 3 jours                │
└─────────────────────────────────────────┘
```

Descriptif, vrai, non anxiogène. Le critère d'acquisition (§1.6) est directement l'interface.

### 5.3 Session complète en soi

```
Durée cible    : 3 à 8 minutes
Règle absolue  : toute session se termine par un acquis nommé
Interdit       : "Continuez pour débloquer", séries, tout dispositif
                 qui punit l'arrêt
```

### 5.4 Normalisation factuelle de l'erreur

**Interdit :** « Ce n'est pas grave », « Bien essayé », toute formule condescendante.
Aucun pourcentage n'est affiché tant que les données observées n'existent pas. Une estimation ne doit jamais être présentée comme une statistique. L'erreur devient **information partagée**, pas déficit personnel.

**Le feedback corrige le modèle mental, jamais seulement la réponse.** Ne jamais afficher « Faux, c'est B ».

### 5.5 Module hors-moteur : le test lui-même

Accessible en permanence depuis l'accueil. Contenu factuel uniquement :
- À quoi ressemble la salle
- Combien de questions, combien de temps
- Qui fait passer le test
- Que se passe-t-il en cas d'échec
- Peut-on repasser, et quand

Peu coûteux, disproportionnellement efficace : réduit l'anxiété de fond pendant tout le reste.

### 5.6 Formellement interdit

| Interdit | Raison |
|---|---|
| Badges, trophées, confettis | Infantilisant pour un adulte |
| Séries / streaks | Punit l'arrêt, culpabilise le temps fragmenté |
| Classements entre apprenants | Anxiogène, hors-sujet |
| Cadenas sur contenu à venir | Réactive l'angoisse scolaire |
| Score visible en apprentissage | Le score n'existe qu'en simulation |
| Catégorie de niveau nommée à l'écran | « Niveau A2 détecté » est humiliant |
| Messages d'encouragement automatiques | L'affect se gère par la structure |
| **Test de diagnostic initial** | **Friction pure, mesure peu fiable (retiré en v2)** |

---

## 6. Sécurité linguistique et visuelle

**Non négociable.** À vérifier sur chaque contenu avant mise en production.

| # | Règle | Vérifiable automatiquement |
|---|---|---|
| L1 | Niveau de langue de la consigne ≤ niveau du contenu testé | Oui |
| L2 | Tout terme de `lexique` est accompagné, jamais seul | Oui |
| L3 | Aucune formulation nouvelle en phase d'évaluation | Oui |
| L4 | Le vocabulaire est une couche séparée | Architecture |
| **V1** | **Toute image doit permettre de comprendre la situation sans lire** | Non — contrôle humain |
| **V2** | **Phrases courtes : une idée = une phrase, pas de subordonnée** | Partiellement |
| **V3** | **Icônes cohérentes : ✓ ✗ ? → toujours le même sens** | Non |
| **V4** | **Corps de texte ≥ 18px sur mobile** | Oui — CSS |

> **📝 NOTE — V1 est la contrainte la plus coûteuse en temps**
> Sans audio, l'image porte la charge de compréhension. Prévois du temps pour la recherche d'images. Sources gratuites et libres de droits : Pexels, Unsplash, Wikimedia Commons.
> Pour les lieux institutionnels (Élysée, Assemblée, mairies), Wikimedia Commons est la meilleure source.

---

## 7. Interface — écrans

### 7.1 Écran d'accueil

```
┌───────────────────────────────────────┐
│  Ma préparation                  👤   │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │  ▶ Continuer                    │  │
│  │  Inscrire son enfant à l'école  │  │
│  │  environ 4 minutes              │  │
│  └─────────────────────────────────┘  │
│                                       │
│  À revoir aujourd'hui — 3 notions     │
│  ┌─────────────────────────────────┐  │
│  │  ▶ Réactivation · 3 min         │  │
│  └─────────────────────────────────┘  │
│                                       │
│  ─────────────────────────────────    │
│                                       │
│  Ce que je sais faire                 │
│                                       │
│  Valeurs de la République             │
│  ●●●●●●○○  6 notions solides          │
│                                       │
│  Institutions                         │
│  ●●●○○○○○  3 notions solides          │
│                                       │
│  Histoire                             │
│  ●●●●○○○○  4 notions solides          │
│                                       │
│  Droits et devoirs                    │
│  ●●○○○○○○  2 notions solides          │
│                                       │
│  Vie quotidienne                      │
│  ●○○○○○○○  1 notion solide            │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │  ℹ️ Comment se passe le test ?   │  │
│  └─────────────────────────────────┘  │
└───────────────────────────────────────┘
```

**Ce qui change par rapport à la v1 :**

| v1 | v2 | Raison |
|---|---|---|
| Chemin linéaire Thème 1→5 | Parcours en cours + réactivation du jour | Les thématiques ne sont pas une progression |
| `6/10`, barres de remplissage | `6 notions solides` | Capacités, pas volume |
| Bouton audio | Supprimé | Audio retiré du projet |
| Thèmes verrouillés | Aucun ordre imposé | Pas de hiérarchie artificielle |

Les 5 thématiques restent **visibles** — elles rassurent et correspondent au test. Elles ne sont plus **séquentielles**.

### 7.2 Écran de micro-jeu — gabarit unique

```
┌───────────────────────────────────────┐
│  ← Quitter                            │
│                                       │
│  À la mairie                          │  ← cadre situationnel
│                                       │     JAMAIS "La laïcité"
│  ┌─────────────────────────────────┐  │
│  │                                 │  │
│  │   [IMAGE — guichet de mairie]   │  │  ← porteuse de sens
│  │                                 │  │
│  └─────────────────────────────────┘  │
│                                       │
│  Une mairie refuse de donner un       │
│  document à une personne.             │
│  Elle porte un signe religieux.       │  ← phrases courtes
│                                       │
│  Est-ce autorisé ?                    │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │  Oui                            │  │
│  ├─────────────────────────────────┤  │
│  │  Non                            │  │
│  ├─────────────────────────────────┤  │
│  │  Je ne sais pas                 │  │
│  └─────────────────────────────────┘  │
│                                       │
│  Je ne comprends pas la question      │  ← permanent
│                                       │
└───────────────────────────────────────┘
```

**Règles du gabarit :**
- Image en haut, avant le texte
- Cadre situationnel, **jamais l'étiquette conceptuelle**
- Maximum 4 options
- « Je ne sais pas » toujours présent, non pénalisant
- « Je ne comprends pas la question » visible sans scroll
- Aucun score, compteur ou chronomètre

### 7.3 Écran de révélation (boucle 2)

Ordre d'affichage **strict** :

```
┌───────────────────────────────────────┐
│                                       │
│  Pourquoi cette règle existe ?        │  ← 1er
│                                       │
│  Pour que l'État traite tout le       │
│  monde de la même façon,              │
│  quelle que soit sa religion.         │
│                                       │
│  ─────────────────────────────────    │
│                                       │
│  Ce principe s'appelle                │  ← 2e : nomination
│  la LAÏCITÉ                           │
│                                       │
│  ─────────────────────────────────    │
│                                       │
│  En français simple :                 │  ← 3e
│  L'État ne favorise aucune religion.  │
│                                       │
│  Dans le texte officiel :             │  ← 4e, à côté
│  « La France est une République       │
│  indivisible, laïque, démocratique    │
│  et sociale. »                        │
│                                       │
│         ┌───────────────────┐         │
│         │   Continuer  →    │         │
│         └───────────────────┘         │
└───────────────────────────────────────┘
```

**Ordre non négociable :** fonction → nom → définition simple → définition officielle.

### 7.4 Écran de clôture

```
┌───────────────────────────────────────┐
│                                       │
│  Session terminée · 4 minutes         │
│                                       │
│  Aujourd'hui, vous savez :            │
│                                       │
│  ✓ Reconnaître la laïcité             │
│    dans une situation                 │
│  ✓ La distinguer de la liberté        │
│    religieuse                         │
│                                       │
│  Prochaine réactivation : dans 3 jours│
│                                       │
│         ┌───────────────────┐         │
│         │     Terminer      │         │
│         └───────────────────┘         │
└───────────────────────────────────────┘
```

Pas de score. Pas de félicitations. **Un acquis nommé.**

> **💬 PROMPT — Coder l'interface**
>
> ```
> Lis SPECIFICATION.md, sections 6 et 7.
>
> Crée /css/style.css avec :
> - corps de texte 18px minimum sur mobile
> - boutons d'option : hauteur minimum 48px (zone tactile)
> - contraste conforme WCAG AA
> - couleurs sémantiques cohérentes :
>   vert = acquis, ambre = en cours, gris = à venir,
>   rouge UNIQUEMENT pour signaler une erreur factuelle
> - mobile d'abord, pas de media query desktop en priorité
> - beaucoup d'espace blanc, jamais d'écran chargé
>
> INTERDIT : animations décoratives, confettis, badges,
> barres de progression en pourcentage.
> ```

---

## 8. Méthode d'analyse du livret ministériel

**Risque principal :** demander une extraction et obtenir un résumé. Ce serait inutile — le PDF officiel existe déjà.

**Principe :** le livret est une **source**, pas un plan. On en extrait des **notions atomiques** qu'on requalifie.

### 8.1 Les 6 passes

Une passe = un objectif. Jamais tout demander en une fois.

---

**PASSE 1 — Inventaire atomique**

> **💬 PROMPT**
> ```
> Voici la thématique [X] du livret ministériel.
>
> Extrais chaque unité de savoir indépendante.
> Ne reformule pas. Ne regroupe pas. Ne hiérarchise pas.
>
> Une unité = quelque chose qui peut être su ou ignoré
> séparément. Si deux informations peuvent être connues
> indépendamment l'une de l'autre, ce sont deux unités.
>
> Ne produis aucun résumé.
> Sortie : une liste numérotée, une unité par ligne.
> ```

*Sortie attendue :* liste plate, longue, non structurée. C'est normal.
*Contrôle :* si une unité contient « et », vérifier qu'elle n'en cache pas deux.

---

**PASSE 2 — Qualification par nature**

> **💬 PROMPT**
> ```
> Voici la liste d'unités de la passe 1.
>
> Attribue à chaque unité UNE SEULE nature :
> - fait_arbitraire : à mémoriser, sans logique interne
> - concept_a_frontieres : défini par ce qu'il inclut et exclut
> - systeme_relationnel : acteurs et rôles en relation
> - norme : comportement attendu ou interdit
>
> Si tu hésites entre deux natures, écris "HÉSITATION"
> et explique pourquoi. Ne tranche pas arbitrairement.
>
> Sortie : tableau à 3 colonnes (unité | nature | hésitation).
> ```

*Contrôle :* les hésitations sont précieuses — elles révèlent une unité mal découpée en passe 1.

---

**PASSE 3 — Fonction et causalité**

> **💬 PROMPT**
> ```
> Pour chaque unité, réponds à UNE SEULE question :
> POURQUOI cette notion existe ? Quel problème résout-elle ?
>
> Contraintes :
> - une phrase
> - français simple, niveau A2
> - aucun jargon
> - si le livret ne le dit pas explicitement, écris
>   "NON EXPLICITE DANS LE LIVRET" — n'invente pas
>
> ATTENTION : ne reformule pas la définition.
> ❌ "La laïcité, c'est la séparation des Églises et de l'État"
> ✅ "Pour que l'État traite tout le monde de la même façon"
>
> Test : ta réponse doit répondre à "à quoi ça sert ?"
> et non à "qu'est-ce que c'est ?"
> ```

*Champ pivot. Sans lui, le reste ne tient pas.*

---

**PASSE 4 — Erreurs, frontières, contre-exemples**

> **💬 PROMPT**
> ```
> Pour chaque unité de nature "concept_a_frontieres" ou "norme",
> identifie :
>
> (a) La confusion la plus fréquente chez un adulte
>     non-francophone qui découvre le système français
>
> (b) Les notions voisines dont il faut la distinguer,
>     en écrivant la frontière exacte en une phrase
>
> (c) DEUX contre-exemples : des situations qui RESSEMBLENT
>     à la notion mais n'en relèvent pas
>
> (d) DEUX cas limites : des situations où la réponse
>     n'est pas évidente
>
> ATTENTION pour (c) : un contre-exemple qui ne ressemble
> pas à la notion est inutile.
> ✅ "Une personne prie chez elle" (contre-exemple de laïcité)
> ❌ "Le drapeau français" (aucun rapport)
> ```

*Passe la plus déterminante pour la qualité finale.*

---

**PASSE 5 — Portes d'entrée et ancrages**

> **💬 PROMPT**
> ```
> Pour chaque unité, propose :
>
> 1. Une situation concrète du quotidien d'un résident
>    étranger en France (mairie, école, préfecture,
>    travail, logement, santé — jamais d'exemple abstrait)
>
> 2. Un ancrage visuel ou spatial : un lieu, un bâtiment,
>    un objet identifiable en photo
>
> 3. Un mot-déclencheur : le terme qui, seul, doit faire
>    remonter la notion en mémoire
>
> 4. Le contraste : la notion opposée ou voisine
>
> Pour le point 2, indique aussi quel type de photo
> chercher (ex : "façade de mairie française avec drapeau").
> ```

---

**PASSE 6 — Formulations d'examen**

> **💬 PROMPT**
> ```
> Pour chaque unité, liste TOUTES les manières dont le test
> pourrait poser la question :
>
> - formulation directe ("Qu'est-ce que X ?")
> - formulation indirecte ("Quel principe garantit... ?")
> - par situation ("Dans ce cas, que dit la loi ?")
> - par négation ("Qu'est-ce qui n'est PAS autorisé ?")
> - par choix entre deux notions
> - par identification à partir d'un indice
>
> Une formulation par ligne. Sois exhaustif :
> cette liste est ce qui garantit qu'aucune formulation
> ne sera inconnue le jour du test.
> ```

### 8.2 Règles imposées à chaque passe

1. **Une passe = un objectif.** Ne jamais combiner extraction et qualification.
2. **Interdiction de compléter par des connaissances externes** sans le signaler.
3. **Thématique par thématique**, jamais le livret entier d'un coup.
4. **Sortie structurée**, jamais de prose.
5. **Signaler l'incertitude plutôt que de combler.** Une hésitation coûte 2 minutes ; une invention non détectée contamine tout le parcours.
6. **Vérification croisée** après chaque thématique.

> **💬 PROMPT — Vérification croisée (après chaque thématique)**
> ```
> Compare le texte original de la thématique [X] avec
> la liste finale des unités extraites.
>
> Quelles informations du livret n'ont été capturées
> dans AUCUNE unité ?
>
> Liste-les. Pour chacune, dis si c'est un oubli à corriger
> ou une information non évaluable au test.
> ```

---

## 9. Plan de travail complet
> **⚠️ PIÈGE — L'étape ④ est un point d'arrêt strict**
> Ne pas produire 150 notions avant d'avoir validé le cycle sur une seule.
> Une erreur de modèle détectée à la notion 1 coûte une journée.
> Détectée à la notion 150, elle coûte le projet.

### Ordre de codage recommandé (étape ⑤)
**Un fichier à la fois. Tester après chaque fichier.**

---

## 10. Checklist de conformité

À passer sur chaque écran avant validation.

**Interface**
- [ ] Aucun pourcentage de volume affiché
- [ ] Aucun badge, trophée, série ou classement
- [ ] Aucune catégorie de niveau nommée
- [ ] Aucun cadenas
- [ ] Bouton « Je ne comprends pas la question » visible sans scroll
- [ ] Maximum 4 options
- [ ] Une seule idée par écran
- [ ] Aucun champ de saisie libre
- [ ] Texte ≥ 18px, boutons ≥ 48px de haut
- [ ] Testé sur téléphone réel

**Pédagogie**
- [ ] `pourquoi_ca_existe` affiché avant `definition_simple`
- [ ] `definition_officielle` à côté, jamais à la place
- [ ] Cadre situationnel affiché, étiquette conceptuelle absente en boucle 1
- [ ] Feedback élaboratif, jamais « Faux, c'est B »
- [ ] Session terminable proprement à tout moment
- [ ] Aucune formulation absente de `formulations_examen`

**Sans audio**
- [ ] Image présente et porteuse de sens en boucle 1
- [ ] Situation compréhensible sans lire le texte
- [ ] Phrases courtes, une idée par phrase
- [ ] Icônes cohérentes dans tout le site

**Contenu sensible**
- [ ] Si `charge_affective = haute` → `cadrage_factuel` affiché
- [ ] Formulation « voici ce que dit la loi », jamais « voici ce qu'il faut penser »

---

## 11. Décisions actées en v2

| Décision | Statut |
|---|---|
| Suppression de l'audio | ✅ Actée |
| Compensation par l'image porteuse de sens | ✅ Ajoutée (V1-V4) |
| Suppression du test de diagnostic initial | ✅ Actée |
| Remplacement par le calibrage silencieux | ✅ Ajouté (§4.3) |
| Adaptation A2/B1/B2 par double formulation | ✅ Actée (§4.4) |
| Ajout de l'étape « Structuration des données » | ✅ Ajoutée (§9) |
| Ajout de l'étape « Prototype sur 1 notion » | ✅ Ajoutée (§9) |
| Stack HTML/CSS/JS natif, GitHub Pages | ✅ Recommandée |
| Stockage `localStorage`, pas de compte | ✅ Recommandé |
