import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import moment from 'moment';
import { AppRoutesConfig } from '../config/routes.config';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LocalstorageService } from '../LocalstorageService';
import { User } from '../models/User';
import { DecodedJwtPayload } from '../models/JwtPayload';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private BACKEND_API = environment.BACKEND_API;

  constructor(
    private http: HttpClient,
    private router: Router,
    private localStorage: LocalstorageService,
  ) {}

  public login(email: string, password: string): Observable<boolean> {
    return this.http
      .post<{
        token: string;
      }>(`${this.BACKEND_API}/auth/login`, { email, password })
      .pipe(
        map((response) => {
          const tokenPayload = this.validateToken(response.token);
          this.localStorage.setItem('jwt_token', response.token);
          return !!tokenPayload;
        }),
        catchError((error) => {
          console.error('Login error:', error);
          return of(false);
        }),
      );
  }

  public register(
    username: string,
    email: string,
    password: string,
  ): Observable<boolean> {
    return this.http
      .post<{
        token: string;
      }>(`${this.BACKEND_API}/auth/register`, { username, email, password })
      .pipe(
        map((response) => {
          const tokenPayload = this.validateToken(response.token);
          this.localStorage.setItem('jwt_token', response.token);
          return !!tokenPayload;
        }),
        catchError((error) => {
          console.error('Registration error:', error);
          return of(false);
        }),
      );
  }

  public getUserInfo(): Observable<User> {
    const token = this.localStorage.getItem('jwt_token');
    if (!token) {
      throw new Error('No token found');
    }

    return this.http.get<User>(`${this.BACKEND_API}/auth/userInfo`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  private validateToken(token: string): DecodedJwtPayload | null {
    try {
      const payload = this.decodeToken(token);

      if (payload && this.hasTokenExpired(payload)) {
        this.logOut();
        return null;
      }

      return payload;
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  }

  private decodeToken(token: string): DecodedJwtPayload | null {
    try {
      const payload = jwtDecode<DecodedJwtPayload>(token);
      this.setSession(payload);
      return payload;
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  }

  private hasTokenExpired(payload: DecodedJwtPayload): boolean {
    const expirationTime = payload.exp * 1000;
    const currentTime = moment().valueOf();
    return currentTime >= expirationTime;
  }

  private setSession(payload: DecodedJwtPayload): void {
    const expiresAt = payload.exp * 1000;
    this.localStorage.setItem('expires_at', String(expiresAt));
  }

  public logOut(): void {
    this.removeSession();
    this.router.navigate([AppRoutesConfig.routes.login]);
  }

  private removeSession(): void {
    this.localStorage.removeItem('expires_at');
    this.localStorage.removeItem('jwt_token');
  }

  public isLoggedIn(): boolean {
    const expiresAtString = this.localStorage.getItem('expires_at');
    const expiresAt = expiresAtString ? +expiresAtString : 0;
    return moment().valueOf() < expiresAt;
  }
}
