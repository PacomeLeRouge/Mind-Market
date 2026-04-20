# Mind&Market

**Borne interactive de questions avec enregistrement audio vocal**

Une application React/Vite conçue pour un dispositif d'écran vertical (9:16). Cette borne permet aux visiteurs de répondre à des questions via enregistrement vocal et facilite la collecte d'insights pour les porteurs de projets.

---

## 🎯 Fonctionnement

L'application guide l'utilisateur à travers 5 étapes :

1. **`question`** — Affichage rotatif des questions (8s par question)
2. **`speak`** — Affichage de la question sélectionnée + appel à l'action
3. **`recording`** — Indicateur visuel d'enregistrement
4. **`confirm`** — Validation ou refus de la réponse
5. **`thanks`** — Message de remerciement (retour automatique après 10s)

---

## 🛠 Stack technique

- **Frontend** : React 18 + Vite
- **Backend** : Node.js/Express
- **Audio** : WebM Format (API MediaRecorder)
- **Contrôle matériel** : Python (bridge pour joystick)
- **Styling** : CSS natif (responsive, rotation 90°)

---

## 📁 Structure du projet

```
Mind-Market/
├── src/                          # Code React
│   ├── App.jsx                   # Cœur de l'application (logique + rendu)
│   ├── main.jsx                  # Point d'entrée
│   ├── styles.css                # Styles globaux (layout 9:16, animations)
│   └── svg/
│       ├── index.js              # Imports SVG
│       ├── Green_Button.svg       # Bouton de validation
│       ├── Red_Button.svg         # Bouton d'annulation
│       ├── Hand.svg               # Curseur/pointeur
│       ├── Joystick.svg           # Illustration joystick
│       ├── OpenHub.svg            # Logo partenaire
│       └── Whisper.svg            # Logo microphone
│
├── server.js                      # API Express (upload, questions)
├── bridge.py                      # Gestionnaire joystick + rotation écran
├── questions.json                 # Base de questions
├── uploads/                       # Dossier des enregistrements audio
│  
│
├── kiosk.sh                       # Script de lancement kiosk Chromium
├── start_borne.sh                 # Démarrage complet du système
├── package.json                   # Dépendances Node.js
├── vite.config.js                 # Configuration Vite
├── index.html                     # Template HTML
└── README.md
```

---

## 🚀 Installation

### Prérequis
- Node.js 16+
- npm ou yarn
- Python 3 (pour le bridge, sur Raspberry Pi uniquement)

### Installation des dépendances

```bash
npm install
```

---

## 💻 Développement

### Frontend + Backend ensemble

**Terminal 1 — Interface (Vite dev server) :**
```bash
npm run dev
```
Ouvre sur `http://localhost:5173`

**Terminal 2 — API (Express) :**
```bash
npm run server
```
Serveur disponible sur `http://localhost:3001`

> Les deux doivent tourner simultanément en développement.

### Prévisualiser une build

```bash
npm run build
npm run preview
```

---

## 🎮 Contrôles

### Joystick DragonRise (sur borne Raspberry Pi)

| Action | Touche mappée | Résultat |
|--------|---------------|----------|
| **Joystick haut** | `ArrowDown` | Passer à la question suivante |
| **Joystick bas** | `ArrowUp` | Revenir à la question précédente |
| **Joystick gauche/droite** | `ArrowUp/Down` | Parcourir les questions |
| **Bouton vert** | `Enter` | Valider/Continuer |
| **Bouton rouge** | `Escape` | Annuler/Recommencer |
| **Joystick haut (5s)** | Rotation écran | Tourner de 90° (normal → right → inverted → left) |

> Mappé par `bridge.py` via `evdev` sur le Raspberry Pi.

---

## API Serveur

### POST `/api/upload-audio`
Enregistrer une réponse audio.

**Body:**
```json
{
  "audio": <fichier WebM>,
  "questionId": "q_001",
  "authorId": "YUPI",
  "questionText": "Est-ce que vous lisez les étiquettes..."
}
```

