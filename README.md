# LogPose

MVP de l'application d'orientation scolaire et professionnelle pour la République du Congo.

## Première livraison

Les deux premières itérations couvrent les **lots 1 et 2** du cahier des charges :

- tableau de bord du marché de l'emploi ;
- filtres par zone, secteur, entreprise et type d'emploi ;
- catalogue de métiers avec recherche, catégories et fiches détaillées ;
- formations, compétences et organisations associées à chaque métier ;
- recherche d'établissements par série, filière et métier visé ;
- concours filtrables et références d'annales avec garde-fous sur les droits de diffusion ;
- API REST locale avec données de démonstration clairement identifiées ;
- interface responsive pensée d'abord pour les usages mobiles.

> Les indicateurs actuellement affichés sont des données fictives de démonstration. Ils ne constituent pas des statistiques officielles sur l'emploi au Congo.

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
4. Mettre en place l'orientation guidée à partir de règles de compatibilité explicites, avant toute couche conversationnelle IA.

Les documents initiaux du projet sont conservés à la racine du dépôt.
