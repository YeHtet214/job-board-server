import nodemailer from "nodemailer";
import { SMTP_USER, SMTP_PASS, SMTP_PORT, SMTP_HOST } from "./env.config.js";
import { InternalServerError } from "@/middleware/errorHandler.js";

const emailContents = (link: string) => [
  {
    type: 'verify',
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #211951;">
            <h1 style="color: #211951; margin: 0;">Job Board</h1>
            <p style="color: #666; font-size: 14px; margin-top: 5px;">Connect with opportunities</p>
          </div>
          
          <div style="padding: 20px 0;">
            <h2 style="color: #333;">Email Verification</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.5;">Thank you for creating an account! To get started, please verify your email address by clicking the button below.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${link}" style="display: inline-block; padding: 12px 24px; background-color: #211951; color: white; text-decoration: none; font-weight: bold; border-radius: 4px; font-size: 16px;">Verify Email Address</a>
            </div>
            
            <p style="color: #555; font-size: 14px; line-height: 1.5;">If the button doesn't work, you can also copy and paste the following link into your browser:</p>
            <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 12px; word-break: break-all; color: #333;">${link}</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e1e1; color: #777; font-size: 14px;">
              <p><strong>Note:</strong> This verification link will expire in 24 hours.</p>
              <p>If you didn't create an account, you can safely ignore this email.</p>
            </div>
          </div>
          
          <div style="background-color: #f7f7f7; padding: 15px; border-radius: 4px; margin-top: 20px; text-align: center; font-size: 12px; color: #666;">
            <p>Need help? Contact our support team at <a href="mailto:support@jobboard.com" style="color: #211951;">support@jobboard.com</a></p>
            <p>&copy; ${new Date().getFullYear()} Job Board. All rights reserved.</p>
          </div>
        </div>
      `
  },
  {
    type: 'resetPassword',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #211951;">
          <h1 style="color: #211951; margin: 0;">Job Board</h1>
          <p style="color: #666; font-size: 14px; margin-top: 5px;">Connect with opportunities</p>
        </div>
        
        <div style="padding: 20px 0;">
          <h2 style="color: #333;">Reset Password</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.5;">To get access to your account back, reset password by clicking the button below.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${link}" style="display: inline-block; padding: 12px 24px; background-color: #211951; color: white; text-decoration: none; font-weight: bold; border-radius: 4px; font-size: 16px;">Reset Password</a>
          </div>
          
          <p style="color: #555; font-size: 14px; line-height: 1.5;">If the button doesn't work, you can also copy and paste the following link into your browser:</p>
          <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 12px; word-break: break-all; color: #333;">${link}</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e1e1; color: #777; font-size: 14px;">
            <p>If you didn't create an account, you can safely ignore this email.</p>
          </div>
        </div>
        
        <div style="background-color: #f7f7f7; padding: 15px; border-radius: 4px; margin-top: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>Need help? Contact our support team at <a href="mailto:support@jobboard.com" style="color: #211951;">support@jobboard.com</a></p>
          <p>&copy; ${new Date().getFullYear()} Job Board. All rights reserved.</p>
        </div>
      </div>
    `
  }
]

interface EmailServiceProps {
  email: string;
  link: string;
  type?: 'verify' | 'resetPassword';
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

/**
 * Sends an email using SMTP service.
 * @param email - The recipient's email address.
 * @param verificationLink - The link to verify the email address.
 * @param token - The verification token.
 * @param type - The type of email being sent - either 'registration' or 'verification' or 'forgotPassword' (optional).
 */

const sendEmailService = async ({email, link, type}: EmailServiceProps) => {
  try {
    const result = await transporter.sendMail({
      from: 'JobBoard <' + SMTP_USER + '>',
      to: email,
      subject: type === 'verify' ? 'Verify your email address' : 'Reset Your Password',
      html: type === 'verify' ? emailContents(link)[0].html : emailContents(link)[1].html,
    })

    console.log('result', result.response);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new InternalServerError('Failed to send verification email');
  }
}

export default sendEmailService;