const express = require('express');
// const cors = require('./middleware/cors'); // inutile maintenant
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

/* =====================================================
   🔥 Middleware global pour désactiver CORS
===================================================== */
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // tout le monde autorisé
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use(cors({
  origin: 'https://gabonconcours.netlify.app' // or '*' for all origins (not recommended for production)
}));

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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'), false);
    }
  }
});

app.use('/uploads', express.static('uploads'));

/* =====================================================
   📌 Import des routes
===================================================== */
const concoursRoutes = require('./routes/concours');
const candidatsRoutes = require('./routes/candidats');
const provincesRoutes = require('./routes/provinces');
const niveauxRoutes = require('./routes/niveaux');
const filieresRoutes = require('./routes/filieres');
const etablissementsRoutes = require('./routes/etablissements');
const matieresRoutes = require('./routes/matieres');
const participationsRoutes = require('./routes/participations');
const dossiersRoutes = require('./routes/dossiers');
const sessionsRoutes = require('./routes/sessions');
const statisticsRoutes = require('./routes/statistics');
const adminRoutes = require('./routes/admin');
const emailRoutes = require('./routes/email');
const etudiantsRoutes = require('./routes/etudiants');
const documentsRoutes = require('./routes/documents');
const paiementsRoutes = require('./routes/paiements');
const documentValidationRoutes = require('./routes/documentValidation');
const adminDocumentsRoutes = require('./routes/admin-documents');
const notificationsRoutes = require('./routes/notifications');
const supportRoutes = require('./routes/supportRoutes');

app.use('/api/concours', concoursRoutes);
app.use('/api/candidats', candidatsRoutes);
app.use('/api/provinces', provincesRoutes);
app.use('/api/niveaux', niveauxRoutes);
app.use('/api/filieres', filieresRoutes);
app.use('/api/etablissements', etablissementsRoutes);
app.use('/api/matieres', matieresRoutes);
app.use('/api/participations', participationsRoutes);
app.use('/api/dossiers', dossiersRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/etudiants', etudiantsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/paiements', paiementsRoutes);
app.use('/api/document-validation', documentValidationRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/support', supportRoutes);

const { router: adminAuthRouter } = require('./routes/adminAuth');
app.use('/api/admin/auth', adminAuthRouter);
app.use('/api/admin/management', require('./routes/adminManagement'));
app.use('/api/admin', adminDocumentsRoutes);
app.use('/api/admin', require('./routes/admin'));

/* =====================================================
   📌 Routes test
===================================================== */
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API GabConcours fonctionnelle! (CORS désactivé 🚀)',
    timestamp: new Date().toISOString()
  });
});

/* =====================================================
   ⚠️ Middleware gestion d’erreurs
===================================================== */
app.use((error, req, res, next) => {
  console.error('Erreur serveur:', error);
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Fichier trop volumineux (max 10MB)'
      });
    }
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
