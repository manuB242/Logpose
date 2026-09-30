const http = require('node:http');
const { URL } = require('node:url');

const PORT = Number(process.env.PORT || 8787);

/**
 * Jeu de données temporaire pour le prototype.
 * À remplacer par des sources documentées et contractualisées avant production.
 */
const opportunities = [
  { job: 'Développeur Fullstack', sector: 'Numérique', zone: 'Brazzaville', company: 'Congo Digital', employmentType: 'CDI', jobs: 142, variation: 18 },
  { job: 'Data Analyst', sector: 'Numérique', zone: 'Brazzaville', company: 'Airtel Congo', employmentType: 'CDI', jobs: 97, variation: 11 },
  { job: 'Digital Marketer', sector: 'Numérique', zone: 'Pointe-Noire', company: 'MTN Congo', employmentType: 'CDD', jobs: 76, variation: 9 },
  { job: 'Chef de chantier', sector: 'BTP', zone: 'Brazzaville', company: 'SOREMI', employmentType: 'CDI', jobs: 128, variation: 7 },
  { job: 'Technicien électricien', sector: 'BTP', zone: 'Pointe-Noire', company: 'E2C', employmentType: 'CDD', jobs: 115, variation: 6 },
  { job: 'Conducteur de travaux', sector: 'BTP', zone: 'Dolisie', company: 'SOREMI', employmentType: 'CDI', jobs: 84, variation: 4 },
  { job: 'Infirmier diplômé d’État', sector: 'Santé', zone: 'Brazzaville', company: 'Clinique Santé Plus', employmentType: 'CDI', jobs: 136, variation: 14 },
  { job: 'Laborantin', sector: 'Santé', zone: 'Pointe-Noire', company: 'Hôpital Loandjili', employmentType: 'Stage', jobs: 61, variation: 5 },
  { job: 'Aide-soignant', sector: 'Santé', zone: 'Brazzaville', company: 'Clinique Santé Plus', employmentType: 'CDD', jobs: 88, variation: 8 },
  { job: 'Agent commercial', sector: 'Commerce', zone: 'Brazzaville', company: 'CFAO Congo', employmentType: 'CDI', jobs: 121, variation: 10 },
  { job: 'Responsable logistique', sector: 'Commerce', zone: 'Pointe-Noire', company: 'CFAO Congo', employmentType: 'CDI', jobs: 93, variation: 12 },
  { job: 'Conseiller clientèle', sector: 'Finance', zone: 'Brazzaville', company: 'BGFI Bank', employmentType: 'CDI', jobs: 102, variation: 8 },
  { job: 'Assistant comptable', sector: 'Finance', zone: 'Pointe-Noire', company: 'BGFI Bank', employmentType: 'Stage', jobs: 65, variation: 6 },
  { job: 'Technicien environnement', sector: 'Environnement', zone: 'Ouesso', company: 'CIB Olam', employmentType: 'CDI', jobs: 72, variation: 15 },
  { job: 'Animateur agricole', sector: 'Agriculture', zone: 'Nkayi', company: 'Agri Congo', employmentType: 'Alternance', jobs: 59, variation: 13 },
  { job: 'Mécanicien industriel', sector: 'Industrie', zone: 'Pointe-Noire', company: 'Pointe-Noire Industrie', employmentType: 'CDI', jobs: 109, variation: 9 }
];

const categories = [
  { id: 'numerique', name: 'Métiers du numérique', description: 'Concevoir, analyser et faire grandir les services numériques.', symbol: '⌘' },
  { id: 'btp', name: 'Métiers du bâtiment', description: 'Construire, planifier et sécuriser les ouvrages.', symbol: '⌁' },
  { id: 'sante', name: 'Métiers de la santé', description: 'Prévenir, soigner et accompagner les patients.', symbol: '✚' },
  { id: 'environnement', name: "Métiers de l'environnement", description: 'Préserver les ressources et agir sur le terrain.', symbol: '◌' },
  { id: 'finance', name: 'Métiers de la gestion', description: 'Conseiller, organiser et piloter les activités.', symbol: '↗' }
];

/**
 * Référentiel de démonstration pour le lot catalogue.
 * Le contenu devra être validé par des établissements et professionnels référents.
 */
