import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GeneratorService {
  private BACKEND_API = environment.BACKEND_API;
  
  constructor(private http: HttpClient) {}

  generateRoute(
    start: { latitude: string; longitude: string },
    end: { latitude: string; longitude: string }
  ): Observable<[number, number][]> {
    return this.createRoute(start, end);
  }

  private createRoute(
    start: { latitude: string; longitude: string },
    end: { latitude: string; longitude: string }
  ): Observable<[number, number][]> {
    return this.http.post<any>(
      `${this.BACKEND_API}/generator/generate-route`,
      { start, end }
    ).pipe(
      map(response => response.waypoints),
      catchError(error => {
        throw new Error('Error generating route: ' + error);
      })
    );
  }

  convertCity(
    city: string
  ): Observable<{ latitude: string; longitude: string }> {
    return this.http.get<any>(
      `https://nominatim.openstreetmap.org/search?format=json&q=${city}`
    ).pipe(
      map(response => {
        if (response && response.length > 0) {
          return { latitude: response[0].lat, longitude: response[0].lon };
        } else {
          throw new Error(`No results found for ${city}`);
        }
      }),
      catchError(error => {
        throw new Error('Error fetching city coordinates: ' + error);
      })
    );
  }
}
