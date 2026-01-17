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
};
