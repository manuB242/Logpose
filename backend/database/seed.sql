-- LogPose — données de démonstration
-- À exécuter après schema.sql : mysql -u logpose -p logpose < backend/database/seed.sql
-- Ces contenus ne sont ni des statistiques officielles, ni un référentiel public validé.

USE logpose;

INSERT INTO sectors (name) VALUES
  ('Agriculture'), ('BTP'), ('Commerce'), ('Environnement'), ('Finance'), ('Industrie'), ('Numérique'), ('Santé')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO zones (name) VALUES
  ('Brazzaville'), ('Dolisie'), ('Nkayi'), ('Ouesso'), ('Pointe-Noire')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO baccalaureate_series (code, name, sort_order) VALUES
  ('A', 'Série A', 1), ('C', 'Série C', 2), ('D', 'Série D', 3), ('G2', 'Série G2', 4)
ON DUPLICATE KEY UPDATE name = VALUES(name), sort_order = VALUES(sort_order);

INSERT INTO job_categories (slug, name, description, symbol, sort_order) VALUES
  ('numerique', 'Métiers du numérique', 'Concevoir, analyser et faire grandir les services numériques.', '⌘', 1),
  ('btp', 'Métiers du bâtiment', 'Construire, planifier et sécuriser les ouvrages.', '⌁', 2),
  ('sante', 'Métiers de la santé', 'Prévenir, soigner et accompagner les patients.', '✚', 3),
  ('environnement', 'Métiers de l''environnement', 'Préserver les ressources et agir sur le terrain.', '◌', 4),
  ('finance', 'Métiers de la gestion', 'Conseiller, organiser et piloter les activités.', '↗', 5)
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), symbol = VALUES(symbol), sort_order = VALUES(sort_order);

INSERT INTO companies (name, sector_id) VALUES
  ('Congo Digital', (SELECT id FROM sectors WHERE name = 'Numérique')),
  ('Airtel Congo', (SELECT id FROM sectors WHERE name = 'Numérique')),
  ('MTN Congo', (SELECT id FROM sectors WHERE name = 'Numérique')),
  ('SOREMI', (SELECT id FROM sectors WHERE name = 'BTP')),
  ('E2C', (SELECT id FROM sectors WHERE name = 'BTP')),
  ('Clinique Santé Plus', (SELECT id FROM sectors WHERE name = 'Santé')),
  ('Hôpital Loandjili', (SELECT id FROM sectors WHERE name = 'Santé')),
  ('CFAO Congo', (SELECT id FROM sectors WHERE name = 'Commerce')),
  ('BGFI Bank', (SELECT id FROM sectors WHERE name = 'Finance')),
  ('CIB Olam', (SELECT id FROM sectors WHERE name = 'Environnement')),
  ('Agri Congo', (SELECT id FROM sectors WHERE name = 'Agriculture')),
  ('Pointe-Noire Industrie', (SELECT id FROM sectors WHERE name = 'Industrie'))
ON DUPLICATE KEY UPDATE sector_id = VALUES(sector_id);

-- Les métiers sont saisis avec une catégorie, un secteur et trois textes séparés
-- pour éviter de mélanger contenu court, profil et mission dans l'interface.
INSERT INTO jobs (category_id, sector_id, slug, name, description, profile, mission)
SELECT jc.id, s.id, 'developpeur-fullstack', 'Développeur Fullstack',
  'Conçoit les interfaces et les services qui font fonctionner une application numérique.',
  'Aime résoudre des problèmes, apprendre en continu et construire des solutions concrètes.',
  'Transforme un besoin en produit numérique utilisable, côté interface comme côté services de données.'
FROM job_categories jc CROSS JOIN sectors s WHERE jc.slug = 'numerique' AND s.name = 'Numérique'
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), profile=VALUES(profile), mission=VALUES(mission);
INSERT INTO jobs (category_id, sector_id, slug, name, description, profile, mission)
SELECT jc.id, s.id, 'data-analyst', 'Data Analyst',
  'Transforme des données en informations utiles pour guider les décisions.',
  'Aime comprendre les chiffres, structurer une question et expliquer ce qui compte.',
  'Collecte, nettoie et analyse des données afin d’identifier des tendances et de créer des tableaux de bord.'
