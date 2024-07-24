import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Trip } from "../../models/Trip";

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
export class TripsComponent {
  trips: Trip[] = [
    {
      id: 1,
      name: 'Trip 1',
      price: 200,
    },
    {
      id: 2,
      name: 'Trip 2',
      price: 200,
    },
  ];
}
