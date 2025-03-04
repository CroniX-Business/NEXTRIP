import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppRoutesConfig } from '../../config/routes.config';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-map-overlay',
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './mapOverlay.component.html',
  styleUrl: './mapOverlay.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapOverlayComponent {
  public appRoutesConfig = AppRoutesConfig;

  mapPageRoute: string = `${AppRoutesConfig.routes.generator}/${AppRoutesConfig.routes.map}`;
  resultPageRoute: string = `${AppRoutesConfig.routes.generator}/${AppRoutesConfig.routes.map}/${AppRoutesConfig.routes.trips}`;
}
