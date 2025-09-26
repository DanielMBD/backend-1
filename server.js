const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

/* =====================================================
   🔐 Configuration CORS
===================================================== */
const corsOptions = {
  origin: 'https://gabonconcours.netlify.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

/* =====================================================
   📂 Création des répertoires uploads
===================================================== */
const uploadDirs = ['./uploads/documents', './uploads/photos'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Répertoire créé: ${dir}`);
  }
});

/* =====================================================
   ⚙️ Middleware
===================================================== */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

/* =====================================================
   📂 Configuration Multer (upload fichiers)
===================================================== */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads/documents';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'), false);
    }
  }
});

/* =====================================================
   📌 Import des routes
===================================================== */
app.use('/api/concours', require('./routes/concours'));
app.use('/api/candidats', require('./routes/candidats'));
app.use('/api/provinces', require('./routes/provinces'));
app.use('/api/niveaux', require('./routes/niveaux'));
app.use('/api/filieres', require('./routes/filieres'));
app.use('/api/etablissements', require('./routes/etablissements'));
app.use('/api/matieres', require('./routes/matieres'));
app.use('/api/participations', require('./routes/participations'));
app.use('/api/dossiers', require('./routes/dossiers'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/statistics', require('./routes/statistics'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/email', require('./routes/email'));
app.use('/api/etudiants', require('./routes/etudiants'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/paiements', require('./routes/paiements'));
app.use('/api/document-validation', require('./routes/documentValidation'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/admin/auth', require('./routes/adminAuth').router);
app.use('/api/admin/management', require('./routes/adminManagement'));
app.use('/api/admin', require('./routes/admin-documents'));

/* =====================================================
   📌 Routes test
===================================================== */
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API GabConcours fonctionnelle! (CORS activé 🚀)',
    timestamp: new Date().toISOString()
  });
});

/* =====================================================
   ⚠️ Middleware gestion d’erreurs
===================================================== */
app.use((error, req, res, next) => {
  console.error('Erreur serveur:', error);
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Fichier trop volumineux (max 10MB)'
    });
  }
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

/* =====================================================
   ❌ Route 404
===================================================== */
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route non trouvée: ${req.method} ${req.originalUrl}`
  });
});

/* =====================================================
   🚀 Connexion DB et lancement serveur
===================================================== */
const { createConnection, testConnection } = require('./config/database');

const startServer = async () => {
  try {
    console.log('⏳ Initialisation de la connexion à la base de données...');
    await createConnection();
    await testConnection();
    console.log('✅ Connexion à MySQL établie');
    console.log(`📌 Base de données: ${process.env.DB_NAME || 'gabconcoursv1'}`);

    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`🌍 API accessible sur: http://localhost:${PORT}/api`);
      console.log(`🔑 Interface admin: http://localhost:5173/admin`);
    });
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