const jobs = [
  {
    id: 'developpeur-fullstack', name: 'Développeur Fullstack', categoryId: 'numerique', sector: 'Numérique',
    description: 'Il ou elle conçoit les interfaces et les services qui font fonctionner une application numérique.',
    mission: 'Le développeur fullstack transforme un besoin en produit numérique utilisable. Il travaille à la fois sur la partie visible d’une application et sur les services qui traitent les données, en lien avec des designers, chefs de projet et autres développeurs.',
    profile: 'Aime résoudre des problèmes, apprendre en continu et construire des solutions concrètes.',
    skills: ['JavaScript / TypeScript', 'Bases de données', 'Interfaces web', 'API REST', 'Git'],
    trainings: [
      { name: 'Licence informatique', level: 'Bac +3', format: 'Université ou école spécialisée' },
      { name: 'Développement logiciel', level: 'Certification', format: 'Formation professionnalisante' }
    ],
    companies: ['Congo Digital', 'Airtel Congo', 'MTN Congo']
  },
  {
    id: 'data-analyst', name: 'Data Analyst', categoryId: 'numerique', sector: 'Numérique',
    description: 'Il ou elle transforme des données en informations utiles pour guider les décisions.',
    mission: 'Le data analyst collecte, nettoie et analyse des données afin d’identifier des tendances. Il crée des tableaux de bord et explique ses résultats de façon accessible aux équipes métier.',
    profile: 'Aime comprendre les chiffres, structurer une question et expliquer ce qui compte.',
    skills: ['Excel avancé', 'SQL', 'Visualisation de données', 'Statistiques', 'Esprit de synthèse'],
    trainings: [
      { name: 'Licence statistiques ou informatique', level: 'Bac +3', format: 'Université' },
      { name: 'Analyse de données', level: 'Certification', format: 'Formation spécialisée' }
    ],
    companies: ['Airtel Congo', 'BGFI Bank', 'Congo Digital']
  },
  {
    id: 'digital-marketer', name: 'Digital Marketer', categoryId: 'numerique', sector: 'Numérique',
    description: 'Il ou elle développe la visibilité d’une organisation sur les canaux numériques.',
    mission: 'Le digital marketer prépare des campagnes, crée ou coordonne les contenus, suit leurs résultats et améliore la présence d’une marque auprès de ses publics.',
    profile: 'Créatif, curieux des usages et à l’aise avec la communication comme les chiffres.',
    skills: ['Réseaux sociaux', 'Création de contenu', 'Publicité en ligne', 'SEO', 'Analyse de campagne'],
    trainings: [
      { name: 'Marketing et communication', level: 'Bac +3', format: 'École ou université' },
      { name: 'Marketing digital', level: 'Certification', format: 'Formation spécialisée' }
    ],
    companies: ['MTN Congo', 'CFAO Congo', 'Congo Digital']
  },
  {
    id: 'product-manager', name: 'Product Manager', categoryId: 'numerique', sector: 'Numérique',
    description: 'Il ou elle fait le lien entre les besoins des utilisateurs, la stratégie et l’équipe de réalisation.',
    mission: 'Le product manager définit les priorités d’un produit, écoute les utilisateurs, rédige les besoins et coordonne les décisions avec les équipes techniques et métier.',
    profile: 'Aime les projets collectifs, l’écoute utilisateur et l’organisation de problèmes complexes.',
    skills: ['Recherche utilisateur', 'Gestion de produit', 'Priorisation', 'Communication', 'Analyse métier'],
    trainings: [
      { name: 'Gestion, informatique ou marketing', level: 'Bac +3', format: 'Université ou école' },
      { name: 'Product management', level: 'Certification', format: 'Formation spécialisée' }
    ],
    companies: ['Congo Digital', 'Airtel Congo', 'MTN Congo']
  },
  {
    id: 'chef-de-chantier', name: 'Chef de chantier', categoryId: 'btp', sector: 'BTP',
    description: 'Il ou elle organise les équipes et veille au bon déroulement d’un chantier.',
    mission: 'Le chef de chantier prépare le travail quotidien, suit l’avancement, répartit les tâches et s’assure du respect des délais ainsi que des règles de sécurité.',
    profile: 'Apprécie le terrain, l’organisation d’équipe et la réalisation visible de projets.',
    skills: ['Lecture de plans', 'Organisation de chantier', 'Sécurité', 'Gestion d’équipe', 'Suivi des travaux'],
    trainings: [
      { name: 'Génie civil ou BTP', level: 'Bac +2 / +3', format: 'École technique ou université' },
      { name: 'Conduite de chantier', level: 'Certification', format: 'Formation technique' }
    ],
    companies: ['SOREMI', 'E2C', 'Pointe-Noire Industrie']
  },
  {
    id: 'technicien-electricien', name: 'Technicien électricien', categoryId: 'btp', sector: 'BTP',
    description: 'Il ou elle installe, contrôle et entretient des équipements électriques.',
    mission: 'Le technicien électricien lit les schémas, réalise les installations, effectue les tests et intervient pour diagnostiquer les pannes, dans le respect des règles de sécurité.',
    profile: 'Précis, méthodique et attiré par la technique appliquée sur le terrain.',
    skills: ['Électricité', 'Lecture de schémas', 'Maintenance', 'Diagnostic', 'Prévention des risques'],
    trainings: [
      { name: 'Électrotechnique', level: 'Bac +2', format: 'École technique' },
      { name: 'Maintenance électrique', level: 'Certification', format: 'Formation professionnelle' }
    ],
    companies: ['E2C', 'SOREMI', 'Pointe-Noire Industrie']
  },
  {
    id: 'infirmier-de', name: 'Infirmier diplômé d’État', categoryId: 'sante', sector: 'Santé',
    description: 'Il ou elle dispense des soins, surveille les patients et travaille avec l’équipe médicale.',
    mission: 'L’infirmier évalue les besoins de soin, applique les prescriptions, accompagne les patients et leurs proches, puis transmet les informations essentielles à l’équipe de santé.',
    profile: 'Empathique, rigoureux et capable de rester attentif dans un environnement exigeant.',
    skills: ['Soins infirmiers', 'Écoute', 'Hygiène', 'Travail d’équipe', 'Organisation'],
    trainings: [
      { name: 'Diplôme d’État infirmier', level: 'Bac +3', format: 'Institut de formation agréé' },
      { name: 'Soins d’urgence', level: 'Certification', format: 'Formation complémentaire' }
    ],
    companies: ['Clinique Santé Plus', 'Hôpital Loandjili']
  },
  {
    id: 'laborantin', name: 'Laborantin', categoryId: 'sante', sector: 'Santé',
    description: 'Il ou elle réalise des analyses et assure la fiabilité des résultats de laboratoire.',
    mission: 'Le laborantin prépare les prélèvements, applique les protocoles d’analyse, contrôle les équipements et consigne les résultats en respectant les exigences d’hygiène.',
    profile: 'Aime les sciences expérimentales, les protocoles précis et l’observation.',
    skills: ['Analyses biologiques', 'Protocoles', 'Hygiène', 'Contrôle qualité', 'Traçabilité'],
    trainings: [
      { name: 'Analyses biomédicales', level: 'Bac +2 / +3', format: 'Institut ou université' },
      { name: 'Techniques de laboratoire', level: 'Certification', format: 'Formation spécialisée' }
    ],
    companies: ['Hôpital Loandjili', 'Clinique Santé Plus']
  },
  {
    id: 'technicien-environnement', name: 'Technicien environnement', categoryId: 'environnement', sector: 'Environnement',
    description: 'Il ou elle observe les impacts des activités et met en œuvre des actions de protection.',
    mission: 'Le technicien environnement effectue des relevés, suit des indicateurs, sensibilise les équipes et participe à l’application de plans de gestion environnementale sur le terrain.',
    profile: 'Attiré par les sciences, le terrain et la préservation des ressources naturelles.',
    skills: ['Suivi environnemental', 'Collecte de données', 'Biodiversité', 'Rédaction de rapports', 'Sensibilisation'],
    trainings: [
      { name: 'Sciences de l’environnement', level: 'Bac +3', format: 'Université ou école spécialisée' },
      { name: 'Gestion environnementale', level: 'Certification', format: 'Formation technique' }
    ],
    companies: ['CIB Olam', 'Agri Congo']
  },
  {
    id: 'conseiller-clientele', name: 'Conseiller clientèle', categoryId: 'finance', sector: 'Finance',
    description: 'Il ou elle accompagne les clients dans le choix et le suivi de services financiers.',
    mission: 'Le conseiller clientèle accueille les demandes, présente les solutions adaptées, suit les dossiers et contribue à instaurer une relation de confiance durable.',
    profile: 'À l’aise dans l’échange, organisé et intéressé par les besoins des personnes ou entreprises.',
    skills: ['Relation client', 'Produits financiers', 'Écoute active', 'Gestion de dossier', 'Rigueur'],
    trainings: [
      { name: 'Banque, finance ou gestion', level: 'Bac +2 / +3', format: 'École ou université' },
      { name: 'Conseil clientèle', level: 'Certification', format: 'Formation bancaire' }
    ],
    companies: ['BGFI Bank', 'CFAO Congo']
  },
  {
    id: 'agent-commercial', name: 'Agent commercial', categoryId: 'finance', sector: 'Commerce',
    description: 'Il ou elle développe les ventes en comprenant les besoins de ses clients.',
    mission: 'L’agent commercial prospecte, conseille les clients, présente des solutions adaptées et suit les échanges jusqu’à la réalisation de la vente.',
    profile: 'Aime échanger, convaincre avec écoute et se fixer des objectifs concrets.',
    skills: ['Relation client', 'Négociation', 'Écoute', 'Organisation', 'Suivi commercial'],
    trainings: [
      { name: 'Commerce et vente', level: 'Bac +2', format: 'École ou formation professionnelle' },
      { name: 'Techniques commerciales', level: 'Certification', format: 'Formation spécialisée' }
    ],
    companies: ['CFAO Congo', 'MTN Congo']
  },
  {
    id: 'responsable-logistique', name: 'Responsable logistique', categoryId: 'finance', sector: 'Commerce',
    description: 'Il ou elle organise les flux de marchandises, les stocks et les livraisons.',
    mission: 'Le responsable logistique coordonne les approvisionnements, suit les stocks et améliore les parcours de livraison pour que les produits soient disponibles au bon moment.',
    profile: 'Méthodique, réactif et intéressé par l’organisation de systèmes concrets.',
    skills: ['Gestion des stocks', 'Planification', 'Coordination', 'Outils de suivi', 'Résolution de problèmes'],
    trainings: [
      { name: 'Logistique et transport', level: 'Bac +2 / +3', format: 'École ou université' },
      { name: 'Gestion de la chaîne logistique', level: 'Certification', format: 'Formation professionnelle' }
    ],
    companies: ['CFAO Congo', 'Pointe-Noire Industrie']
  },
  {
    id: 'assistant-comptable', name: 'Assistant comptable', categoryId: 'finance', sector: 'Finance',
    description: 'Il ou elle participe au suivi quotidien des opérations comptables d’une organisation.',
    mission: 'L’assistant comptable enregistre les pièces, aide au suivi des factures, prépare les rapprochements et contribue à la fiabilité des informations financières.',
    profile: 'Rigoureux, à l’aise avec les chiffres et attentif aux détails.',
    skills: ['Comptabilité générale', 'Tableurs', 'Classement', 'Rigueur', 'Organisation'],
    trainings: [
      { name: 'Comptabilité et gestion', level: 'Bac +2', format: 'École ou université' },
      { name: 'Pratique comptable', level: 'Certification', format: 'Formation professionnelle' }
    ],
    companies: ['BGFI Bank', 'CFAO Congo']
  },
  {
    id: 'conducteur-de-travaux', name: 'Conducteur de travaux', categoryId: 'btp', sector: 'BTP',
    description: 'Il ou elle pilote la préparation et la coordination globale d’un ou plusieurs chantiers.',
    mission: 'Le conducteur de travaux planifie les moyens nécessaires, suit les coûts et les délais, puis coordonne les intervenants pour assurer la bonne exécution des ouvrages.',
    profile: 'Aime organiser des projets de terrain et prendre des décisions avec méthode.',
    skills: ['Planification', 'Gestion de budget', 'Lecture de plans', 'Coordination', 'Qualité et sécurité'],
    trainings: [
      { name: 'Génie civil ou BTP', level: 'Bac +3', format: 'Université ou école technique' },
      { name: 'Conduite de travaux', level: 'Certification', format: 'Formation spécialisée' }
    ],
    companies: ['SOREMI', 'E2C']
  },
  {
    id: 'aide-soignant', name: 'Aide-soignant', categoryId: 'sante', sector: 'Santé',
    description: 'Il ou elle accompagne les personnes dans les gestes essentiels du quotidien et dans leur confort.',
    mission: 'L’aide-soignant assure des soins d’hygiène et de confort, observe l’état des patients et travaille sous la responsabilité de l’équipe soignante.',
    profile: 'Patient, attentif aux autres et à l’aise dans le travail collectif.',
    skills: ['Accompagnement', 'Hygiène', 'Observation', 'Écoute', 'Travail d’équipe'],
    trainings: [
      { name: 'Aide-soignant', level: 'Certification', format: 'Institut de formation agréé' },
      { name: 'Hygiène et premiers gestes', level: 'Certification', format: 'Formation complémentaire' }
    ],
    companies: ['Clinique Santé Plus', 'Hôpital Loandjili']
  },
  {
    id: 'animateur-agricole', name: 'Animateur agricole', categoryId: 'environnement', sector: 'Agriculture',
    description: 'Il ou elle accompagne les producteurs dans l’adoption de pratiques agricoles adaptées.',
    mission: 'L’animateur agricole organise des démonstrations, partage des conseils techniques et recueille les besoins des exploitants pour soutenir le développement local.',
    profile: 'Aime le terrain, la transmission et le contact avec les communautés.',
    skills: ['Techniques agricoles', 'Animation', 'Écoute', 'Planification', 'Sensibilisation'],
    trainings: [
      { name: 'Agronomie ou développement rural', level: 'Bac +2 / +3', format: 'École ou université' },
      { name: 'Conseil agricole', level: 'Certification', format: 'Formation de terrain' }
    ],
    companies: ['Agri Congo', 'CIB Olam']
  },
  {
    id: 'mecanicien-industriel', name: 'Mécanicien industriel', categoryId: 'btp', sector: 'Industrie',
    description: 'Il ou elle entretient et répare les équipements mécaniques utilisés dans les installations industrielles.',
    mission: 'Le mécanicien industriel réalise les contrôles, diagnostique les dysfonctionnements et intervient pour maintenir les machines en état de fonctionnement.',
    profile: 'Pratique, curieux du fonctionnement des machines et attentif à la sécurité.',
    skills: ['Mécanique', 'Maintenance préventive', 'Diagnostic', 'Lecture de plans', 'Sécurité'],
    trainings: [
      { name: 'Maintenance industrielle', level: 'Bac +2', format: 'École technique' },
      { name: 'Mécanique industrielle', level: 'Certification', format: 'Formation professionnelle' }
    ],
    companies: ['Pointe-Noire Industrie', 'SOREMI']
  }
];