FROM job_categories jc CROSS JOIN sectors s WHERE jc.slug = 'numerique' AND s.name = 'Numérique'
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), profile=VALUES(profile), mission=VALUES(mission);
INSERT INTO jobs (category_id, sector_id, slug, name, description, profile, mission)
SELECT jc.id, s.id, 'digital-marketer', 'Digital Marketer',
  'Développe la visibilité d’une organisation sur les canaux numériques.',
  'Créatif, curieux des usages et à l’aise avec la communication comme les chiffres.',
  'Prépare des campagnes, coordonne les contenus et suit leurs résultats pour améliorer la présence d’une marque.'
FROM job_categories jc CROSS JOIN sectors s WHERE jc.slug = 'numerique' AND s.name = 'Numérique'
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), profile=VALUES(profile), mission=VALUES(mission);
INSERT INTO jobs (category_id, sector_id, slug, name, description, profile, mission)
SELECT jc.id, s.id, 'product-manager', 'Product Manager',
  'Fait le lien entre les besoins des utilisateurs, la stratégie et l’équipe de réalisation.',
  'Aime les projets collectifs, l’écoute utilisateur et l’organisation de problèmes complexes.',
  'Définit les priorités d’un produit, écoute les utilisateurs et coordonne les décisions avec les équipes.'
FROM job_categories jc CROSS JOIN sectors s WHERE jc.slug = 'numerique' AND s.name = 'Numérique'
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), profile=VALUES(profile), mission=VALUES(mission);
INSERT INTO jobs (category_id, sector_id, slug, name, description, profile, mission)
SELECT jc.id, s.id, 'chef-de-chantier', 'Chef de chantier',
  'Organise les équipes et veille au bon déroulement d’un chantier.',
  'Apprécie le terrain, l’organisation d’équipe et la réalisation visible de projets.',
  'Prépare le travail quotidien, suit l’avancement et fait respecter les délais ainsi que les règles de sécurité.'
FROM job_categories jc CROSS JOIN sectors s WHERE jc.slug = 'btp' AND s.name = 'BTP'
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), profile=VALUES(profile), mission=VALUES(mission);
INSERT INTO jobs (category_id, sector_id, slug, name, description, profile, mission)
SELECT jc.id, s.id, 'technicien-electricien', 'Technicien électricien',
  'Installe, contrôle et entretient des équipements électriques.',
  'Précis, méthodique et attiré par la technique appliquée sur le terrain.',
  'Lit les schémas, réalise les installations et diagnostique les pannes dans le respect des règles de sécurité.'
FROM job_categories jc CROSS JOIN sectors s WHERE jc.slug = 'btp' AND s.name = 'BTP'
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), profile=VALUES(profile), mission=VALUES(mission);
INSERT INTO jobs (category_id, sector_id, slug, name, description, profile, mission)
SELECT jc.id, s.id, 'conducteur-de-travaux', 'Conducteur de travaux',
  'Pilote la préparation et la coordination globale d’un ou plusieurs chantiers.',
  'Aime organiser des projets de terrain et prendre des décisions avec méthode.',
  'Planifie les moyens nécessaires, suit les coûts et les délais, puis coordonne les intervenants.'
FROM job_categories jc CROSS JOIN sectors s WHERE jc.slug = 'btp' AND s.name = 'BTP'
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), profile=VALUES(profile), mission=VALUES(mission);
INSERT INTO jobs (category_id, sector_id, slug, name, description, profile, mission)
SELECT jc.id, s.id, 'mecanicien-industriel', 'Mécanicien industriel',
  'Entretient et répare les équipements mécaniques utilisés dans les installations industrielles.',
  'Pratique, curieux du fonctionnement des machines et attentif à la sécurité.',
  'Réalise les contrôles, diagnostique les dysfonctionnements et intervient pour maintenir les machines en état.'
FROM job_categories jc CROSS JOIN sectors s WHERE jc.slug = 'btp' AND s.name = 'Industrie'
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), profile=VALUES(profile), mission=VALUES(mission);
INSERT INTO jobs (category_id, sector_id, slug, name, description, profile, mission)
SELECT jc.id, s.id, 'infirmier-de', 'Infirmier diplômé d’État',
  'Dispense des soins, surveille les patients et travaille avec l’équipe médicale.',
  'Empathique, rigoureux et capable de rester attentif dans un environnement exigeant.',
  'Évalue les besoins de soin, applique les prescriptions et transmet les informations utiles à l’équipe.'
