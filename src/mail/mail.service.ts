import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    // Initialize the transporter with better error handling and explicit security settings
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      // Get mail configuration from environment variables
      const host = this.configService.get<string>('MAIL_HOST');
      const port = this.configService.get<number>('MAIL_PORT');
      const user = this.configService.get<string>('MAIL_USER');
      const pass = this.configService.get<string>('MAIL_PASSWORD');
      
      // Log the mail configuration (without password)
      this.logger.log(`Initializing mail service with host: ${host}, port: ${port}, user: ${user}`);

      // Configure transporter with explicit security options
      this.transporter = nodemailer.createTransport({
        host: host,
        port: port,
        secure: port === 465, // true for 465, false for other ports
        auth: {
          user: user,
          pass: pass,
        },
        // Add these options for better TLS handling
        tls: {
          // Do not fail on invalid certs
          rejectUnauthorized: false,
          // Force specific TLS version if needed - try removing this first
          // minVersion: 'TLSv1.2',
        },
        // Add debug option to see detailed connection information
        debug: true,
        logger: true
      });

      // Verify the connection
      this.verifyConnection();
    } catch (error) {
      this.logger.error(`Failed to initialize mail transporter: ${error.message}`, error.stack);
      // Continue initialization but log the error
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
      
      // Get base URL from config
      const baseUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
      
      // Create both web and mobile deep link URLs
      const webResetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`;
      
      // Create a mobile deep link URL using your app's scheme
      // Replace 'bloodbridge' with your actual app scheme registered in AndroidManifest.xml and Info.plist
      const mobileDeepLink = `bloodbridge://reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: `"Blood Bridge" <${this.configService.get('MAIL_FROM') || this.configService.get('MAIL_USER')}>`,
        to: to,
        subject: 'Blood Bridge - Password Reset',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d32f2f;">Blood Bridge Password Reset</h2>
            <p>Hello ${name},</p>
            <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
            <p>To reset your password in the mobile app:</p>
            <div style="text-align: center; margin: 25px 0;">
              <a href="${mobileDeepLink}" style="background-color: #d32f2f; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                Reset Password in App
              </a>
            </div>
            <p>If the button above doesn't work, try opening this link in your mobile device:</p>
            <p><a href="${mobileDeepLink}">${mobileDeepLink}</a></p>
            <p>Or use this link if you're on a computer:</p>
            <p><a href="${webResetUrl}">${webResetUrl}</a></p>
            <p>This link will expire in 1 hour.</p>
            <p>Best regards,<br>Blood Bridge Team</p>
          </div>
        `,
      };
  
      this.logger.log(`Sending password reset email to ${to}`);
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to ${to}: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`, error.stack);
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }

  // Other email sending methods can go here
  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    try {
      const mailOptions = {
        from: `"Blood Bridge" <${this.configService.get('MAIL_FROM') || this.configService.get('MAIL_USER')}>`,
        to: to,
        subject: 'Welcome to Blood Bridge',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d32f2f;">Welcome to Blood Bridge!</h2>
            <p>Hello ${name},</p>
            <p>Thank you for registering with Blood Bridge. We're excited to have you as part of our community dedicated to saving lives through blood donation.</p>
            <p>With your account, you can:</p>
            <ul>
              <li>Track your donation history</li>
              <li>Find blood donation events near you</li>
              <li>Respond to urgent blood requests</li>
              <li>Connect with hospitals in need</li>
            </ul>
            <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
            <p>Best regards,<br>Blood Bridge Team</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Welcome email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${to}: ${error.message}`, error.stack);
      // We won't throw here to prevent registration process from failing
    }
  }

  
}