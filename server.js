import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuration de multer pour les fichiers audio
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const filename = `recording_${timestamp}.webm`;
    cb(null, filename);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Route pour uploader un audio
app.post('/api/upload-audio', upload.single('audio'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier audio reçu' });
    }

    // 1. On récupère les métadonnées envoyées par React
    const { questionId, authorId, questionText } = req.body;
    const timestamp = Date.now();

    // 2. On crée un super nom de fichier avec les IDs !
    const qId = questionId || 'no_qId';
    const aId = authorId || 'no_aId';
    const newBaseName = `author-${aId}_question-${qId}_${timestamp}`;
    
    const newAudioPath = path.join(uploadsDir, `${newBaseName}.webm`);
    const metadataPath = path.join(uploadsDir, `${newBaseName}.json`);

    // 3. On renomme le fichier généré par Multer avec notre nouveau nom
    fs.renameSync(req.file.path, newAudioPath);

    // 4. Créer un fichier JSON ultra-complet
    const metadata = {
      timestamp: new Date().toISOString(),
      filename: `${newBaseName}.webm`,
      questionId: qId,
      authorId: aId,
      questionText: questionText || 'Pas de question',
      fileSize: req.file.size,
      duration: null
    };

    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    console.log(`✓ Audio enregistré: ${metadata.filename} (${(req.file.size / 1024).toFixed(2)}KB)`);
    console.log(`  Auteur: ${aId} | Question: ${qId}`);

    res.json({
      success: true,
      filename: metadata.filename,
      filepath: newAudioPath,
      fileSize: req.file.size
    });
  } catch (error) {
    console.error('Erreur lors du traitement:', error);
    res.status(500).json({ error: 'Erreur serveur lors de l\'enregistrement de l\'audio' });
  }
});

// Route pour lister les audios enregistrés
app.get('/api/audios', (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir)
      .filter(file => file.endsWith('.webm'))
      .map(file => ({
        filename: file,
        path: `/uploads/${file}`,
        created: fs.statSync(path.join(uploadsDir, file)).birthtime
      }))
      .sort((a, b) => b.created - a.created);

    res.json({ audios: files, count: files.length });
  } catch (error) {
    console.error('Erreur lors de la lecture des audios:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Servir les fichiers audio
app.use('/uploads', express.static(uploadsDir));

// --- AJOUT : Route pour lire les questions dynamiquement ---
app.get('/api/questions', (req, res) => {
  try {
    const questionsPath = path.join(__dirname, 'questions.json');
    const data = fs.readFileSync(questionsPath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Erreur lors de la lecture des questions:', error);
    res.status(500).json({ error: 'Impossible de charger les questions' });
  }
});

// Fallback pour SPA (React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════╗
║   Mind & Market - Audio Recording      ║
║   Serveur démarré sur port ${PORT}       ║
║   📁 Dossier uploads: ${uploadsDir}  ║
╚════════════════════════════════════════╝
  `);
});
