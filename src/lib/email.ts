import nodemailer from 'nodemailer';
import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Or your mail service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use app password for Gmail
  },
});

// Generic function to load and compile a template
function compileTemplate(template: string, context: any) {
  const compiled = Handlebars.compile(template);
  return compiled(context);
}

// ✅ General sendEmail function
export const sendEmail = async ({
  to,
  subject,
  template,
  context
}: {
  to: string;
  subject: string;
  template: string;
  context: any;
}) => {
  try {
    const html = compileTemplate(template, context);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
};

// ✅ Keep your OTP-specific sender too
export const sendOTPEmail = async (
  to: string,
  otp: string,
  type: 'registration' | 'forgotpassword'
) => {
  const subject =
    type === 'registration'
      ? 'Verify Your Email - Recipe App Registration'
      : 'Reset Your Password - Recipe App';

  const templatePath = path.join(
    process.cwd(),
    'src',
    'utils',
    'emailTemplates',
    `${type}.hbs`
  );
  const source = fs.readFileSync(templatePath, 'utf8');
  const html = compileTemplate(source, { otp });

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
    console.error('OTP email sending failed:', error);
    return { success: false, error };
  }
};
