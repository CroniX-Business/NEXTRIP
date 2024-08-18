import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MapComponent } from '../map/map.component';
import { ProfileComponent } from '../profile/profile.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AppRoutesConfig } from '../../config/routes.config';
import { User } from '../../models/User';
import { GeneratorService } from '../../services/generator.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-generator',
  standalone: true,
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MapComponent,
    ProfileComponent,
    DashboardComponent,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
})
export class GeneratorComponent implements OnInit {
  user: User | null = null;
  tokens: number = 0;

  public appRoutesConfig = AppRoutesConfig;

  mapPageRoute: string = `${AppRoutesConfig.routes.generator}/${AppRoutesConfig.routes.map}`;
  profilePageRoute: string = `${AppRoutesConfig.routes.generator}/${AppRoutesConfig.routes.profile}`;
  adminDashboardPageRoute: string = `${AppRoutesConfig.routes.generator}/${AppRoutesConfig.routes.dashboard}`;

  constructor(
    private authService: AuthService,
    private generatorService: GeneratorService,
    private cdr: ChangeDetectorRef,
  ) {
    this.getUserInfo();
  }

  ngOnInit() {
    this.generatorService.tokens$.subscribe((tokens) => {
      this.tokens = tokens;
      this.cdr.markForCheck();
    });
  }

  checkAdminRole(): boolean {
    return this.user?.role === 'admin';
  }

  getUserInfo(): void {
    this.authService.getUserInfo().subscribe({
      next: (user) => {
        this.user = user;
        this.tokens = this.user.tokens;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error fetching user information:', error);
      },
    });
  }

  public LogOut(): void {
    this.authService.logOut();
  }
}
