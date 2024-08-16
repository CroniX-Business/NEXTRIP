import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContactFormService {
  private BACKEND_API = environment.BACKEND_API;

  constructor(private http: HttpClient) {}

  public sendContactForm(
    email: string,
    subject: string,
    message: string,
  ): Observable<boolean> {
    return this.sendContactFormPrivate(email, subject, message);
  }

  private sendContactFormPrivate(
    email: string,
    subject: string,
    message: string,
  ): Observable<boolean> {
    return this.http
      .post(`${this.BACKEND_API}/contact`, { email, subject, message })
      .pipe(
        map((response) => {
          console.log(response);
          return true;
        }),
        catchError((error) => {
          console.error('Login error:', error);
          return of(false);
        }),
      );
  }
}
