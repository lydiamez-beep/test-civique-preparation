# État du projet

Dernière mise à jour : 23 juillet 2026

## Étapes (voir SPECIFICATION.md section 9)

- [x] ① Organisation
- [x] ② Analyse du livret — thématique 1 uniquement
- [~] ③ Structuration des données — 1 notion sur 43
- [ ] ④ Prototype sur 1 notion — EN COURS
- [ ] ⑤ Codage complet
- [ ] ⑥ Remplissage du contenu

## Analyse du livret

Thématique 1 (Principes et valeurs de la République) : terminée.
6 passes + vérification croisée + consolidation.
Résultat : 43 notions testables, 270 formulations d'examen.
Thématiques 2 à 5 : non commencées.

## Données

`data/notions/01-valeurs.json` contient 1 notion validée : LAICITE_01.
Les autres fichiers sont vides.
`data/situations/` reste à créer.

## Code

- `js/donnees.js` — chargement et validation des notions
- `js/etat.js` — localStorage, critère d'acquisition (section 1.6)
- `js/jeux/detective.js` — micro-jeu boucle 1, attend un objet item

Manquent : le moteur d'assemblage, `css/style.css`, `index.html`.

## Décision d'architecture du 23 juillet

L'entité `Situation` est une ressource de premier rang (section 1.3).
Relation plusieurs à plusieurs avec `Notion`, portée par `notions_mobilisees`.
La situation est l'unité de conception ; la notion reste l'unité de suivi.
Le moteur assemble
cat > ETAT.md << 'EOF'
# État du projet

Dernière mise à jour : 23 juillet 2026

## Étapes (voir SPECIFICATION.md section 9)

- [x] ① Organisation
- [x] ② Analyse du livret — thématique 1 uniquement
- [~] ③ Structuration des données — 1 notion sur 43
- [ ] ④ Prototype sur 1 notion — EN COURS
- [ ] ⑤ Codage complet
- [ ] ⑥ Remplissage du contenu

## Analyse du livret

Thématique 1 (Principes et valeurs de la République) : terminée.
6 passes + vérification croisée + consolidation.
Résultat : 43 notions testables, 270 formulations d'examen.
Thématiques 2 à 5 : non commencées.

## Données

`data/notions/01-valeurs.json` contient 1 notion validée : LAICITE_01.
Les autres fichiers sont vides.
`data/situations/` reste à créer.

## Code

- `js/donnees.js` — chargement et validation des notions
- `js/etat.js` — localStorage, critère d'acquisition (section 1.6)
- `js/jeux/detective.js` — micro-jeu boucle 1, attend un objet item

Manquent : le moteur d'assemblage, `css/style.css`, `index.html`.

## Décision d'architecture du 23 juillet

L'entité `Situation` est une ressource de premier rang (section 1.3).
Relation plusieurs à plusieurs avec `Notion`, portée par `notions_mobilisees`.
La situation est l'unité de conception ; la notion reste l'unité de suivi.
Le moteur assemble Situation + Notion + micro-jeu pour produire un Item éphémère.

## Prochaine action

Rédiger la première situation au format section 1.3.
