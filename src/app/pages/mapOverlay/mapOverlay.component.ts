import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppRoutesConfig } from '../../config/routes.config';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MapComponent } from '../map/map.component';

@Component({
  selector: 'app-map-overlay',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MapComponent,
  ],
  templateUrl: './mapOverlay.component.html',
  styleUrl: './mapOverlay.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapOverlayComponent {
  public appRoutesConfig = AppRoutesConfig;

  mapPageRoute: string = `${AppRoutesConfig.routes.generator}/${AppRoutesConfig.routes.map}`;
  resultPageRoute: string = `${AppRoutesConfig.routes.generator}/${AppRoutesConfig.routes.map}/${AppRoutesConfig.routes.trips}`;
}
