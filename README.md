# LogPose

MVP de l'application d'orientation scolaire et professionnelle pour la République du Congo.

## MVP livré — lots 1 à 4

Les quatre premières itérations couvrent le socle fonctionnel du cahier des charges :

- tableau de bord du marché de l'emploi et filtres par zone, secteur, entreprise et type d'emploi ;
- catalogue de métiers avec recherche, catégories et fiches détaillées ;
- formations, compétences et organisations associées à chaque métier ;
- recherche d'établissements par série, filière et métier visé ;
- concours filtrables et références d'annales avec garde-fous sur les droits de diffusion ;
- orientation guidée par cinq questions dépendantes et recommandations explicables ;
- API REST locale avec données de démonstration clairement identifiées ;
- interface responsive pensée d'abord pour les usages mobiles.

> Tous les indicateurs, référentiels, établissements, concours et recommandations actuellement affichés sont des données de démonstration. Ils ne constituent ni des statistiques officielles, ni une garantie d’admission ou d’emploi.

## Pré-requis

- Node.js 22 ou supérieur
- npm 10 ou supérieur

## Démarrage

```bash
npm install
npm run dev
```

L'interface est exposée par Vite (généralement sur `http://localhost:5173`) et l'API est lancée sur le port `8787`.

## Vérification de production

```bash
npm run build
```

## Architecture actuelle

```text
apps/
├── api/       # API REST Node.js, sans dépendance serveur externe
└── web/       # Interface React + TypeScript + Vite
```

Le navigateur appelle uniquement des URL relatives sous `/api`. En développement, Vite les transmet à l'API ; cette convention reste compatible avec un déploiement derrière un même domaine.

## Suite prévue

1. Valider les sources de données, leur date de mise à jour et leur méthode de calcul.
2. Remplacer les référentiels de démonstration par des données contrôlées avec les partenaires.
3. Ajouter les fiches établissement, conditions d’admission et fichiers d’annales autorisés.
4. Définir le consentement, la conservation et la suppression des futures sessions d’orientation authentifiées.
5. Évaluer une couche conversationnelle IA comme aide à la reformulation, sans remplacer les règles de compatibilité explicites.

Les documents initiaux du projet sont conservés à la racine du dépôt.