FROM job_categories jc CROSS JOIN sectors s WHERE jc.slug = 'sante' AND s.name = 'Santé'
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), profile=VALUES(profile), mission=VALUES(mission);
INSERT INTO jobs (category_id, sector_id, slug, name, description, profile, mission)
SELECT jc.id, s.id, 'laborantin', 'Laborantin',
  'Réalise des analyses et assure la fiabilité des résultats de laboratoire.',
  'Aime les sciences expérimentales, les protocoles précis et l’observation.',
  'Prépare les prélèvements, applique les protocoles et contrôle les équipements de laboratoire.'
FROM job_categories jc CROSS JOIN sectors s WHERE jc.slug = 'sante' AND s.name = 'Santé'
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), profile=VALUES(profile), mission=VALUES(mission);
INSERT INTO jobs (category_id, sector_id, slug, name, description, profile, mission)
SELECT jc.id, s.id, 'aide-soignant', 'Aide-soignant',
  'Accompagne les personnes dans les gestes essentiels du quotidien et dans leur confort.',
  'Patient, attentif aux autres et à l’aise dans le travail collectif.',
  'Assure les soins d’hygiène et de confort, observe l’état des patients et travaille avec l’équipe soignante.'
FROM job_categories jc CROSS JOIN sectors s WHERE jc.slug = 'sante' AND s.name = 'Santé'
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), profile=VALUES(profile), mission=VALUES(mission);
INSERT INTO jobs (category_id, sector_id, slug, name, description, profile, mission)
SELECT jc.id, s.id, 'technicien-environnement', 'Technicien environnement',
  'Observe les impacts des activités et met en œuvre des actions de protection.',
  'Attiré par les sciences, le terrain et la préservation des ressources naturelles.',
  'Effectue des relevés, suit des indicateurs et participe à l’application de plans de gestion environnementale.'
FROM job_categories jc CROSS JOIN sectors s WHERE jc.slug = 'environnement' AND s.name = 'Environnement'
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), profile=VALUES(profile), mission=VALUES(mission);
INSERT INTO jobs (category_id, sector_id, slug, name, description, profile, mission)
SELECT jc.id, s.id, 'animateur-agricole', 'Animateur agricole',
  'Accompagne les producteurs dans l’adoption de pratiques agricoles adaptées.',
  'Aime le terrain, la transmission et le contact avec les communautés.',
  'Organise des démonstrations, partage des conseils techniques et recueille les besoins des exploitants.'
FROM job_categories jc CROSS JOIN sectors s WHERE jc.slug = 'environnement' AND s.name = 'Agriculture'
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), profile=VALUES(profile), mission=VALUES(mission);
INSERT INTO jobs (category_id, sector_id, slug, name, description, profile, mission)
SELECT jc.id, s.id, 'conseiller-clientele', 'Conseiller clientèle',
  'Accompagne les clients dans le choix et le suivi de services financiers.',
  'À l’aise dans l’échange, organisé et intéressé par les besoins des personnes ou entreprises.',
  'Accueille les demandes, présente les solutions adaptées et suit les dossiers avec une relation de confiance.'
FROM job_categories jc CROSS JOIN sectors s WHERE jc.slug = 'finance' AND s.name = 'Finance'
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), profile=VALUES(profile), mission=VALUES(mission);
INSERT INTO jobs (category_id, sector_id, slug, name, description, profile, mission)
SELECT jc.id, s.id, 'assistant-comptable', 'Assistant comptable',
  'Participe au suivi quotidien des opérations comptables d’une organisation.',
  'Rigoureux, à l’aise avec les chiffres et attentif aux détails.',
  'Enregistre les pièces, aide au suivi des factures et contribue à la fiabilité des informations financières.'