const establishments = [
  {
    id: 'institut-horizon', name: 'Institut Horizon', city: 'Brazzaville', country: 'République du Congo',
    programs: [
      { id: 'dev-web', field: 'Informatique', name: 'Développement logiciel', duration: '3 ans', series: ['Série C', 'Série D'], jobs: ['Développeur Fullstack', 'Data Analyst'] },
      { id: 'data', field: 'Informatique', name: 'Analyse de données', duration: '3 ans', series: ['Série C', 'Série D'], jobs: ['Data Analyst'] }
    ]
  },
  {
    id: 'campus-avenir', name: 'Campus Avenir', city: 'Pointe-Noire', country: 'République du Congo',
    programs: [
      { id: 'marketing', field: 'Marketing & communication', name: 'Marketing digital', duration: '2 ans', series: ['Série A', 'Série C', 'Série D'], jobs: ['Digital Marketer', 'Product Manager', 'Agent commercial'] },
      { id: 'logistique', field: 'Gestion & commerce', name: 'Logistique et transport', duration: '2 ans', series: ['Série C', 'Série D', 'Série G2'], jobs: ['Responsable logistique'] }
    ]
  },
  {
    id: 'ecole-sante-services', name: 'École Santé & Services', city: 'Brazzaville', country: 'République du Congo',
    programs: [
      { id: 'infirmier', field: 'Santé', name: 'Soins infirmiers', duration: '3 ans', series: ['Série C', 'Série D'], jobs: ['Infirmier diplômé d’État', 'Aide-soignant'] },
      { id: 'laboratoire', field: 'Santé', name: 'Analyses biomédicales', duration: '3 ans', series: ['Série C', 'Série D'], jobs: ['Laborantin'] }
    ]
  },
  {
    id: 'academie-batir', name: 'Académie Bâtir', city: 'Pointe-Noire', country: 'République du Congo',
    programs: [
      { id: 'genie-civil', field: 'BTP', name: 'Génie civil', duration: '3 ans', series: ['Série C', 'Série D'], jobs: ['Chef de chantier', 'Conducteur de travaux'] },
      { id: 'maintenance', field: 'BTP', name: 'Maintenance électromécanique', duration: '2 ans', series: ['Série C', 'Série D'], jobs: ['Technicien électricien', 'Mécanicien industriel'] }
    ]
  },
  {
    id: 'institut-vert', name: 'Institut Vert', city: 'Dolisie', country: 'République du Congo',
    programs: [
      { id: 'environnement', field: 'Environnement', name: 'Gestion environnementale', duration: '3 ans', series: ['Série C', 'Série D'], jobs: ['Technicien environnement', 'Animateur agricole'] }
    ]
  },
  {
    id: 'centre-gestion-plus', name: 'Centre Gestion Plus', city: 'Brazzaville', country: 'République du Congo',
    programs: [
      { id: 'banque', field: 'Gestion & commerce', name: 'Banque, finance et assurance', duration: '2 ans', series: ['Série C', 'Série D', 'Série G2'], jobs: ['Conseiller clientèle', 'Assistant comptable'] }
    ]
  }
];

