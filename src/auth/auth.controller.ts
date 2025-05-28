// src/auth/auth.controller.ts
import { Controller, Post, Body, Query, Get, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { CreateDonorDto } from '../donor/dto/create-donor.dto';
import { Public } from './auth.guard';
import { ConfigService } from '@nestjs/config';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}
  
  @Public()
  @Post('login')
  @ApiBody({ type: LoginDto })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  @ApiBody({ type: CreateDonorDto })
  register(@Body() createDonorDto: CreateDonorDto) {
    return this.authService.registerDonor(createDonorDto);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    await this.authService.forgotPassword(body.email);
    return { success: true, message: 'If an account exists with this email, a reset link has been sent.' };
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    await this.authService.resetPassword(body.token, body.newPassword);
    return { success: true, message: 'Password reset successfully.' };
  }

  @Public()
  @Get('reset-password')
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async validateResetToken(@Query('token') token: string, @Res() res: any) {
    // Redirect to the web-based reset page
    return res.redirect(`/auth/reset-password-web?token=${token}`);
  }

  @Public()
  @Get('reset-password-web')
  @ApiResponse({ status: 200, description: 'HTML Reset Password Page' })
  async resetPasswordWebPage(@Query('token') token: string, @Res() res: any) {
    try {
      // Validate the token
      await this.authService.validateResetToken(token);
      
      // Return HTML page with redirection capabilities
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Blood Bridge Password Reset</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              text-align: center;
              background-color: #f8f8f8;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 { color: #d32f2f; }
            .btn {
              background-color: #d32f2f;
              color: white;
              border: none;
              padding: 12px 20px;
              font-size: 16px;
              border-radius: 4px;
              cursor: pointer;
              font-weight: bold;
              margin: 10px 0;
              text-decoration: none;
              display: inline-block;
            }
            input {
              padding: 12px;
              margin: 10px 0;
              border: 1px solid #ddd;
              border-radius: 4px;
              width: 100%;
              box-sizing: border-box;
            }
            .error { color: red; }
            .success { color: green; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Blood Bridge Password Reset</h1>
            
            <div id="app-redirect">
              <p>Opening Blood Bridge app...</p>
              <p>If the app doesn't open automatically, please use one of the options below:</p>
              <a href="bloodbridge://reset-password?token=${token}" class="btn">Open in App</a>
              <div style="margin: 20px 0;">
                <p>- OR -</p>
              </div>
            </div>

            <div id="web-form">
              <h2>Reset your password</h2>
              <form id="resetForm">
                <div>
                  <input type="password" id="password" placeholder="New Password" required>
                </div>
                <div>
                  <input type="password" id="confirmPassword" placeholder="Confirm Password" required>
                </div>
                <p id="error" class="error"></p>
                <p id="success" class="success"></p>
                <button type="submit" class="btn">Reset Password</button>
              </form>
            </div>
          </div>

          <script>
            // Try to redirect to app first
            window.location.href = "bloodbridge://reset-password?token=${token}";
            
            // Handle web form submission
            document.getElementById('resetForm').addEventListener('submit', async function(e) {
              e.preventDefault();
              
              const password = document.getElementById('password').value;
              const confirmPassword = document.getElementById('confirmPassword').value;
              const errorEl = document.getElementById('error');
              const successEl = document.getElementById('success');
              
              errorEl.textContent = '';
              successEl.textContent = '';
              
              if (password.length < 6) {
                errorEl.textContent = 'Password must be at least 6 characters long';
                return;
              }
              
              if (password !== confirmPassword) {
                errorEl.textContent = 'Passwords do not match';
                return;
              }
              
              try {
                const response = await fetch('/auth/reset-password', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    token: "${token}",
                    newPassword: password
                  })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                  document.getElementById('resetForm').style.display = 'none';
                  successEl.textContent = 'Password reset successful! You can now log in with your new password.';
                } else {
                  errorEl.textContent = data.message || 'An error occurred. Please try again.';
                }
              } catch (error) {
                errorEl.textContent = 'An error occurred. Please try again.';
              }
            });
          </script>
        </body>
        </html>
      `);
    } catch (error) {
      // Return error HTML for invalid token
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invalid Reset Link - Blood Bridge</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              text-align: center;
              background-color: #f8f8f8;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 { color: #d32f2f; }
            .btn {
              background-color: #d32f2f;
              color: white;
              border: none;
              padding: 12px 20px;
              font-size: 16px;
              border-radius: 4px;
              cursor: pointer;
              font-weight: bold;
              margin: 10px 0;
              text-decoration: none;
              display: inline-block;
            }
            .error { color: red; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Invalid or Expired Link</h1>
            <p class="error">The password reset link you clicked is invalid or has expired.</p>
            <p>Please request a new password reset link.</p>
            <a href="${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}/forgot-password" class="btn">Request New Link</a>
          </div>
        </body>
        </html>
      `);
    }
  }

}