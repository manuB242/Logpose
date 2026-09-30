# LogPose

Application web d’orientation scolaire et professionnelle pour la République du Congo, réalisée en **PHP natif + MySQL**, sans framework.

## Fonctionnalités

- tableau de bord du marché de l’emploi et filtres par zone, secteur, entreprise et type d’emploi ;
- catalogue de métiers, recherche, catégories et fiches détaillées ;
- établissements et parcours filtrables par série, filière et métier ;
- concours et références d’annales, avec garde-fous sur les droits de diffusion ;
- orientation guidée par cinq questions dépendantes et recommandations explicables ;
- interface responsive en français, conservant la charte visuelle LogPose.

> Les indicateurs, référentiels, établissements, concours et recommandations affichés sont des données de démonstration. Ils ne constituent ni des statistiques officielles, ni une garantie d’admission ou d’emploi.

## Stack sans framework

```text
backend/
├── config/app.php               # configuration PHP
├── database/schema.sql          # schéma MySQL / MariaDB
├── database/seed.sql            # données de démonstration
├── public/
│   ├── index.php                # point d’entrée web + API
│   ├── router.php               # routeur du serveur PHP intégré
│   └── assets/
│       ├── app.css              # charte LogPose
│       └── app.js               # interactions navigateur vanilla
├── src/                         # API REST, PDO, HTTP et logique métier
└── views/home.php               # document HTML rendu par PHP
```

Le site et l’API sont servis depuis le même domaine. Le navigateur appelle uniquement des URL relatives sous `/api` avec la Fetch API native.

## Prérequis

- PHP **8.1+** avec les extensions `pdo_mysql` et `json` ;
- MySQL **8+** ou MariaDB **10.6+** ;
- un serveur HTTP avec PHP-FPM (production) ou le serveur intégré PHP (développement).

Aucun package Composer, framework PHP, Node.js, React ou Vite n’est nécessaire.

## Icônes

Les pictogrammes proviennent de la bibliothèque [Lucide](https://lucide.dev/) **v0.468.0**, distribuée localement dans `backend/public/assets/vendor/lucide.min.js` sous licence ISC. Aucun emoji ni pictogramme dessiné à la main n’est utilisé par l’interface.

## Initialiser la base de données

1. Créer le schéma avec un compte MySQL administrateur :

   ```bash
   mysql -u root -p < backend/database/schema.sql
   ```

2. Créer le compte applicatif puis lui donner accès à la base :

   ```sql
   CREATE USER 'logpose'@'localhost' IDENTIFIED BY 'change_this_password';
   GRANT ALL PRIVILEGES ON logpose.* TO 'logpose'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. Charger les données de démonstration :

   ```bash
   mysql -u logpose -p logpose < backend/database/seed.sql
   ```

4. Créer la configuration locale :

   ```bash
   cp backend/.env.example backend/.env
   ```

## Démarrage local

```bash
php -S 0.0.0.0:8787 -t backend/public backend/public/router.php
```

Le site est alors disponible sur `http://localhost:8787`.

Le serveur intégré est réservé au développement. En production, servir `backend/public` derrière Nginx ou Apache avec PHP-FPM et renseigner les variables d’environnement côté infrastructure.

## Vérifications

```bash
php -l backend/public/index.php
php -l backend/src/Api.php
php -l backend/views/home.php
```

## API principale

| Domaine | Endpoints |
| --- | --- |
| Marché de l’emploi | `GET /api/dashboard`, `GET /api/filter-options` |
| Métiers | `GET /api/metiers`, `GET /api/metiers/:slug` |
| Établissements | `GET /api/etablissements/options`, `GET /api/etablissements` |
| Concours | `GET /api/concours/options`, `GET /api/concours`, `GET /api/concours/:slug/annales` |
| Orientation | `POST /api/orientation/sessions`, `POST /api/orientation/sessions/:id/answers`, `GET /api/orientation/sessions/:id/recommandations` |

Les requêtes vers MySQL utilisent PDO et des instructions préparées. Les sessions d’orientation ne contiennent que les choix du questionnaire ; aucun nom, contact ou résultat scolaire n’est demandé.

## Suite recommandée

1. Valider la fraîcheur, les sources et la méthode de calcul des données emploi.
2. Remplacer les référentiels de démonstration par des données contrôlées avec les partenaires.
3. Ajouter les fiches établissement, conditions d’admission et annales dont les droits sont validés.
4. Définir consentement, durée de conservation, export et suppression avant tout profil utilisateur authentifié.