FROM job_categories jc CROSS JOIN sectors s WHERE jc.slug = 'finance' AND s.name = 'Finance'
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), profile=VALUES(profile), mission=VALUES(mission);
INSERT INTO jobs (category_id, sector_id, slug, name, description, profile, mission)
SELECT jc.id, s.id, 'responsable-logistique', 'Responsable logistique',
  'Organise les flux de marchandises, les stocks et les livraisons.',
  'Méthodique, réactif et intéressé par l’organisation de systèmes concrets.',
  'Coordonne les approvisionnements, suit les stocks et améliore les parcours de livraison.'
FROM job_categories jc CROSS JOIN sectors s WHERE jc.slug = 'finance' AND s.name = 'Commerce'
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), profile=VALUES(profile), mission=VALUES(mission);
INSERT INTO jobs (category_id, sector_id, slug, name, description, profile, mission)
SELECT jc.id, s.id, 'agent-commercial', 'Agent commercial',
  'Développe les ventes en comprenant les besoins de ses clients.',
  'Aime échanger, convaincre avec écoute et se fixer des objectifs concrets.',
  'Prospecte, conseille les clients et suit les échanges jusqu’à la réalisation de la vente.'
FROM job_categories jc CROSS JOIN sectors s WHERE jc.slug = 'finance' AND s.name = 'Commerce'
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), profile=VALUES(profile), mission=VALUES(mission);

INSERT INTO skills (job_id, name, sort_order)
SELECT j.id, source.name, source.sort_order FROM jobs j
JOIN (
  SELECT 'developpeur-fullstack' AS slug, 'JavaScript / TypeScript' AS name, 1 AS sort_order UNION ALL
  SELECT 'developpeur-fullstack', 'Bases de données', 2 UNION ALL SELECT 'developpeur-fullstack', 'API REST', 3 UNION ALL
  SELECT 'data-analyst', 'SQL', 1 UNION ALL SELECT 'data-analyst', 'Visualisation de données', 2 UNION ALL SELECT 'data-analyst', 'Statistiques', 3 UNION ALL
  SELECT 'digital-marketer', 'Réseaux sociaux', 1 UNION ALL SELECT 'digital-marketer', 'Création de contenu', 2 UNION ALL SELECT 'digital-marketer', 'Analyse de campagne', 3 UNION ALL
  SELECT 'product-manager', 'Recherche utilisateur', 1 UNION ALL SELECT 'product-manager', 'Priorisation', 2 UNION ALL SELECT 'product-manager', 'Communication', 3 UNION ALL
  SELECT 'chef-de-chantier', 'Lecture de plans', 1 UNION ALL SELECT 'chef-de-chantier', 'Organisation de chantier', 2 UNION ALL SELECT 'chef-de-chantier', 'Gestion d’équipe', 3 UNION ALL
  SELECT 'technicien-electricien', 'Électricité', 1 UNION ALL SELECT 'technicien-electricien', 'Lecture de schémas', 2 UNION ALL SELECT 'technicien-electricien', 'Maintenance', 3 UNION ALL
  SELECT 'conducteur-de-travaux', 'Planification', 1 UNION ALL SELECT 'conducteur-de-travaux', 'Gestion de budget', 2 UNION ALL SELECT 'conducteur-de-travaux', 'Coordination', 3 UNION ALL
  SELECT 'mecanicien-industriel', 'Mécanique', 1 UNION ALL SELECT 'mecanicien-industriel', 'Maintenance préventive', 2 UNION ALL SELECT 'mecanicien-industriel', 'Diagnostic', 3 UNION ALL
  SELECT 'infirmier-de', 'Soins infirmiers', 1 UNION ALL SELECT 'infirmier-de', 'Écoute', 2 UNION ALL SELECT 'infirmier-de', 'Hygiène', 3 UNION ALL
  SELECT 'laborantin', 'Analyses biologiques', 1 UNION ALL SELECT 'laborantin', 'Protocoles', 2 UNION ALL SELECT 'laborantin', 'Contrôle qualité', 3 UNION ALL
  SELECT 'aide-soignant', 'Accompagnement', 1 UNION ALL SELECT 'aide-soignant', 'Hygiène', 2 UNION ALL SELECT 'aide-soignant', 'Travail d’équipe', 3 UNION ALL
  SELECT 'technicien-environnement', 'Suivi environnemental', 1 UNION ALL SELECT 'technicien-environnement', 'Collecte de données', 2 UNION ALL SELECT 'technicien-environnement', 'Sensibilisation', 3 UNION ALL
  SELECT 'animateur-agricole', 'Techniques agricoles', 1 UNION ALL SELECT 'animateur-agricole', 'Animation', 2 UNION ALL SELECT 'animateur-agricole', 'Planification', 3 UNION ALL
  SELECT 'conseiller-clientele', 'Relation client', 1 UNION ALL SELECT 'conseiller-clientele', 'Produits financiers', 2 UNION ALL SELECT 'conseiller-clientele', 'Écoute active', 3 UNION ALL
  SELECT 'assistant-comptable', 'Comptabilité générale', 1 UNION ALL SELECT 'assistant-comptable', 'Tableurs', 2 UNION ALL SELECT 'assistant-comptable', 'Rigueur', 3 UNION ALL
  SELECT 'responsable-logistique', 'Gestion des stocks', 1 UNION ALL SELECT 'responsable-logistique', 'Planification', 2 UNION ALL SELECT 'responsable-logistique', 'Coordination', 3 UNION ALL
  SELECT 'agent-commercial', 'Relation client', 1 UNION ALL SELECT 'agent-commercial', 'Négociation', 2 UNION ALL SELECT 'agent-commercial', 'Suivi commercial', 3
) AS source ON source.slug = j.slug
ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order);

