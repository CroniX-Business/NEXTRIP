import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { Place, Trip } from '../../models/Generator';
import { GeneratorService } from '../../services/generator.service';
import { Router } from '@angular/router';
import { AppRoutesConfig } from '../../config/routes.config';
import { User } from '../../models/User';
import { AuthService } from '../../services/auth.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-public-trips',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './publicTrips.component.html',
  styleUrls: ['./publicTrips.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicTripsComponent {
  public user$ = new BehaviorSubject<User | null>(null);
  public trips$ = new BehaviorSubject<Trip[]>([]);
  public bestTrips$ = new BehaviorSubject<Trip[]>([]);
  public allTrips$ = new BehaviorSubject<Trip[]>([]);
  public places$ = new BehaviorSubject<Place[]>([]);

  isExpandedBest = false;
  isExpandedAll = false;

  constructor(
    private authService: AuthService,
    private generatorService: GeneratorService,
    private router: Router,
  ) {
    this.getUserInfo();
    this.loadTrips();
  }

  toggleExpandBest() {
    this.isExpandedBest = !this.isExpandedBest;
  }

  toggleExpandAll() {
    this.isExpandedAll = !this.isExpandedAll;
  }

  toggleLike(tripId: string) {
    const currentUser = this.user$.getValue();
    if (currentUser) {
      const isLiked = this.isLiked(tripId);
      if (isLiked) {
        //this.updateLikes(tripId, -1);
      } else {
        //this.updateLikes(tripId, 1);
      }
    }
  }

  isLiked(tripId: string): boolean {
    const currentUser = this.user$.getValue();
    const trips = this.trips$.getValue();
    const trip = trips.find((trip) => trip.tripId === tripId);

    return trip ? trip.likedBy.includes(currentUser?._id || '') : false;
  }

  // updateLikes(tripId: string, change: number): void {
  //   const updateTripLikes = (trips: Trip[]) => {
  //     return trips.map((trip) => {
  //       if (trip.tripId === tripId) {
  //         return {
  //           ...trip,
  //           likes: trip.likes + change,
  //           likedBy:
  //             change > 0
  //               ? [...trip.likedBy, this.user$.getValue()?._id || '']
  //               : trip.likedBy.filter(
  //                   (id) => id !== this.user$.getValue()?._id,
  //                 ),
  //         };
  //       }
  //       return trip;
  //     });
  //   };

  //   const trips = this.trips$.getValue();
  //   this.trips$.next(updateTripLikes(trips));
  //   this.bestTrips$.next(this.getBestTrips(trips));
  //   this.allTrips$.next(this.getAllTrips(trips));
  // }

  getUserInfo() {
    this.authService.getUserInfo().subscribe({
      next: (user) => {
        this.user$.next(user);
      },
      error: (error) => {
        console.error('Error fetching user information:', error);
      },
    });
  }

  loadTrips() {
    this.generatorService.getPublicTrips().subscribe({
      next: (trips: Trip[]) => {
        this.trips$.next(trips);
        this.bestTrips$.next(this.getBestTrips(trips));
        this.allTrips$.next(this.getAllTrips(trips));
      },
      error: (err) => console.error('Error fetching trips:', err),
    });
  }

  getBestTrips(trips: Trip[]): Trip[] {
    return trips
      .slice()
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 10);
  }

  getAllTrips(trips: Trip[]): Trip[] {
    return trips.slice().sort(() => Math.random() - 0.5);
  }

  sendPlaces(tripId: string): void {
    const selectedTrip = this.trips$
      .getValue()
      .find((trip) => trip.tripId === tripId);

    if (selectedTrip) {
      this.places$.next(selectedTrip.places);
      this.generatorService.setPlacesFromTrip(selectedTrip.places);
      this.router.navigate([
        `${AppRoutesConfig.routeNames.generator}/${AppRoutesConfig.routeNames.map}`,
      ]);
    } else {
      console.error('Trip not found');
    }
  }
}
