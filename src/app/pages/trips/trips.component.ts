import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GeneratorService } from '../../services/generator.service';
import { Place, Trip } from '../../models/Generator';
import { User } from '../../models/User';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { AppRoutesConfig } from '../../config/routes.config';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-trips',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './trips.component.html',
  styleUrls: ['./trips.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TripsComponent {
  public user$ = new BehaviorSubject<User | null>(null);
  public trips$ = new BehaviorSubject<Trip[]>([]);
  public places$ = new BehaviorSubject<Place[]>([]);

  showCommentModal = false;
  showConfirmationModal = false;
  tripId: string | null = null;
  isPublic: boolean = false;
  public message$ = new BehaviorSubject<string>('');

  public commentForm = new FormGroup({
    comment: new FormControl('', Validators.required),
  });

  constructor(
    private generatorService: GeneratorService,
    private authService: AuthService,
    private router: Router,
  ) {
    this.getUserInfo();
  }

  openCommentModal(tripId: string) {
    this.tripId = tripId;
    this.message$.next('');
    const selectedTrip = this.trips$
      .getValue()
      .find((trip) => trip.tripId === tripId);
    if (selectedTrip) {
      this.commentForm.setValue({ comment: selectedTrip.comment || '' });
    } else {
      this.commentForm.reset();
    }
    this.showCommentModal = true;
  }

  closeCommentModal() {
    this.showCommentModal = false;
    this.tripId = null;
  }

  openConfirmationModal(tripId: string) {
    this.showConfirmationModal = true;
    this.tripId = tripId;
  }

  closeConfirmationModal() {
    this.showConfirmationModal = false;
    this.tripId = null;
  }

  removeTrip() {
    if (this.tripId && this.user$.getValue()) {
      const userId = this.user$.getValue()?._id;
      if (userId) {
        this.generatorService.removeTripFromDB(userId, this.tripId).subscribe({
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
  }

  getUserInfo() {
    this.authService.getUserInfo().subscribe({
      next: (user) => {
        this.user$.next(user);
        this.loadTrips();
      },
      error: (error) => {
        console.error('Error fetching user information:', error);
      },
    });
  }

  loadTrips(): void {
    const user = this.user$.getValue();
    if (user) {
      this.generatorService.getTrips(user._id).subscribe({
        next: (trips) => {
          this.trips$.next(trips);
        },
        error: (err) => console.error('Error fetching trips:', err),
      });
    }
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

  saveComment() {
    if (!this.user$.getValue() || !this.tripId) {
      console.error('User or Trip ID is missing');
      return;
    }

    if (this.commentForm.invalid) {
      console.error('Form is invalid');
      return;
    }

    const commentValue = this.commentForm.controls.comment.value!;

    this.generatorService
      .saveTripComment(this.user$.getValue()!._id, this.tripId, commentValue)
      .subscribe({
        next: (response) => {
          console.log('Comment saved successfully');
          this.message$.next(response);
          this.loadTrips();
        },
        error: (err) => {
          console.error('Error saving comment:', err);
          this.message$.next('Error saving comment');
        },
      });
  }

  savePublicStatus(event: Event, tripId: string): void {
    const inputElement = event.target as HTMLInputElement;
    this.isPublic = inputElement.checked;

    const user = this.user$.getValue();
    if (user) {
      this.generatorService
        .saveTripPublicStatus(user._id, tripId, this.isPublic)
        .subscribe({
          next: () => {
            console.log('Trip public status updated successfully');
            this.loadTrips();
          },
          error: (err) => {
            console.error('Error updating trip status:', err);
          },
        });
    }
  }

  isPublicTrip(tripId: string): boolean {
    const trip = this.trips$.getValue().find((t) => t.tripId === tripId);
    return trip ? trip.public : false;
  }
}