const contests = [
  {
    id: 'concours-informatique', name: "Concours d'entrée — Informatique", organizer: 'Institut Horizon', city: 'Brazzaville', field: 'Informatique', series: ['Série C', 'Série D'],
    description: 'Sélection pour les parcours de développement logiciel et d’analyse de données.',
    papers: [
      { id: 'annale-info-2025-math', label: 'Mathématiques', year: 2025, type: 'Sujet', pages: 3 },
      { id: 'annale-info-2025-logique', label: 'Logique et raisonnement', year: 2025, type: 'Sujet + corrigé', pages: 4 },
      { id: 'annale-info-2024-math', label: 'Mathématiques', year: 2024, type: 'Sujet', pages: 3 }
    ]
  },
  {
    id: 'concours-sante', name: "Concours d'entrée — Soins infirmiers", organizer: 'École Santé & Services', city: 'Brazzaville', field: 'Santé', series: ['Série C', 'Série D'],
    description: 'Sélection indicative pour les parcours de soins infirmiers et d’analyses biomédicales.',
    papers: [
      { id: 'annale-sante-2025-bio', label: 'Biologie', year: 2025, type: 'Sujet', pages: 4 },
      { id: 'annale-sante-2024-chimie', label: 'Chimie', year: 2024, type: 'Sujet + corrigé', pages: 4 }
    ]
  },
  {
    id: 'concours-btp', name: "Concours d'entrée — Génie civil", organizer: 'Académie Bâtir', city: 'Pointe-Noire', field: 'BTP', series: ['Série C', 'Série D'],
    description: 'Sélection indicative pour les parcours de génie civil et de maintenance.',
    papers: [
      { id: 'annale-btp-2025-math', label: 'Mathématiques appliquées', year: 2025, type: 'Sujet', pages: 3 },
      { id: 'annale-btp-2024-tech', label: 'Techniques du bâtiment', year: 2024, type: 'Sujet', pages: 5 }
    ]
  },
  {
    id: 'concours-gestion', name: "Concours d'entrée — Banque & gestion", organizer: 'Centre Gestion Plus', city: 'Brazzaville', field: 'Gestion & commerce', series: ['Série C', 'Série D', 'Série G2'],
    description: 'Sélection indicative pour les parcours de banque, finance et assurance.',
    papers: [
      { id: 'annale-gestion-2025-culture', label: 'Culture générale', year: 2025, type: 'Sujet', pages: 3 },
      { id: 'annale-gestion-2024-compta', label: 'Comptabilité', year: 2024, type: 'Sujet + corrigé', pages: 4 }
    ]
  }
];