INSERT INTO establishments (slug, name, city, country) VALUES
  ('institut-horizon', 'Institut Horizon', 'Brazzaville', 'République du Congo'),
  ('campus-avenir', 'Campus Avenir', 'Pointe-Noire', 'République du Congo'),
  ('ecole-sante-services', 'École Santé & Services', 'Brazzaville', 'République du Congo'),
  ('academie-batir', 'Académie Bâtir', 'Pointe-Noire', 'République du Congo'),
  ('institut-vert', 'Institut Vert', 'Dolisie', 'République du Congo'),
  ('centre-gestion-plus', 'Centre Gestion Plus', 'Brazzaville', 'République du Congo')
ON DUPLICATE KEY UPDATE name=VALUES(name), city=VALUES(city), country=VALUES(country);

INSERT INTO programs (establishment_id, field, name, duration, duration_months, level, format)
SELECT e.id, source.field, source.name, source.duration, source.months, source.level, source.format
FROM establishments e JOIN (
  SELECT 'institut-horizon' AS establishment, 'Informatique' AS field, 'Développement logiciel' AS name, '3 ans' AS duration, 36 AS months, 'Bac +3' AS level, 'Université ou école spécialisée' AS format UNION ALL
  SELECT 'institut-horizon', 'Informatique', 'Analyse de données', '3 ans', 36, 'Bac +3', 'Université ou école spécialisée' UNION ALL
  SELECT 'campus-avenir', 'Marketing & communication', 'Marketing digital', '2 ans', 24, 'Bac +2', 'École ou formation professionnelle' UNION ALL
  SELECT 'campus-avenir', 'Gestion & commerce', 'Logistique et transport', '2 ans', 24, 'Bac +2', 'École ou université' UNION ALL
  SELECT 'ecole-sante-services', 'Santé', 'Soins infirmiers', '3 ans', 36, 'Bac +3', 'Institut de formation agréé' UNION ALL
  SELECT 'ecole-sante-services', 'Santé', 'Analyses biomédicales', '3 ans', 36, 'Bac +3', 'Institut ou université' UNION ALL
  SELECT 'academie-batir', 'BTP', 'Génie civil', '3 ans', 36, 'Bac +3', 'Université ou école technique' UNION ALL
  SELECT 'academie-batir', 'BTP', 'Maintenance électromécanique', '2 ans', 24, 'Bac +2', 'École technique' UNION ALL
  SELECT 'institut-vert', 'Environnement', 'Gestion environnementale', '3 ans', 36, 'Bac +3', 'Université ou école spécialisée' UNION ALL
  SELECT 'centre-gestion-plus', 'Gestion & commerce', 'Banque, finance et assurance', '2 ans', 24, 'Bac +2', 'École ou université'
) AS source ON source.establishment = e.slug
ON DUPLICATE KEY UPDATE field=VALUES(field), duration=VALUES(duration), duration_months=VALUES(duration_months), level=VALUES(level), format=VALUES(format);

