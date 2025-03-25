import { Controller, Post, Headers, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('verify-token')
  async verifyUser(@Headers('Authorization') authHeader: string) {
    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const token = authHeader.replace('Bearer ', '');
      const userData = await this.authService.verifyToken(token);

      const userRole = await this.authService.getUserRole(userData.uid);

      if (userRole === 'unknown') {
        throw new UnauthorizedException('User not found in the system');
      }

      return {
        success: true,
        uid: userData.uid,
        email: userData.email,
        role: userRole,
      };
    } catch (error) {
      console.error('Auth Error:', error.message);

      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(error.message);
      }

      throw new InternalServerErrorException('Something went wrong during authentication');
    }
  }
}
