import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MapComponent } from '../map/map.component';
import { ProfileComponent } from '../profile/profile.component';
import { SettingsComponent } from '../settings/settings.component';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AppRoutesConfig } from '../../config/routes.config';

@Component({
  selector: 'app-generator',
  standalone: true,
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MapComponent,
    ProfileComponent,
    SettingsComponent,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
})
export class GeneratorComponent {
  public appRoutesConfig = AppRoutesConfig;

  mapPageRoute: string = `${AppRoutesConfig.routes.generator}/${AppRoutesConfig.routes.map}`;
  profilePageRoute: string = `${AppRoutesConfig.routes.generator}/${AppRoutesConfig.routes.profile}`;
  settingsPageRoute: string = `${AppRoutesConfig.routes.generator}/${AppRoutesConfig.routes.settings}`;

  constructor(private authService: AuthService) {}

  public LogOut(): void {
    this.authService.logOut();
  }
}
