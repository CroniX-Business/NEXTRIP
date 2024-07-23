import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Feature, Point } from '@maplibre/maplibre-gl-directions';
import { GeoJsonProperties } from 'geojson';

@Injectable({
  providedIn: 'root',
})
export class GeneratorService {
  private BACKEND_API = environment.BACKEND_API;
  
  constructor(private http: HttpClient) {}


  generateRoute(waypointsFeatures: Feature<Point, GeoJsonProperties>[]): Observable<any> {
    return this.createRoute(waypointsFeatures);
  }

  private createRoute(waypointsFeatures: Feature<Point, GeoJsonProperties>[]): Observable<any> {
    return this.http.post<any>(`${this.BACKEND_API}/generator`, { waypointsFeatures: waypointsFeatures });
  }
}