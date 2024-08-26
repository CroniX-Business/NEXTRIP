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
  ): Observable<string> {
    return this.sendContactFormPrivate(email, subject, message);
  }

  public sendContactFormPrivate(
    email: string,
    subject: string,
    message: string,
  ): Observable<string> {
    return this.http
      .post<string>(
        `${this.BACKEND_API}/contact`,
        { email, subject, message },
        { responseType: 'text' as 'json' },
      )
      .pipe(
        map((response: string) => {
          return response;
        }),
        catchError((error) => {
          return of(`Failed to send message: ${error.message}`);
        }),
      );
  }
}
