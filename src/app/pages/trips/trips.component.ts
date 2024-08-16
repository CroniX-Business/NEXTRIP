import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component
} from '@angular/core';
import { GeneratorService } from '../../services/generator.service';
import { Place, Trip } from '../../models/Generator';
import { User } from '../../models/User';
import { AuthService } from '../../services/auth.service';

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

  constructor(
    private generatorService: GeneratorService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.getUserInfo();
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
    const selectedTrip = this.trips?.find(trip => trip.tripId === tripId);

    if (selectedTrip) {
      this.places = selectedTrip.places;
      this.generatorService.setPlacesFromTrip(this.places);
    } else {
      console.error('Trip not found');
    }
  }
}
