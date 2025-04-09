import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext, SetMetadata } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { UnauthorizedException } from '@nestjs/common';

// Define a constant for our metadata key
export const IS_PUBLIC_KEY = 'isPublic';

// Create a decorator to mark routes as public
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If the route is public, allow access without token
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1]; // Get token from the Authorization header

    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    try {
      const user = this.jwtService.verify(token);
      request.user = user; // Attach user information to the request object
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}