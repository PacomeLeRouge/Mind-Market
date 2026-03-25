# Mind & Market - Audio Recording Device

Application React pour enregistrer des réponses audio sur un Raspberry Pi.

## Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Build l'application (production)

```bash
npm run build
```

## Démarrage

### Mode développement (frontend + backend séparé)

**Terminal 1 - Frontend (Vite dev server):**
```bash
npm run dev
```
L'app React s'ouvrira sur `http://localhost:5173`

**Terminal 2 - Backend (API pour stocker les audios):**
```bash
npm run server
```
Le serveur API s'exécutera sur `http://localhost:3001`

### Mode Production (Raspberry Pi)

```bash
npm start
```

Cela va :
1. Builder l'application React
2. Lancer le serveur sur `http://0.0.0.0:3001` (accessible sur le réseau local)

## Structure

```
Mind-Market/
├── src/                 # Code React
├── server.js           # Serveur Node.js/Express
├── package.json        # Dépendances et scripts
├── uploads/            # 📁 Audios enregistrés (créé automatiquement)
│   ├── recording_TIMESTAMP.webm    # Fichier audio
│   └── recording_TIMESTAMP.json    # Métadonnées
└── README.md
```

## API

### POST `/api/upload-audio`
Envoie un audio enregistré pour le stocker sur disque.

**Body:**
- `audio` (file) - Fichier WebM
- `question` (string) - Question associée

**Response:**
```json
{
  "success": true,
  "filename": "recording_1679452800000.webm",
  "filepath": "/path/to/uploads/recording_1679452800000.webm",
  "fileSize": 125480
}
```

### GET `/api/audios`
Retourne la liste de tous les audios enregistrés.

**Response:**
```json
{
  "count": 3,
  "audios": [
    {
      "filename": "recording_1679452800000.webm",
      "path": "/uploads/recording_1679452800000.webm",
      "created": "2023-03-21T10:00:00.000Z"
    }
  ]
}
```

## Sur Raspberry Pi

### Configuration réseau

1. Connectez le Raspberry Pi au réseau (WiFi ou Ethernet)
2. Trouvez l'adresse IP du Pi:
   ```bash
   hostname -I
   ```
3. Accédez à l'app depuis un navigateur: `http://<IP_DU_PI>:3001`

### Permissions pour le microphone

Assurez-vous que le navigateur a accès au microphone:
- Vérifiez les paramètres système du Pi
- Donnez les permissions au navigateur si demandé

### Stockage des audios

Les audios sont sauvegardés dans le dossier `uploads/` du répertoire du projet.
Chaque audio possède:
- Un fichier `.webm` (le son)
- Un fichier `.json` avec les métadonnées (timestamp, question, taille)

## Formats

- **Audio:** WebM (codec Opus) - Format léger et compressé
- **Métadonnées:** JSON avec timestamp, question, taille fichier

## Limitation

- ✅ Durée minimum: 5 secondes (rejet automatique)
- ✅ Taille max: 50MB par fichier
- ✅ Stockage local: Sans dépendance internet

## Dépannage

**L'app ne se connecte pas au serveur?**
- Vérifiez que `npm run server` s'exécute sur le port 3001
- Vérifiez que le firewall n'bloque pas le port 3001

**Pas d'accès au microphone?**
- Vérifiez les permissions du navigateur (Settings → Privacy)
- Sur Raspberry Pi, assurez-vous que ALSA/PulseAudio est configuré

**Erreur lors de l'enregistrement?**
- Vérifiez les droits d'accès du dossier `uploads/`
- Assurez-vous qu'il y a assez d'espace disque sur la carte SD
