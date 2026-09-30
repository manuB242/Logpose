# LogPose

MVP d’orientation scolaire et professionnelle pour la République du Congo.

## Fonctionnalités livrées

- tableau de bord du marché de l’emploi et filtres par zone, secteur, entreprise et type d’emploi ;
- catalogue de métiers, recherche, catégories et fiches détaillées ;
- établissements et parcours filtrables par série, filière et métier ;
- concours et références d’annales avec garde-fous sur les droits de diffusion ;
- orientation guidée par cinq questions dépendantes et recommandations explicables ;
- interface React responsive en français.

> Tous les indicateurs, référentiels, établissements, concours et recommandations actuellement affichés sont des données de démonstration. Ils ne constituent ni des statistiques officielles, ni une garantie d’admission ou d’emploi.

## Architecture

```text
backend/                         # API REST PHP natif, sans framework
├── config/app.php               # configuration applicative
├── database/schema.sql          # structure MySQL / MariaDB
├── database/seed.sql            # données de démonstration
├── public/index.php             # point d’entrée HTTP
├── public/router.php            # routeur du serveur PHP intégré
└── src/                         # PDO, requêtes HTTP, réponses et logique métier

apps/web/                        # React + TypeScript + Vite
```

Le navigateur n’appelle que des URL relatives sous `/api`. Vite les transmet à l’API PHP en développement ; ce principe reste compatible avec un déploiement derrière le même domaine.

## Prérequis

- PHP **8.1+** avec les extensions `pdo_mysql` et `json` ;
- MySQL **8+** ou MariaDB **10.6+** ;
- Node.js 22+ et npm 10+ pour l’interface React.

## Initialiser la base de données

1. Créer le schéma avec un compte MySQL administrateur :

   ```bash
   mysql -u root -p < backend/database/schema.sql
   ```

2. Créer un compte applicatif, puis lui accorder l’accès à la base `logpose` :

   ```sql
   CREATE USER 'logpose'@'localhost' IDENTIFIED BY 'change_this_password';
   GRANT ALL PRIVILEGES ON logpose.* TO 'logpose'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. Charger les données de démonstration :

   ```bash
   mysql -u logpose -p logpose < backend/database/seed.sql
   ```

4. Copier et ajuster la configuration locale :

   ```bash
   cp backend/.env.example backend/.env
   ```

`backend/.env` est chargé sans dépendance externe et reste ignoré par Git.

## Démarrage local

```bash
npm install
npm run dev
```

- l’API PHP écoute sur le port `8787` ;
- l’interface Vite écoute généralement sur le port `5173`.

La commande utilise le serveur intégré PHP uniquement pour le développement. En production, servir `backend/public` derrière Nginx ou Apache avec PHP-FPM et injecter les variables d’environnement côté infrastructure.

## Vérifications

```bash
npm run build
php -l backend/public/index.php
php -l backend/src/Api.php
```

## API principale

| Domaine | Endpoints |
| --- | --- |
| Marché de l’emploi | `GET /api/dashboard`, `GET /api/filter-options` |
| Métiers | `GET /api/metiers`, `GET /api/metiers/:slug` |
| Établissements | `GET /api/etablissements/options`, `GET /api/etablissements` |
| Concours | `GET /api/concours/options`, `GET /api/concours`, `GET /api/concours/:slug/annales` |
| Orientation | `POST /api/orientation/sessions`, `POST /api/orientation/sessions/:id/answers`, `GET /api/orientation/sessions/:id/recommandations` |

Les réponses utilisent des requêtes PDO préparées. Les sessions d’orientation sont désormais stockées en MySQL, mais ne contiennent que les choix du questionnaire ; aucun nom, contact ou résultat scolaire n’est demandé.

## Suite recommandée

1. Valider les sources, la fraîcheur et la méthode de calcul des données emploi.
2. Remplacer les référentiels de démonstration par des données contrôlées avec les partenaires.
3. Ajouter les fiches établissement, conditions d’admission et annales dont les droits sont validés.
4. Définir consentement, durées de conservation, export et suppression avant tout profil utilisateur authentifié.
5. Évaluer une couche conversationnelle IA comme aide à la reformulation, sans remplacer les règles de compatibilité explicites.
