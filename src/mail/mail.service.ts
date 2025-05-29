import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      const host = this.configService.get<string>('MAIL_HOST');
      const port = this.configService.get<number>('MAIL_PORT');
      const user = this.configService.get<string>('MAIL_USER');
      const pass = this.configService.get<string>('MAIL_PASSWORD');
      
      this.logger.log(`Initializing mail service with host: ${host}, port: ${port}, user: ${user}`);

      this.transporter = nodemailer.createTransporter({
        host: host,
        port: port,
        secure: port === 465,
        auth: {
          user: user,
          pass: pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
        debug: true,
        logger: true
      });

      this.verifyConnection();
    } catch (error) {
      this.logger.error(`Failed to initialize mail transporter: ${error.message}`, error.stack);
    }
  }

  private async verifyConnection() {
    try {
      const verification = await this.transporter.verify();
      this.logger.log('Mail server connection established successfully');
      return verification;
    } catch (error) {
      this.logger.error(`Mail server connection failed: ${error.message}`, error.stack);
      return false;
    }
  }

  async sendPasswordResetEmail(
    to: string,
    resetToken: string,
    name: string,
  ): Promise<void> {
    try {
      this.logger.log(`Preparing to send password reset email to ${to}`);
      
      // Create mobile deep link URL using your app's scheme
      // This should match the scheme defined in your AndroidManifest.xml and iOS Info.plist
      const mobileDeepLink = `bloodbridge://reset-password?token=${resetToken}`;
      
      // Alternative format that might work better on some devices
      const universalLink = `https://bloodbridge.app/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: `"Blood Bridge" <${this.configService.get('MAIL_FROM') || this.configService.get('MAIL_USER')}>`,
        to: to,
        subject: 'Blood Bridge - Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #d32f2f; margin: 0;">🩸 Blood Bridge</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
            
            <p style="font-size: 16px; line-height: 1.5; color: #333;">Hello ${name},</p>
            
            <p style="font-size: 16px; line-height: 1.5; color: #333;">
              We received a request to reset your password for your Blood Bridge account. 
              If you didn't make this request, you can safely ignore this email.
            </p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <p style="font-size: 16px; margin-bottom: 15px; color: #333; font-weight: bold;">
                📱 To reset your password in the Blood Bridge mobile app:
              </p>
              
              <div style="text-align: center; margin: 20px 0;">
                <a href="${mobileDeepLink}" 
                   style="background-color: #d32f2f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
                  🔓 Reset Password in App
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666; text-align: center; margin-top: 15px;">
                Tap the button above to open the Blood Bridge app and reset your password
              </p>
            </div>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="font-size: 14px; color: #856404; margin: 0;">
                <strong>⚠️ Important:</strong> This reset link will expire in 1 hour for your security.
              </p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="font-size: 14px; color: #666; margin: 5px 0;">
                <strong>Having trouble?</strong>
              </p>
              <p style="font-size: 14px; color: #666; margin: 5px 0;">
                • Make sure you have the Blood Bridge app installed
              </p>
              <p style="font-size: 14px; color: #666; margin: 5px 0;">
                • Try copying and pasting this link: <code style="background: #f8f9fa; padding: 2px 4px; border-radius: 3px;">${mobileDeepLink}</code>
              </p>
              <p style="font-size: 14px; color: #666; margin: 5px 0;">
                • Contact our support team if you continue to have issues
              </p>
            </div>
            
            <div style="margin-top: 40px; text-align: center; color: #666; font-size: 14px;">
              <p style="margin: 5px 0;">Best regards,</p>
              <p style="margin: 5px 0; font-weight: bold; color: #d32f2f;">The Blood Bridge Team</p>
              <p style="margin: 20px 0 0 0; font-size: 12px; color: #999;">
                Connecting donors, saving lives 💝
              </p>
            </div>
          </div>
        `,
        // Add text version as fallback
        text: `
Blood Bridge - Password Reset Request

Hello ${name},

We received a request to reset your password for your Blood Bridge account.

To reset your password, copy and paste this link into your mobile device:
${mobileDeepLink}

This link will expire in 1 hour.

If you didn't request this password reset, you can safely ignore this email.

Best regards,
The Blood Bridge Team
        `,
      };
  
      this.logger.log(`Sending password reset email to ${to} with deep link: ${mobileDeepLink}`);
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to ${to}: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`, error.stack);
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    try {
      const mailOptions = {
        from: `"Blood Bridge" <${this.configService.get('MAIL_FROM') || this.configService.get('MAIL_USER')}>`,
        to: to,
        subject: 'Welcome to Blood Bridge! 🩸',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #d32f2f; margin: 0;">🩸 Welcome to Blood Bridge!</h1>
            </div>
            
            <p style="font-size: 16px; line-height: 1.5; color: #333;">Hello ${name},</p>
            
            <p style="font-size: 16px; line-height: 1.5; color: #333;">
              Thank you for joining Blood Bridge! We're thrilled to have you as part of our 
              life-saving community of blood donors and healthcare heroes.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #d32f2f; margin-top: 0;">🌟 What you can do with Blood Bridge:</h3>
              <ul style="color: #333; line-height: 1.6;">
                <li>📊 Track your donation history and impact</li>
                <li>📍 Find blood donation events near you</li>
                <li>🚨 Respond to urgent blood requests in your area</li>
                <li>🏥 Connect directly with hospitals in need</li>
                <li>🏆 Earn recognition for your life-saving contributions</li>
                <li>📱 Get real-time notifications for donation opportunities</li>
              </ul>
            </div>
            
            <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="font-size: 14px; color: #155724; margin: 0;">
                <strong>💡 Did you know?</strong> One blood donation can save up to three lives! 
                Your generosity makes a real difference in your community.
              </p>
            </div>
            
            <div style="margin-top: 40px; text-align: center; color: #666; font-size: 14px;">
              <p style="margin: 5px 0;">Welcome aboard,</p>
              <p style="margin: 5px 0; font-weight: bold; color: #d32f2f;">The Blood Bridge Team</p>
              <p style="margin: 20px 0 0 0; font-size: 12px; color: #999;">
                Together, we save lives 💝
              </p>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Welcome email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${to}: ${error.message}`, error.stack);
    }
  }
}