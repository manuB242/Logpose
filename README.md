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

## Application mobile React Native

Le dossier [`mobile/`](mobile/) contient l’application iOS et Android **React Native / Expo**, qui reprend la charte LogPose et consomme les mêmes contrats REST PHP : marché, métiers et fiches, parcours d’orientation dépendant, établissements, concours et références d’annales.

```text
mobile/
├── App.tsx                     # vues mobiles et navigation basse
├── src/api.ts                  # client des routes REST PHP
├── src/types.ts                # contrats TypeScript de l’API
├── src/theme.ts                # charte mobile LogPose
├── app.json                    # configuration Expo
└── .env.example                # modèle de l’URL publique de l’API
```

L’app mobile utilise `lucide-react-native` et `react-native-svg` : les pictogrammes proviennent donc également de Lucide, sans emoji ni SVG artisanaux.

## Prérequis

- PHP **8.1+** avec les extensions `pdo_mysql` et `json` ;
- MySQL **8+** ou MariaDB **10.6+** ;
- un serveur HTTP avec PHP-FPM (production) ou le serveur intégré PHP (développement).

Aucun package Composer, framework PHP, Node.js, React ou Vite n’est nécessaire pour servir le **web PHP** et son API.

L’application mobile requiert en complément Node.js 20+ (ou une version compatible avec Expo SDK 52), Expo Go sur un appareil physique ou un émulateur Android/iOS.

## Démarrer l’application mobile

1. Déployer l’API PHP sur une URL HTTPS accessible depuis l’appareil mobile. La réponse API autorise déjà les requêtes `GET`, `POST` et `OPTIONS` nécessaires à l’application.
2. Créer la configuration locale, puis remplacer l’exemple par l’URL de déploiement réelle **sans** suffixe `/api` :

   ```bash
   cp mobile/.env.example mobile/.env
   # EXPO_PUBLIC_API_BASE_URL=https://logpose.example.cg
   ```

   N’utilisez pas `localhost` ni `127.0.0.1` : ils désigneraient le téléphone, pas l’ordinateur ni le serveur PHP.
3. Installer et démarrer Expo :

   ```bash
   cd mobile
   npm install
   npm run typecheck
   npm start
   ```

4. Scanner le QR code avec Expo Go, ou lancer un émulateur avec `npm run android` / `npm run ios`.

Les variables commençant par `EXPO_PUBLIC_` sont incluses dans le bundle Expo : elles ne doivent donc jamais contenir un mot de passe, une clé privée ou un secret.

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

cd mobile
npm run typecheck
npx expo config --type public
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
