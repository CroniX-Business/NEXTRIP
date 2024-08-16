import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EditUserInfoService {
  private BACKEND_API = environment.BACKEND_API;

  constructor(private http: HttpClient) {}

  public editUserInfo(userID: string, userInfo: object): Observable<boolean> {
    return this.editUserInfoPrivate(userID, userInfo);
  }

  private editUserInfoPrivate(
    userID: string,
    userInfo: object,
  ): Observable<boolean> {
    return this.http
      .put(`${this.BACKEND_API}/userInfo/edit/${userID}`, userInfo)
      .pipe(
        map(() => true),
        catchError((error) => {
          console.error('Edit user info error:', error);
          return of(false);
        }),
      );
  }
}
