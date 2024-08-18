import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import { GeneratorService } from '../../services/generator.service';
import { Place, Trip } from '../../models/Generator';
import { User } from '../../models/User';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { AppRoutesConfig } from '../../config/routes.config';

@Component({
  selector: 'app-trips',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trips.component.html',
  styleUrl: './trips.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TripsComponent {
  user: User | null = null;
  trips: Trip[] | null = null;
  places: Place[] | null = null;

  showConfirmationModal = false;
  tripToRemove: string | null = null;

  constructor(
    private generatorService: GeneratorService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {
    this.getUserInfo();
  }

  openConfirmationModal(tripId: string) {
    this.showConfirmationModal = true;
    this.tripToRemove = tripId;
  }

  closeConfirmationModal() {
    this.showConfirmationModal = false;
    this.tripToRemove = null;
  }

  removeTrip() {
    if (this.tripToRemove && this.user) {
      this.generatorService
        .removeTripFromDB(this.user._id, this.tripToRemove)
        .subscribe({
          next: (response) => {
            console.log('Trip removed successfully:', response);
            this.loadTrips();
            this.closeConfirmationModal();
          },
          error: (error) => {
            console.error('Error removing trip:', error);
          },
        });
    }
  }

  getUserInfo(): void {
    this.authService.getUserInfo().subscribe({
      next: (user) => {
        this.user = user;
        this.loadTrips();
      },
      error: (error) => {
        console.error('Error fetching user information:', error);
      },
    });
  }

  loadTrips(): void {
    if (this.user) {
      this.generatorService.getTrips(this.user?._id).subscribe({
        next: (trips) => {
          this.trips = trips;
          this.cdr.markForCheck();
        },
        error: (err) => console.error('Error fetching trips:', err),
      });
    }
  }

  sendPlaces(tripId: string): void {
    const selectedTrip = this.trips?.find((trip) => trip.tripId === tripId);

    if (selectedTrip) {
      this.places = selectedTrip.places;
      this.generatorService.setPlacesFromTrip(this.places);
      this.router.navigate([
        `${AppRoutesConfig.routeNames.generator}/${AppRoutesConfig.routeNames.map}`,
      ]);
    } else {
      console.error('Trip not found');
    }
  }
}
