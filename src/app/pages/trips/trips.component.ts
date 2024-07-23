import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-trips',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './trips.component.html',
  styleUrl: './trips.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TripsComponent { }
