import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Feature, Point } from '@maplibre/maplibre-gl-directions';
import { GeoJsonProperties } from 'geojson';
import { generatorParams, Place, Trip } from '../models/Generator';

@Injectable({
  providedIn: 'root',
})
export class GeneratorService {
  private BACKEND_API = environment.BACKEND_API;

  placesFromTrips: Place[] = [];

  constructor(private http: HttpClient) {}

  public generateRoute(
    waypointsFeatures: Feature<Point, GeoJsonProperties>[],
    generatorParams: generatorParams,
  ): Observable<Place[]> {
    return this.generateRoutePrivate(waypointsFeatures, generatorParams);
  }

  public saveRoute(
    userId: string,
    places: Place[],
    tripName: string,
  ): Observable<boolean> {
    return this.saveRoutePrivate(userId, places, tripName);
  }

  public getTrips(userId: string): Observable<Trip[]> {
    return this.getTripsPrivate(userId);
  }

  public getPlacesFromTrip(): Place[] {
    return this.placesFromTrips;
  }

  public setPlacesFromTrip(places: Place[]) {
    this.placesFromTrips = places;
  }

  private generateRoutePrivate(
    waypointsFeatures: Feature<Point, GeoJsonProperties>[],
    generatorParams: generatorParams,
  ): Observable<Place[]> {
    return this.http.post<Place[]>(`${this.BACKEND_API}/generator`, {
      waypointsFeatures: waypointsFeatures,
      generatorParams: generatorParams,
    });
  }

  private saveRoutePrivate(
    userId: string,
    places: Place[],
    tripName: string,
  ): Observable<boolean> {
    return this.http.post<boolean>(`${this.BACKEND_API}/generator/save-route`, {
      userId,
      places,
      tripName,
    });
  }

  private getTripsPrivate(userId: string): Observable<Trip[]> {
    return this.http.post<Trip[]>(`${this.BACKEND_API}/generator/get-trips`, {
      userId,
    });
  }
}
