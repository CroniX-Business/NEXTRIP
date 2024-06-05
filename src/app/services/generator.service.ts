import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeneratorService {

  constructor(private http: HttpClient) { }

  async convertCity(city: string): Promise<{ latitude: string, longitude: string }> {
    try {
      const response = await firstValueFrom(
        this.http.get<any>(
          `https://nominatim.openstreetmap.org/search?format=json&q=${city}`
        )
      );
      if (response && response.length > 0) {
        return { latitude: response[0].lat, longitude: response[0].lon };
      } else {
        throw new Error(`No results found for ${city}`);
      }
    } catch (error) {
      throw new Error('Error fetching city coordinates: ' + error);
    }
  }

  createRoute(start: { latitude: string, longitude: string }, end: { latitude: string, longitude: string }): [number, number][] {
    return [
      [parseFloat(start.longitude), parseFloat(start.latitude)],
      [parseFloat(end.longitude), parseFloat(end.latitude)]
    ];
  }
}
