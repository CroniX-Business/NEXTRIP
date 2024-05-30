import { Injectable } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AppRoutesConfig } from '../config/routes.config';
import { Router } from '@angular/router';

@Injectable()
export class AuthGuard {
  public constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  private canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    }
    this.router.navigate([AppRoutesConfig.routeNames.login]);
    return false;
  }
}