const unique = (values) => [...new Set(values)].sort((a, b) => a.localeCompare(b, 'fr'));
const parseList = (value) => (value ? value.split(',').filter(Boolean) : []);
const inFilter = (value, selected) => selected.length === 0 || selected.includes(value);
const sum = (rows) => rows.reduce((total, row) => total + row.jobs, 0);

function aggregateBy(rows, property, label) {
  const values = new Map();
  rows.forEach((row) => values.set(row[property], (values.get(row[property]) || 0) + row.jobs));
  return [...values.entries()]
    .map(([name, value]) => ({ [label]: name, value }))
    .sort((a, b) => b.value - a.value);
}

function jobSummary(job) {
  const category = categories.find((item) => item.id === job.categoryId);
  return {
    id: job.id,
    name: job.name,
    categoryId: job.categoryId,
    category: category?.name || 'Autres métiers',
    categorySymbol: category?.symbol || '•',
    sector: job.sector,
    description: job.description,
    profile: job.profile
  };
}

function getCatalog(searchParams) {
  const categoryId = searchParams.get('category');
  const term = (searchParams.get('q') || '').trim().toLocaleLowerCase('fr');
  const items = jobs
    .filter((job) => !categoryId || job.categoryId === categoryId)
    .filter((job) => !term || `${job.name} ${job.description} ${job.sector}`.toLocaleLowerCase('fr').includes(term))
    .map(jobSummary);

  return {
    metadata: {
      dataStatus: 'demonstration',
      source: 'Référentiel métiers fictif LogPose — contenu à faire valider avant diffusion.'
    },
    categories: categories.map((category) => ({
      ...category,
      jobCount: jobs.filter((job) => job.categoryId === category.id).length
    })),
    items
  };
}