-- Compatibilités séries / programmes.
INSERT IGNORE INTO program_series (program_id, series_id)
SELECT p.id, bs.id FROM programs p CROSS JOIN baccalaureate_series bs
WHERE (p.name IN ('Développement logiciel', 'Analyse de données', 'Soins infirmiers', 'Analyses biomédicales', 'Génie civil', 'Maintenance électromécanique', 'Gestion environnementale') AND bs.name IN ('Série C', 'Série D'))
   OR (p.name = 'Marketing digital' AND bs.name IN ('Série A', 'Série C', 'Série D'))
   OR (p.name IN ('Logistique et transport', 'Banque, finance et assurance') AND bs.name IN ('Série C', 'Série D', 'Série G2'));

INSERT IGNORE INTO program_jobs (program_id, job_id)
SELECT p.id, j.id FROM programs p JOIN jobs j ON
  (p.name = 'Développement logiciel' AND j.slug IN ('developpeur-fullstack', 'data-analyst')) OR
  (p.name = 'Analyse de données' AND j.slug = 'data-analyst') OR
  (p.name = 'Marketing digital' AND j.slug IN ('digital-marketer', 'product-manager', 'agent-commercial')) OR
  (p.name = 'Logistique et transport' AND j.slug = 'responsable-logistique') OR
  (p.name = 'Soins infirmiers' AND j.slug IN ('infirmier-de', 'aide-soignant')) OR
  (p.name = 'Analyses biomédicales' AND j.slug = 'laborantin') OR
  (p.name = 'Génie civil' AND j.slug IN ('chef-de-chantier', 'conducteur-de-travaux')) OR
  (p.name = 'Maintenance électromécanique' AND j.slug IN ('technicien-electricien', 'mecanicien-industriel')) OR
  (p.name = 'Gestion environnementale' AND j.slug IN ('technicien-environnement', 'animateur-agricole')) OR
  (p.name = 'Banque, finance et assurance' AND j.slug IN ('conseiller-clientele', 'assistant-comptable'));

INSERT INTO employment_records (period, job_id, sector_id, zone_id, company_id, employment_type, job_count, variation_percent)
SELECT '2026', j.id, s.id, z.id, c.id, source.employment_type, source.job_count, source.variation
FROM (
  SELECT 'developpeur-fullstack' AS job_slug, 'Numérique' AS sector_name, 'Brazzaville' AS zone_name, 'Congo Digital' AS company_name, 'CDI' AS employment_type, 142 AS job_count, 18 AS variation UNION ALL
  SELECT 'data-analyst', 'Numérique', 'Brazzaville', 'Airtel Congo', 'CDI', 97, 11 UNION ALL
  SELECT 'digital-marketer', 'Numérique', 'Pointe-Noire', 'MTN Congo', 'CDD', 76, 9 UNION ALL
  SELECT 'chef-de-chantier', 'BTP', 'Brazzaville', 'SOREMI', 'CDI', 128, 7 UNION ALL
  SELECT 'technicien-electricien', 'BTP', 'Pointe-Noire', 'E2C', 'CDD', 115, 6 UNION ALL
  SELECT 'conducteur-de-travaux', 'BTP', 'Dolisie', 'SOREMI', 'CDI', 84, 4 UNION ALL
  SELECT 'infirmier-de', 'Santé', 'Brazzaville', 'Clinique Santé Plus', 'CDI', 136, 14 UNION ALL
  SELECT 'laborantin', 'Santé', 'Pointe-Noire', 'Hôpital Loandjili', 'Stage', 61, 5 UNION ALL
  SELECT 'aide-soignant', 'Santé', 'Brazzaville', 'Clinique Santé Plus', 'CDD', 88, 8 UNION ALL
  SELECT 'agent-commercial', 'Commerce', 'Brazzaville', 'CFAO Congo', 'CDI', 121, 10 UNION ALL
  SELECT 'responsable-logistique', 'Commerce', 'Pointe-Noire', 'CFAO Congo', 'CDI', 93, 12 UNION ALL
  SELECT 'conseiller-clientele', 'Finance', 'Brazzaville', 'BGFI Bank', 'CDI', 102, 8 UNION ALL
  SELECT 'assistant-comptable', 'Finance', 'Pointe-Noire', 'BGFI Bank', 'Stage', 65, 6 UNION ALL
  SELECT 'technicien-environnement', 'Environnement', 'Ouesso', 'CIB Olam', 'CDI', 72, 15 UNION ALL
  SELECT 'animateur-agricole', 'Agriculture', 'Nkayi', 'Agri Congo', 'Alternance', 59, 13 UNION ALL
  SELECT 'mecanicien-industriel', 'Industrie', 'Pointe-Noire', 'Pointe-Noire Industrie', 'CDI', 109, 9
) AS source
INNER JOIN jobs j ON j.slug = source.job_slug
INNER JOIN sectors s ON s.name = source.sector_name
INNER JOIN zones z ON z.name = source.zone_name
INNER JOIN companies c ON c.name = source.company_name
ON DUPLICATE KEY UPDATE job_count=VALUES(job_count), variation_percent=VALUES(variation_percent), sector_id=VALUES(sector_id);

