import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
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
  private tokensSubject = new BehaviorSubject<number>(0);
  tokens$_ = this.tokensSubject.asObservable();

  constructor(private http: HttpClient) {}

  public generateRoute(
    waypointsFeatures: Feature<Point, GeoJsonProperties>[],
    generatorParams: generatorParams,
    userId: string,
  ): Observable<Place[]> {
    return this.generateRoutePrivate(
      waypointsFeatures,
      generatorParams,
      userId,
    );
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

  public getPublicTrips(): Observable<Trip[]> {
    return this.getPublicTripsPrivate();
  }

  public getPlacesFromTrip(): Place[] {
    return this.placesFromTrips;
  }

  public setPlacesFromTrip(places: Place[]) {
    this.placesFromTrips = places;
  }

  public updateTokens(newTokenCount: number) {
    this.tokensSubject.next(newTokenCount);
  }

  public removeTripFromDB(
    userId: string,
    placeId: string,
  ): Observable<boolean> {
    return this.removeTripFromDBPrivate(userId, placeId);
  }

  public saveTripComment(
    userId: string,
    tripId: string,
    comment: string,
  ): Observable<string> {
    return this.saveTripCommentPrivate(userId, tripId, comment);
  }

  public saveTripPublicStatus(
    userId: string,
    tripId: string,
    isPublic: boolean,
  ): Observable<boolean> {
    return this.saveTripPublicStatusPrivate(userId, tripId, isPublic);
  }

  private generateRoutePrivate(
    waypointsFeatures: Feature<Point, GeoJsonProperties>[],
    generatorParams: generatorParams,
    userId: string,
  ): Observable<Place[]> {
    return this.http.post<Place[]>(`${this.BACKEND_API}/generator`, {
      waypointsFeatures: waypointsFeatures,
      generatorParams: generatorParams,
      userId: userId,
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

  private getPublicTripsPrivate(): Observable<Trip[]> {
    return this.http.get<Trip[]>(
      `${this.BACKEND_API}/generator/get-public-trips`,
    );
  }

  private removeTripFromDBPrivate(
    userId: string,
    tripId: string,
  ): Observable<boolean> {
    return this.http
      .delete(`${this.BACKEND_API}/generator/delete/${userId}/${tripId}`)
      .pipe(map(() => true));
  }

  private saveTripCommentPrivate(
    userId: string,
    tripId: string,
    comment: string,
  ): Observable<string> {
    return this.http
      .post<string>(
        `${this.BACKEND_API}/generator/save-trip-comment`,
        {
          userId,
          tripId,
          comment,
        },
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

  private saveTripPublicStatusPrivate(
    userId: string,
    tripId: string,
    isPublic: boolean,
  ): Observable<boolean> {
    return this.http
      .post<boolean>(`${this.BACKEND_API}/generator/save-public-status`, {
        userId,
        tripId,
        isPublic,
      })
      .pipe(map(() => true));
  }
}
