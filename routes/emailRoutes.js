
const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');

// Augmenter la limite pour les images
router.use(express.json({ limit: '10mb' }));
router.use(express.urlencoded({ limit: '10mb', extended: true }));

// POST /api/email/receipt - Envoyer un reçu PDF par email
router.post('/receipt', async (req, res) => {
  try {
    const { maican, nupcan, candidatData } = req.body;

    if (!maican || !nupcan) {
      return res.status(400).json({
        success: false,
        message: 'Email et NUPCAN requis'
      });
    }

    await emailService.sendReceiptEmail({
      to: maican,
      nupcan,
      candidatData
    });

    res.json({
      success: true,
      message: 'Reçu envoyé par email avec succès'
    });
  } catch (error) {
    console.error('Erreur envoi reçu email:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du reçu'
    });
  }
});

// POST /api/email/receipt-image - Envoyer un reçu image par email
router.post('/receipt-image', async (req, res) => {
  try {
    const { maican, nupcan, candidatData, imageData } = req.body;

    if (!maican || !nupcan || !imageData) {
      return res.status(400).json({
        success: false,
        message: 'Email, NUPCAN et image requis'
      });
    }

    await emailService.sendReceiptImageEmail({
      to: maican,
      nupcan,
      candidatData,
      imageData
    });

    res.json({
      success: true,
      message: 'Reçu image envoyé par email avec succès'
    });
  } catch (error) {
    console.error('Erreur envoi reçu image email:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du reçu image'
    });
  }
});

// POST /api/email/document-validation - Notification de validation de document
router.post('/document-validation', async (req, res) => {
  try {
    const { maican, documentName, statut, commentaire } = req.body;

    if (!maican || !documentName || !statut) {
      return res.status(400).json({
        success: false,
        message: 'Email, nom du document et statut requis'
      });
    }

    await emailService.sendDocumentValidationEmail({
      to: maican,
      documentName,
      statut,
      commentaire
    });

    res.json({
      success: true,
      message: 'Notification envoyée avec succès'
    });
  } catch (error) {
    console.error('Erreur envoi notification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi de la notification'
    });
  }
});

module.exports = router;