function getEducationOptions() {
  const programs = establishments.flatMap((establishment) => establishment.programs);
  return {
    series: unique(programs.flatMap((program) => program.series)),
    fields: unique(programs.map((program) => program.field)),
    jobs: unique(programs.flatMap((program) => program.jobs))
  };
}

function getEstablishments(searchParams) {
  const series = parseList(searchParams.get('series'));
  const fields = parseList(searchParams.get('fields'));
  const jobsFilter = parseList(searchParams.get('jobs'));
  const items = establishments.flatMap((establishment) => establishment.programs.map((program) => ({
    id: `${establishment.id}-${program.id}`,
    establishmentId: establishment.id,
    establishment: establishment.name,
    city: establishment.city,
    country: establishment.country,
    field: program.field,
    program: program.name,
    duration: program.duration,
    series: program.series,
    jobs: program.jobs
  }))).filter((item) =>
    (series.length === 0 || item.series.some((value) => series.includes(value))) &&
    (fields.length === 0 || fields.includes(item.field)) &&
    (jobsFilter.length === 0 || item.jobs.some((value) => jobsFilter.includes(value)))
  );
  return {
    metadata: { dataStatus: 'demonstration', source: 'Référentiel établissements fictif LogPose — données à contractualiser.' },
    appliedFilters: { series, fields, jobs: jobsFilter },
    items
  };
}

