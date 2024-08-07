import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EditUserInfoService {
  private BACKEND_API = environment.BACKEND_API;
  private userID: string = '';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private userInfo = this.authService.getUserInfo().subscribe({
    next: (user) => {
      this.userID = user._id;
    },
    error: (error) => {
      console.error('Error fetching user information:', error);
    },
  });

  public editUserInfo(userID: string, userInfo: object): Observable<boolean> {
    return this.http.put(`${this.BACKEND_API}/userInfo/edit/${userID}`, userInfo).pipe(
      map(() => true),
      catchError((error) => {
        console.error('Edit user info error:', error);
        return of(false);
      })
    );
  }
  
}