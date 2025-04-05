import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UnauthorizedException } from '@nestjs/common';
import { Role } from './role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<Role[]>('roles', context.getHandler()); // Get roles from the handler
    if (!requiredRoles) {
      return true; // No roles required, just let the request pass through
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Get user from the request (added by AuthGuard)

    if (!user) {
      throw new UnauthorizedException('No user found');
    }

    // Check if user has one of the required roles
    return requiredRoles.some((role) => user.role === role);
  }
}
