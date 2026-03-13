## Page 1

Développement du Module “Periodontal Chart”
Projet : Digitalisation du Dossier Patient Dentaire
1. Contexte
Dans le cadre de l’amélioration du système SaaS de gestion des dossiers patients, l’entreprise
souhaite intégrer un module de Periodontal Chart numérique.
Actuellement, le suivi parodontal est souvent réalisé sur support papier. Cette approche présente
plusieurs limitations :
Difficulté de stockage et d’archivage
Absence de suivi longitudinal automatisé
Risque d’erreurs ou perte de données
Manque de visualisation synthétique
Ce projet vise donc à développer une solution digitale interactive intégrée à l’écosystème existant.
2. Objectifs du projet
2.1 Objectif principal
Concevoir et intégrer un module permettant l’enregistrement, la visualisation et le suivi des
données parodontales de manière structurée.
2.2 Objectifs secondaires
Remplacer les fiches papier par un système digital
Améliorer la lisibilité via un odontogramme interactif
Permettre la comparaison entre plusieurs examens
Optimiser la saisie rapide en cabinet
Assurer la cohérence avec l’architecture actuelle
2.3.Patterns UX observés
 • Interface divisée en deux sections horizontales : dents supérieures (maxillaire) en haut, dents
inférieures (mandibule) en bas
  • Les racines des dents supérieures pointent vers le HAUT ; les racines des dents inférieures
pointent vers le BAS
  • Zone bleue ombrée générée automatiquement = poche parodontale (calculée depuis les
valeurs saisies)
  • Navigation par clic direct sur les cellules du tableau — pas de formulaire séparé
  • Mise à jour en temps réel : dès qu'une valeur est saisie, le dessin de la dent se met à jour
  • Affichage des statistiques globales en bas : Mean Probing Depth, Mean Attachment Level, %
Plaque, % Bleeding CAHIER DES CHARGES
MyPrescription

## Page 2

Champ TypePlage de
valeursDéfinitionValeur
normale
Gingival Margin
(GM)Numérique -10 à +10
mmPosition de la gencive par
rapport à la jonction
cémento-émail0 mm
Probing Depth
(PD)Numérique 0 à 12 mm Distance entre le fond de la
poche et le bord gingival libre≤ 3 mm
Plaque Index
(PI)Booléen (clic)0 ou 1Pourcentage de surfaces
dentaires avec présence
de plaque< 20%
Bleeding on
Probing (BOP)Booléen (clic)0 ou 1Saignement provoqué
par sondage parodontal
doux< 10%
des sites
Furcation Clic coloréGrade 0, I,
II, IIIDegré d'atteinte de la
zone de bifurcation
radiculaireGrade 0
(absent)
Mobility
(Mob.)Numérique0 à 3Amplitude de
déplacement de la dent
sous pression digitaleGrade 0
Clinical
Attachment
Level
(CAL)Numérique
calculé0 à ~20
mm PD − GM : perte d'attache
réelle (indicateur de
destruction)0 mm3.1Champs de données identifiés


## Page 3

3.3 Gestion des états
Un chart peut avoir deux états :
Draft : modifiable
Finalized : verrouillé après validation
3.4 Consultation & Historique
Liste des charts par patient
Affichage détaillé d’un chart
Comparaison entre deux dates d’examen
4. Spécifications Techniques
4.1 Backend
Base de données : PostgreSQL
Node.js + Express
Création d’une table periodontal_charts
Stockage structuré via JSONB
API REST sécurisée :
Méthode Endpoint Description
POST /patients/:id/perio-charts Création
GET /patients/:id/perio-charts Liste
GET /perio-charts/:id Détail
PUT /perio-charts/:id Modification3.2 Système FDI (ISO 3950) — Europe / Algérie
◦ Standard international adopté par la FDI World Dental Federation
◦ Notation à 2 chiffres : 1er chiffre = quadrant, 2ème chiffre = position
◦ Quadrant 1 (sup. droit patient) : 11 à 18
◦ Quadrant 2 (sup. gauche patient) : 21 à 28
◦ Quadrant 3 (inf. gauche patient) : 31 à 38
◦ Quadrant 4 (inf. droit patient) : 41 à 48
Dents temporaires : quadrants 5, 6, 7, 8

## Page 4

4.2 Modélisation de données
Structure proposée :
id (UUID)
patient_id (FK)
doctor_id (FK)
data (JSONB)
status (ENUM)
notes (TEXT)
created_at
updated_at
Index
patient_id
doctor_id
created_at
4.3 Frontend
Intégration dans le profil patient (nouvel onglet)
Visualisation graphique via SVG interactif + react 
pour l’image interactive :
Architecture technique
Framework : React (JSX)
Bundler : Vite
Langage : JavaScript / JSX
Données : JSON (indices cliniques par dent)
Graphique : SVG pour dessiner les dents
5. Livrables
Script de migration SQL
Implémentation backend
Interface frontend complète
Documentation technique
Tests unitaires


