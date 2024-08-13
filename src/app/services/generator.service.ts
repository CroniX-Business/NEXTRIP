import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Feature, Point } from '@maplibre/maplibre-gl-directions';
import { GeoJsonProperties } from 'geojson';
import { generatorParams } from '../models/Generator';

@Injectable({
  providedIn: 'root',
})
export class GeneratorService {
  private BACKEND_API = environment.BACKEND_API;
  
  constructor(private http: HttpClient) {}


  generateRoute(waypointsFeatures: Feature<Point, GeoJsonProperties>[], generatorParams: generatorParams): Observable<any> {
    return this.createRoute(waypointsFeatures, generatorParams);
  }

  private createRoute(waypointsFeatures: Feature<Point, GeoJsonProperties>[], generatorParams: generatorParams): Observable<any> {
    return this.http.post(`${this.BACKEND_API}/generator`, { waypointsFeatures: waypointsFeatures, generatorParams: generatorParams });
  }
}