function getContestOptions() {
  return {
    series: unique(contests.flatMap((contest) => contest.series)),
    fields: unique(contests.map((contest) => contest.field))
  };
}

function contestSummary(contest) {
  return {
    id: contest.id,
    name: contest.name,
    organizer: contest.organizer,
    city: contest.city,
    field: contest.field,
    series: contest.series,
    description: contest.description,
    paperCount: contest.papers.length
  };
}

function getContests(searchParams) {
  const series = parseList(searchParams.get('series'));
  const fields = parseList(searchParams.get('fields'));
  return {
    metadata: { dataStatus: 'demonstration', source: 'Référentiel concours fictif LogPose — dates et pièces à confirmer.' },
    appliedFilters: { series, fields },
    items: contests
      .filter((contest) => (series.length === 0 || contest.series.some((value) => series.includes(value))) && (fields.length === 0 || fields.includes(contest.field)))
      .map(contestSummary)
  };
}

function getContestPapers(id) {
  const contest = contests.find((item) => item.id === id);
  if (!contest) return null;
  return {
    metadata: { dataStatus: 'demonstration', source: 'Référentiel annales fictif LogPose — aucun fichier source n’est encore publié.' },
    contest: contestSummary(contest),
    papers: contest.papers
  };
}

function getDashboard(searchParams) {
  const zones = parseList(searchParams.get('zones'));
  const sectors = parseList(searchParams.get('sectors'));
  const companies = parseList(searchParams.get('companies'));
  const employmentTypes = parseList(searchParams.get('employmentTypes'));
  const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 5, 1), 10);

  const rows = opportunities.filter((item) =>
    inFilter(item.zone, zones) &&
    inFilter(item.sector, sectors) &&
    inFilter(item.company, companies) &&
    inFilter(item.employmentType, employmentTypes)
  );

  const jobsCreated = sum(rows);
  const weightedVariation = jobsCreated === 0
    ? 0
    : Math.round(rows.reduce((total, row) => total + row.jobs * row.variation, 0) / jobsCreated);
  const sectorDistribution = aggregateBy(rows, 'sector', 'name').map((item) => ({
    ...item,
    percent: jobsCreated === 0 ? 0 : Math.round((item.value / jobsCreated) * 100)
  }));

  return {
    metadata: {
      period: searchParams.get('period') || '2026',
      lastUpdated: '27 septembre 2026',
      dataStatus: 'demonstration',
      source: 'Jeu de données fictif LogPose — ne pas utiliser comme statistique officielle.'
    },
    appliedFilters: { zones, sectors, companies, employmentTypes },
    kpis: { jobsCreated, variationPercent: weightedVariation },
    sectorDistribution,
    topJobs: aggregateBy(rows, 'job', 'name')
      .map((item) => ({ ...item, id: jobs.find((job) => job.name === item.name)?.id || null }))
      .slice(0, limit),
    topCompanies: aggregateBy(rows, 'company', 'name').slice(0, 5),
    totalRows: rows.length
  };
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(payload));
}