**Response:**
```json
{
  "success": true,
  "filename": "author-YUPI_question-q_001_1679452800000.webm",
  "filepath": "/path/to/uploads/...",
  "fileSize": 125480
}
```

Fichiers générés :
- `author-ID_question-ID_TSTAMP.webm` → Fichier audio
- `author-ID_question-ID_TSTAMP.json` → Métadonnées (timestamp, size, etc.)

---

### GET `/api/questions`
Récupérer la liste des questions.

**Response:**
```json
[
  {
    "id": "q_001",
    "authorId": "YUPI",
    "projectName": "YUPI",
    "text": "Est-ce que vous lisez les étiquettes des boissons..."
  }
]
```

---

### GET `/api/audios`
Lister tous les enregistrements.

**Response:**
```json
{
  "count": 42,
  "audios": [
    {
      "filename": "author-YUPI_question-q_001_1679452800000.webm",
      "path": "/uploads/...",
      "created": "2023-03-21T10:00:00.000Z"
    }
  ]
}
```

---

## ❓ Gestion des Questions

Les questions sont dans `questions.json` :

```json
{
  "id": "q_001",           // Identifiant unique
  "authorId": "YUPI",      // ID du porteur de projet
  "projectName": "YUPI",   // Nom affiché
  "text": "Est-ce que..."   // Question
}
```

### Ajouter une question

1. Ouvrir `questions.json`
2. Ajouter un nouvel objet :
```json
{
  "id": "q_011",
  "authorId": "NEW_PROJECT",
  "projectName": "NEW PROJECT",
  "text": "Votre question ici ?"
}
```
3. **Production** : Relancer le serveur

> Les questions sont chargées dynamiquement et mélangées à chaque démarrage de l'app.

---

## Production (Rock Pi)

### Installation sur la borne

```bash
cd ~/Mind-Market
npm run build
```

### Démarrage automatique

Le script `start_borne.sh` lance l'ensemble du système :

```bash
./start_borne.sh
```

Il :
1. Désactive la veille de l'écran
2. Configure l'audio USB
3. Lance le serveur Node.js via PM2
4. Lance le bridge Python (joystick + rotation)
5. Ouvre Chromium en mode kiosk plein écran

### Dépannage (accès console)

1. Brancher un clavier USB
2. `ALT + F4` → Quitter l'interface
3. Accéder au terminal

Redémarrer le système :
```bash
sudo reboot
```

Vérifier l'état des services :
```bash
pm2 status
```

---

## Design

- **Format** : 9:16 (portrait)
- **Écran intérieur** : Rotation CSS 90° (simulation TV portrait)
- **Animations** : Transitions légères en CSS
- **Icônes** : SVG vectorielles
- **Responsive** : Adapté aux grands écrans tactiles/kiosk

---

## Données enregistrées

Chaque enregistrement génère **2 fichiers** :

**Fichier audio :**
- Format : WebM
- Codec : Opus (48kHz, mono)
- Localisation : `uploads/author-ID_question-ID_TSTAMP.webm`

**Métadonnées JSON :**
```json
{
  "timestamp": "2023-03-21T10:00:00.000Z",
  "filename": "author-YUPI_question-q_001_1679452800000.webm",
  "questionId": "q_001",
  "authorId": "YUPI",
  "questionText": "Est-ce que...",
  "fileSize": 125480,
  "duration": null
}
```

---

## Scripts disponibles

```bash
npm run dev       # Frontend dev (Vite)
npm run build     # Build production
npm run preview   # Prévisualiser la build
npm run server    # Backend API Express
```

---

## 📝 Notes

- L'application mélange les questions à chaque initialisation
- Chaque enregistrement est timestampé et nommé avec l'auteur + la question
- Les métadonnées JSON permettent le filtrage et l'analyse ultérieure
- Le bridge Python gère l'inversion Rouge/Vert des boutons matériel
- La rotation écran est persistante (xrandr)
