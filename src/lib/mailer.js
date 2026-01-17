import nodemailer from "nodemailer";

function hasSMTP() {
  return (
    process.env.MAIL_HOST &&
    process.env.MAIL_PORT &&
    process.env.MAIL_USER &&
    process.env.MAIL_PASS &&
    process.env.MAIL_FROM
  );
}

const transporter = hasSMTP()
  ? nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: Number(process.env.MAIL_PORT) === 465,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    })
  : null;

export const mailer = {
  async sendMail({ to, subject, text, html }) {
    if (!transporter) {
      console.log(`\n[DEV] Mail simulé:\nTo: ${to}\nSubject: ${subject}\n${text || html}\n`);
      return;
    }

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      text,
      html: html || text, // fallback
    });
  },

  async sendVerification(email, token) {
    const front = process.env.FRONT_URL || "http://localhost:3000";
    const verifyUrl = `${front}/verify-email?token=${token}`;
    
    const text = `
Bonjour,

Merci de vous être inscrit ! Pour activer votre compte, cliquez sur le lien ci-dessous :

${verifyUrl}

Ce lien est valable pendant 24 heures.

Si vous n'avez pas créé de compte, ignorez ce message.

Cordialement,
L'équipe API Auth
    `;

    await this.sendMail({
      to: email,
      subject: "Vérifiez votre email",
      text,
    });
  },

  async sendResetPassword(email, token) {
    const front = process.env.FRONT_URL || "http://localhost:3000";
    const resetUrl = `${front}/reset-password?token=${token}`;
    
    const text = `
Bonjour,

Vous avez demandé à réinitialiser votre mot de passe.
Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :

${resetUrl}

Ce lien est valable pendant 24 heures.

⚠️ ATTENTION : Si vous n'avez pas demandé cette réinitialisation, 
ignorez ce message. Votre mot de passe actuel reste inchangé.

Cordialement,
L'équipe API Auth
    `;

    await this.sendMail({
      to: email,
      subject: "Réinitialisation de votre mot de passe",
      text,
    });
  },

  async sendPasswordChanged(email, userName = '') {
    const text = `
Bonjour ${userName},

Votre mot de passe a été modifié avec succès.

Si vous n'êtes pas à l'origine de cette modification, veuillez contacter immédiatement notre équipe de support.

Date de modification : ${new Date().toLocaleString('fr-FR')}

Cordialement,
L'équipe API Auth
    `;

    await this.sendMail({
      to: email,
      subject: "Votre mot de passe a été modifié",
      text,
    });
  },

  async sendLoginNotification(email, userName = '', deviceInfo = {}) {
    const { userAgent = 'Inconnu', ipAddress = 'Inconnue', location = 'Inconnue' } = deviceInfo;
    
    const text = `
Bonjour ${userName},

Une nouvelle connexion à votre compte a été détectée.

Détails de la connexion :
- Date : ${new Date().toLocaleString('fr-FR')}
- Appareil : ${userAgent}
- Adresse IP : ${ipAddress}
- Localisation : ${location}

Si vous n'êtes pas à l'origine de cette connexion, veuillez immédiatement :
1. Changer votre mot de passe
2. Révoquer toutes vos sessions actives
3. Contacter notre équipe de support

Cordialement,
L'équipe API Auth
    `;

    await this.sendMail({
      to: email,
      subject: "Nouvelle connexion détectée sur votre compte",
      text,
    });
  },

  async sendSessionRevoked(email, userName = '', count = 1) {
    const text = `
Bonjour ${userName},

${count} session(s) a/ont été révoquée(s) sur votre compte.

Date : ${new Date().toLocaleString('fr-FR')}
Nombre de sessions révoquées : ${count}

Si vous n'êtes pas à l'origine de cette action, veuillez immédiatement contacter notre équipe de support.

Cordialement,
L'équipe API Auth
    `;

    await this.sendMail({
      to: email,
      subject: "Sessions révoquées sur votre compte",
      text,
    });
  },
};
