import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import moment from 'moment';
import { JwtPayload } from '../models/JwtPayload';
import { AppRoutesConfig } from '../config/routes.config';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LocalstorageService } from '../LocalstorageService';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private BACKEND_API = environment.BACKEND_API;

  constructor(private http: HttpClient, private router: Router, private localStorage: LocalstorageService) {}

  public login(email: string, password: string): Observable<boolean> {
    return this.http
      .post<{ token: string }>(`${this.BACKEND_API}/auth/login`, { email, password })
      .pipe(
        map((response) => {
          const tokenPayload = this.validateToken(response.token);
          return !!tokenPayload;
        }),
        catchError((error) => {
          console.error('Login error:', error);
          return of(false);
        })
      );
  }

  public register(
    username: string,
    email: string,
    password: string
  ): Observable<boolean> {
    return this.http
      .post<{ token: string }>(`${this.BACKEND_API}/auth/register`, {
        username,
        email,
        password,
      })
      .pipe(
        map((response) => {
          const tokenPayload = this.validateToken(response.token);
          return !!tokenPayload;
        }),
        catchError((error) => {
          console.error('Registration error:', error);
          return of(false);
        })
      );
  }

  private validateToken(token: string): JwtPayload | null {
    try {
      const payload = this.decodeToken(token);

      if (this.hasTokenExpired()) {
        this.logOut();
        return null;
      } else {
        return payload;
      }
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  }

  private decodeToken(token: string): JwtPayload | null {
    try {
      const payload = jwtDecode(token) as JwtPayload;
      this.setSession(payload);

      return payload;
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  }

  private hasTokenExpired(): boolean {
    const currentUnixTime = moment().unix();
    const tokenExpirationUnixTime = this.getTokenExpiration();

    const currentMoment = moment.unix(currentUnixTime);
    const defaultUnixTime = 0;
    const tokenExpirationMoment = moment.unix(tokenExpirationUnixTime ?? defaultUnixTime);

    return tokenExpirationMoment.isBefore(currentMoment);
  }

  private getTokenExpiration(): number {
    return +(this.localStorage.getItem('expires_at') || '0');
  }

  private setSession(payload: JwtPayload): void {
    const expires_at = +moment().unix() + +payload.expires_at;
    this.localStorage.setItem('expires_at', String(expires_at));
  }

  public logOut(): void {
    this.removeSession();
    this.router.navigate([AppRoutesConfig.routes.login]);
  }

  private removeSession(): void {
    this.localStorage.removeItem('expires_at');
  }

  public isLoggedIn(): boolean {
    return !this.hasTokenExpired();
  }
}
