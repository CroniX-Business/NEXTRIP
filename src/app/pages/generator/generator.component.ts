import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MapComponent } from '../map/map.component';

@Component({
  selector: 'app-generator',
  standalone: true,
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MapComponent]
})
export class GeneratorComponent {
  constructor(private authService: AuthService) {}

  public LogOut(): void {
    this.authService.logOut();
  }
}
