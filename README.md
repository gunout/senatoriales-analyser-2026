# 🏛️ Analyseur Sénatoriales 2026

![Licence MIT](https://img.shields.io/badge/Licence-MIT-blue.svg)
![HTML5](https://img.shields.io/badge/HTML-5-E34F26?logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-3.9.1-FF6384?logo=chartdotjs&logoColor=white)
![Statut](https://img.shields.io/badge/Statut-Actif-brightgreen)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
![Made in France](https://img.shields.io/badge/Made%20in-France-0055A4)

> **Analyseur open source des candidatures aux élections sénatoriales 2026**
> Outil de visualisation des 178 sièges renouvelés (série 2) — scrutin majoritaire et proportionnel.

---

## 📋 Table des matières

- [À propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [Sources de données](#-sources-de-données)
- [Structure des fichiers](#-structure-des-fichiers)
- [Technologies](#-technologies)
- [Contribuer](#-contribuer)
- [Licence](#-licence)
- [Remerciements](#-remerciements)

---

## 🎯 À propos

Cet outil permet d'**explorer et d'analyser les candidatures officielles** aux élections sénatoriales du **27 septembre 2026**, qui renouvellent **178 sièges** de la série 2 dans **64 circonscriptions** (63 départements + une circonscription des Français de l'étranger).

Le Sénat est renouvelé par moitié tous les trois ans. Le collège électoral compte environ **162 000 grands électeurs**, composé à **95 % de délégués des conseils municipaux**.

Le mode de scrutin varie selon le nombre de sièges à pourvoir :

- **1 à 2 sièges** → scrutin **majoritaire** à deux tours (candidat + remplaçant)
- **3 sièges et plus** → scrutin **proportionnel** à la représentation proportionnelle (listes fermées)

---

## ✨ Fonctionnalités

### 📊 Analyse des données

- ✅ Chargement de **3 fichiers CSV** par glisser-déposer
- ✅ Détection automatique des colonnes (normalisation des accents et apostrophes)
- ✅ Agrégation par circonscription
- ✅ Identification des **sortants** et **têtes de liste**
- ✅ Calcul des répartitions politiques par nuance

### 🎨 Visualisation

- ✅ **Palette officielle des 25 nuances** du Ministère de l'Intérieur
- ✅ Graphique **Chart.js** interactif (répartition politique)
- ✅ Badges colorés par type de scrutin, nuance, statut
- ✅ Design **Marianne d'État** conforme au DSFR

### 🔍 Navigation

- ✅ Recherche par circonscription ou département
- ✅ Filtres par type de scrutin (majoritaire / proportionnel)
- ✅ Tris multiples (code, nom, nb candidats, nb électeurs)
- ✅ Vue détail par circonscription

### 📱 Responsive

- ✅ Interface adaptée mobile, tablette, desktop
- ✅ Accessibilité conforme RGAA (contrastes, focus, tailles)

---

## 🚀 Installation

### Option 1 : Utilisation directe (recommandée)

Aucune installation requise. Le fichier `index.html` est **autonome**.

```bash
# Cloner le dépôt
git clone https://github.com/gunout/senatoriales-analyser-2026.git

# Ouvrir dans le navigateur
cd senatoriales-analyser-2026
open index.html     # macOS
# ou
xdg-open index.html # Linux
# ou
start index.html    # Windows
```

### Option 2 : Serveur local (pour le développement)

```bash
# Avec Python 3
python3 -m http.server 8000

# Avec Node.js
npx serve

# Avec PHP
php -S localhost:8000
```

Puis ouvrir **http://localhost:8000** dans votre navigateur.

### Option 3 : GitHub Pages

Le site est accessible directement en ligne :

**🔗 https://gunout.github.io/senatoriales-analyser-2026/**

---

## 📖 Utilisation

### 1️⃣ Télécharger les données officielles

| Fichier | Source | Description |
|---|---|---|
| **Candidatures majoritaires** | [data.gouv.fr](https://www.data.gouv.fr/datasets/elections-senatoriales-2026-candidatures-aux-scrutins-majoritaire-tour-1-et-proportionnel) | Candidats individuels (1-2 sièges) |
| **Candidatures proportionnelles** | [data.gouv.fr](https://www.data.gouv.fr/datasets/elections-senatoriales-2026-candidatures-aux-scrutins-majoritaire-tour-1-et-proportionnel) | Listes fermées (3+ sièges) |
| **Inscrits par bureau de vote** | [data.gouv.fr](https://www.data.gouv.fr/datasets/elections-senatoriales-2026-nombre-dinscrits-par-bureau-de-vote) | Grands électeurs par circonscription |

### 2️⃣ Charger les fichiers

Glissez-déposez les 3 fichiers CSV dans les zones correspondantes :

```
📁 ~/Desktop/senat/
├── senatoriales-2026-candidatures-individuelles-scrutin-majoritaire.csv
├── senatoriales-2026-candidatures-listes-scrutin-proportionnel.csv
└── referentiel-des-bureaux-de-vote-sen2026csv.csv
```

### 3️⃣ Explorer

- **Cliquez** sur une carte de circonscription pour voir le détail
- **Filtrez** par type de scrutin ou par département
- **Triez** par nombre de candidats ou d'électeurs
- **Recherchez** par nom ou code

---

## 📊 Sources de données

Toutes les données proviennent de **sources officielles** :

| Dataset | Producteur | Licence |
|---|---|---|
| Candidatures sénatoriales 2026 | Ministère de l'Intérieur | Licence Ouverte 2.0 |
| Inscrits par bureau de vote | Ministère de l'Intérieur | Licence Ouverte 2.0 |
| Sénateurs sortants série 2 | Sénat | Licence Ouverte 2.0 |

**Codes de nuance officiels** : circulaire du Ministère de l'Intérieur (25 nuances : `LR`, `SOC`, `RN`, `UDR`, `HOR`, `VEC`, `COM`, `LFI`, etc.).

---

## 🗂️ Structure des fichiers

```
senatoriales-analyser-2026/
├── index.html                    # Application complète (autonome)
├── README.md                     # Ce fichier
├── LICENSE                       # Licence MIT
├── CONTRIBUTING.md               # Guide de contribution
│
├── data/                         # (non versionné)
│   ├── candidatures-majoritaire.csv
│   ├── candidatures-proportionnel.csv
│   └── inscrits-par-bureau.csv
│
└── screenshots/                  # Captures d'écran
    ├── overview.png
    └── detail.png
```

---

## 🛠️ Technologies

| Technologie | Usage |
|---|---|
| ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) | Structure |
| ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) | Design DSFR / Marianne |
| ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black) | Logique applicative |
| ![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?logo=chartdotjs&logoColor=white) | Visualisations |
| **Police Marianne** | Typographie officielle de l'État |
| **JetBrains Mono** | Chiffres et données techniques |

**Aucune dépendance npm** — tout fonctionne côté client via CDN.

---

## 🤝 Contribuer

Les contributions sont **les bienvenues** ! Voici comment procéder :

1. **Fork** le projet
2. **Créez** une branche (`git checkout -b feature/amelioration`)
3. **Committez** vos changements (`git commit -m 'Ajout de fonctionnalité X'`)
4. **Pushez** la branche (`git push origin feature/amelioration`)
5. **Ouvrez** une Pull Request

### Idées d'amélioration

- [ ] Intégration des **résultats officiels** (dès publication sur data.gouv.fr)
- [ ] Calcul automatique des **sièges attribués** (méthode de la plus forte moyenne)
- [ ] Export **PDF** des fiches de circonscription
- [ ] Comparaison **2023 vs 2026** des sièges par groupe politique
- [ ] Carte de France **interactive** (Leaflet + GeoJSON)
- [ ] Mode **sombre** automatique (`prefers-color-scheme`)
- [ ] Tests unitaires des parsers CSV

Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour plus de détails.

---

## 📄 Licence

Ce projet est sous licence **MIT** — voir [LICENSE](LICENSE) pour plus de détails.

Vous êtes libre de :

- ✅ Utiliser commercialement
- ✅ Modifier
- ✅ Distribuer
- ✅ Utiliser en privé

---

## 🙏 Remerciements

- **Ministère de l'Intérieur** — données officielles
- **data.gouv.fr** — plateforme de diffusion
- **Sénat** — informations institutionnelles
- **DSFR** (Système de Design de l'État) — inspiration design
- **Chart.js** — bibliothèque de graphiques

---

## 📞 Contact

- **Dépôt** : [gunout/senatoriales-analyser-2026](https://github.com/gunout/senatoriales-analyser-2026)
- **Issues** : [GitHub Issues](https://github.com/gunout/senatoriales-analyser-2026/issues)
- **Discussions** : [GitHub Discussions](https://github.com/gunout/senatoriales-analyser-2026/discussions)
- **Site en ligne** : [gunout.github.io/senatoriales-analyser-2026](https://gunout.github.io/senatoriales-analyser-2026/)

---

<div align="center">

**Fait avec ❤️ pour la transparence démocratique**

![République Française](https://img.shields.io/badge/République-Française-000091?style=for-the-badge)
![Liberté Égalité Fraternité](https://img.shields.io/badge/Liberté%20Égalité%20Fraternité-000091?style=for-the-badge)

*Élections sénatoriales 2026 · Série 2 · 178 sièges renouvelés*

</div>