function requestHandler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'GET' && url.pathname === '/api/health') {
    return sendJson(res, 200, { status: 'ok' });
  }

  if (req.method === 'GET' && url.pathname === '/api/filter-options') {
    return sendJson(res, 200, {
      zones: unique(opportunities.map((item) => item.zone)),
      sectors: unique(opportunities.map((item) => item.sector)),
      companies: unique(opportunities.map((item) => item.company)),
      employmentTypes: unique(opportunities.map((item) => item.employmentType))
    });
  }

  if (req.method === 'GET' && url.pathname === '/api/dashboard') {
    return sendJson(res, 200, getDashboard(url.searchParams));
  }

  if (req.method === 'GET' && url.pathname === '/api/metiers') {
    return sendJson(res, 200, getCatalog(url.searchParams));
  }

  const jobMatch = url.pathname.match(/^\/api\/metiers\/([^/]+)$/);
  if (req.method === 'GET' && jobMatch) {
    const job = jobs.find((item) => item.id === decodeURIComponent(jobMatch[1]));
    if (!job) return sendJson(res, 404, { error: 'Métier introuvable.' });
    return sendJson(res, 200, {
      metadata: { dataStatus: 'demonstration', source: 'Référentiel métiers fictif LogPose.' },
      item: { ...jobSummary(job), mission: job.mission, skills: job.skills, trainings: job.trainings, companies: job.companies }
    });
  }

  if (req.method === 'GET' && url.pathname === '/api/etablissements/options') {
    return sendJson(res, 200, getEducationOptions());
  }

  if (req.method === 'GET' && url.pathname === '/api/etablissements') {
    return sendJson(res, 200, getEstablishments(url.searchParams));
  }

  if (req.method === 'GET' && url.pathname === '/api/concours/options') {
    return sendJson(res, 200, getContestOptions());
  }

  if (req.method === 'GET' && url.pathname === '/api/concours') {
    return sendJson(res, 200, getContests(url.searchParams));
  }

  const contestPapersMatch = url.pathname.match(/^\/api\/concours\/([^/]+)\/annales$/);
  if (req.method === 'GET' && contestPapersMatch) {
    const payload = getContestPapers(decodeURIComponent(contestPapersMatch[1]));
    return payload ? sendJson(res, 200, payload) : sendJson(res, 404, { error: 'Concours introuvable.' });
  }

  const paperDownloadMatch = url.pathname.match(/^\/api\/annales\/([^/]+)\/telechargement$/);
  if (req.method === 'GET' && paperDownloadMatch) {
    return sendJson(res, 409, {
      error: 'Aucun fichier n’est disponible pour cette référence de démonstration.',
      code: 'DEMO_FILE_UNAVAILABLE'
    });
  }

  return sendJson(res, 404, { error: 'Route introuvable.' });
}

const server = http.createServer(requestHandler);
server.listen(PORT, '0.0.0.0', () => {
  console.log(`API LogPose disponible sur http://0.0.0.0:${PORT}`);
});
