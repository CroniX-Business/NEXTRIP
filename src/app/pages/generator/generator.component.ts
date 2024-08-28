import {
  ChangeDetectionStrategy,
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
import { PublicTripsComponent } from '../publicTrips/publicTrips.component';
import { BehaviorSubject } from 'rxjs';

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
    PublicTripsComponent,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
})
export class GeneratorComponent implements OnInit {
  public user$ = new BehaviorSubject<User | null>(null);
  public tokens$ = new BehaviorSubject<number>(0);

  public appRoutesConfig = AppRoutesConfig;

  mapPageRoute: string = `${AppRoutesConfig.routes.generator}/${AppRoutesConfig.routes.map}`;
  profilePageRoute: string = `${AppRoutesConfig.routes.generator}/${AppRoutesConfig.routes.profile}`;
  adminDashboardPageRoute: string = `${AppRoutesConfig.routes.generator}/${AppRoutesConfig.routes.dashboard}`;
  publicTripsPageRoute: string = `${AppRoutesConfig.routes.generator}/${AppRoutesConfig.routes.publicTrips}`;

  constructor(
    private authService: AuthService,
    private generatorService: GeneratorService,
  ) {
    this.getUserInfo();
  }

  ngOnInit() {
    this.generatorService.tokens$.subscribe((tokens) => {
      this.tokens$.next(tokens);
    });
  }

  checkAdminRole(): boolean {
    return this.user$.getValue()?.role === 'admin';
  }

  getUserInfo() {
    this.authService.getUserInfo().subscribe({
      next: (user) => {
        this.user$.next(user);
        this.tokens$.next(user.tokens);
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
