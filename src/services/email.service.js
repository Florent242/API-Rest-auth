import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT) || 1025,
  secure: false,
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      }
    : undefined,
});

async function loadTemplate(templateName) {
  const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);
  return await fs.readFile(templatePath, 'utf-8');
}

function replaceVariables(template, variables) {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  result = result.replace(/{{YEAR}}/g, new Date().getFullYear().toString());
  return result;
}

export async function sendVerificationEmail(user, token) {
  try {
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify/${token}`;
    const template = await loadTemplate('verify-email');
    const html = replaceVariables(template, {
      userName: user.name || user.email.split('@')[0],
      VERIFY_URL: verifyUrl,
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"API Rest Auth" <noreply@api.com>',
      to: user.email,
      subject: 'Vérifiez votre adresse email',
      html,
    });

    logger.info(`Verification email sent to ${user.email}`);
  } catch (error) {
    logger.error(`Failed to send verification email to ${user.email}:`, error);
    throw error;
  }
}

export async function sendPasswordResetEmail(user, token) {
  try {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password/${token}`;
    const template = await loadTemplate('reset-password');
    const html = replaceVariables(template, {
      userName: user.name || user.email.split('@')[0],
      RESET_URL: resetUrl,
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"API Rest Auth" <noreply@api.com>',
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe',
      html,
    });

    logger.info(`Password reset email sent to ${user.email}`);
  } catch (error) {
    logger.error(`Failed to send password reset email to ${user.email}:`, error);
    throw error;
  }
}

export async function sendLoginNotification(user, loginInfo) {
  try {
    const changePasswordUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/change-password`;
    const template = await loadTemplate('login-notification');
    const html = replaceVariables(template, {
      userName: user.name || user.email.split('@')[0],
      loginDate: new Date(loginInfo.loginAt).toLocaleString('fr-FR'),
      ipAddress: loginInfo.ipAddress || 'Inconnu',
      userAgent: loginInfo.userAgent || 'Inconnu',
      CHANGE_PASSWORD_URL: changePasswordUrl,
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"API Rest Auth" <noreply@api.com>',
      to: user.email,
      subject: '🔔 Nouvelle connexion détectée',
      html,
    });

    logger.info(`Login notification sent to ${user.email}`);
  } catch (error) {
    logger.error(`Failed to send login notification to ${user.email}:`, error);
  }
}

export async function sendPasswordChangedNotification(user, changeInfo) {
  try {
    const template = await loadTemplate('password-changed');
    const html = replaceVariables(template, {
      userName: user.name || user.email.split('@')[0],
      changeDate: new Date(changeInfo.changedAt).toLocaleString('fr-FR'),
      ipAddress: changeInfo.ipAddress || 'Inconnu',
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"API Rest Auth" <noreply@api.com>',
      to: user.email,
      subject: '✅ Votre mot de passe a été modifié',
      html,
    });

    logger.info(`Password changed notification sent to ${user.email}`);
  } catch (error) {
    logger.error(`Failed to send password changed notification to ${user.email}:`, error);
  }
}
