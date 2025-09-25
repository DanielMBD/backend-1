// Dans emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // Ou votre service d'email
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendDocumentValidationNotification(document, candidat, statut, commentaire) {

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: candidat.maican, // Récupérer l'email du candidat via document ou une autre source
        subject: `Validation de votre document - Statut : ${statut}`,
        text: `Cher(e) candidat(e),\n\nVotre document (${document.nomdoc}) a été ${statut}.\n${
            commentaire ? `Commentaire : ${commentaire}\n` : ''
        }\nCordialement,\nL'équipe administrative`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email envoyé:', info.response);
        return { success: true, message: 'Email envoyé avec succès' };
    } catch (error) {
        console.error('Erreur envoi email:', error);
        throw new Error('Échec de l\'envoi de l\'email');
    }
}

module.exports = { sendDocumentValidationNotification };