INSERT INTO contests (slug, name, organizer, city, field, description) VALUES
  ('concours-informatique', 'Concours d''entrée — Informatique', 'Institut Horizon', 'Brazzaville', 'Informatique', 'Sélection pour les parcours de développement logiciel et d’analyse de données.'),
  ('concours-sante', 'Concours d''entrée — Soins infirmiers', 'École Santé & Services', 'Brazzaville', 'Santé', 'Sélection indicative pour les parcours de soins infirmiers et d’analyses biomédicales.'),
  ('concours-btp', 'Concours d''entrée — Génie civil', 'Académie Bâtir', 'Pointe-Noire', 'BTP', 'Sélection indicative pour les parcours de génie civil et de maintenance.'),
  ('concours-gestion', 'Concours d''entrée — Banque & gestion', 'Centre Gestion Plus', 'Brazzaville', 'Gestion & commerce', 'Sélection indicative pour les parcours de banque, finance et assurance.')
ON DUPLICATE KEY UPDATE name=VALUES(name), organizer=VALUES(organizer), city=VALUES(city), field=VALUES(field), description=VALUES(description);

INSERT IGNORE INTO contest_series (contest_id, series_id)
SELECT c.id, bs.id FROM contests c CROSS JOIN baccalaureate_series bs
WHERE (c.slug IN ('concours-informatique', 'concours-sante', 'concours-btp') AND bs.name IN ('Série C', 'Série D'))
   OR (c.slug = 'concours-gestion' AND bs.name IN ('Série C', 'Série D', 'Série G2'));

INSERT INTO papers (contest_id, slug, label, year, document_type, page_count) VALUES
  ((SELECT id FROM contests WHERE slug='concours-informatique'), 'annale-info-2025-math', 'Mathématiques', 2025, 'Sujet', 3),
  ((SELECT id FROM contests WHERE slug='concours-informatique'), 'annale-info-2025-logique', 'Logique et raisonnement', 2025, 'Sujet + corrigé', 4),
  ((SELECT id FROM contests WHERE slug='concours-informatique'), 'annale-info-2024-math', 'Mathématiques', 2024, 'Sujet', 3),
  ((SELECT id FROM contests WHERE slug='concours-sante'), 'annale-sante-2025-bio', 'Biologie', 2025, 'Sujet', 4),
  ((SELECT id FROM contests WHERE slug='concours-sante'), 'annale-sante-2024-chimie', 'Chimie', 2024, 'Sujet + corrigé', 4),
  ((SELECT id FROM contests WHERE slug='concours-btp'), 'annale-btp-2025-math', 'Mathématiques appliquées', 2025, 'Sujet', 3),
  ((SELECT id FROM contests WHERE slug='concours-btp'), 'annale-btp-2024-tech', 'Techniques du bâtiment', 2024, 'Sujet', 5),
  ((SELECT id FROM contests WHERE slug='concours-gestion'), 'annale-gestion-2025-culture', 'Culture générale', 2025, 'Sujet', 3),
  ((SELECT id FROM contests WHERE slug='concours-gestion'), 'annale-gestion-2024-compta', 'Comptabilité', 2024, 'Sujet + corrigé', 4)
ON DUPLICATE KEY UPDATE label=VALUES(label), year=VALUES(year), document_type=VALUES(document_type), page_count=VALUES(page_count);
