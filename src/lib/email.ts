import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use app password for Gmail
  },
});

function getTemplateHtml(templateName: 'registration' | 'forgotpassword', data: { otp: string }) {
  const templatePath = path.join(process.cwd(), 'src', 'utils', 'emailTemplates', `${templateName}.hbs`);
  const source = fs.readFileSync(templatePath, 'utf8');
  const template = Handlebars.compile(source);
  return template(data);
}

export const sendOTPEmail = async (to: string, otp: string, type: 'registration' | 'forgotpassword') => {
  const subject = type === 'registration' 
    ? 'Verify Your Email - Recipe App Registration' 
    : 'Reset Your Password - Recipe App';

  const html = getTemplateHtml(type, { otp });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
}; 