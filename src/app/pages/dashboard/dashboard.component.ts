import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {}
