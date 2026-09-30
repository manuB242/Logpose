# Décisions de démarrage — MVP LogPose

## Périmètre livré en premier

Le premier lot matérialise la consultation du marché de l'emploi et ses filtres. Il ne prétend pas encore fournir de données officielles ; toutes les valeurs sont des données de démonstration identifiées dans l'interface et la réponse API.

## Principes

- **Mobile-first et français** : l'interface cible les terminaux mobiles à connectivité potentiellement limitée.
- **URL relatives** : le client consomme `/api/*`, jamais une adresse `localhost` depuis le navigateur.
- **API séparée** : le contrat REST est disponible avant le choix définitif entre une app React Native et Flutter.
- **Données traçables** : chaque réponse du tableau de bord contient une date de mise à jour et une mention de démonstration. La future source de données devra être ajoutée avant la mise en production.
- **Pas de profil personnel dans ce lot** : l'authentification et la conversation d'orientation seront ajoutées après définition du consentement, de la rétention et de la suppression des données.

## Contrat du tableau de bord

`GET /api/dashboard?period=2026&zones=Brazzaville&sectors=Num%C3%A9rique&companies=...&employmentTypes=CDI&limit=5`

Réponse : métadonnées de provenance, indicateurs clés, répartition des secteurs, métiers les plus demandés et entreprises recruteuses.

Les valeurs multiples sont passées sous forme de liste séparée par des virgules. Les noms des paramètres sont explicites et homogènes avec le futur modèle de données.

## Lot 2 — catalogue et fiches métiers

Le catalogue est livré avec une catégorie dépliable à la fois, une recherche côté client et une fiche pour chaque métier. Les contrats sont :

- `GET /api/metiers` : catégories et cartes de métiers ;
- `GET /api/metiers/:id` : contenu complet d'une fiche métier.

Les compétences, formations et organisations affichées sont des exemples de démonstration. Ils doivent être validés et sourcés avant toute diffusion publique. Les données de tendance et de volume restent dans le tableau de bord : elles ne sont pas affichées dans la fiche métier, conformément au cahier des charges.
